import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applications } from '../data/applications';
import { getLocalApplications } from '../utils/localApplications';
import { getProfile } from '../data/profiles';
import { CVDocument } from '../components/cv/CVDocument';
import { CoverLetterDocument } from '../components/cover-letter/CoverLetterDocument';
import { ExportModal } from '../components/ExportModal';
import { JsonEditModal } from '../components/JsonEditModal';
import { useApplication } from '../hooks/useApplication';
import { useApplicationStatus } from '../hooks/useApplicationStatus';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/status';
import { FONT_LABELS, ALL_FONTS } from '../utils/fonts';
import { generateTextExport } from '../utils/textExport';
import { buildPdfFilename } from '../utils/pdfFilename';
import { autoAppliedDateFor, autoInterviewDateFor, autoFinalDecisionDateFor } from '../utils/autoStatusDates';
import { sanitizeFolderName, renderPageCanvases, buildPdfBlob, writeApplicationPdfs } from '../utils/pdfExport';
import {
  isFileSystemAccessSupported, getSavedExportFolder, chooseExportFolder, ensureExportFolderPermission,
} from '../utils/exportFolder';
import type { ApplicationConfig, ApplicationStatus, AppFont, CoverLetter } from '../types';

const LANG_FLAGS: Record<string, string> = { en: '🇬🇧', de: '🇩🇪' };

