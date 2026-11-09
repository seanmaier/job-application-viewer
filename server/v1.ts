// Resource-oriented API for scripts and assistants (authenticated with an API
// token or the session cookie). Unlike /api/data, which the frontend uses to
// sync raw storage keys, these routes work on one application or base profile
// at a time and return the merged, effective view of it.
import { Hono, type Context } from 'hono';
import type { AppLanguage, ApplicationConfig, ApplicationStatus, BaseProfile, SkillGroup } from '../src/types.ts';
import { validateApplicationConfig } from '../src/utils/parseApplicationConfig.ts';
import { validateProfile } from '../src/utils/parseProfile.ts';
import { validateSkillGroups } from '../src/utils/parseSkillGroups.ts';
import { isAppLanguage, LANGUAGES, languageOf } from '../src/utils/language.ts';
import { slugify, uniqueId } from '../src/utils/slug.ts';
import { purgeDate } from '../src/utils/trash.ts';
import type { User } from './auth.ts';
import { transaction } from './db.ts';
import { getJson, getValue, idsWithStoredKey, KEYS, setJson, setValue } from './store.ts';

type StoredConfig = Omit<ApplicationConfig, 'status'>;

export const v1 = new Hono<{ Variables: { user: User } }>();

function localApps(userId: number): ApplicationConfig[] {
  return getJson<ApplicationConfig[]>(userId, KEYS.localApps) ?? [];
}

// Mirrors what the app renders: the stored application, overlaid with the
// edits saved for it (useApplication) and its separately kept status
// (useApplicationStatus). Whether it's in the trash is only ever recorded on
// the stored entry.
function effectiveApplication(userId: number, base: ApplicationConfig): ApplicationConfig {
  const override = getJson<StoredConfig>(userId, KEYS.appConfig(base.id));
  const status = getValue(userId, KEYS.status(base.id)) as ApplicationStatus | null;
  return { ...base, ...override, id: base.id, status: status ?? base.status, deletedAt: base.deletedAt };
}

function findApplication(userId: number, id: string): ApplicationConfig | null {
  const base = localApps(userId).find((a) => a.id === id);
  return base ? effectiveApplication(userId, base) : null;
}

function baseProfiles(userId: number): BaseProfile[] | null {
  return getJson<BaseProfile[]>(userId, KEYS.baseProfiles);
}

/**
 * Lists leave trashed items out; with `?trash=true` they list only those,
 * each with the time it will be purged.
 */
function listView<T extends { deletedAt?: string }>(c: Context, items: T[]) {
  if (c.req.query('trash') !== 'true') return c.json(items.filter((i) => !i.deletedAt));
  return c.json(
    items.filter((i) => i.deletedAt).map((i) => ({ ...i, purgesAt: purgeDate(i.deletedAt!).toISOString() })),
  );
}

v1.get('/me', (c) => c.json(c.get('user')));

// Optional ?language=de|en narrows the list; applications without a stored
// language count as English, like in the app.
v1.get('/applications', (c) => {
  const userId = c.get('user').id;
  const language = c.req.query('language');
  if (language !== undefined && !isAppLanguage(language)) {
    return invalid(c, [`Unknown language "${language}". Use one of: ${LANGUAGES.join(', ')}.`]);
  }
  const apps = localApps(userId).map((a) => effectiveApplication(userId, a));
  return listView(c, language ? apps.filter((a) => languageOf(a) === language) : apps);
});

v1.get('/applications/:id', (c) => {
  const app = findApplication(c.get('user').id, c.req.param('id'));
  return app ? c.json(app) : c.json({ error: 'No such application.' }, 404);
});

// Empty until the app has been opened once: the frontend seeds the list from
// the legacy per-language profiles on first use.
v1.get('/base-profiles', (c) => listView(c, baseProfiles(c.get('user').id) ?? []));

v1.get('/base-profiles/:id', (c) => {
  const profile = baseProfiles(c.get('user').id)?.find((p) => p.id === c.req.param('id'));
  return profile ? c.json(profile) : c.json({ error: 'No such base profile.' }, 404);
});

