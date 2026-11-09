import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { AppLanguage, ApplicationConfig, BaseProfile } from '../types';
import {
  applicationsUsingBaseProfile, deleteBaseProfilePermanently, getDeletedBaseProfiles, restoreBaseProfile,
} from '../utils/baseProfiles';
import {
  deleteLocalApplicationPermanently, getDeletedLocalApplications, restoreLocalApplication,
} from '../utils/localApplications';
import { purgeDate, TRASH_RETENTION_DAYS } from '../utils/trash';

const LANG_FLAGS: Record<AppLanguage, string> = { en: '🇬🇧', de: '🇩🇪' };

const actionBtn =
  '[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-2)] bg-transparent border border-[color:var(--rule)] rounded px-2.5 py-1 cursor-pointer transition-colors';
const meta = '[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)]';
const sectionLabel = '[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--accent)] mb-2';

const formatDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

// Newest deletions first: those are the ones most likely to be restored.
function newestFirst<T extends { deletedAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? ''));
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

interface RowProps {
  title: ReactNode;
  deletedAt: string;
  extra?: string;
  onRestore: () => void;
  onDeletePermanently: () => void;
}

function TrashRow({ title, deletedAt, extra, onRestore, onDeletePermanently }: RowProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[color:var(--rule)] py-2.5">
      <div className="flex-1 min-w-[200px]">
        <span className="block [font-family:var(--font-mono)] text-[12.5px] text-[color:var(--ink-invert)] truncate">{title}</span>
        <span className={`block ${meta} mt-0.5`}>
          deleted {formatDate(deletedAt)} · removed {formatDate(purgeDate(deletedAt))}
          {extra && ` · ${extra}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className={`${actionBtn} hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]`} onClick={onRestore}>
          restore
        </button>
        <button
          className={`${actionBtn} hover:text-[color:var(--status-rejected)] hover:border-[color:var(--status-rejected)]`}
          onClick={onDeletePermanently}
        >
          delete permanently
        </button>
      </div>
    </div>
  );
}

function Section({ label, empty, children }: { label: string; empty: boolean; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className={sectionLabel}>{label}</h2>
      {empty ? <p className={`${meta} py-4`}>nothing here.</p> : children}
    </section>
  );
}

/** Soft-deleted applications and base profiles: restore them, or delete them for good before the server purges them. */
export function TrashPage() {
  const [applications, setApplications] = useState(() => newestFirst(getDeletedLocalApplications()));
  const [profiles, setProfiles] = useState(() => newestFirst(getDeletedBaseProfiles()));
  const reload = () => {
    setApplications(newestFirst(getDeletedLocalApplications()));
    setProfiles(newestFirst(getDeletedBaseProfiles()));
  };

  const deleteApplication = (app: ApplicationConfig) => {
    if (!confirm(`Delete "${app.company} – ${app.role}" permanently, with its cover letter and notes? This cannot be undone.`)) return;
    deleteLocalApplicationPermanently(app.id);
    reload();
  };

  const deleteProfile = (profile: BaseProfile) => {
    const usedBy = applicationsUsingBaseProfile(profile.id);
    const fallback = usedBy.length > 0
      ? ` ${plural(usedBy.length, 'application')} (${usedBy.map((a) => a.company).join(', ')}) ` +
        'will fall back to the language default profile.'
      : '';
    if (!confirm(`Delete "${profile.name}" permanently? This cannot be undone.${fallback}`)) return;
    deleteBaseProfilePermanently(profile.id);
    reload();
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] pt-6 px-4 pb-32 max-w-[900px] mx-auto sm:pt-12 sm:px-8">
      <header className="mb-6 sm:mb-8 [font-family:var(--font-mono)] text-[15px] flex flex-wrap items-center gap-x-5 gap-y-1">
        <Link className="text-[11px] text-[color:var(--ink-3)] no-underline hover:text-[color:var(--ink-invert)]" to="/">
          ← Dashboard
        </Link>
        <span>
          <span className="text-[color:var(--ink-3)]">~/</span>
          <span className="text-[color:var(--accent)]">trash</span>
          <span className="text-[color:var(--ink-3)] animate-pulse"> _</span>
        </span>
      </header>

      <p className={`${meta} mb-8 leading-[1.6]`}>
        Deleted applications and base profiles stay here for {TRASH_RETENTION_DAYS} days, then they're removed for good.
        A trashed base profile keeps rendering for the applications that use it until then.
      </p>

      <Section label="applications" empty={applications.length === 0}>
        {applications.map((a) => (
          <TrashRow
            key={a.id}
            title={`${LANG_FLAGS[a.language ?? 'en']} ${a.company} – ${a.role}`}
            deletedAt={a.deletedAt!}
            onRestore={() => { restoreLocalApplication(a.id); reload(); }}
            onDeletePermanently={() => deleteApplication(a)}
          />
        ))}
      </Section>

      <Section label="base profiles" empty={profiles.length === 0}>
        {profiles.map((p) => {
          const usedBy = applicationsUsingBaseProfile(p.id).length;
          return (
            <TrashRow
              key={p.id}
              title={`${LANG_FLAGS[p.language]} ${p.name}`}
              deletedAt={p.deletedAt!}
              extra={usedBy > 0 ? `used by ${plural(usedBy, 'application')}` : undefined}
              onRestore={() => { restoreBaseProfile(p.id); reload(); }}
              onDeletePermanently={() => deleteProfile(p)}
            />
          );
        })}
      </Section>
    </div>
  );
}
