import type { AppLanguage } from '../types';

export type PrintTarget = 'both' | 'cv' | 'coverLetter';

const PREFIXES: Record<PrintTarget, Record<AppLanguage, string>> = {
  cv: { en: 'cv', de: 'lebenslauf', sv: 'cv' },
  coverLetter: { en: 'cover-letter', de: 'anschreiben', sv: 'personligt-brev' },
  both: { en: 'application-documents', de: 'Bewerbungsunterlagen', sv: 'ansokningshandlingar' },
};

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Suggested filename (no extension) for a Print/PDF export, e.g. "cv-jane-doe" or "anschreiben-jane-doe". */
export function buildPdfFilename(target: PrintTarget, language: AppLanguage, name: string): string {
  return `${PREFIXES[target][language]}-${slugify(name)}`;
}
