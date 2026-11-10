import type { ApplicationConfig } from '../../types';
import { isDemo } from '../../demo/demoMode';
import { demoApplications } from '../../demo/applications';

// Real application data is gitignored (personal info) — glob it so the app
// still builds and runs on a fresh clone with none present. example.json is
// a template for `cp`, not a real application, so it's excluded here.
const modules = import.meta.glob<{ default: ApplicationConfig }>('/private/applications/*.json', { eager: true });

// The demo never shows real data, even in a build that has some.
export const applications: ApplicationConfig[] = isDemo
  ? demoApplications
  : Object.entries(modules)
      .filter(([path]) => !path.endsWith('/example.json'))
      .map(([, mod]) => mod.default);
