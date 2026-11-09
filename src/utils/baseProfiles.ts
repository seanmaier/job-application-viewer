import type { AppLanguage, ApplicationConfig, BaseProfile, Profile } from '../types';
import { storage } from './storage';
import { getProfile } from '../data/profiles';
import { applications } from '../data/applications';
import { getLocalApplications } from './localApplications';
import { getConfigOverride } from './appStorage';
import { slugify, uniqueId } from './slug';
import { TRASH_RETENTION_DAYS } from './trash';

const KEY = 'base-profiles';

const LANGUAGE_LABELS: Record<AppLanguage, string> = { en: 'English', de: 'Deutsch' };

function readList(): BaseProfile[] | null {
  try {
    const raw = storage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BaseProfile[]) : null;
  } catch {
    return null;
  }
}

function writeList(list: BaseProfile[]): void {
  storage.setItem(KEY, JSON.stringify(list));
}

// First-run migration: fold the previous single-profile-per-language setup
// (static file + optional `profile-override-<lang>`, both already merged by
// `getProfile`) into one named base profile per language, so existing users
// keep their edits instead of losing them when this feature ships.
function seedFromLegacyProfiles(): BaseProfile[] {
  const seeded: BaseProfile[] = (['en', 'de'] as AppLanguage[]).map((language) => ({
    id: `default-${language}`,
    name: `${LANGUAGE_LABELS[language]} (default)`,
    language,
    profile: getProfile(language),
  }));
  writeList(seeded);
  return seeded;
}

/** Every stored base profile, including the ones in the trash. Writes must start from this list. */
export function getAllBaseProfiles(): BaseProfile[] {
  return readList() ?? seedFromLegacyProfiles();
}

/** The base profiles to offer and list: everything not in the trash. */
export function getBaseProfiles(): BaseProfile[] {
  return getAllBaseProfiles().filter((p) => !p.deletedAt);
}

export function getDeletedBaseProfiles(): BaseProfile[] {
  return getAllBaseProfiles().filter((p) => p.deletedAt);
}

// Includes trashed profiles, so applications that use one keep rendering it
// until it's purged.
export function getBaseProfile(id: string): BaseProfile | undefined {
  return getAllBaseProfiles().find((p) => p.id === id);
}

export function saveBaseProfile(baseProfile: BaseProfile): void {
  const rest = getAllBaseProfiles().filter((p) => p.id !== baseProfile.id);
  writeList([...rest, baseProfile]);
}

function updateBaseProfile(id: string, change: (p: BaseProfile) => BaseProfile): void {
  writeList(getAllBaseProfiles().map((p) => (p.id === id ? change(p) : p)));
}

/** Soft delete: moves the profile to the trash, from which the server purges it after the retention period. */
export function trashBaseProfile(id: string): void {
  updateBaseProfile(id, (p) => ({ ...p, deletedAt: new Date().toISOString() }));
}

/** The confirmation shown before moving a profile to the trash, warning about applications that use it. */
export function trashConfirmMessage(profile: BaseProfile): string {
  const usedBy = applicationsUsingBaseProfile(profile.id);
  const retention = `${TRASH_RETENTION_DAYS} days`;
  if (usedBy.length === 0) return `Move "${profile.name}" to the trash? You can restore it there for ${retention}.`;
  return (
    `Move "${profile.name}" to the trash? It's used by ${usedBy.length} application${usedBy.length === 1 ? '' : 's'} ` +
    `(${usedBy.map((a) => a.company).join(', ')}). They keep using it while it's in the trash and fall back to ` +
    `the language default profile once it's deleted for good after ${retention}.`
  );
}

export function restoreBaseProfile(id: string): void {
  updateBaseProfile(id, ({ deletedAt: _deletedAt, ...rest }) => rest);
}

/** Hard delete: removes the profile right away, without going through the trash. */
export function deleteBaseProfilePermanently(id: string): void {
  writeList(getAllBaseProfiles().filter((p) => p.id !== id));
}

// Trashed profiles keep their id until purged, so a restore never collides.
export function uniqueBaseProfileId(name: string): string {
  return uniqueId(slugify(name) || 'profile', new Set(getAllBaseProfiles().map((p) => p.id)));
}

export function blankProfile(language: AppLanguage): Profile {
  return {
    name: '',
    role: '',
    email: '',
    website: '',
    github: '',
    linkedin: '',
    city: '',
    summary: '',
    experience: [],
    projects: [],
    education: { degree: '', school: '', dates: '' },
    skillGroups: [],
    languages: [{ name: LANGUAGE_LABELS[language], level: '' }],
    interests: [],
  };
}

// Applications (static + local, not trashed) that currently point at this
// base profile — used to warn before deleting one that's still in use. The
// profile is usually picked in the editor, which saves it as an override.
export function applicationsUsingBaseProfile(id: string): ApplicationConfig[] {
  const all = [...applications, ...getLocalApplications()];
  return all.filter((a) => (getConfigOverride(a.id)?.baseProfileId ?? a.baseProfileId) === id);
}

// Resolves the profile an application should render with: its selected base
// profile when set (falling back gracefully if that profile was since
// deleted), otherwise the legacy per-language profile — so applications
// created before this feature (or left on "language default") keep working.
export function resolveApplicationProfile(app: ApplicationConfig): Profile {
  if (app.baseProfileId) {
    const baseProfile = getBaseProfile(app.baseProfileId);
    if (baseProfile) return baseProfile.profile;
  }
  return getProfile(app.language);
}
