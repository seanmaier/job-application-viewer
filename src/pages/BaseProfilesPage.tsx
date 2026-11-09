import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AppLanguage } from '../types';
import {
  getBaseProfiles, getDeletedBaseProfiles, trashBaseProfile, trashConfirmMessage, applicationsUsingBaseProfile,
} from '../utils/baseProfiles';
import type { BaseProfile } from '../types';
import { CreateBaseProfileModal } from '../components/CreateBaseProfileModal';

const LANG_FLAGS: Record<AppLanguage, string> = { en: '🇬🇧', de: '🇩🇪' };

export function BaseProfilesPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(() => getBaseProfiles());
  const [trashCount, setTrashCount] = useState(() => getDeletedBaseProfiles().length);
  const [createOpen, setCreateOpen] = useState(false);

  const handleTrash = (profile: BaseProfile) => {
    if (!confirm(trashConfirmMessage(profile))) return;
    trashBaseProfile(profile.id);
    setProfiles(getBaseProfiles());
    setTrashCount(getDeletedBaseProfiles().length);
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] pt-6 px-4 pb-32 max-w-[900px] mx-auto sm:pt-12 sm:px-8">
      <header className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="[font-family:var(--font-mono)] text-[15px] flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link className="text-[11px] text-[color:var(--ink-3)] no-underline hover:text-[color:var(--ink-invert)]" to="/">
            ← Dashboard
          </Link>
          <span>
            <span className="text-[color:var(--ink-3)]">~/</span>
            <span className="text-[color:var(--accent)] whitespace-nowrap">base-profiles</span>
            <span className="text-[color:var(--ink-3)] animate-pulse"> _</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline border border-[color:var(--rule)] px-3 py-1.5 hover:text-[color:var(--ink-invert)] hover:border-[color:var(--ink-2)] transition-colors duration-150"
            to="/trash"
          >
            trash{trashCount > 0 ? ` (${trashCount})` : ''}
          </Link>
          <button
            className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] bg-transparent border border-[color:var(--rule)] px-3 py-1.5 cursor-pointer hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] transition-colors duration-150"
            onClick={() => setCreateOpen(true)}
          >
            + new base profile
          </button>
        </div>
      </header>

      {/* Column headers */}
      <div className="hidden sm:flex items-center border-b border-[color:var(--rule)] pb-1.5">
        <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] flex-1">
          name
        </span>
        <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] w-[70px] shrink-0 text-right">
          lang
        </span>
        <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] w-[130px] shrink-0 text-right">
          used by
        </span>
        <span className="w-[130px] shrink-0" />
      </div>

      {profiles.length === 0 ? (
        <p className="[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-3)] py-10">
          no base profiles yet.
        </p>
      ) : (
        profiles.map((p) => {
          const usedBy = applicationsUsingBaseProfile(p.id);
          return (
            <div
              key={p.id}
              className="group flex items-center border-b border-[color:var(--rule)] py-2.5 cursor-pointer transition-colors duration-100 hover:bg-[color:var(--surface)]"
              onClick={() => navigate(`/profiles/${p.id}`)}
            >
              <div className="flex-1 min-w-0">
                <span className="block [font-family:var(--font-mono)] text-[12.5px] text-[color:var(--ink-invert)] truncate">{p.name}</span>
                {/* Language and usage move under the name on phones, where their columns don't fit */}
                <span className="sm:hidden block [font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] mt-0.5">
                  {LANG_FLAGS[p.language]} · {usedBy.length > 0 ? `${usedBy.length} application${usedBy.length === 1 ? '' : 's'}` : 'unused'}
                </span>
              </div>
              <span className="hidden sm:block text-[12px] w-[70px] shrink-0 text-right" title={p.language}>
                {LANG_FLAGS[p.language]}
              </span>
              <span className="hidden sm:block [font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] w-[130px] shrink-0 text-right truncate">
                {usedBy.length > 0 ? `${usedBy.length} application${usedBy.length === 1 ? '' : 's'}` : '—'}
              </span>
              <div className="shrink-0 flex items-center justify-end gap-2 pl-3 sm:w-[130px]">
                <Link
                  className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-2)] no-underline border border-[color:var(--rule)] rounded px-2.5 py-1 transition-colors hover:text-[color:var(--ink-invert)] hover:border-[color:var(--ink-2)]"
                  to={`/profiles/${p.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  edit
                </Link>
                <button
                  className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-2)] bg-transparent border border-[color:var(--rule)] rounded px-2.5 py-1 cursor-pointer transition-colors hover:text-[color:var(--status-rejected)] hover:border-[color:var(--status-rejected)]"
                  onClick={(e) => { e.stopPropagation(); handleTrash(p); }}
                  title="Move to trash"
                >
                  delete
                </button>
              </div>
            </div>
          );
        })
      )}

      {createOpen && (
        <CreateBaseProfileModal
          existingProfiles={profiles}
          onClose={() => setCreateOpen(false)}
          onCreated={(id) => navigate(`/profiles/${id}`)}
        />
      )}
    </div>
  );
}
