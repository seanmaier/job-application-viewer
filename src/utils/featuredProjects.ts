import type { ApplicationConfig, Profile, Project } from '../types';

// The projects shown on an application's CV, in the order the application
// lists them in featuredProjectIds (falling back to the profile's own order).
// Ids that no longer match a project in the profile are skipped.
export function featuredProjects(profile: Profile, application: ApplicationConfig): Project[] {
  if (!application.featuredProjectIds) return profile.projects;
  return application.featuredProjectIds
    .map((id) => profile.projects.find((p) => p.id === id))
    .filter((p): p is Project => p !== undefined);
}
