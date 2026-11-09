import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AppLanguage, BaseProfile } from '../types';
import {
  applicationsUsingBaseProfile, deleteBaseProfilePermanently, getDeletedBaseProfiles, restoreBaseProfile,
} from '../utils/baseProfiles';
import { purgeDate, TRASH_RETENTION_DAYS } from '../utils/trash';

const LANG_FLAGS: Record<AppLanguage, string> = { en: '🇬🇧', de: '🇩🇪' };

const actionBtn =
  '[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-2)] bg-transparent border border-[color:var(--rule)] rounded px-2.5 py-1 cursor-pointer transition-colors';
const meta = '[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)]';

const formatDate = (date: Date) => date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

// Newest deletions first: those are the ones most likely to be restored.
const byDeletedDesc = (a: BaseProfile, b: BaseProfile) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? '');

/** Soft-deleted base profiles: restore them, or delete them for good before the server purges them. */
export function TrashPage() {
  const [profiles, setProfiles] = useState(() => getDeletedBaseProfiles().sort(byDeletedDesc));
  const reload = () => setProfiles(getDeletedBaseProfiles().sort(byDeletedDesc));

  const handleRestore = (profile: BaseProfile) => {
    restoreBaseProfile(profile.id);
    reload();
  };

  const handleDeletePermanently = (profile: BaseProfile) => {
    const usedBy = applicationsUsingBaseProfile(profile.id);
    const fallback = usedBy.length > 0
      ? ` ${usedBy.length} application${usedBy.length === 1 ? '' : 's'} (${usedBy.map((a) => a.company).join(', ')}) ` +
        'will fall back to the language default profile.'
      : '';
    if (!confirm(`Delete "${profile.name}" permanently? This cannot be undone.${fallback}`)) return;
    deleteBaseProfilePermanently(profile.id);
    reload();
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] pt-6 px-4 pb-32 max-w-[900px] mx-auto sm:pt-12 sm:px-8">
      <header className="mb-6 sm:mb-8 [font-family:var(--font-mono)] text-[15px] flex flex-wrap items-center gap-x-5 gap-y-1">
        <Link className="text-[11px] text-[color:var(--ink-3)] no-underline hover:text-[color:var(--ink-invert)]" to="/profiles">
          ← Base profiles
        </Link>
        <span>
          <span className="text-[color:var(--ink-3)]">~/</span>
          <span className="text-[color:var(--accent)]">trash</span>
          <span className="text-[color:var(--ink-3)] animate-pulse"> _</span>
        </span>
      </header>

      <p className={`${meta} mb-6 leading-[1.6]`}>
        Deleted base profiles stay here for {TRASH_RETENTION_DAYS} days, then they're removed for good.
        Applications that use one keep rendering it until then.
      </p>

      {profiles.length === 0 ? (
        <p className="[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-3)] py-10">the trash is empty.</p>
      ) : (
        profiles.map((p) => {
          const usedBy = applicationsUsingBaseProfile(p.id).length;
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[color:var(--rule)] py-2.5">
              <div className="flex-1 min-w-[200px]">
                <span className="block [font-family:var(--font-mono)] text-[12.5px] text-[color:var(--ink-invert)] truncate">
                  {LANG_FLAGS[p.language]} {p.name}
                </span>
                <span className={`block ${meta} mt-0.5`}>
                  deleted {formatDate(new Date(p.deletedAt!))} · removed {formatDate(purgeDate(p.deletedAt!))}
                  {usedBy > 0 && ` · used by ${usedBy} application${usedBy === 1 ? '' : 's'}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`${actionBtn} hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]`}
                  onClick={() => handleRestore(p)}
                >
                  restore
                </button>
                <button
                  className={`${actionBtn} hover:text-[color:var(--status-rejected)] hover:border-[color:var(--status-rejected)]`}
                  onClick={() => handleDeletePermanently(p)}
                >
                  delete permanently
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
