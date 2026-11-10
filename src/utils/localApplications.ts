import type { ApplicationConfig } from '../types';
import { storage } from './storage';
import { clearConfigOverride } from './appStorage';
import { normalizeNotes } from './notes';

const KEY = 'local-apps';

/** Every stored application, including the ones in the trash. Writes must start from this list. */
export function getAllLocalApplications(): ApplicationConfig[] {
  try {
    const raw = storage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as ApplicationConfig[]) : [];
    return parsed.map((a) => ({ ...a, notes: normalizeNotes(a.notes) }));
  } catch {
    return [];
  }
}

/** The applications to show and work with: everything not in the trash. */
export function getLocalApplications(): ApplicationConfig[] {
  return getAllLocalApplications().filter((a) => !a.deletedAt);
}

export function getDeletedLocalApplications(): ApplicationConfig[] {
  return getAllLocalApplications().filter((a) => a.deletedAt);
}

function writeList(list: ApplicationConfig[]): void {
  storage.setItem(KEY, JSON.stringify(list));
}

export function saveLocalApplication(app: ApplicationConfig): void {
  const rest = getAllLocalApplications().filter((a) => a.id !== app.id);
  writeList([...rest, app]);
}

function updateLocalApplication(id: string, change: (a: ApplicationConfig) => ApplicationConfig): void {
  writeList(getAllLocalApplications().map((a) => (a.id === id ? change(a) : a)));
}

/** Soft delete: moves the application to the trash, from which the server purges it after the retention period. */
export function trashLocalApplication(id: string): void {
  updateLocalApplication(id, (a) => ({ ...a, deletedAt: new Date().toISOString() }));
}

export function restoreLocalApplication(id: string): void {
  updateLocalApplication(id, ({ deletedAt: _deletedAt, ...rest }) => rest);
}

/** Hard delete: removes the application with its saved edits and status right away. */
export function deleteLocalApplicationPermanently(id: string): void {
  writeList(getAllLocalApplications().filter((a) => a.id !== id));
  clearConfigOverride(id);
  storage.removeItem(`status-${id}`);
}

export function isLocalApplication(id: string): boolean {
  return getAllLocalApplications().some((a) => a.id === id);
}
