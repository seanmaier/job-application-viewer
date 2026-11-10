import type { Note } from '../types';

function generateNoteId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Creates a new note with a fresh id and the current time as its creation timestamp. */
export function createNote(text: string): Note {
  return { id: generateNoteId(), text, createdAt: new Date().toISOString() };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Normalizes a stored/imported "notes" value into the current array shape.
 * Accepts the legacy single free-text string (migrated into one note with no
 * timestamp, since its creation time was never recorded) alongside the
 * current array format. Returns undefined when there's nothing to show.
 */
export function normalizeNotes(value: unknown): Note[] | undefined {
  if (typeof value === 'string') {
    const text = value.trim();
    return text ? [{ id: generateNoteId(), text }] : undefined;
  }
  if (!Array.isArray(value)) return undefined;

  const notes = value
    .filter(isPlainObject)
    .filter((n) => typeof n.text === 'string' && n.text.trim() !== '')
    .map((n) => ({
      id: typeof n.id === 'string' && n.id ? n.id : generateNoteId(),
      text: n.text as string,
      ...(typeof n.createdAt === 'string' && n.createdAt && { createdAt: n.createdAt }),
    }));

  return notes.length > 0 ? notes : undefined;
}

/** A short one-line summary for compact previews (dashboard table/card): the most recent note's text, with a count when there's more than one. */
export function summarizeNotes(notes?: Note[]): string {
  if (!notes || notes.length === 0) return '';
  const latest = notes[0].text;
  return notes.length > 1 ? `${notes.length} notes · ${latest}` : latest;
}
