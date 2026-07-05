import type { ApplicationConfig } from '../types';

type StoredConfig = Omit<ApplicationConfig, 'status'>;

const key = (id: string) => `app-config-${id}`;

export function getConfigOverride(id: string): StoredConfig | null {
  try {
    const raw = localStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as StoredConfig) : null;
  } catch {
    return null;
  }
}

export function setConfigOverride(id: string, config: StoredConfig): void {
  localStorage.setItem(key(id), JSON.stringify(config));
}

export function clearConfigOverride(id: string): void {
  localStorage.removeItem(key(id));
}

export function hasConfigOverride(id: string): boolean {
  return localStorage.getItem(key(id)) !== null;
}
