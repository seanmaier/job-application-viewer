import type { AppLanguage } from '../types.ts';

export const LANGUAGES: AppLanguage[] = ['en', 'de'];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = { en: 'English', de: 'Deutsch' };

export const LANG_FLAGS: Record<AppLanguage, string> = { en: '🇬🇧', de: '🇩🇪' };

/** Applications written before the field existed are English. */
export function languageOf(app: { language?: AppLanguage }): AppLanguage {
  return app.language ?? 'en';
}

export function isAppLanguage(value: unknown): value is AppLanguage {
  return LANGUAGES.includes(value as AppLanguage);
}
