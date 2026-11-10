import type { AppLanguage } from '../types';

export type PrintTarget = 'both' | 'cv' | 'coverLetter';

const DOCUMENT_NAMES: Record<PrintTarget, Record<AppLanguage, string>> = {
  cv: { en: 'CV', de: 'Lebenslauf', sv: 'CV' },
  coverLetter: { en: 'CoverLetter', de: 'Anschreiben', sv: 'PersonligtBrev' },
  both: { en: 'Application', de: 'Bewerbungsunterlagen', sv: 'Ansokningshandlingar' },
};

const UMLAUTS: Record<string, string> = {
  ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ß: 'ss',
};

/** "IBS Schreiber" → "IBS_Schreiber", "Müller & Söhne" → "Mueller_Soehne": ASCII only, underscores as separators. */
function toFilenamePart(value: string): string {
  return value
    .replace(/[äöüÄÖÜß]/g, (c) => UMLAUTS[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Filename (no extension) for an exported PDF, following one scheme for every
 * document: Vorname_Nachname_Dokument_Firma, e.g. "Sean_Maier_Anschreiben_IBS_Schreiber".
 */
export function buildPdfFilename(target: PrintTarget, language: AppLanguage, name: string, company: string): string {
  return [toFilenamePart(name), DOCUMENT_NAMES[target][language], toFilenamePart(company)]
    .filter(Boolean)
    .join('_');
}
