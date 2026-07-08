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
    <div className="min-h-screen bg-[color:var(--bg)] pt-12 px-10 pb-20 max-w-[900px] mx-auto">
      <header className="mb-6 flex items-center justify-between gap-6 border-b-[1.5px] border-[color:var(--rule)] pb-5">
        <div className="text-[22px] font-bold text-[color:var(--ink)] tracking-[-0.4px]">Applications</div>
        <Link
          className="[font-family:var(--font-mono)] text-[11px] bg-[color:var(--accent)] text-white no-underline rounded px-3.5 py-[6px] tracking-[0.03em] hover:bg-[#1d4ed8] transition-colors duration-150"
          to="/application/new"
        >
          + New
        </Link>
      </header>

      {allApps.length === 0 ? (
        <p className="[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-3)] py-8 text-center">
          No applications yet. Add one to get started.
        </p>
      ) : (
        <div className="border border-[color:var(--rule)] rounded-lg overflow-hidden">
          <div className="flex items-center gap-5 px-5 py-2 bg-[color:var(--surface)] border-b border-[color:var(--rule)]">
            <span className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] text-[color:var(--ink-3)] w-[200px] shrink-0">Company</span>
            <span className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] text-[color:var(--ink-3)] flex-1">Role</span>
            <span className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] text-[color:var(--ink-3)] w-[110px] text-center shrink-0">Status</span>
            <span className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] text-[color:var(--ink-3)] w-[96px] text-right shrink-0">Sent</span>
            <span className="w-[19px] shrink-0" />
          </div>
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
