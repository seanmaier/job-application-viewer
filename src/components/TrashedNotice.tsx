import { Link } from 'react-router-dom';

/**
 * Shown instead of a view or editor when its item is in the trash: saving it
 * would quietly bring it back, so it has to be restored there first.
 */
export function TrashedNotice({ name }: { name: string }) {
  return (
    <div className="py-20 px-10 [font-family:var(--font-mono)] text-[color:var(--ink-2)] flex flex-col gap-4">
      <p>"{name}" is in the trash. Restore it there to open it again.</p>
      <Link className="text-[color:var(--accent)]" to="/trash">→ Go to trash</Link>
    </div>
  );
}
