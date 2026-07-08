import type { AppLanguage, Profile } from '../types';

const key = (lang: AppLanguage) => `profile-override-${lang}`;

export function getProfileOverride(lang: AppLanguage): Profile | null {
  try {
    const raw = localStorage.getItem(key(lang));
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function setProfileOverride(lang: AppLanguage, profile: Profile): void {
  localStorage.setItem(key(lang), JSON.stringify(profile));
}

export function clearProfileOverride(lang: AppLanguage): void {
  localStorage.removeItem(key(lang));
}

export function hasProfileOverride(lang: AppLanguage): boolean {
  return localStorage.getItem(key(lang)) !== null;
}
