import { useRef, useState } from 'react';
import { NotesView } from './NotesView';
import type { AppLanguage, Note } from '../types';

interface Props {
  company: string;
  notes: Note[];
  language: AppLanguage;
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const secondaryBtn = '[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--ink-2)] border border-white/12 rounded px-3.5 py-[6px] cursor-pointer hover:text-[color:var(--ink-invert)]';
const primaryBtn = '[font-family:var(--font-mono)] text-[11px] bg-[color:var(--accent)] text-[color:var(--ink)] border-none rounded px-4 py-[6px] cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40';

// An application's notes: a composer for adding a new, separately timestamped
// entry, and the growing list of everything added so far below it. Ctrl/Cmd+Enter
// adds the draft; Escape closes.
export function NotesDialog({ company, notes, language, onAdd, onDelete, onClose }: Props) {
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft('');
    textareaRef.current?.focus();
  };

  return (
    // May be rendered inside a clickable dashboard row: stop clicks here from
    // bubbling up to it and navigating to the application.
    <div
      className="fixed inset-0 bg-[rgba(20,28,46,0.65)] flex items-center justify-center z-[100] p-3 sm:p-6 cursor-default"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        className="bg-[#1a2236] rounded-lg w-full max-w-[640px] p-6 flex flex-col gap-4 outline-none shadow-[0_20px_60px_rgba(20,28,46,0.40)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="[font-family:var(--font-mono)] text-[12px] font-semibold tracking-[0.04em] uppercase text-[color:var(--ink-invert)]">
          Notes · <span className="text-[color:var(--accent)] normal-case">{company}</span>
        </div>

        <textarea
          ref={textareaRef}
          autoFocus
          className="[font-family:var(--font-mono)] text-[12.5px] leading-[1.6] bg-[color:var(--surface)] text-[color:var(--ink-invert)] border-[1.5px] border-[color:var(--rule)] rounded-[5px] p-3 h-[90px] resize-y focus:outline-none focus:border-[color:var(--accent)]"
          placeholder="Add a new note… (contacts, next steps, anything worth remembering)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); addNote(); }
          }}
        />
        <div className="flex justify-end -mt-2">
          <button className={primaryBtn} onClick={addNote} disabled={!draft.trim()}>+ Add note</button>
        </div>

        <div className="border-t border-[color:var(--rule)] pt-3 max-h-[40vh] overflow-y-auto">
          <NotesView notes={notes} language={language} onDelete={onDelete} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="[font-family:var(--font-mono)] text-[10.5px] text-[color:var(--ink-2)]">
            Ctrl+Enter to add · Esc to close
          </span>
          <button className={secondaryBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
