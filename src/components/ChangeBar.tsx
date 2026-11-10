import { useEffect, useState } from 'react';
import { fetchVersions } from '../utils/api';
import type { AppVersion } from '../utils/versionDiff';
import { authorLabel, formatRelative } from './versionLabels';
import { LatestChangeSkeleton } from './Skeleton';

interface Props {
  appId: string;
  message: string;
  onMessageChange: (message: string) => void;
  onSave: () => void;
  onOpenHistory: () => void;
}

const mono = '[font-family:var(--font-mono)]';

// Desktop footer of the edit form, like a commit box: the latest recorded
// change (who, when, why) as the way into the full history, and the message
// for this save right next to the button that saves it.
export function ChangeBar({ appId, message, onMessageChange, onSave, onOpenHistory }: Props) {
  const [latest, setLatest] = useState<AppVersion | null | undefined>(undefined);

  useEffect(() => {
    fetchVersions(appId)
      .then((list) => setLatest(list[0] ?? null))
      .catch(() => setLatest(null));
  }, [appId]);

  const author = latest ? authorLabel(latest.author) : null;

  return (
    <div className="hidden lg:flex flex-col gap-2.5 sticky bottom-[-2rem] -mx-7 -mb-8 mt-auto px-7 pt-3 pb-4 bg-[color:var(--ink)] border-t-[1.5px] border-[color:var(--rule)] z-10">
      <button
        className="flex flex-col gap-1 min-w-0 bg-transparent border-none p-0 cursor-pointer text-left group"
        onClick={onOpenHistory}
        title="Show the version history"
      >
        <span className="flex items-center gap-2 w-full">
          <span className={`${mono} text-[9.5px] tracking-[0.14em] uppercase text-[color:var(--accent)]`}>Last change</span>
          {latest && author && (
            <>
              <span className={`${mono} text-[10px] border rounded px-1.5 py-px ${author.className}`}>{author.text}</span>
              <span className={`${mono} text-[10.5px] text-[color:var(--ink-3)]`}>{formatRelative(latest.createdAt)}</span>
            </>
          )}
          <span className={`${mono} text-[10.5px] text-[color:var(--ink-2)] group-hover:text-[color:var(--accent)] ml-auto`}>
            history →
          </span>
        </span>
        {latest === undefined ? (
          <LatestChangeSkeleton />
        ) : (
          <span className={`text-[12px] leading-[1.45] line-clamp-2 ${latest?.message ? 'text-[color:var(--ink-invert)]' : 'text-[color:var(--ink-3)] italic'}`}>
            {latest === null ? 'No changes recorded yet' : latest.message ?? 'No description'}
          </span>
        )}
      </button>
      <div className="flex gap-2">
        <input
          className={`${mono} flex-1 min-w-0 text-[11.5px] bg-[color:var(--surface)] text-[color:var(--ink-invert)] border-[1.5px] border-[color:var(--rule)] rounded-[5px] px-2.5 py-[7px] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent)]`}
          placeholder="What changed? (optional)"
          aria-label="Describe what this save changes (optional)"
          maxLength={500}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }}
        />
        <button
          className={`${mono} text-[11px] bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold border-none rounded px-4 cursor-pointer hover:brightness-110 shrink-0`}
          onClick={onSave}
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
