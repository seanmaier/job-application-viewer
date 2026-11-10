import type { AppLanguage } from '../types';

const LOCALES: Record<AppLanguage, string> = { en: 'en-US', de: 'de-DE', sv: 'sv-SE' };

/** Formats an ISO "YYYY-MM-DD" date (as produced by <input type="date">) with the month spelled out. */
export function formatDateLong(isoDate: string, language: AppLanguage): string {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALES[language], { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

/** Formats an ISO "YYYY-MM-DD" date with the month numeric, so it stays short in a narrow column. */
export function formatDateNumeric(isoDate: string, language: AppLanguage): string {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALES[language], { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Formats an ISO timestamp (date + time, as produced by `new Date().toISOString()`) for a note's "created at" label. */
export function formatDateTime(isoTimestamp: string, language: AppLanguage): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALES[language], { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/** Formats a Date as ISO "YYYY-MM-DD" in local time. */
export function toIsoDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Today as an ISO "YYYY-MM-DD" date in local time. */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Best-effort parse of a freeform display date (e.g. "July 5, 2026") back to "YYYY-MM-DD" for <input type="date">. */
export function parseToIsoDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return toIsoDate(date);
}

/**
 * Parses a date as stored on an application (formatDateNumeric output:
 * "10.11.2026" for de, "11/10/2026" for en, "2026-11-10" for sv) back to
 * "YYYY-MM-DD". Falls back to parseToIsoDate for anything else, such as
 * hand-written dates.
 */
export function numericDateToIso(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const de = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (de) return `${de[3]}-${de[2].padStart(2, '0')}-${de[1].padStart(2, '0')}`;
  const en = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (en) return `${en[3]}-${en[1].padStart(2, '0')}-${en[2].padStart(2, '0')}`;
  return parseToIsoDate(trimmed);
}
