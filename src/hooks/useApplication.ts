import { useState } from 'react';
import type { ApplicationConfig } from '../types';
import {
  getConfigOverride,
  setConfigOverride,
  clearConfigOverride,
  hasConfigOverride,
} from '../utils/appStorage';
import { setChangeMessage } from '../utils/storage';

export function useApplication(staticApp: ApplicationConfig) {
  const [app, setApp] = useState<ApplicationConfig>(() => {
    const override = getConfigOverride(staticApp.id);
    return override ? { ...staticApp, ...override, id: staticApp.id } : staticApp;
  });

  const [isDirty, setIsDirty] = useState(() => hasConfigOverride(staticApp.id));

  /** `message` optionally says what changed; it shows in the application's version history. */
  const save = (updated: Omit<ApplicationConfig, 'status'>, message = '') => {
    const stored = { ...updated, id: staticApp.id };
    setChangeMessage(staticApp.id, message);
    setConfigOverride(staticApp.id, stored);
    setApp((prev) => ({ ...stored, status: prev.status }));
    setIsDirty(true);
  };

  const reset = () => {
    clearConfigOverride(staticApp.id);
    setApp(staticApp);
    setIsDirty(false);
  };

  return { app, save, reset, isDirty };
}
