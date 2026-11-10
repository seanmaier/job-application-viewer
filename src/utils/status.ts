import type { ApplicationStatus } from '../types';
import { numericDateToIso, todayIso, toIsoDate } from './date';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  drafting:  'drafting',
  ready:     'ready',
  sent:      'sent',
  interview: 'interview',
  offer:     'offer',
  rejected:  'rejected',
  ghosted:   'ghosted',
  withdrawn: 'withdrawn',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  drafting:  'var(--status-drafting)',
  ready:     'var(--status-ready)',
  sent:      'var(--status-sent)',
  interview: 'var(--status-interview)',
  offer:     'var(--status-offer)',
  rejected:  'var(--status-rejected)',
  ghosted:   'var(--status-ghosted)',
  withdrawn: 'var(--status-withdrawn)',
};

/** A sent application without any response for this many days is marked "ghosted". */
export const GHOSTED_AFTER_DAYS = 30;

/** The ISO date a sent application counts as ghosted (applied date + GHOSTED_AFTER_DAYS), or null without a readable applied date. */
export function ghostedOn(appliedDate: string | undefined): string | null {
  const applied = appliedDate ? numericDateToIso(appliedDate) : '';
  if (!applied) return null;
  const date = new Date(`${applied}T00:00:00`);
  date.setDate(date.getDate() + GHOSTED_AFTER_DAYS);
  return toIsoDate(date);
}

/**
 * Moves a "sent" application to "ghosted" once GHOSTED_AFTER_DAYS have passed
 * since it was sent; any other status is returned unchanged. A response is
 * recorded by moving the status on (interview, rejected …), which ends this.
 */
export function withAutoGhosting(status: ApplicationStatus, appliedDate: string | undefined): ApplicationStatus {
  if (status !== 'sent') return status;
  const due = ghostedOn(appliedDate);
  return due && due <= todayIso() ? 'ghosted' : status;
}
