import { db } from './db.ts';

// Typed access to the per-user kv rows the frontend writes. Keys and value
// formats must stay in sync with src/utils/{localApplications,appStorage,
// baseProfiles}.ts and src/hooks/useApplicationStatus.ts.
export const KEYS = {
  localApps: 'local-apps',
  baseProfiles: 'base-profiles',
  appConfig: (id: string) => `app-config-${id}`,
  status: (id: string) => `status-${id}`,
};

export function getValue(userId: number, key: string): string | null {
  const row = db.prepare('SELECT value FROM kv WHERE user_id = ? AND key = ?').get(userId, key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

/** Parses a stored JSON value; a corrupt one reads as missing, like the frontend treats it. */
export function getJson<T>(userId: number, key: string): T | null {
  const raw = getValue(userId, key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setValue(userId: number, key: string, value: string): void {
  db.prepare(
    'INSERT INTO kv (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value',
  ).run(userId, key, value);
}

export function setJson(userId: number, key: string, value: unknown): void {
  setValue(userId, key, JSON.stringify(value));
}

export function removeValue(userId: number, key: string): void {
  db.prepare('DELETE FROM kv WHERE user_id = ? AND key = ?').run(userId, key);
}
