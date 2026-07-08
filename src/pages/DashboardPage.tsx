import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applications as staticApps } from '../data/applications';
import { getLocalApplications, deleteLocalApplication } from '../utils/localApplications';
import { ApplicationCard } from '../components/dashboard/ApplicationCard';

export function DashboardPage() {
  const [localApps, setLocalApps] = useState(() => getLocalApplications());
  const allApps = [...staticApps, ...localApps];

  const handleDelete = (id: string) => {
    if (!confirm('Delete this application?')) return;
    deleteLocalApplication(id);
    setLocalApps(getLocalApplications());
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] pt-12 px-8 pb-20 max-w-[860px] mx-auto">
      <header className="mb-8 flex items-baseline justify-between gap-6">
        <div className="[font-family:var(--font-mono)] text-[15px]">
          <span className="text-[color:var(--ink-3)]">~/</span>
          <span className="text-[color:var(--accent)]">applications</span>
          <span className="text-[color:var(--ink-3)] animate-pulse"> _</span>
        </div>
        <Link
          className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline border border-[color:var(--rule)] px-3 py-1.5 hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] transition-colors duration-150"
          to="/application/new"
        >
          + new
        </Link>
      </header>

      {/* Column headers */}
      <div className="flex items-center border-b border-[color:var(--rule)] pb-1.5">
        <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] w-[190px] shrink-0 pl-1">company</span>
        <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] flex-1">role</span>
        <span className="w-[28px] shrink-0" />
        <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] w-[116px] shrink-0 text-right pr-1">status</span>
        <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] w-[90px] shrink-0 text-right">applied</span>
        <span className="w-[28px] shrink-0" />
      </div>

      {allApps.length === 0 ? (
        <p className="[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-3)] py-10">
          no applications found.
        </p>
      ) : (
        <div>
          {allApps.map((app) => {
            const isLocal = !staticApps.some((s) => s.id === app.id);
            return (
              <ApplicationCard
                key={app.id}
                application={app}
                onDelete={isLocal ? () => handleDelete(app.id) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
