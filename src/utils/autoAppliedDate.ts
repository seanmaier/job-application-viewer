import type { ApplicationStatus, AppLanguage } from '../types';
import { formatDateLong } from './date';

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns today's date (month spelled out, per language) if this status
 * transition should auto-fill the applied date — drafting/ready -> sent,
 * and nothing set yet. A manually-set date is never overwritten. Returns
 * undefined when auto-fill doesn't apply.
 */
export function autoAppliedDateFor(
  prevStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
  currentAppliedDate: string | undefined,
  language: AppLanguage | undefined,
): string | undefined {
  const transitioningToSent = nextStatus === 'sent' && (prevStatus === 'drafting' || prevStatus === 'ready');
  if (!transitioningToSent || currentAppliedDate) return undefined;
  return formatDateLong(todayIso(), language ?? 'en');
}
