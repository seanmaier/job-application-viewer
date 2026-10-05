import { useEffect, useRef, useState } from 'react';
import { NotesView } from './NotesView';

interface Props {
  company: string;
  value: string;
  onSave: (value: string) => void;
  onClose: () => void;
  /** Open straight into editing instead of the read-only view. */
  startEditing?: boolean;
}

const secondaryBtn = '[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--ink-2)] border border-white/12 rounded px-3.5 py-[6px] cursor-pointer hover:text-[color:var(--ink-invert)]';
const primaryBtn = '[font-family:var(--font-mono)] text-[11px] bg-[color:var(--accent)] text-[color:var(--ink)] border-none rounded px-4 py-[6px] cursor-pointer hover:opacity-90';

// An application's notes, larger than the dashboard's narrow table cell allows:
// a read-only view first (empty notes start in edit mode), with an Edit button
// to switch to a textarea. In edit mode Ctrl/Cmd+Enter saves; Escape closes.
export function NotesDialog({ company, value, onSave, onClose, startEditing = false }: Props) {
  const [editing, setEditing] = useState(startEditing || !value.trim());
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the textarea when editing, otherwise the dialog itself so Escape
  // works without clicking into it first.
  useEffect(() => {
    const el = textareaRef.current;
    if (editing && el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    } else {
      dialogRef.current?.focus();
    }
  }, [editing]);

  const save = () => {
    if (draft !== value) onSave(draft);
    onClose();
  };

  // Cancelling an edit goes back to the read-only view when the dialog was
  // opened there and there is something to show; a dialog opened straight
  // into editing (e.g. from the application page) just closes.
  const cancelEdit = () => {
    if (!startEditing && value.trim()) {
      setDraft(value);
      setEditing(false);
    } else {
      onClose();
    }
  };

  return (
    // May be rendered inside a clickable dashboard row: stop clicks here from
    // bubbling up to it and navigating to the application.
    <div
      className="fixed inset-0 bg-[rgba(20,28,46,0.65)] flex items-center justify-center z-[100] p-6 cursor-default"
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

        {editing ? (
          <textarea
            ref={textareaRef}
            className="[font-family:var(--font-mono)] text-[12.5px] leading-[1.6] bg-[color:var(--surface)] text-[color:var(--ink-invert)] border-[1.5px] border-[color:var(--rule)] rounded-[5px] p-3 h-[320px] resize-y focus:outline-none focus:border-[color:var(--accent)]"
            placeholder="Contacts, next steps, anything worth remembering…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
            }}
          />
        ) : (
          <div className="bg-[color:var(--surface)] border-[1.5px] border-[color:var(--rule)] rounded-[5px] p-3 min-h-[120px] max-h-[60vh] overflow-y-auto">
            <NotesView notes={value} />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="[font-family:var(--font-mono)] text-[10.5px] text-[color:var(--ink-2)]">
            {editing ? 'Ctrl+Enter to save · Esc to close' : 'Esc to close'}
          </span>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button className={secondaryBtn} onClick={cancelEdit}>Cancel</button>
                <button className={primaryBtn} onClick={save}>Save</button>
              </>
            ) : (
              <>
                <button className={secondaryBtn} onClick={onClose}>Close</button>
                <button className={primaryBtn} onClick={() => setEditing(true)}>Edit</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
