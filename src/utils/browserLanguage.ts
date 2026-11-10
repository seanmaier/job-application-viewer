import type { AppLanguage } from '../types';
import { isAppLanguage } from './language';

/** The first of the browser's preferred languages the app speaks, else English. */
export function browserLanguage(): AppLanguage {
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const primary = tag?.toLowerCase().split('-')[0];
    if (isAppLanguage(primary)) return primary;
  }
  return 'en';
}
