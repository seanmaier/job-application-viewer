import type { AppLanguage } from '../types';
import { isAppLanguage, LANGUAGES } from '../utils/language';

// The demo lives under /demo of the same build: no login, fictional sample
// data, and every edit stays in this browser tab (sessionStorage) instead of
// going to the server. Decided once at load, since it picks the data source.

export const DEMO_BASENAME = '/demo';

export const isDemo =
  typeof window !== 'undefined' &&
  (window.location.pathname === DEMO_BASENAME || window.location.pathname.startsWith(`${DEMO_BASENAME}/`));

const DATA_KEY = 'job-applications-demo';
const LOCALE_KEY = 'job-applications-demo-locale';
const TOUR_KEY = 'job-applications-demo-tour-seen';

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode etc.): the demo still works until reload.
  }
}

/** The first of the browser's preferred languages the demo speaks, else English. */
function browserLocale(): AppLanguage {
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const primary = tag?.toLowerCase().split('-')[0];
    if (isAppLanguage(primary)) return primary;
  }
  return 'en';
}

/** The demo's language: one picked in the demo wins over the browser's. */
export const demoLocale: AppLanguage = (() => {
  if (!isDemo) return 'en';
  const chosen = readSession(LOCALE_KEY);
  return isAppLanguage(chosen) ? chosen : browserLocale();
})();

export const DEMO_LOCALES = LANGUAGES;

/** Switches the demo's language. The sample data differs per language, so it starts over. */
export function setDemoLocale(locale: AppLanguage): void {
  writeSession(LOCALE_KEY, locale);
  writeSession(DATA_KEY, null);
  window.location.assign(DEMO_BASENAME);
}

/** The demo's saved edits from earlier in this tab, or nothing on a fresh visit. */
export function loadDemoData(): Record<string, string> {
  try {
    const raw = readSession(DATA_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** Applies one batch of writes to the tab's copy; the server is never involved. */
export async function saveDemoData(set: Record<string, string>, remove: string[]): Promise<void> {
  const data = loadDemoData();
  remove.forEach((k) => delete data[k]);
  Object.assign(data, set);
  writeSession(DATA_KEY, JSON.stringify(data));
}

/** Throws away every demo edit and starts over with the sample data (and the tour). */
export function resetDemo(): void {
  writeSession(DATA_KEY, null);
  writeSession(TOUR_KEY, null);
  window.location.assign(DEMO_BASENAME);
}

/** Whether the tour should open by itself: once per tab, on the first visit. */
export function shouldAutoOpenTour(): boolean {
  return readSession(TOUR_KEY) === null;
}

export function markTourSeen(): void {
  writeSession(TOUR_KEY, '1');
}
