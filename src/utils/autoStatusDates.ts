import type { ApplicationStatus, AppLanguage } from '../types';
import { formatDateLong } from './date';

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function autoDateFor(
  shouldTrigger: boolean,
  currentValue: string | undefined,
  language: AppLanguage | undefined,
): string | undefined {
  if (!shouldTrigger || currentValue) return undefined;
  return formatDateLong(todayIso(), language ?? 'en');
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
  const shouldTrigger = nextStatus === 'sent' && (prevStatus === 'drafting' || prevStatus === 'ready');
  return autoDateFor(shouldTrigger, currentAppliedDate, language);
}

/** Same as autoAppliedDateFor, but for the interview date (transitioning into "interview"). */
export function autoInterviewDateFor(
  prevStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
  currentInterviewDate: string | undefined,
  language: AppLanguage | undefined,
): string | undefined {
  const shouldTrigger = nextStatus === 'interview' && prevStatus !== 'interview';
  return autoDateFor(shouldTrigger, currentInterviewDate, language);
}

/** Same as autoAppliedDateFor, but for the final decision date (transitioning into "offer" or "rejected"). */
export function autoFinalDecisionDateFor(
  prevStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
  currentFinalDecisionDate: string | undefined,
  language: AppLanguage | undefined,
): string | undefined {
  const shouldTrigger = (nextStatus === 'offer' || nextStatus === 'rejected') && prevStatus !== nextStatus;
  return autoDateFor(shouldTrigger, currentFinalDecisionDate, language);
}