export function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const staticApp = id ? [...applications, ...getLocalApplications()].find((a) => a.id === id) : undefined;

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
  const [exportFolderName, setExportFolderName] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const cvExportRef = useRef<HTMLDivElement>(null);
  const clExportRef = useRef<HTMLDivElement>(null);

  const profile = getProfile(app.language);
  const langFlag = LANG_FLAGS[app.language ?? 'en'];

  useEffect(() => {
    getSavedExportFolder().then((handle) => setExportFolderName(handle?.name ?? null));
  }, []);

  const handleFontChange = (font: AppFont) => {
    const { status: _s, ...rest } = app;
    save({ ...rest, font });
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    const autoApplied = autoAppliedDateFor(status, newStatus, app.appliedDate, app.language);
    const autoInterview = autoInterviewDateFor(status, newStatus, app.interviewDate, app.language);
    const autoFinalDecision = autoFinalDecisionDateFor(status, newStatus, app.finalDecisionDate, app.language);
    if (autoApplied || autoInterview || autoFinalDecision) {
      const { status: _s, ...rest } = app;
      save({
        ...rest,
        ...(autoApplied && { appliedDate: autoApplied }),
        ...(autoInterview && { interviewDate: autoInterview }),
        ...(autoFinalDecision && { finalDecisionDate: autoFinalDecision }),
      });
    }
    setStatus(newStatus);
  };

  const handleChooseFolder = async () => {
    if (!isFileSystemAccessSupported()) {
      alert('Your browser doesn\'t support choosing a save folder. Try Chrome or Edge.');
      return;
    }
    const handle = await chooseExportFolder();
    if (handle) setExportFolderName(handle.name);
  };

  const handleDownload = async () => {
    if (!isFileSystemAccessSupported()) {
      alert('Your browser doesn\'t support saving directly to a folder. Try Chrome or Edge.');
      return;
    }
    if (!profile.name.trim()) {
      const goToProfile = confirm(
        'Your profile has no name set yet, so the exported files can\'t be named properly. Set one now?',
      );
      if (goToProfile) navigate('/profile');
      return;
    }

    let handle = await getSavedExportFolder();
    if (!handle) {
      handle = await chooseExportFolder();
      if (!handle) return;
      setExportFolderName(handle.name);
    }

    const hasPermission = await ensureExportFolderPermission(handle);
    if (!hasPermission) {
      alert('Permission to write to the export folder was denied.');
      return;
    }

    setDownloading(true);
    try {
      const cvPages = cvExportRef.current
        ? Array.from(cvExportRef.current.querySelectorAll(':scope > .doc-page')) as HTMLElement[]
        : [];
      const clPages = clExportRef.current
        ? Array.from(clExportRef.current.querySelectorAll(':scope > .doc-page')) as HTMLElement[]
        : [];

      const cvCanvases = await renderPageCanvases(cvPages);
      const clCanvases = clPages.length > 0 ? await renderPageCanvases(clPages) : [];

      const lang = app.language ?? 'en';
      const files: Array<{ filename: string; blob: Blob }> = [
        { filename: `${buildPdfFilename('cv', lang, profile.name)}.pdf`, blob: buildPdfBlob(cvCanvases) },
      ];
      if (clCanvases.length > 0) {
        files.push({ filename: `${buildPdfFilename('coverLetter', lang, profile.name)}.pdf`, blob: buildPdfBlob(clCanvases) });
        files.push({ filename: `${buildPdfFilename('both', lang, profile.name)}.pdf`, blob: buildPdfBlob([...cvCanvases, ...clCanvases]) });
      }

      await writeApplicationPdfs(handle, sanitizeFolderName(app.company), files);
    } catch (e) {
      console.error(e);
      alert('Something went wrong while exporting. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] print:min-h-0 print:bg-white">
      <div className="sticky top-0 z-10 bg-[color:var(--ink)] flex items-center justify-between px-6 h-[52px] gap-4 print:hidden">
        <Link
          className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline shrink-0 hover:text-[color:var(--ink-invert)]"
          to="/"
        >
          ← Dashboard
        </Link>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-[13px] font-semibold text-[color:var(--ink-invert)] whitespace-nowrap">{app.company}</span>
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
            className="[font-family:var(--font-mono)] text-[11px] bg-white/7 border border-white/12 rounded px-2.5 py-[5px] cursor-pointer text-[color:var(--ink-2)]"
            value={app.font ?? 'sans'}
            onChange={(e) => handleFontChange(e.target.value as AppFont)}
          >
            {ALL_FONTS.map((f) => (
              <option key={f} value={f} className="text-[color:var(--ink-invert)] bg-[color:var(--surface)]">
                {FONT_LABELS[f]}
              </option>
            ))}
          </select>
          <select
            className="[font-family:var(--font-mono)] text-[11px] bg-white/7 border border-white/12 rounded px-2.5 py-[5px] cursor-pointer min-w-[140px]"
            value={status}
            style={{ color: STATUS_COLORS[status] }}
            onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="text-[color:var(--ink-invert)] bg-[color:var(--surface)]">{label}</option>
            ))}
          </select>
          <Link
            className="[font-family:var(--font-mono)] text-[11px] bg-white/7 text-[color:var(--ink-invert)] border border-white/18 rounded px-3.5 py-[5px] cursor-pointer tracking-[0.04em] no-underline hover:bg-white/14"
            to={`/application/${staticApp.id}/edit`}
          >
            Edit
          </Link>
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-white/7 text-[color:var(--ink-invert)] border border-white/18 rounded px-3.5 py-[5px] cursor-pointer tracking-[0.04em] hover:bg-white/14"
            onClick={() => setJsonOpen(true)}
          >
            JSON
          </button>
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--accent)] border border-[color:var(--accent)] rounded px-3.5 py-[5px] cursor-pointer tracking-[0.04em] hover:bg-[color:var(--accent)] hover:text-[color:var(--ink)]"
            onClick={() => setExportOpen(true)}
          >
            LLM Export
          </button>
          {exportFolderName && (
            <span
              className="[font-family:var(--font-mono)] text-[10px] text-[color:var(--ink-3)] whitespace-nowrap"
              title="Export folder"
            >
              📁 {exportFolderName}
            </span>
          )}
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--ink-3)] border border-white/12 rounded px-3 py-[5px] cursor-pointer hover:text-[color:var(--ink-invert)] hover:border-white/25"
            onClick={handleChooseFolder}
          >
            {exportFolderName ? 'change folder' : 'choose folder'}
          </button>
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--accent)] border border-[color:var(--accent)] rounded px-3.5 py-[5px] cursor-pointer tracking-[0.04em] hover:bg-[color:var(--accent)] hover:text-[color:var(--ink)] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </button>
        </div>
      </div>

      <div className="pt-10 px-5 pb-20 print:p-0">
        <CVDocument profile={profile} application={{ ...app, status }} />
        {app.coverLetter && (
          <CoverLetterDocument
            profile={profile}
            application={{ ...app, status, coverLetter: app.coverLetter as CoverLetter }}
            paginate
          />
        )}
      </div>

      {/* Off-screen, A4-accurate copies rasterized for the PDF download — kept
          separate from the on-screen view above so its layout never affects it. */}
      {/* Intentionally off-screen rather than visibility/display-hidden — html2canvas
          needs the browser to actually paint this content, which hidden elements aren't. */}
      <div className="pdf-export-root" style={{ position: 'absolute', top: 0, left: '-9999px' }}>
        <div ref={cvExportRef}>
          <CVDocument profile={profile} application={{ ...app, status }} />
        </div>
        {app.coverLetter && (
          <div ref={clExportRef}>
            <CoverLetterDocument
              profile={profile}
              application={{ ...app, status, coverLetter: app.coverLetter as CoverLetter }}
              paginate
            />
          </div>
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
