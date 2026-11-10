import { diffArrays } from 'diff';
import type { ApplicationConfig, SkillGroup } from '../types';

/** An application's content as the server versions it (see server/history.ts). */
export type VersionContent = Omit<ApplicationConfig, 'status' | 'deletedAt' | 'notes'>;

export interface AppVersion {
  id: number;
  createdAt: string;
  author: string;
  message: string | null;
  content: VersionContent;
}

/** A changed value, shown as a word diff; undefined means the field wasn't set. */
export interface TextChange {
  type: 'text';
  label: string;
  before?: string;
  after?: string;
}

export interface ListItem {
  op: 'added' | 'removed' | 'changed';
  text: string;
  /** For "changed": the previous text, diffed against `text`. */
  before?: string;
}

/** Changes to a list, item by item, plus a note such as a changed order. */
export interface ListChange {
  type: 'list';
  label: string;
  items: ListItem[];
  note?: string;
}

export type FieldChange = TextChange | ListChange;

/** Turns ids into something readable, e.g. base profile and project names. */
export interface DiffNames {
  baseProfile?: (id: string) => string | undefined;
  project?: (id: string) => string | undefined;
}

function text(label: string, before: string | undefined, after: string | undefined): TextChange[] {
  const a = before || undefined;
  const b = after || undefined;
  return a === b ? [] : [{ type: 'text', label, before: a, after: b }];
}

/**
 * Set-like comparison for lists where only membership and order matter
 * (skills, projects): what was added, what was removed, and whether the
 * items both versions share moved around.
 */
function membership(label: string, before: string[], after: string[]): ListChange[] {
  const had = new Set(before);
  const has = new Set(after);
  const items: ListItem[] = [
    ...after.filter((x) => !had.has(x)).map((x): ListItem => ({ op: 'added', text: x })),
    ...before.filter((x) => !has.has(x)).map((x): ListItem => ({ op: 'removed', text: x })),
  ];
  const sharedBefore = before.filter((x) => has.has(x));
  const sharedAfter = after.filter((x) => had.has(x));
  const reordered = sharedBefore.some((x, i) => x !== sharedAfter[i]);
  if (!items.length && !reordered) return [];
  return [{ type: 'list', label, items, ...(reordered && { note: 'Order changed' }) }];
}

/**
 * Sequence comparison for lists of longer texts (cover letter paragraphs): a
 * removed item directly followed by an added one counts as that item being
 * edited, so it shows as one word diff instead of a delete plus an insert.
 */
function sequence(label: string, before: string[], after: string[]): ListChange[] {
  const items: ListItem[] = [];
  const parts = diffArrays(before, after);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const next = parts[i + 1];
    if (part.removed && next?.added) {
      const pairs = Math.min(part.value.length, next.value.length);
      for (let j = 0; j < pairs; j++) items.push({ op: 'changed', before: part.value[j], text: next.value[j] });
      part.value.slice(pairs).forEach((t) => items.push({ op: 'removed', text: t }));
      next.value.slice(pairs).forEach((t) => items.push({ op: 'added', text: t }));
      i++;
    } else if (part.added) {
      part.value.forEach((t) => items.push({ op: 'added', text: t }));
    } else if (part.removed) {
      part.value.forEach((t) => items.push({ op: 'removed', text: t }));
    }
  }
  return items.length ? [{ type: 'list', label, items }] : [];
}

function skillGroups(before: SkillGroup[] | undefined, after: SkillGroup[] | undefined): FieldChange[] {
  if (!before && !after) return [];
  if (!before || !after) {
    return text('Skills', before ? 'Custom skill groups' : 'From base profile', after ? 'Custom skill groups' : 'From base profile');
  }
  const changes: FieldChange[] = membership('Skill groups', before.map((g) => g.label), after.map((g) => g.label));
  for (const group of after) {
    const old = before.find((g) => g.label === group.label);
    if (!old) {
      if (group.skills.length) changes.push({ type: 'list', label: `Skills · ${group.label}`, items: group.skills.map((s) => ({ op: 'added', text: s })) });
      continue;
    }
    changes.push(...membership(`Skills · ${group.label}`, old.skills, group.skills));
    if ((old.variant ?? 'default') !== (group.variant ?? 'default')) {
      changes.push(...text(`Skills · ${group.label} · style`, old.variant ?? 'default', group.variant ?? 'default'));
    }
  }
  return changes;
}

/** Every field that differs between two versions, in the order the editor shows them. */
export function diffVersions(before: VersionContent, after: VersionContent, names: DiffNames = {}): FieldChange[] {
  const profileName = (id?: string) => (id ? names.baseProfile?.(id) ?? id : 'Language default');
  const projectName = (id: string) => names.project?.(id) ?? id;
  const a = before.coverLetter;
  const b = after.coverLetter;

  return [
    ...text('Base profile', profileName(before.baseProfileId), profileName(after.baseProfileId)),
    ...text('Language', before.language, after.language),
    ...text('Company', before.company, after.company),
    ...text('Role', before.role, after.role),
    ...text('Job posting URL', before.url, after.url),
    ...text('Font', before.font, after.font),
    ...text('Applied date', before.appliedDate, after.appliedDate),
    ...text('Interview date', before.interviewDate, after.interviewDate),
    ...text('Final decision date', before.finalDecisionDate, after.finalDecisionDate),
    // Unset means the base profile's summary: shown as the custom text being added or removed.
    ...text('Summary', before.summaryOverride, after.summaryOverride),
    ...membership(
      'Featured projects',
      (before.featuredProjectIds ?? []).map(projectName),
      (after.featuredProjectIds ?? []).map(projectName),
    ),
    ...skillGroups(before.skillGroupsOverride, after.skillGroupsOverride),
    ...(!a !== !b ? text('Cover letter', a ? 'Included' : 'None', b ? 'Included' : 'None') : []),
    ...text('Cover letter · Recipient', a?.recipientOrg, b?.recipientOrg),
    ...text('Cover letter · Contact person', a?.recipientName, b?.recipientName),
    ...text('Cover letter · Subject', a?.subjectRole, b?.subjectRole),
    ...text('Cover letter · Date', a?.date, b?.date),
    ...sequence('Cover letter · Paragraphs', a?.paragraphs ?? [], b?.paragraphs ?? []),
    ...text('Cover letter · Closing', a?.closing, b?.closing),
    ...otherFields(before, after),
  ];
}

const KNOWN_FIELDS = new Set([
  'id', 'company', 'role', 'language', 'font', 'appliedDate', 'interviewDate', 'finalDecisionDate', 'url',
  'baseProfileId', 'summaryOverride', 'featuredProjectIds', 'skillGroupsOverride', 'coverLetter',
]);

// Fields added to ApplicationConfig later still show up, as raw JSON, until
// they get a proper presentation above.
function otherFields(before: VersionContent, after: VersionContent): TextChange[] {
  const a = before as unknown as Record<string, unknown>;
  const b = after as unknown as Record<string, unknown>;
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => !KNOWN_FIELDS.has(k));
  const json = (v: unknown) => (v === undefined ? undefined : JSON.stringify(v, null, 1));
  return keys.flatMap((k) => text(k, json(a[k]), json(b[k])));
}
