import type { SkillGroup } from '../types';

export type SkillGroupsParseResult =
  | { ok: true; skillGroups: SkillGroup[] }
  | { ok: false; errors: string[] };

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

/** Validates a parsed JSON value against SkillGroup[], collecting every error found. */
export function validateSkillGroups(input: unknown): SkillGroupsParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['Expected a JSON array of skill groups.'] };
  }

  const errors: string[] = [];
  input.forEach((item, i) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      errors.push(`Item ${i}: expected an object with "label" and "skills".`);
      return;
    }
    const obj = item as Record<string, unknown>;
    if (!isString(obj.label) || !obj.label.trim()) errors.push(`Item ${i}: "label" is required and must be a non-empty string.`);
    if (!Array.isArray(obj.skills) || obj.skills.length === 0 || !obj.skills.every(isString)) {
      errors.push(`Item ${i}: "skills" must be a non-empty array of strings.`);
    }
    if (obj.variant !== undefined && obj.variant !== 'default' && obj.variant !== 'learning') {
      errors.push(`Item ${i}: "variant" must be "default" or "learning".`);
    }
  });

  if (errors.length > 0) return { ok: false, errors };

  const skillGroups: SkillGroup[] = (input as Record<string, unknown>[]).map((obj) => ({
    label: obj.label as string,
    skills: obj.skills as string[],
    ...(obj.variant === 'learning' && { variant: 'learning' as const }),
  }));

  return { ok: true, skillGroups };
}

/** Parses and validates a raw JSON string in one step. */
export function parseSkillGroups(raw: string): SkillGroupsParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON: ${(e as SyntaxError).message}`] };
  }
  return validateSkillGroups(parsed);
}
