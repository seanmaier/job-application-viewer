import type { BaseProfile } from '../src/types.ts';
import { isPurgeDue } from '../src/utils/trash.ts';
import { db, transaction } from './db.ts';
import { KEYS, setJson } from './store.ts';

/**
 * Removes trashed base profiles whose retention period has passed, for every
 * user. Applications still pointing at one fall back to the language default
 * profile, as the trash and delete dialogs warn. Returns how many were removed.
 */
export function purgeExpiredBaseProfiles(now: number = Date.now()): number {
  return transaction(() => {
    const rows = db.prepare('SELECT user_id, value FROM kv WHERE key = ?').all(KEYS.baseProfiles) as {
      user_id: number;
      value: string;
    }[];
    let removed = 0;
    for (const row of rows) {
      let list: unknown;
      try {
        list = JSON.parse(row.value);
      } catch {
        continue; // Leave a corrupt value for the user to notice rather than erasing it.
      }
      if (!Array.isArray(list)) continue;
      const kept = (list as BaseProfile[]).filter((p) => !(p.deletedAt && isPurgeDue(p.deletedAt, now)));
      if (kept.length === list.length) continue;
      removed += list.length - kept.length;
      setJson(row.user_id, KEYS.baseProfiles, kept);
    }
    return removed;
  });
}
