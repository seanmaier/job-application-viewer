import type { Profile, AppLanguage } from '../types';
import enData from '@private/profiles/en.json';
import deData from '@private/profiles/de.json';

const profiles: Record<AppLanguage, Profile> = {
  en: enData as Profile,
  de: deData as Profile,
};

export function getProfile(language?: AppLanguage): Profile {
  return profiles[language ?? 'en'];
}
