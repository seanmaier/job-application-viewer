import { useEffect, useMemo, useRef, useState } from 'react';
import { diffWords } from 'diff';
import { fetchVersions, restoreVersion } from '../utils/api';
import { diffVersions, type AppVersion, type DiffNames, type FieldChange } from '../utils/versionDiff';
import { authorLabel, formatTime } from './versionLabels';
import { VersionHistorySkeleton } from './Skeleton';

interface Props {
  appId: string;
  company: string;
  names: DiffNames;
  /** Whether the form has edits that restoring would throw away. */
  hasUnsavedEdits: boolean;
  onRestored: () => void;
  onClose: () => void;
}

const mono = '[font-family:var(--font-mono)]';
const secondaryBtn = `${mono} text-[11px] bg-transparent text-[color:var(--ink-2)] border border-white/12 rounded px-3.5 py-[6px] cursor-pointer hover:text-[color:var(--ink-invert)]`;
const restoreBtn = `${mono} text-[11px] bg-transparent text-[color:var(--accent)] border border-[color:var(--accent)] rounded px-3.5 py-[6px] cursor-pointer hover:bg-[color:var(--accent)] hover:text-[color:var(--ink)] disabled:opacity-40 disabled:cursor-default`;
const insClass = 'bg-[rgba(63,185,80,0.22)] text-[#7ee787] rounded-[2px] no-underline';
const delClass = 'bg-[rgba(248,81,73,0.20)] text-[#ffa198] rounded-[2px] line-through mr-[3px]';

function WordDiff({ before, after }: { before: string; after: string }) {
  return (
    <>
      {diffWords(before, after).map((part, i) =>
        part.added ? <ins key={i} className={insClass}>{part.value}</ins>
          : part.removed ? <del key={i} className={delClass}>{part.value}</del>
            : <span key={i}>{part.value}</span>,
      )}
    </>
  );
}

