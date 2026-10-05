const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

interface Props {
  notes: string;
  className?: string;
}

// Read-only rendering of an application's notes: keeps line breaks and turns
// bare http(s) URLs into links.
export function NotesView({ notes, className = '' }: Props) {
  if (!notes.trim()) {
    return <p className={`[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] italic m-0 ${className}`}>No notes yet.</p>;
  }

  return (
    <div className={`[font-family:var(--font-mono)] text-[12.5px] leading-[1.6] text-[color:var(--ink-invert)] whitespace-pre-wrap [overflow-wrap:anywhere] ${className}`}>
      {notes.split(URL_PATTERN).map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--accent)] underline underline-offset-2 hover:opacity-80"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </div>
  );
}
