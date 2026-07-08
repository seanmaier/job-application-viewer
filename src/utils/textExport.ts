import type { ApplicationConfig, Profile } from '../types';

const divider = '─'.repeat(44);

function section(title: string): string {
  return `\n${divider}\n${title}\n${divider}\n`;
}

export function generateTextExport(profile: Profile, application: ApplicationConfig): string {
  const cl = application.coverLetter;
  const lines: string[] = [];

  // Header
  lines.push(`${profile.name.toUpperCase()} — APPLICATION`);
  lines.push('═'.repeat(44));
  lines.push('');
  lines.push(`APPLYING TO: ${application.company}`);
  lines.push(`ROLE:        ${application.role}`);
  if (cl) lines.push(`DATE:        ${cl.date}`);
  if (application.url) lines.push(`POSTING:     ${application.url}`);

  // Contact
  lines.push(section('CONTACT'));
  lines.push(`Email:    ${profile.email}`);
  lines.push(`Website:  ${profile.website}`);
  lines.push(`GitHub:   ${profile.github}`);
  lines.push(`LinkedIn: ${profile.linkedin}`);
  lines.push(`City:     ${profile.city}`);

  // Profile
  lines.push(section('PROFILE'));
  lines.push(application.summaryOverride ?? profile.summary);

  // Experience
  lines.push(section('EXPERIENCE'));
  profile.experience.forEach((exp) => {
    lines.push(exp.title);
    const company = exp.companyNote ? `${exp.company} · ${exp.companyNote}` : exp.company;
    lines.push(`${company} | ${exp.dates}`);
    exp.bullets.forEach((b) => lines.push(`  - ${b}`));
    lines.push('');
  });

  // Skills
  lines.push(section('SKILLS'));
  profile.skillGroups.forEach((group) => {
    const label = `${group.label}:`.padEnd(18);
    lines.push(`${label}${group.skills.join(', ')}`);
  });

  // Projects
  const projects = application.featuredProjectIds
    ? profile.projects.filter((p) => application.featuredProjectIds!.includes(p.id))
    : profile.projects;

  lines.push(section('PROJECTS'));
  projects.forEach((project) => {
    const name = project.hackathonLabel
      ? `${project.name} [${project.hackathonLabel}]`
      : project.name;
    lines.push(name);
    lines.push(`Stack:       ${project.stack}`);
    if (project.link) lines.push(`Link:        ${project.link}`);
    lines.push(`Description: ${project.description}`);
    lines.push('');
  });

  // Education
  lines.push(section('EDUCATION'));
  lines.push(profile.education.degree);
  if (profile.education.schoolDetail) {
    lines.push(`${profile.education.school} · ${profile.education.schoolDetail}`);
  } else {
    lines.push(profile.education.school);
  }
  lines.push(profile.education.dates);

  // Languages
  lines.push(section('LANGUAGES'));
  profile.languages.forEach((lang) => {
    lines.push(`${lang.name}: ${lang.level}`);
  });

  // Cover letter (optional)
  if (cl) {
    lines.push(section('COVER LETTER'));
    lines.push(`Date: ${cl.date}`);
    lines.push(`To:   ${cl.recipientName ?? 'Hiring Team'}, ${cl.recipientOrg}`);
    lines.push('');
    lines.push(`Re: Application — ${cl.subjectRole}`);
    lines.push('');
    cl.paragraphs.forEach((p) => {
      lines.push(p);
      lines.push('');
    });
    lines.push(`Sincerely,\n${profile.name}`);
  }

  return lines.join('\n');
}