function ChangeView({ change }: { change: FieldChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`${mono} text-[9.5px] tracking-[0.14em] uppercase text-[color:var(--accent)]`}>
        {change.label}
        {change.type === 'list' && change.note && (
          <span className="ml-2 normal-case tracking-normal text-[color:var(--ink-3)]">↕ {change.note}</span>
        )}
      </div>
      {change.type === 'text' ? (
        <div className="text-[12.5px] leading-[1.6] text-[color:var(--ink-invert)] whitespace-pre-wrap break-words">
          {change.before !== undefined && change.after !== undefined ? (
            <WordDiff before={change.before} after={change.after} />
          ) : change.after !== undefined ? (
            <ins className={insClass}>{change.after}</ins>
          ) : (
            <del className={delClass}>{change.before}</del>
          )}
        </div>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-1">
          {change.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[12.5px] leading-[1.6] text-[color:var(--ink-invert)]">
              <span className={`${mono} shrink-0 w-3 ${item.op === 'added' ? 'text-[#7ee787]' : item.op === 'removed' ? 'text-[#ffa198]' : 'text-[color:var(--status-sent)]'}`}>
                {item.op === 'added' ? '+' : item.op === 'removed' ? '−' : '~'}
              </span>
              <span className="whitespace-pre-wrap break-words min-w-0">
                {item.op === 'changed' ? <WordDiff before={item.before ?? ''} after={item.text} />
                  : item.op === 'added' ? <ins className={insClass}>{item.text}</ins>
                    : <del className={delClass}>{item.text}</del>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// The application's versions like `git log`: who changed it when and why on
// the left, and on the right what the selected version changed compared to
// the one before it, field by field. Any older version can be restored.
export function VersionHistoryDialog({ appId, company, names, hasUnsavedEdits, onRestored, onClose }: Props) {
  const [versions, setVersions] = useState<AppVersion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => dialogRef.current?.focus(), []);

  useEffect(() => {
    fetchVersions(appId)
      .then((list) => {
        setVersions(list);
        setSelectedId(list[0]?.id ?? null);
      })
      .catch((e: Error) => setError(e.message));
  }, [appId]);

  const index = versions?.findIndex((v) => v.id === selectedId) ?? -1;
  const selected = index >= 0 ? versions![index] : undefined;
  const previous = index >= 0 ? versions![index + 1] : undefined;
  const changes = useMemo(
    () => (selected && previous ? diffVersions(previous.content, selected.content, names) : []),
    [selected, previous, names],
  );

  const handleRestore = async () => {
    if (!selected) return;
    const warning = hasUnsavedEdits ? '\n\nYour unsaved edits in the form will be discarded.' : '';
    if (!confirm(`Restore the version from ${formatTime(selected.createdAt)}?${warning}`)) return;
    setRestoring(true);
    try {
      await restoreVersion(appId, selected.id);
      onRestored();
    } catch (e) {
      setError((e as Error).message);
      setRestoring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(20,28,46,0.65)] flex items-center justify-center z-[100] p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#1a2236] rounded-lg w-full max-w-[1040px] h-[88dvh] flex flex-col outline-none shadow-[0_20px_60px_rgba(20,28,46,0.40)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/8 shrink-0">
          <div className={`${mono} text-[12px] font-semibold tracking-[0.04em] uppercase text-[color:var(--ink-invert)] min-w-0 truncate`}>
            History · <span className="text-[color:var(--accent)] normal-case">{company}</span>
          </div>
          <button className={secondaryBtn} onClick={onClose}>Close</button>
        </div>

        {error && <p className={`${mono} text-[11px] text-[color:var(--status-rejected)] px-5 py-2 m-0`}>{error}</p>}
        {!versions && !error && <VersionHistorySkeleton />}
        {versions && versions.length === 0 && (
          <p className="text-[13px] text-[color:var(--ink-2)] px-5 py-4 m-0 leading-[1.55]">
            No changes recorded yet. From now on, every change to this application, in the app or through the API,
            is kept here.
          </p>
        )}

        {versions && versions.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-[300px_1fr]">
            <ol className="m-0 p-0 list-none overflow-y-auto max-md:max-h-[35%] max-md:border-b md:border-r border-white/8 shrink-0">
              {versions.map((v) => {
                const author = authorLabel(v.author);
                const active = v.id === selectedId;
                return (
                  <li key={v.id}>
                    <button
                      className={`w-full text-left px-4 py-2.5 border-none border-b border-white/5 cursor-pointer flex flex-col gap-1 ${active ? 'bg-[color:var(--accent-bg)] shadow-[inset_3px_0_0_var(--accent)]' : 'bg-transparent hover:bg-white/4'}`}
                      onClick={() => setSelectedId(v.id)}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`${mono} text-[10px] border rounded px-1.5 py-px ${author.className}`}>{author.text}</span>
                        <span className={`${mono} text-[10.5px] text-[color:var(--ink-3)]`}>{formatTime(v.createdAt)}</span>
                      </span>
                      <span className={`text-[12.5px] leading-[1.45] ${v.message ? 'text-[color:var(--ink-invert)]' : 'text-[color:var(--ink-3)] italic'}`}>
                        {v.message ?? (v.author === 'baseline' ? 'State before the first recorded change' : 'No description')}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
              {selected && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`${mono} text-[11px] text-[color:var(--ink-2)]`}>
                    {previous ? `Changes compared to ${formatTime(previous.createdAt)}` : 'Oldest kept version'}
                  </span>
                  <button className={restoreBtn} onClick={handleRestore} disabled={restoring || index === 0}
                    title={index === 0 ? 'This is the current version' : undefined}>
                    {index === 0 ? 'Current version' : restoring ? 'Restoring…' : 'Restore this version'}
                  </button>
                </div>
              )}
              {selected && previous && changes.length === 0 && (
                <p className="text-[13px] text-[color:var(--ink-3)] m-0">No visible changes.</p>
              )}
              {selected && !previous && (
                <p className="text-[13px] text-[color:var(--ink-3)] m-0 leading-[1.55]">
                  There's no older version to compare this one with.
                </p>
              )}
              {changes.map((change, i) => <ChangeView key={i} change={change} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
