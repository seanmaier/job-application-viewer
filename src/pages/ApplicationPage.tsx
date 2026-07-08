import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applications } from '../data/applications';
import { getProfile } from '../data/profiles';
import { CVDocument } from '../components/cv/CVDocument';
import { CoverLetterDocument } from '../components/cover-letter/CoverLetterDocument';
import { ExportModal } from '../components/ExportModal';
import { JsonEditModal } from '../components/JsonEditModal';
import { useApplication } from '../hooks/useApplication';
import { useApplicationStatus } from '../hooks/useApplicationStatus';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/status';
import { generateTextExport } from '../utils/textExport';
import type { ApplicationConfig, ApplicationStatus, CoverLetter } from '../types';

const LANG_FLAGS: Record<string, string> = { en: '🇬🇧', de: '🇩🇪' };

export function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const staticApp = id ? applications.find((a) => a.id === id) : undefined;

  if (!staticApp) {
    return (
      <div className="py-20 px-10 [font-family:var(--font-mono)] text-[color:var(--ink-2)] flex flex-col gap-4">
        <p>Application not found.</p>
        <Link className="text-[color:var(--accent)]" to="/">← Back to dashboard</Link>
      </div>
    );
  }

  return <ApplicationContent staticApp={staticApp} />;
}

function ApplicationContent({ staticApp }: { staticApp: ApplicationConfig }) {
  const { app, save, isDirty } = useApplication(staticApp);
  const [status, setStatus] = useApplicationStatus(staticApp.id, staticApp.status);
  const [exportOpen, setExportOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);

  const profile = getProfile(app.language);
  const langFlag = LANG_FLAGS[app.language ?? 'en'];

  return (
    <div className="min-h-screen bg-[color:var(--bg)] print:min-h-0 print:bg-white">
      <div className="sticky top-0 z-10 bg-[color:var(--ink)] flex items-center justify-between px-6 h-[52px] gap-4 print:hidden">
        <Link
          className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline shrink-0 hover:text-[color:var(--surface)]"
          to="/"
        >
          ← Dashboard
        </Link>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-[13px] font-semibold text-[color:var(--surface)] whitespace-nowrap">{app.company}</span>
          <span className="text-[12px] text-[color:var(--ink-3)] whitespace-nowrap overflow-hidden text-ellipsis">{app.role}</span>
          <span className="text-[13px] leading-none" title={`Language: ${app.language ?? 'en'}`}>{langFlag}</span>
          {isDirty && (
            <span className="[font-family:var(--font-mono)] text-[9px] tracking-[0.1em] uppercase text-[color:var(--status-sent)] border border-[color:var(--status-sent)] rounded-[10px] py-px px-[7px] opacity-80">
              edited
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <select
            className="[font-family:var(--font-mono)] text-[11px] bg-white/7 border border-white/12 rounded px-2.5 py-[5px] cursor-pointer min-w-[140px]"
            value={status}
            style={{ color: STATUS_COLORS[status] }}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="text-[color:var(--ink)] bg-[color:var(--surface)]">{label}</option>
            ))}
          </select>
          <Link
            className="[font-family:var(--font-mono)] text-[11px] bg-white/7 text-[color:var(--surface)] border border-white/18 rounded px-3.5 py-[5px] cursor-pointer tracking-[0.04em] no-underline hover:bg-white/14"
            to={`/application/${staticApp.id}/edit`}
          >
            Edit
          </Link>
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-white/7 text-[color:var(--surface)] border border-white/18 rounded px-3.5 py-[5px] cursor-pointer tracking-[0.04em] hover:bg-white/14"
            onClick={() => setJsonOpen(true)}
          >
            JSON
          </button>
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--accent-bg)] border border-[color:var(--accent)] rounded px-3.5 py-[5px] cursor-pointer tracking-[0.04em] hover:bg-[color:var(--accent)] hover:text-[color:var(--surface)]"
            onClick={() => setExportOpen(true)}
          >
            LLM Export
          </button>
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--accent-bg)] border border-[color:var(--accent)] rounded px-3.5 py-[5px] cursor-pointer tracking-[0.04em] hover:bg-[color:var(--accent)] hover:text-[color:var(--surface)]"
            onClick={() => {
              const prev = document.title;
              document.title = `${app.company} - ${app.role} · ${profile.name}`;
              window.print();
              document.title = prev;
            }}
          >
            Print / PDF
          </button>
        </div>
      </div>

      <div className="pt-10 px-5 pb-20 print:p-0">
        <CVDocument profile={profile} application={{ ...app, status }} />
        {app.coverLetter && (
          <CoverLetterDocument
            profile={profile}
            application={{ ...app, status, coverLetter: app.coverLetter as CoverLetter }}
          />
        )}
      </div>

      {exportOpen && (
        <ExportModal
          text={generateTextExport(profile, { ...app, status })}
          onClose={() => setExportOpen(false)}
        />
      )}

      {jsonOpen && (
        <JsonEditModal
          app={{ ...app, status }}
          onSave={(updated) => { save(updated); }}
          onClose={() => setJsonOpen(false)}
        />
      )}
    </div>
  );
}
