import { useState } from 'react';
import type { ApplicationStatus } from '../types';

export function useApplicationStatus(appId: string, initial: ApplicationStatus) {
  const key = `status-${appId}`;
  const [status, setStatusState] = useState<ApplicationStatus>(
    () => (localStorage.getItem(key) as ApplicationStatus | null) ?? initial,
  );

  const setStatus = (s: ApplicationStatus) => {
    localStorage.setItem(key, s);
    setStatusState(s);
  };

  return [status, setStatus] as const;
}
