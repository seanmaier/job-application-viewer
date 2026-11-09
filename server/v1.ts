// Resource-oriented API for scripts and assistants (authenticated with an API
// token or the session cookie). Unlike /api/data, which the frontend uses to
// sync raw storage keys, these routes work on one application or base profile
// at a time and return the merged, effective view of it.
import { Hono } from 'hono';
import type { ApplicationConfig, ApplicationStatus, BaseProfile } from '../src/types.ts';
import type { User } from './auth.ts';
import { getJson, getValue, KEYS } from './store.ts';

type StoredConfig = Omit<ApplicationConfig, 'status'>;

export const v1 = new Hono<{ Variables: { user: User } }>();

function localApps(userId: number): ApplicationConfig[] {
  return getJson<ApplicationConfig[]>(userId, KEYS.localApps) ?? [];
}

// Mirrors what the app renders: the stored application, overlaid with the
// edits saved for it (useApplication) and its separately kept status
// (useApplicationStatus).
function effectiveApplication(userId: number, base: ApplicationConfig): ApplicationConfig {
  const override = getJson<StoredConfig>(userId, KEYS.appConfig(base.id));
  const status = getValue(userId, KEYS.status(base.id)) as ApplicationStatus | null;
  return { ...base, ...override, id: base.id, status: status ?? base.status };
}

function findApplication(userId: number, id: string): ApplicationConfig | null {
  const base = localApps(userId).find((a) => a.id === id);
  return base ? effectiveApplication(userId, base) : null;
}

function baseProfiles(userId: number): BaseProfile[] | null {
  return getJson<BaseProfile[]>(userId, KEYS.baseProfiles);
}

v1.get('/me', (c) => c.json(c.get('user')));

v1.get('/applications', (c) => {
  const userId = c.get('user').id;
  return c.json(localApps(userId).map((a) => effectiveApplication(userId, a)));
});

v1.get('/applications/:id', (c) => {
  const app = findApplication(c.get('user').id, c.req.param('id'));
  return app ? c.json(app) : c.json({ error: 'No such application.' }, 404);
});

// Empty until the app has been opened once: the frontend seeds the list from
// the legacy per-language profiles on first use.
v1.get('/base-profiles', (c) => c.json(baseProfiles(c.get('user').id) ?? []));

v1.get('/base-profiles/:id', (c) => {
  const profile = baseProfiles(c.get('user').id)?.find((p) => p.id === c.req.param('id'));
  return profile ? c.json(profile) : c.json({ error: 'No such base profile.' }, 404);
});
