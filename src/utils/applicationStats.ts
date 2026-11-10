import type { ApplicationConfig, ApplicationStatus } from '../types';

export type StatKey = 'total' | 'thisMonth' | 'active' | 'interviews' | 'offers';

const ACTIVE_STATUSES: ApplicationStatus[] = ['sent', 'interview'];

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Whether an application (with its current effective status/dates) matches a stat filter; `null`/`'total'` match everything. */
export function matchesStat(app: ApplicationConfig, key: StatKey | null): boolean {
  switch (key) {
    case null:
    case 'total':
      return true;
    case 'thisMonth':
      return !!app.appliedDate?.startsWith(currentMonthKey());
    case 'active':
      return ACTIVE_STATUSES.includes(app.status);
    case 'interviews':
      return app.status === 'interview' || !!app.interviewDate;
    case 'offers':
      return app.status === 'offer';
  }
}

export function countStat(applications: ApplicationConfig[], key: StatKey): number {
  return applications.filter((a) => matchesStat(a, key)).length;
}
