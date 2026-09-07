import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AppLanguage } from '../types';
import {
  getBaseProfiles, deleteBaseProfile, applicationsUsingBaseProfile,
} from '../utils/baseProfiles';
import { CreateBaseProfileModal } from '../components/CreateBaseProfileModal';

const LANG_FLAGS: Record<AppLanguage, string> = { en: '🇬🇧', de: '🇩🇪' };

export function BaseProfilesPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(() => getBaseProfiles());
  const [createOpen, setCreateOpen] = useState(false);

  const handleDelete = (id: string, name: string) => {
    const usedBy = applicationsUsingBaseProfile(id);
    const message = usedBy.length > 0
      ? `"${name}" is used by ${usedBy.length} application${usedBy.length === 1 ? '' : 's'} ` +
        `(${usedBy.map((a) => a.company).join(', ')}). Deleting it will fall them back to the ` +
        `language default profile. Delete anyway?`
      : `Delete base profile "${name}"? This cannot be undone.`;
    if (!confirm(message)) return;
    deleteBaseProfile(id);
    setProfiles(getBaseProfiles());
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] pt-12 px-8 pb-32 max-w-[900px] mx-auto">
      <header className="mb-8 flex items-baseline justify-between gap-6">
        <div className="[font-family:var(--font-mono)] text-[15px] flex items-center gap-5">
          <Link className="text-[11px] text-[color:var(--ink-3)] no-underline hover:text-[color:var(--ink-invert)]" to="/">
            ← Dashboard
          </Link>
          <span>
            <span className="text-[color:var(--ink-3)]">~/</span>
            <span className="text-[color:var(--accent)]">base-profiles</span>
            <span className="text-[color:var(--ink-3)] animate-pulse"> _</span>
          </span>
        </div>
        <button
          className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] bg-transparent border border-[color:var(--rule)] px-3 py-1.5 cursor-pointer hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] transition-colors duration-150"
          onClick={() => setCreateOpen(true)}
        >
          + new base profile
        </button>
      </header>

      {/* Column headers */}
      <div className="flex items-center border-b border-[color:var(--rule)] pb-1.5">
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
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className="[font-family:var(--font-mono)] text-[12.5px] text-[color:var(--ink-invert)] truncate">{p.name}</span>
              </div>
              <span className="text-[12px] w-[70px] shrink-0 text-right" title={p.language}>
                {LANG_FLAGS[p.language]}
              </span>
              <span className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] w-[130px] shrink-0 text-right truncate">
                {usedBy.length > 0 ? `${usedBy.length} application${usedBy.length === 1 ? '' : 's'}` : '—'}
              </span>
              <div className="w-[130px] shrink-0 flex items-center justify-end gap-2">
                <Link
                  className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline border border-[color:var(--rule)] rounded px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[color:var(--ink-invert)] hover:border-[color:var(--ink-2)]"
                  to={`/profiles/${p.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  edit
                </Link>
                <button
                  className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:text-[color:var(--status-rejected)]"
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }}
                  title="Delete"
                >
                  ✕
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
