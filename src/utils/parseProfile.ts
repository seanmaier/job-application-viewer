import type { Education, Experience, HumanLanguage, Profile, Project, SkillGroup } from '../types';

const SKILL_GROUP_VARIANTS = ['default', 'learning'] as const;

export type ParseResult =
  | { ok: true; profile: Profile }
  | { ok: false; errors: string[] };

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function requireString(obj: Record<string, unknown>, field: string, path: string, errors: string[]): void {
  if (!isString(obj[field])) errors.push(`"${path}" must be a string.`);
}

function requireOptionalString(obj: Record<string, unknown>, field: string, path: string, errors: string[]): void {
  if (obj[field] !== undefined && !isString(obj[field])) errors.push(`"${path}" must be a string.`);
}

function validateExperience(value: unknown, index: number, errors: string[]): Experience | undefined {
  const path = `experience[${index}]`;
  if (!isPlainObject(value)) {
    errors.push(`"${path}" must be an object.`);
    return undefined;
  }
  const itemErrors: string[] = [];
  requireString(value, 'title', `${path}.title`, itemErrors);
  requireString(value, 'company', `${path}.company`, itemErrors);
  requireString(value, 'dates', `${path}.dates`, itemErrors);
  requireOptionalString(value, 'companyNote', `${path}.companyNote`, itemErrors);
  if (!isStringArray(value.bullets)) itemErrors.push(`"${path}.bullets" must be an array of strings.`);

  errors.push(...itemErrors);
  if (itemErrors.length > 0) return undefined;

  return {
    title: value.title as string,
    company: value.company as string,
    dates: value.dates as string,
    bullets: value.bullets as string[],
    ...(isString(value.companyNote) && { companyNote: value.companyNote }),
  };
}

function validateProject(value: unknown, index: number, errors: string[]): Project | undefined {
  const path = `projects[${index}]`;
  if (!isPlainObject(value)) {
    errors.push(`"${path}" must be an object.`);
    return undefined;
  }
  const itemErrors: string[] = [];
  requireString(value, 'id', `${path}.id`, itemErrors);
  requireString(value, 'name', `${path}.name`, itemErrors);
  requireString(value, 'stack', `${path}.stack`, itemErrors);
  requireString(value, 'description', `${path}.description`, itemErrors);
  requireOptionalString(value, 'link', `${path}.link`, itemErrors);
  requireOptionalString(value, 'linkLabel', `${path}.linkLabel`, itemErrors);
  requireOptionalString(value, 'hackathonLabel', `${path}.hackathonLabel`, itemErrors);

  errors.push(...itemErrors);
  if (itemErrors.length > 0) return undefined;

  return {
    id: value.id as string,
    name: value.name as string,
    stack: value.stack as string,
    description: value.description as string,
    ...(isString(value.link) && { link: value.link }),
    ...(isString(value.linkLabel) && { linkLabel: value.linkLabel }),
    ...(isString(value.hackathonLabel) && { hackathonLabel: value.hackathonLabel }),
  };
}

function validateEducation(value: unknown, errors: string[]): Education | undefined {
  if (!isPlainObject(value)) {
    errors.push('"education" must be an object.');
    return undefined;
  }
  const itemErrors: string[] = [];
  requireString(value, 'degree', 'education.degree', itemErrors);
  requireString(value, 'school', 'education.school', itemErrors);
  requireString(value, 'dates', 'education.dates', itemErrors);
  requireOptionalString(value, 'schoolDetail', 'education.schoolDetail', itemErrors);

  errors.push(...itemErrors);
  if (itemErrors.length > 0) return undefined;

  return {
    degree: value.degree as string,
    school: value.school as string,
    dates: value.dates as string,
    ...(isString(value.schoolDetail) && { schoolDetail: value.schoolDetail }),
  };
}