// ---- Writes ---------------------------------------------------------------
// Every write is one read-modify-write inside a transaction, so concurrent
// API calls can't lose each other's changes. Nothing here deletes for good:
// base profiles only go to the trash (see below), applications not at all.
// Items in the trash can't be changed until they're restored.

const APPLICATION_FIELDS = [
  'id', 'company', 'role', 'status', 'language', 'font', 'appliedDate', 'interviewDate', 'finalDecisionDate',
  'notes', 'url', 'baseProfileId', 'summaryOverride', 'featuredProjectIds', 'skillGroupsOverride', 'coverLetter',
];
const BASE_PROFILE_FIELDS = ['id', 'name', 'language', 'profile'];

type Body = Record<string, unknown>;

function isPlainObject(v: unknown): v is Body {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function invalid(c: Context, details: string[]) {
  return c.json({ error: 'Validation failed.', details }, 400);
}

/** Reads a JSON object body, or lists what's wrong with it, including fields a typo would silently drop. */
async function readBody(c: Context, allowed: string[]): Promise<Body | string[]> {
  const body: unknown = await c.req.json().catch(() => undefined);
  if (!isPlainObject(body)) return ['Expected a JSON object body.'];
  const unknownFields = Object.keys(body).filter((k) => !allowed.includes(k));
  if (unknownFields.length) return [`Unknown field(s): ${unknownFields.join(', ')}. Allowed: ${allowed.join(', ')}.`];
  return body;
}

type Validated<T> = { ok: true; value: T } | { ok: false; errors: string[] };

// validateApplicationConfig doesn't carry skillGroupsOverride through, so it
// is validated and re-attached here.
function validateApplication(input: Body): Validated<ApplicationConfig> {
  const result = validateApplicationConfig(input);
  const errors = result.ok ? [] : [...result.errors];
  let skillGroups: SkillGroup[] | undefined;
  if (input.skillGroupsOverride !== undefined) {
    const sg = validateSkillGroups(input.skillGroupsOverride);
    if (sg.ok) skillGroups = sg.skillGroups;
    else errors.push(...sg.errors.map((e) => `skillGroupsOverride: ${e}`));
  }
  if (!result.ok || errors.length) return { ok: false, errors };
  return { ok: true, value: { ...result.config, ...(skillGroups && { skillGroupsOverride: skillGroups }) } };
}

// An application may only be pointed at a base profile that exists and isn't
// in the trash; otherwise it would silently render the language default.
function baseProfileIdError(userId: number, body: Body): string | null {
  if (typeof body.baseProfileId !== 'string' || !body.baseProfileId) return null;
  const profile = baseProfiles(userId)?.find((p) => p.id === body.baseProfileId);
  if (!profile) return `"baseProfileId": no base profile "${body.baseProfileId}".`;
  if (profile.deletedAt) return `"baseProfileId": base profile "${body.baseProfileId}" is in the trash.`;
  return null;
}

// New applications always start as drafts, so nothing the assistant creates
// looks finished until the user has reviewed it in the app.
v1.post('/applications', async (c) => {
  const body = await readBody(c, APPLICATION_FIELDS);
  if (Array.isArray(body)) return invalid(c, body);
  const result = validateApplication({ ...body, status: 'drafting' });
  if (!result.ok) return invalid(c, result.errors);

  const userId = c.get('user').id;
  const profileError = baseProfileIdError(userId, body);
  if (profileError) return invalid(c, [profileError]);
  const explicitId = typeof body.id === 'string' && body.id.trim() !== '';
  if (!result.value.id) return invalid(c, ['Could not derive an id from "company"; pass an "id".']);

  const outcome = transaction(() => {
    const apps = localApps(userId);
    // An id is also taken while edits or a status are stored under it: they
    // may belong to an application from private/applications/, which the
    // server can't see. The API never removes them, so it can't destroy that
    // data by accident; it picks another id instead.
    const taken = new Set([
      ...apps.map((a) => a.id),
      ...idsWithStoredKey(userId, KEYS.appConfig('')),
      ...idsWithStoredKey(userId, KEYS.status('')),
    ]);
    if (explicitId && taken.has(result.value.id)) return null;
    const config = { ...result.value, id: explicitId ? result.value.id : uniqueId(result.value.id, taken) };
    setJson(userId, KEYS.localApps, [...apps, config]);
    return config;
  });

  if (!outcome) {
    return c.json({ error: `The id "${result.value.id}" is already in use. Pick another one or leave "id" out.` }, 409);
  }
  return c.json(effectiveApplication(userId, outcome), 201);
});

// Partial update: given fields replace the current value, null removes an
// optional one. Saved the way the app's editor saves (the app-config
// override plus the separate status key), so the app shows it immediately.
v1.patch('/applications/:id', async (c) => {
  const body = await readBody(c, APPLICATION_FIELDS);
  if (Array.isArray(body)) return invalid(c, body);
  const id = c.req.param('id');
  if (body.id !== undefined && body.id !== id) return invalid(c, ['"id" cannot be changed.']);

  const userId = c.get('user').id;
  const profileError = baseProfileIdError(userId, body);
  if (profileError) return invalid(c, [profileError]);
  const outcome = transaction((): Validated<null> | 'trashed' | null => {
    const current = findApplication(userId, id);
    if (!current) return null;
    if (current.deletedAt) return 'trashed';
    const merged: Body = { ...current };
    for (const [key, value] of Object.entries(body)) {
      if (value === null) delete merged[key];
      else merged[key] = value;
    }
    const result = validateApplication(merged);
    if (!result.ok) return result;

    const { status, ...stored } = result.value;
    setJson(userId, KEYS.appConfig(id), stored);
    if ('status' in body) setValue(userId, KEYS.status(id), status);
    return { ok: true, value: null };
  });

  if (!outcome) return c.json({ error: 'No such application.' }, 404);
  if (outcome === 'trashed') return c.json({ error: 'This application is in the trash. Restore it in the app first.' }, 409);
  if (!outcome.ok) return invalid(c, outcome.errors);
  return c.json(findApplication(userId, id));
});

function validateBaseProfile(input: Body): Validated<Omit<BaseProfile, 'id'>> {
  const errors: string[] = [];
  if (typeof input.name !== 'string' || !input.name.trim()) errors.push('"name" is required and must be a non-empty string.');
  if (!LANGUAGES.includes(input.language as AppLanguage)) errors.push('"language" must be "en" or "de".');
  const profile = validateProfile(input.profile);
  if (!profile.ok) errors.push(...profile.errors.map((e) => `profile: ${e}`));
  if (errors.length || !profile.ok) return { ok: false, errors };
  return {
    ok: true,
    value: { name: (input.name as string).trim(), language: input.language as AppLanguage, profile: profile.profile },
  };
}

const NOT_SEEDED = 'Base profiles are set up the first time the app is opened. Open it once, then retry.';

v1.post('/base-profiles', async (c) => {
  const body = await readBody(c, BASE_PROFILE_FIELDS);
  if (Array.isArray(body)) return invalid(c, body);
  const result = validateBaseProfile(body);
  if (!result.ok) return invalid(c, result.errors);
  const givenId = body.id;
  if (givenId !== undefined && (typeof givenId !== 'string' || !givenId || slugify(givenId) !== givenId)) {
    return invalid(c, ['"id" must be a lowercase slug like "backend-de".']);
  }

  const userId = c.get('user').id;
  const outcome = transaction((): BaseProfile | 'not-seeded' | 'conflict' => {
    // Writing a list before the app seeded it would stop the app from ever
    // adding the default profiles, so this waits for that first run.
    const list = baseProfiles(userId);
    if (!list) return 'not-seeded';
    const taken = new Set(list.map((p) => p.id));
    // Trashed profiles keep their id until purged, so a restore never collides.
    if (givenId !== undefined && taken.has(givenId)) return 'conflict';
    const id = givenId ?? uniqueId(slugify(result.value.name) || 'profile', taken);
    const created: BaseProfile = { id, ...result.value };
    setJson(userId, KEYS.baseProfiles, [...list, created]);
    return created;
  });

  if (outcome === 'not-seeded') return c.json({ error: NOT_SEEDED }, 409);
  if (outcome === 'conflict') return c.json({ error: `A base profile with id "${givenId}" already exists.` }, 409);
  return c.json(outcome, 201);
});

// Full replacement of name, language and profile; the id stays.
v1.put('/base-profiles/:id', async (c) => {
  const body = await readBody(c, BASE_PROFILE_FIELDS);
  if (Array.isArray(body)) return invalid(c, body);
  const id = c.req.param('id');
  if (body.id !== undefined && body.id !== id) return invalid(c, ['"id" cannot be changed.']);
  const result = validateBaseProfile(body);
  if (!result.ok) return invalid(c, result.errors);

  const userId = c.get('user').id;
  const updated = transaction((): BaseProfile | 'not-found' | 'trashed' => {
    const list = baseProfiles(userId);
    const current = list?.find((p) => p.id === id);
    if (!list || !current) return 'not-found';
    if (current.deletedAt) return 'trashed';
    const replacement: BaseProfile = { id, ...result.value };
    setJson(userId, KEYS.baseProfiles, list.map((p) => (p.id === id ? replacement : p)));
    return replacement;
  });

  if (updated === 'not-found') return c.json({ error: 'No such base profile.' }, 404);
  if (updated === 'trashed') return c.json({ error: 'This base profile is in the trash. Restore it first.' }, 409);
  return c.json(updated);
});

// ---- Trash ----------------------------------------------------------------
// The API only soft-deletes base profiles: they move to the trash, where the
// user can restore them or delete them for good in the app, and the server
// purges them after TRASH_RETENTION_DAYS. Applications are trashed only by
// the user in the app; the API just leaves trashed ones out of its lists.

/** Applications not in the trash (with their saved edits) that render with this base profile. */
function applicationsUsing(userId: number, profileId: string): ApplicationConfig[] {
  return localApps(userId)
    .map((a) => effectiveApplication(userId, a))
    .filter((a) => !a.deletedAt && a.baseProfileId === profileId);
}

// Refuses profiles that applications still use: once purged, those would
// silently fall back to the language default profile, changing CVs that may
// already have been sent. Move the applications to another profile first.
v1.delete('/base-profiles/:id', (c) => {
  const id = c.req.param('id');
  const userId = c.get('user').id;
  const outcome = transaction((): BaseProfile | ApplicationConfig[] | null => {
    const list = baseProfiles(userId);
    const current = list?.find((p) => p.id === id);
    if (!list || !current) return null;
    if (current.deletedAt) return current;
    const usedBy = applicationsUsing(userId, id);
    if (usedBy.length) return usedBy;
    const trashed: BaseProfile = { ...current, deletedAt: new Date().toISOString() };
    setJson(userId, KEYS.baseProfiles, list.map((p) => (p.id === id ? trashed : p)));
    return trashed;
  });

  if (!outcome) return c.json({ error: 'No such base profile.' }, 404);
  if (Array.isArray(outcome)) {
    return c.json(
      {
        error: 'This base profile is still used by applications. Point them at another profile first.',
        applications: outcome.map((a) => ({ id: a.id, company: a.company, role: a.role, status: a.status })),
      },
      409,
    );
  }
  return c.json({ ...outcome, purgesAt: purgeDate(outcome.deletedAt!).toISOString() });
});

v1.post('/base-profiles/:id/restore', (c) => {
  const id = c.req.param('id');
  const userId = c.get('user').id;
  const restored = transaction(() => {
    const list = baseProfiles(userId);
    const current = list?.find((p) => p.id === id);
    if (!list || !current) return null;
    const { deletedAt: _deletedAt, ...active } = current;
    if (current.deletedAt) setJson(userId, KEYS.baseProfiles, list.map((p) => (p.id === id ? active : p)));
    return active;
  });

  return restored ? c.json(restored) : c.json({ error: 'No such base profile (it may already have been purged).' }, 404);
});
