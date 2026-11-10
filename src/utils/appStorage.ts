import type { ApplicationConfig } from '../types';
import { storage } from './storage';
import { normalizeNotes } from './notes';

type StoredConfig = Omit<ApplicationConfig, 'status'>;

const key = (id: string) => `app-config-${id}`;

export function getConfigOverride(id: string): StoredConfig | null {
  try {
    const raw = storage.getItem(key(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConfig;
    return { ...parsed, notes: normalizeNotes(parsed.notes) };
  } catch {
    return null;
  }
}

export function setConfigOverride(id: string, config: StoredConfig): void {
  storage.setItem(key(id), JSON.stringify(config));
}

export function clearConfigOverride(id: string): void {
  storage.removeItem(key(id));
}

export function hasConfigOverride(id: string): boolean {
  return storage.getItem(key(id)) !== null;
}
