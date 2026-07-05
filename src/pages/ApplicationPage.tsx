import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applications } from '../data/applications';
import { profile } from '../data/profile';
import { CVDocument } from '../components/cv/CVDocument';
import { CoverLetterDocument } from '../components/cover-letter/CoverLetterDocument';
import { ExportModal } from '../components/ExportModal';
import { useApplicationStatus } from '../hooks/useApplicationStatus';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/status';
import { generateTextExport } from '../utils/textExport';
import type { ApplicationStatus } from '../types';
import '../styles/application-page.css';

export function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const application = applications.find((a) => a.id === id);
  const [exportOpen, setExportOpen] = useState(false);

  if (!application) {
    return (
      <div className="app-not-found">
        <p>Application not found.</p>
        <Link to="/">← Back to dashboard</Link>
      </div>
    );
  }

  const [status, setStatus] = useApplicationStatus(application.id, application.status);

  return (
    <div className="app-page">
      <div className="app-toolbar">
        <Link className="app-back" to="/">← Dashboard</Link>
        <div className="app-toolbar-center">
          <span className="app-company">{application.company}</span>
          <span className="app-role">{application.role}</span>
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
          <button className="app-export-btn" onClick={() => setExportOpen(true)}>
            LLM Export
          </button>
          <button className="app-print-btn" onClick={() => window.print()}>
            Print / PDF
          </button>
        </div>
      </div>

      <div className="app-documents">
        <CVDocument profile={profile} application={application} />
        <CoverLetterDocument profile={profile} application={application} />
      </div>

      {exportOpen && (
        <ExportModal
          text={generateTextExport(profile, application)}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  );
}
