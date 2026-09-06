import type { ApplicationConfig } from '../../types';

// Real application data is gitignored (personal info) — glob it so the app
// still builds and runs on a fresh clone with none present. example.json is
// a template for `cp`, not a real application, so it's excluded here.
const modules = import.meta.glob<{ default: ApplicationConfig }>('/private/applications/*.json', { eager: true });

export const applications: ApplicationConfig[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith('/example.json'))
  .map(([, mod]) => mod.default);
