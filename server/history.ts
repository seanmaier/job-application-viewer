// Version history of applications, so it stays visible what an assistant (or
// the user) changed. Every version is a full snapshot of the application's
// content; the app computes diffs between neighbours when showing them. A
// snapshot is a few KB, so storing whole ones costs next to nothing and keeps
// every version readable and restorable on its own, even after the config
// format changes.
import type { ApplicationConfig } from '../src/types.ts';
import { db } from './db.ts';
import { getJson, KEYS } from './store.ts';

/** What a version holds: the application's content without status, trash state or notes. */
export type VersionContent = Omit<ApplicationConfig, 'status' | 'deletedAt' | 'notes'>;

export interface AppVersion {
  id: number;
  createdAt: string;
  /** "browser" for edits in the app, otherwise the name of the API token that wrote it. */
  author: string;
  message: string | null;
  content: VersionContent;
}

export const BROWSER_AUTHOR = 'browser';
/** The content an application had before its first recorded change. */
export const BASELINE_AUTHOR = 'baseline';
const MAX_VERSIONS_PER_APP = 50;
const MAX_MESSAGE_LENGTH = 500;

db.exec(`
  CREATE TABLE IF NOT EXISTS app_versions (
    id         INTEGER PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_id     TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    author     TEXT NOT NULL,
    message    TEXT,
    content    TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS app_versions_by_app ON app_versions (user_id, app_id, id);
`);

// Notes are a running log kept beside the application rather than part of
// what gets sent, and the status has its own timeline; versioning them would
// bury the content changes this history is for.
function contentOf(config: ApplicationConfig | Omit<ApplicationConfig, 'status'>): VersionContent {
  const { status: _status, deletedAt: _deletedAt, notes: _notes, ...content } = config as ApplicationConfig;
  return content;
}

/**
 * The application's current content as the app renders it: its saved edits,
 * or else its entry in the stored list. Null if the server knows neither
 * (e.g. an application bundled from private/applications/ without edits).
 */
export function currentContent(userId: number, appId: string): VersionContent | null {
  const override = getJson<Omit<ApplicationConfig, 'status'>>(userId, KEYS.appConfig(appId));
  if (override) return contentOf({ ...override, id: appId });
  const base = getJson<ApplicationConfig[]>(userId, KEYS.localApps)?.find((a) => a.id === appId);
  return base ? contentOf(base) : null;
}

interface Row {
  id: number;
  created_at: number;
  author: string;
  message: string | null;
  content: string;
}

function latestRow(userId: number, appId: string): Row | undefined {
  return db
    .prepare('SELECT * FROM app_versions WHERE user_id = ? AND app_id = ? ORDER BY id DESC LIMIT 1')
    .get(userId, appId) as Row | undefined;
}

export type Snapshot = Map<string, string | null>;

/** Each application's current content, taken before a write so recordChanges can tell what the write changed. */
export function snapshot(userId: number, appIds: Iterable<string>): Snapshot {
  const result: Snapshot = new Map();
  for (const id of appIds) {
    const content = currentContent(userId, id);
    result.set(id, content ? JSON.stringify(content) : null);
  }
  return result;
}

function insert(userId: number, appId: string, author: string, message: string | null, content: string, now: number) {
  db.prepare(
    'INSERT INTO app_versions (user_id, app_id, created_at, author, message, content) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(userId, appId, now, author, message, content);
}

/**
 * Records a version for every application in the snapshot whose content the
 * write changed, like a commit per save. Call it after writing, inside the
 * same transaction. An application without history first gets its previous
 * content as a baseline, so its first change can be diffed too.
 * `messageFor` gives the note on what changed, per application.
 */
export function recordChanges(
  userId: number,
  before: Snapshot,
  author: string,
  messageFor: (appId: string) => string | null | undefined = () => null,
): void {
  const now = Date.now();
  for (const [appId, previous] of before) {
    const content = currentContent(userId, appId);
    if (!content) continue;
    const serialized = JSON.stringify(content);
    if (serialized === previous) continue;

    if (previous !== null && !latestRow(userId, appId)) insert(userId, appId, BASELINE_AUTHOR, null, previous, now);
    if (latestRow(userId, appId)?.content === serialized) continue;
    const message = messageFor(appId)?.trim().slice(0, MAX_MESSAGE_LENGTH) || null;
    insert(userId, appId, author, message, serialized, now);
    prune(userId, appId);
  }
}

function prune(userId: number, appId: string): void {
  db.prepare(
    `DELETE FROM app_versions WHERE user_id = ? AND app_id = ? AND id NOT IN (
       SELECT id FROM app_versions WHERE user_id = ? AND app_id = ? ORDER BY id DESC LIMIT ?
     )`,
  ).run(userId, appId, userId, appId, MAX_VERSIONS_PER_APP);
}

function toVersion(row: Row): AppVersion {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    author: row.author,
    message: row.message,
    content: JSON.parse(row.content) as VersionContent,
  };
}

/** Newest first. */
export function listVersions(userId: number, appId: string): AppVersion[] {
  const rows = db
    .prepare('SELECT * FROM app_versions WHERE user_id = ? AND app_id = ? ORDER BY id DESC')
    .all(userId, appId) as unknown as Row[];
  return rows.map(toVersion);
}

export function getVersion(userId: number, appId: string, versionId: number): AppVersion | null {
  const row = db
    .prepare('SELECT * FROM app_versions WHERE user_id = ? AND app_id = ? AND id = ?')
    .get(userId, appId, versionId) as Row | undefined;
  return row ? toVersion(row) : null;
}

export function deleteVersions(userId: number, appId: string): void {
  db.prepare('DELETE FROM app_versions WHERE user_id = ? AND app_id = ?').run(userId, appId);
}

/**
 * The application ids a raw storage write (PUT /api/data) may change the
 * content of: every saved-edits key it sets or removes, plus every entry of
 * the stored list when that is rewritten.
 */
export function affectedAppIds(keys: string[], localAppsLists: (ApplicationConfig[] | null)[]): Set<string> {
  const prefix = KEYS.appConfig('');
  const ids = new Set<string>();
  for (const key of keys) if (key.startsWith(prefix)) ids.add(key.slice(prefix.length));
  for (const list of localAppsLists) for (const app of list ?? []) ids.add(app.id);
  return ids;
}
