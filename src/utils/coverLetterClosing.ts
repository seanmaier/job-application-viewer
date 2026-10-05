import type { AppLanguage } from '../types';

// Used when a cover letter doesn't set its own closing line.
export const DEFAULT_CLOSINGS: Record<AppLanguage, string> = {
  en: 'Sincerely,',
  de: 'Mit freundlichen Grüßen',
};
