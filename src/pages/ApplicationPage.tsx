import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applications } from '../data/applications';
import { profile } from '../data/profile';
import { CVDocument } from '../components/cv/CVDocument';
import { CoverLetterDocument } from '../components/cover-letter/CoverLetterDocument';
import { ExportModal } from '../components/ExportModal';
import { JsonEditModal } from '../components/JsonEditModal';
import { useApplication } from '../hooks/useApplication';
import { useApplicationStatus } from '../hooks/useApplicationStatus';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/status';
import { generateTextExport } from '../utils/textExport';
import type { ApplicationConfig, ApplicationStatus } from '../types';
import '../styles/application-page.css';

// Guard component — renders nothing until we confirm the app exists,
// so inner hooks are never called conditionally.
export function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const staticApp = id ? applications.find((a) => a.id === id) : undefined;

  if (!staticApp) {
    return (
      <div className="app-not-found">
        <p>Application not found.</p>
        <Link to="/">← Back to dashboard</Link>
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

  return (
    <div className="app-page">
      <div className="app-toolbar">
        <Link className="app-back" to="/">← Dashboard</Link>
        <div className="app-toolbar-center">
          <span className="app-company">{app.company}</span>
          <span className="app-role">{app.role}</span>
          {isDirty && <span className="app-dirty-badge">edited</span>}
        </div>
        <div className="app-toolbar-right">
          <select
            className="app-status-select"
            value={status}
            style={{ color: STATUS_COLORS[status] }}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Link className="app-edit-btn" to={`/application/${staticApp.id}/edit`}>
            Edit
          </Link>
          <button className="app-edit-btn" onClick={() => setJsonOpen(true)}>
            JSON
          </button>
          <button className="app-export-btn" onClick={() => setExportOpen(true)}>
            LLM Export
          </button>
          <button className="app-print-btn" onClick={() => window.print()}>
            Print / PDF
          </button>
        </div>
      </div>

      <div className="app-documents">
        <CVDocument profile={profile} application={{ ...app, status }} />
        <CoverLetterDocument profile={profile} application={{ ...app, status }} />
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
