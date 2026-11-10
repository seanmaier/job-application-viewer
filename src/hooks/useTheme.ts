import { useState } from 'react';

export type Theme = 'default' | 'winter';

const STORAGE_KEY = 'vita:theme';

function applyTheme(theme: Theme): void {
  if (theme === 'default') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
}

/** Reads the theme choice stored by {@link applyStoredTheme}, without touching the DOM again. */
function readStoredTheme(): Theme {
  return localStorage.getItem(STORAGE_KEY) === 'winter' ? 'winter' : 'default';
}

/** Applies the stored theme before React renders, so the page never flashes the wrong one. Call once from main.tsx. */
export function applyStoredTheme(): void {
  applyTheme(readStoredTheme());
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = (next: Theme) => {
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  };

  return { theme, setTheme };
}
