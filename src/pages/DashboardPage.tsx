import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applications as staticApps } from '../data/applications';
import { getLocalApplications, deleteLocalApplication } from '../utils/localApplications';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/status';
import { ApplicationCard } from '../components/dashboard/ApplicationCard';
import { ImportApplicationModal } from '../components/ImportApplicationModal';
import type { ApplicationStatus } from '../types';

function readStatus(id: string, fallback: ApplicationStatus): ApplicationStatus {
  return (localStorage.getItem(`status-${id}`) as ApplicationStatus | null) ?? fallback;
}

function writeStatus(id: string, status: ApplicationStatus) {
  localStorage.setItem(`status-${id}`, status);
}

export function DashboardPage() {
  const [localApps, setLocalApps] = useState(() => getLocalApplications());
  const allApps = [...staticApps, ...localApps];

  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>(() =>
    Object.fromEntries(allApps.map((a) => [a.id, readStatus(a.id, a.status)])),
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    writeStatus(id, status);
    setStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleBulkStatus = (status: ApplicationStatus) => {
    selected.forEach((id) => writeStatus(id, status));
    setStatuses((prev) => {
      const next = { ...prev };
      selected.forEach((id) => { next[id] = status; });
      return next;
    });
    setSelected(new Set());
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this application?')) return;
    deleteLocalApplication(id);
    setLocalApps(getLocalApplications());
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelected(new Set());
  };

  const handleBulkDelete = () => {
    const deletableIds = [...selected].filter((id) => !staticApps.some((s) => s.id === id));
    if (deletableIds.length === 0) return;
    const skipped = selected.size - deletableIds.length;
    const message =
      `Delete ${deletableIds.length} selected application${deletableIds.length === 1 ? '' : 's'}? This cannot be undone.` +
      (skipped > 0 ? ` (${skipped} selected application${skipped === 1 ? '' : 's'} can't be deleted and will be kept.)` : '');
    if (!confirm(message)) return;
    deletableIds.forEach((id) => deleteLocalApplication(id));
    setLocalApps(getLocalApplications());
    setSelected(new Set());
  };

  const anySelected = selected.size > 0;

  return (
    <div className="min-h-screen bg-[color:var(--bg)] pt-12 px-8 pb-32 max-w-[900px] mx-auto">
      <header className="mb-8 flex items-baseline justify-between gap-6">
        <div className="[font-family:var(--font-mono)] text-[15px]">
          <span className="text-[color:var(--ink-3)]">~/</span>
          <span className="text-[color:var(--accent)]">applications</span>
          <span className="text-[color:var(--ink-3)] animate-pulse"> _</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`[font-family:var(--font-mono)] text-[11px] bg-transparent border px-3 py-1.5 cursor-pointer transition-colors duration-150 ${
              selectMode
                ? 'text-[color:var(--accent)] border-[color:var(--accent)]'
                : 'text-[color:var(--ink-3)] border-[color:var(--rule)] hover:text-[color:var(--ink-2)] hover:border-[color:var(--ink-2)]'
            }`}
            onClick={toggleSelectMode}
          >
            {selectMode ? 'done' : 'select'}
          </button>
          <Link
            className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline border border-[color:var(--rule)] px-3 py-1.5 hover:text-[color:var(--ink-2)] hover:border-[color:var(--ink-2)] transition-colors duration-150"
            to="/profile"
          >
            profile
          </Link>
          <button
            className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] bg-transparent border border-[color:var(--rule)] px-3 py-1.5 cursor-pointer hover:text-[color:var(--ink-2)] hover:border-[color:var(--ink-2)] transition-colors duration-150"
            onClick={() => setImportOpen(true)}
          >
            import
          </button>
          <Link
            className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline border border-[color:var(--rule)] px-3 py-1.5 hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] transition-colors duration-150"
            to="/application/new"
          >
            + new
          </Link>
        </div>
      </header>

      {/* Column headers */}
      <div className="flex items-center border-b border-[color:var(--rule)] pb-1.5">
        <span className="w-[28px] shrink-0" />
        <span className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] w-[190px] shrink-0">company</span>
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
                status={statuses[app.id] ?? app.status}
                onStatusChange={(s) => handleStatusChange(app.id, s)}
                selected={selected.has(app.id)}
                onSelect={(checked) => handleSelect(app.id, checked)}
                showCheckbox={selectMode || anySelected}
                selectMode={selectMode}
                onDelete={isLocal ? () => handleDelete(app.id) : undefined}
              />
            );
          })}
        </div>
      )}

      {/* Bulk action bar */}
      {anySelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[color:var(--surface)] border border-[color:var(--rule)] px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <span className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-2)]">
            {selected.size} selected
          </span>
          <span className="text-[color:var(--rule)] select-none">|</span>
          <span className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)]">set status:</span>
          <div className="flex items-center gap-1.5">
            {(Object.entries(STATUS_LABELS) as [ApplicationStatus, string][]).map(([value, label]) => (
              <button
                key={value}
                className="[font-family:var(--font-mono)] text-[10.5px] bg-transparent border-none cursor-pointer px-2 py-0.5 hover:opacity-70 transition-opacity"
                style={{ color: STATUS_COLORS[value] }}
                onClick={() => handleBulkStatus(value)}
              >
                [{label}]
              </button>
            ))}
          </div>
          <span className="text-[color:var(--rule)] select-none">|</span>
          <button
            className="[font-family:var(--font-mono)] text-[10.5px] bg-transparent border-none cursor-pointer px-2 py-0.5 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--status-rejected)' }}
            onClick={handleBulkDelete}
          >
            delete
          </button>
          <span className="text-[color:var(--rule)] select-none">|</span>
          <button
            className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] bg-transparent border-none cursor-pointer hover:text-[color:var(--status-rejected)] transition-colors"
            onClick={() => setSelected(new Set())}
          >
            ✕
          </button>
        </div>
      )}

      {importOpen && <ImportApplicationModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}
