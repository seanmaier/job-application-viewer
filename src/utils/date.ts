import type { AppLanguage } from '../types';

const LOCALES: Record<AppLanguage, string> = { en: 'en-US', de: 'de-DE' };

/** Formats an ISO "YYYY-MM-DD" date (as produced by <input type="date">) with the month spelled out. */
export function formatDateLong(isoDate: string, language: AppLanguage): string {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALES[language], { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

/** Best-effort parse of a freeform display date (e.g. "July 5, 2026") back to "YYYY-MM-DD" for <input type="date">. */
export function parseToIsoDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
