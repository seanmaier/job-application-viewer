import { getDeletedBaseProfiles } from './baseProfiles';
import { getDeletedLocalApplications } from './localApplications';

/** Everything currently in the trash, for the "trash (n)" links. */
export function countTrashed(): number {
  return getDeletedLocalApplications().length + getDeletedBaseProfiles().length;
}
