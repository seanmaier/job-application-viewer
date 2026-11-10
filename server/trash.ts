import { isPurgeDue } from '../src/utils/trash.ts';
import { db, transaction } from './db.ts';
import { deleteVersions } from './history.ts';
import { KEYS, removeValue, setJson } from './store.ts';

interface Trashable {
  id: string;
  deletedAt?: string;
}

/**
 * Removes the entries of one stored list (local-apps or base-profiles) whose
 * time in the trash is up, for every user, and returns them per user.
 */
function purgeList(key: string, now: number): { userId: number; purged: Trashable[] }[] {
  const rows = db.prepare('SELECT user_id, value FROM kv WHERE key = ?').all(key) as { user_id: number; value: string }[];
  const result: { userId: number; purged: Trashable[] }[] = [];
  for (const row of rows) {
    let list: unknown;
    try {
      list = JSON.parse(row.value);
    } catch {
      continue; // Leave a corrupt value for the user to notice rather than erasing it.
    }
    if (!Array.isArray(list)) continue;
    const due = (item: Trashable) => !!item.deletedAt && isPurgeDue(item.deletedAt, now);
    const purged = (list as Trashable[]).filter(due);
    if (!purged.length) continue;
    setJson(row.user_id, key, (list as Trashable[]).filter((item) => !due(item)));
    result.push({ userId: row.user_id, purged });
  }
  return result;
}

/**
 * Permanently removes trashed applications and base profiles whose retention
 * period has passed. A purged application takes its saved edits, status and
 * version history with it; applications still pointing at a purged base profile fall back to
 * the language default profile, as the app warns. Returns the counts.
 */
export function purgeTrash(now: number = Date.now()): { applications: number; baseProfiles: number } {
  return transaction(() => {
    const apps = purgeList(KEYS.localApps, now);
    for (const { userId, purged } of apps) {
      for (const app of purged) {
        removeValue(userId, KEYS.appConfig(app.id));
        removeValue(userId, KEYS.status(app.id));
        deleteVersions(userId, app.id);
      }
    }
    const profiles = purgeList(KEYS.baseProfiles, now);
    const count = (r: { purged: Trashable[] }[]) => r.reduce((n, { purged }) => n + purged.length, 0);
    return { applications: count(apps), baseProfiles: count(profiles) };
  });
}
