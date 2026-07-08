import type { Profile, AppLanguage } from '../types';
import { getProfileOverride } from '../utils/profileStorage';
import enData from '@private/profiles/en.json';
import deData from '@private/profiles/de.json';

const profiles: Record<AppLanguage, Profile> = {
  en: enData as Profile,
  de: deData as Profile,
};

export function getProfile(language?: AppLanguage): Profile {
  const lang = language ?? 'en';
  return getProfileOverride(lang) ?? profiles[lang];
}

export function getStaticProfile(language?: AppLanguage): Profile {
  return profiles[language ?? 'en'];
}
