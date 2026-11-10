const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

/** Splits text into plain parts and clickable links for bare http(s) URLs. */
export function linkify(text: string) {
  return text.split(URL_PATTERN).map((part, i) =>
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
  );
}
