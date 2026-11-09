// Shared by the frontend (trash view) and the server (purge job and API), so
// both agree on when a soft-deleted base profile is gone for good.
export const TRASH_RETENTION_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** When a profile soft-deleted at `deletedAt` (ISO timestamp) is purged. */
export function purgeDate(deletedAt: string): Date {
  return new Date(new Date(deletedAt).getTime() + TRASH_RETENTION_DAYS * DAY_MS);
}

/** Whether the retention period has passed; an unparseable timestamp counts as due rather than living forever. */
export function isPurgeDue(deletedAt: string, now: number = Date.now()): boolean {
  const due = purgeDate(deletedAt).getTime();
  return Number.isNaN(due) || due <= now;
}
