import { useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { withAutoGhosting } from '../utils/status';
import type { ApplicationStatus } from '../types';

export function useApplicationStatus(appId: string, initial: ApplicationStatus, appliedDate?: string) {
  const key = `status-${appId}`;
  const [status, setStatusState] = useState<ApplicationStatus>(() =>
    withAutoGhosting((storage.getItem(key) as ApplicationStatus | null) ?? initial, appliedDate),
  );

  // Persist an automatic move to "ghosted", so it doesn't only exist on screen.
  useEffect(() => {
    if (storage.getItem(key) !== status && status === 'ghosted') storage.setItem(key, status);
  }, [key, status]);

  const setStatus = (s: ApplicationStatus) => {
    storage.setItem(key, s);
    setStatusState(s);
  };

  return [status, setStatus] as const;
}
