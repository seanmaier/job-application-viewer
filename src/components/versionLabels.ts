// Shared presentation of versions in the history dialog and the edit form's change bar.

/** The badge for who made a version: the app user, the baseline, or the API token's name. */
export function authorLabel(author: string): { text: string; className: string } {
  if (author === 'browser') return { text: 'you', className: 'text-[color:var(--ink-2)] border-white/15' };
  if (author === 'baseline') return { text: 'before history', className: 'text-[color:var(--ink-3)] border-white/10' };
  return { text: author, className: 'text-[color:var(--status-interview)] border-[color:var(--status-interview)]' };
}

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
];

/** "3 hours ago", "yesterday", or the date once it's more than a week back. */
export function formatRelative(iso: string, now = Date.now()): string {
  const elapsed = now - new Date(iso).getTime();
  if (elapsed > 7 * UNITS[0][1]) return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, ms] of UNITS) {
    if (elapsed >= ms) return rtf.format(-Math.floor(elapsed / ms), unit);
  }
  return 'just now';
}
