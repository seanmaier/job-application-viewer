import type { ApplicationConfig, ApplicationStatus, AppLanguage, AppFont, CoverLetter } from '../types';
import { slugify } from './slug';

const STATUSES: ApplicationStatus[] = ['drafting', 'ready', 'sent', 'interview', 'offer', 'rejected', 'withdrawn'];
const LANGUAGES: AppLanguage[] = ['en', 'de'];
const FONTS: AppFont[] = ['sans', 'serif', 'mono'];

export type ParseResult =
  | { ok: true; config: ApplicationConfig }
  | { ok: false; errors: string[] };

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function validateCoverLetter(value: unknown, errors: string[]): CoverLetter | undefined {
  if (value === undefined) return undefined;
  if (!isPlainObject(value)) {
    errors.push('"coverLetter" must be an object.');
    return undefined;
  }
  const clErrors: string[] = [];
  if (!isString(value.recipientOrg) || !value.recipientOrg.trim()) clErrors.push('"coverLetter.recipientOrg" is required and must be a non-empty string.');
  if (!isString(value.date)) clErrors.push('"coverLetter.date" must be a string.');
  if (!isString(value.subjectRole)) clErrors.push('"coverLetter.subjectRole" must be a string.');
  if (!Array.isArray(value.paragraphs) || !value.paragraphs.every(isString)) clErrors.push('"coverLetter.paragraphs" must be an array of strings.');
  if (value.recipientName !== undefined && !isString(value.recipientName)) clErrors.push('"coverLetter.recipientName" must be a string.');

  errors.push(...clErrors);
  if (clErrors.length > 0) return undefined;

  return {
    recipientOrg: value.recipientOrg as string,
    date: value.date as string,
    subjectRole: value.subjectRole as string,
    paragraphs: value.paragraphs as string[],
    ...(isString(value.recipientName) && value.recipientName && { recipientName: value.recipientName }),
  };
}

/** Validates a parsed JSON value against the ApplicationConfig shape, collecting every error found. */
export function validateApplicationConfig(input: unknown): ParseResult {
  if (!isPlainObject(input)) {
    return { ok: false, errors: ['Expected a JSON object.'] };
  }

  const errors: string[] = [];

  if (!isString(input.company) || !input.company.trim()) errors.push('"company" is required and must be a non-empty string.');
  if (!isString(input.role) || !input.role.trim()) errors.push('"role" is required and must be a non-empty string.');

  const id = isString(input.id) && input.id.trim()
    ? input.id
    : slugify(isString(input.company) ? input.company : '');

  let status: ApplicationStatus = 'drafting';
  if (input.status !== undefined) {
    if (!isString(input.status) || !STATUSES.includes(input.status as ApplicationStatus)) {
      errors.push(`"status" must be one of: ${STATUSES.join(', ')}.`);
    } else {
      status = input.status as ApplicationStatus;
    }
  }

  let language: AppLanguage | undefined;
  if (input.language !== undefined) {
    if (!isString(input.language) || !LANGUAGES.includes(input.language as AppLanguage)) {
      errors.push('"language" must be "en" or "de".');
    } else {
      language = input.language as AppLanguage;
    }
  }

  let font: AppFont | undefined;
  if (input.font !== undefined) {
    if (!isString(input.font) || !FONTS.includes(input.font as AppFont)) {
      errors.push('"font" must be "sans", "serif", or "mono".');
    } else {
      font = input.font as AppFont;
    }
  }

  for (const key of ['appliedDate', 'url', 'summaryOverride'] as const) {
    if (input[key] !== undefined && !isString(input[key])) {
      errors.push(`"${key}" must be a string.`);
    }
  }

  if (input.featuredProjectIds !== undefined
    && (!Array.isArray(input.featuredProjectIds) || !input.featuredProjectIds.every(isString))) {
    errors.push('"featuredProjectIds" must be an array of strings.');
  }

  const coverLetter = validateCoverLetter(input.coverLetter, errors);

  if (errors.length > 0) return { ok: false, errors };

  const config: ApplicationConfig = {
    id,
    company: input.company as string,
    role: input.role as string,
    status,
    ...(language && { language }),
    ...(font && { font }),
    ...(isString(input.appliedDate) && input.appliedDate && { appliedDate: input.appliedDate }),
    ...(isString(input.url) && input.url && { url: input.url }),
    ...(isString(input.summaryOverride) && input.summaryOverride && { summaryOverride: input.summaryOverride }),
    ...(Array.isArray(input.featuredProjectIds) && { featuredProjectIds: input.featuredProjectIds as string[] }),
    ...(coverLetter && { coverLetter }),
  };

  return { ok: true, config };
}

/** Parses and validates a raw JSON string in one step. */
export function parseApplicationConfig(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON: ${(e as SyntaxError).message}`] };
  }
  return validateApplicationConfig(parsed);
}
