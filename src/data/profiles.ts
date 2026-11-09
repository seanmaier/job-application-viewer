import type { Profile, AppLanguage } from '../types';
import { getProfileOverride } from '../utils/profileStorage';
import { isDemo } from '../demo/demoMode';
import demoEn from '../demo/profiles/en.json';
import demoDe from '../demo/profiles/de.json';
import demoSv from '../demo/profiles/sv.json';

// Real profile data is gitignored (personal info) — glob it so the app still
// builds and runs on a fresh clone, falling back to the committed example.
const modules = import.meta.glob<{ default: Profile }>('/private/profiles/*.json', { eager: true });

function loadProfile(lang: AppLanguage): Profile {
  const mod = modules[`/private/profiles/${lang}.json`] ?? modules[`/private/profiles/${lang}.example.json`];
  if (!mod) {
    throw new Error(
      `Missing profile data for "${lang}". Copy private/profiles/${lang}.example.json to ` +
      `private/profiles/${lang}.json and fill in your own details.`,
    );
  }
  return mod.default;
}

// The demo shows a fictional person instead of the real (or example) profile.
const profiles: Record<AppLanguage, Profile> = isDemo
  ? { en: demoEn as Profile, de: demoDe as Profile, sv: demoSv as Profile }
  : { en: loadProfile('en'), de: loadProfile('de'), sv: loadProfile('sv') };

export function getProfile(language?: AppLanguage): Profile {
  const lang = language ?? 'en';
  return getProfileOverride(lang) ?? profiles[lang];
}

export function getStaticProfile(language?: AppLanguage): Profile {
  return profiles[language ?? 'en'];
}
