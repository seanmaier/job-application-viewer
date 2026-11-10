import type { AppLanguage, Note } from '../types';
import { formatDateTime } from '../utils/date';
import { linkify } from '../utils/linkify';

interface Props {
  notes: Note[];
  language: AppLanguage;
  className?: string;
  /** Lets the viewer remove a single note (not offered in the compact dashboard preview). */
  onDelete?: (id: string) => void;
}

// Read-only rendering of an application's notes: each one was added
// separately, so each keeps its own block and creation timestamp, newest
// first — and bare http(s) URLs become links.
export function NotesView({ notes, language, className = '', onDelete }: Props) {
  if (notes.length === 0) {
    return <p className={`[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] italic m-0 ${className}`}>No notes yet.</p>;
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {notes.map((note) => (
        <div key={note.id} className="group/note border-b border-[color:var(--rule)] last:border-b-0 pb-3 last:pb-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.08em] text-[color:var(--ink-3)]">
              {note.createdAt ? formatDateTime(note.createdAt, language) : 'undated'}
            </span>
            {onDelete && (
              <button
                type="button"
                className="[font-family:var(--font-mono)] text-[10px] text-[color:var(--ink-3)] bg-transparent border-none cursor-pointer opacity-0 group-hover/note:opacity-100 hover:text-[color:var(--status-rejected)] transition-opacity"
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                aria-label="Delete note"
              >
                ✕
              </button>
            )}
          </div>
          <div className="[font-family:var(--font-mono)] text-[12.5px] leading-[1.6] text-[color:var(--ink-invert)] whitespace-pre-wrap [overflow-wrap:anywhere]">
            {linkify(note.text)}
          </div>
        </div>
      ))}
    </div>
  );
}