function validateSkillGroup(value: unknown, index: number, errors: string[]): SkillGroup | undefined {
  const path = `skillGroups[${index}]`;
  if (!isPlainObject(value)) {
    errors.push(`"${path}" must be an object.`);
    return undefined;
  }
  const itemErrors: string[] = [];
  requireString(value, 'label', `${path}.label`, itemErrors);
  if (!isStringArray(value.skills)) itemErrors.push(`"${path}.skills" must be an array of strings.`);
  if (value.variant !== undefined && !SKILL_GROUP_VARIANTS.includes(value.variant as SkillGroup['variant'] & string)) {
    itemErrors.push(`"${path}.variant" must be "default" or "learning".`);
  }

  errors.push(...itemErrors);
  if (itemErrors.length > 0) return undefined;

  return {
    label: value.label as string,
    skills: value.skills as string[],
    ...(value.variant !== undefined && { variant: value.variant as SkillGroup['variant'] }),
  };
}

function validateHumanLanguage(value: unknown, index: number, errors: string[]): HumanLanguage | undefined {
  const path = `languages[${index}]`;
  if (!isPlainObject(value)) {
    errors.push(`"${path}" must be an object.`);
    return undefined;
  }
  const itemErrors: string[] = [];
  requireString(value, 'name', `${path}.name`, itemErrors);
  requireString(value, 'level', `${path}.level`, itemErrors);

  errors.push(...itemErrors);
  if (itemErrors.length > 0) return undefined;

  return { name: value.name as string, level: value.level as string };
}

/** Validates a parsed JSON value against the Profile shape, collecting every error found. */
export function validateProfile(input: unknown): ParseResult {
  if (!isPlainObject(input)) {
    return { ok: false, errors: ['Expected a JSON object.'] };
  }

  const errors: string[] = [];

  for (const field of ['name', 'role', 'email', 'website', 'github', 'linkedin', 'city', 'summary'] as const) {
    requireString(input, field, field, errors);
  }

  if (!input.name || (isString(input.name) && !input.name.trim())) {
    errors.push('"name" is required and must be a non-empty string.');
  }

  let experience: Experience[] = [];
  if (!Array.isArray(input.experience)) {
    errors.push('"experience" must be an array.');
  } else {
    const parsed = input.experience.map((item, i) => validateExperience(item, i, errors));
    if (parsed.every((item): item is Experience => item !== undefined)) experience = parsed;
  }

  let projects: Project[] = [];
  if (!Array.isArray(input.projects)) {
    errors.push('"projects" must be an array.');
  } else {
    const parsed = input.projects.map((item, i) => validateProject(item, i, errors));
    if (parsed.every((item): item is Project => item !== undefined)) projects = parsed;
  }

  const education = validateEducation(input.education, errors);

  let skillGroups: SkillGroup[] = [];
  if (!Array.isArray(input.skillGroups)) {
    errors.push('"skillGroups" must be an array.');
  } else {
    const parsed = input.skillGroups.map((item, i) => validateSkillGroup(item, i, errors));
    if (parsed.every((item): item is SkillGroup => item !== undefined)) skillGroups = parsed;
  }

  let languages: HumanLanguage[] = [];
  if (!Array.isArray(input.languages)) {
    errors.push('"languages" must be an array.');
  } else {
    const parsed = input.languages.map((item, i) => validateHumanLanguage(item, i, errors));
    if (parsed.every((item): item is HumanLanguage => item !== undefined)) languages = parsed;
  }

  if (!isStringArray(input.interests)) errors.push('"interests" must be an array of strings.');

  if (errors.length > 0) return { ok: false, errors };

  const profile: Profile = {
    name: input.name as string,
    role: input.role as string,
    email: input.email as string,
    website: input.website as string,
    github: input.github as string,
    linkedin: input.linkedin as string,
    city: input.city as string,
    summary: input.summary as string,
    experience,
    projects,
    education: education as Education,
    skillGroups,
    languages,
    interests: input.interests as string[],
  };

  return { ok: true, profile };
}

/** Parses and validates a raw JSON string in one step. */
export function parseProfile(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON: ${(e as SyntaxError).message}`] };
  }
  return validateProfile(parsed);
}
