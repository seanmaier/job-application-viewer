import type { AppLanguage } from '../types.ts';

export const LANGUAGES: AppLanguage[] = ['en', 'de', 'sv'];

/** Each language's own name for itself, as shown in pickers. */
export const LANGUAGE_LABELS: Record<AppLanguage, string> = { en: 'English', de: 'Deutsch', sv: 'Svenska' };

export const LANG_FLAGS: Record<AppLanguage, string> = { en: '🇬🇧', de: '🇩🇪', sv: '🇸🇪' };

/** Applications written before the field existed are English. */
export function languageOf(app: { language?: AppLanguage }): AppLanguage {
  return app.language ?? 'en';
}

export function isAppLanguage(value: unknown): value is AppLanguage {
  return LANGUAGES.includes(value as AppLanguage);
}

/** The validation message for a field that must hold one of LANGUAGES. */
export const LANGUAGE_ERROR = `"language" must be one of ${LANGUAGES.map((l) => `"${l}"`).join(', ')}.`;
