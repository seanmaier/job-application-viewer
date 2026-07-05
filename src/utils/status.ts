import type { ApplicationStatus } from '../types';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  drafting:  '✏️  Drafting',
  ready:     '✅  Ready to send',
  sent:      '📤  Sent',
  interview: '🗓  Interview',
  offer:     '🎉  Offer',
  rejected:  '✗  Rejected',
  withdrawn: '—  Withdrawn',
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
