import { useEffect, useState } from 'react';

/** 'auto' follows the current season; the others pin a theme regardless of date. */
export type ThemePreference = 'auto' | 'default' | 'spring' | 'summer' | 'autumn' | 'winter';
export type Theme = 'default' | 'spring' | 'summer' | 'autumn' | 'winter';

const STORAGE_KEY = 'vita:theme';

// Pinning a specific season is a dev-only way to preview it; production only
// ever lets someone turn the (real, current) season on or off.
export const THEME_PREFERENCES: readonly ThemePreference[] = import.meta.env.DEV
  ? ['auto', 'default', 'spring', 'summer', 'autumn', 'winter']
  : ['auto', 'default'];

/** Meteorological seasons, each with its own theme. */
function seasonTheme(date: Date): Theme {
  const month = date.getMonth(); // 0 = January
  if (month === 11 || month <= 1) return 'winter'; // Dec-Feb
  if (month <= 4) return 'spring'; // Mar-May
  if (month <= 7) return 'summer'; // Jun-Aug
  return 'autumn'; // Sep-Nov
}

function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'auto' ? seasonTheme(new Date()) : preference;
}

function readStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (THEME_PREFERENCES as string[]).includes(stored ?? '') ? (stored as ThemePreference) : 'auto';
}

function applyTheme(theme: Theme): void {
  if (theme === 'default') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
}

// Module-level state shared by every useTheme() call, so the nav toggle and the
// seasonal effect overlay (separate components) stay in sync without a context.
let preference: ThemePreference = readStoredPreference();
const listeners = new Set<() => void>();

function setPreference(next: ThemePreference): void {
  preference = next;
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(resolveTheme(next));
  listeners.forEach((l) => l());
}

/** Applies the stored preference before React renders, so the page never flashes the wrong theme. Call once from main.tsx. */
export function applyStoredTheme(): void {
  applyTheme(resolveTheme(preference));
}

export function useTheme() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => void listeners.delete(listener);
  }, []);

  return { preference, theme: resolveTheme(preference), setPreference };
}
