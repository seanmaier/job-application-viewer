import type { ApplicationConfig, ApplicationStatus } from '../types';
import { numericDateToIso, todayIso } from './date';

export type StatKey = 'total' | 'thisMonth' | 'active' | 'interviews' | 'offers' | 'ghosted';

const ACTIVE_STATUSES: ApplicationStatus[] = ['sent', 'interview'];

/** Whether an application (with its current effective status/dates) matches a stat filter; `null`/`'total'` match everything. */
export function matchesStat(app: ApplicationConfig, key: StatKey | null): boolean {
  switch (key) {
    case null:
    case 'total':
      return true;
    case 'thisMonth':
      return !!app.appliedDate && numericDateToIso(app.appliedDate).slice(0, 7) === todayIso().slice(0, 7);
    case 'active':
      return ACTIVE_STATUSES.includes(app.status);
    case 'interviews':
      return app.status === 'interview' || !!app.interviewDate;
    case 'offers':
      return app.status === 'offer';
    case 'ghosted':
      return app.status === 'ghosted';
  }
}

export function countStat(applications: ApplicationConfig[], key: StatKey): number {
  return applications.filter((a) => matchesStat(a, key)).length;
}
