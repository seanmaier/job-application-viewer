import type { ApplicationStatus } from '../types';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  drafting:  'drafting',
  ready:     'ready',
  sent:      'sent',
  interview: 'interview',
  offer:     'offer',
  rejected:  'rejected',
  withdrawn: 'withdrawn',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  drafting:  'var(--status-drafting)',
  ready:     'var(--status-ready)',
  sent:      'var(--status-sent)',
  interview: 'var(--status-interview)',
  offer:     'var(--status-offer)',
  rejected:  'var(--status-rejected)',
  withdrawn: 'var(--status-withdrawn)',
};
