import type { ApplicationConfig } from '../types';

const KEY = 'local-apps';

export function getLocalApplications(): ApplicationConfig[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ApplicationConfig[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalApplication(app: ApplicationConfig): void {
  const rest = getLocalApplications().filter((a) => a.id !== app.id);
  localStorage.setItem(KEY, JSON.stringify([...rest, app]));
}

export function deleteLocalApplication(id: string): void {
  const rest = getLocalApplications().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(rest));
}

export function isLocalApplication(id: string): boolean {
  return getLocalApplications().some((a) => a.id === id);
}
