import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useBlocker } from 'react-router-dom';
import { applications } from '../data/applications';
import { getLocalApplications } from '../utils/localApplications';
import type { ApplicationConfig, AppFont, AppLanguage, CoverLetter } from '../types';
import { ALL_FONTS, FONT_LABELS } from '../utils/fonts';
import { getProfile } from '../data/profiles';
import { useApplication } from '../hooks/useApplication';
import { CVDocument } from '../components/cv/CVDocument';
import { CoverLetterDocument } from '../components/cover-letter/CoverLetterDocument';
import { AutoTextarea } from '../components/AutoTextarea';
import { ImportParagraphsControl } from '../components/ImportParagraphsControl';
import { ExportParagraphsButton } from '../components/ExportParagraphsButton';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';
import { formatDateLong, parseToIsoDate } from '../utils/date';
import {
  nafSection, nafRow, nafLabel, nafOptional, nafInput, nafTextarea,
  nafCheckboxes, nafCheckboxLabel, nafCheckboxInput, nafParagraphRow, nafRemoveBtn, nafAddBtn,
  newAppPage, newAppBack, newAppTitle, newAppBody, newAppForm,
  newAppPreview, napHeader, napFilename, napHint, napLiveLabel,
  editAppHeader, editAppCompany, editAppHeaderActions, editResetBtn, editSaveBtn,
} from '../styles/formStyles';

function toId(company: string) {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-app';
}

// Inner component — staticApp is guaranteed to exist
function EditContent({ staticApp }: { staticApp: ApplicationConfig }) {
  const { app, save, reset, isDirty } = useApplication(staticApp);
  const navigate = useNavigate();

  const [company, setCompany] = useState(app.company);
  const [role, setRole] = useState(app.role);
  const [url, setUrl] = useState(app.url ?? '');
  const [appliedDate, setAppliedDate] = useState(app.appliedDate ?? '');
  const [language, setLanguage] = useState<AppLanguage>(app.language ?? 'en');
  const [font, setFont] = useState<AppFont>(app.font ?? 'sans');

  const profile = getProfile(language);
  const [summaryOverride, setSummaryOverride] = useState(app.summaryOverride ?? '');
  const [featuredIds, setFeaturedIds] = useState<string[]>(
    app.featuredProjectIds ?? profile.projects.map((p) => p.id),
  );
  const [hasCoverLetter, setHasCoverLetter] = useState(!!app.coverLetter);
  const [dateISO, setDateISO] = useState(() => parseToIsoDate(app.coverLetter?.date ?? ''));
  const [recipientOrg, setRecipientOrg] = useState(app.coverLetter?.recipientOrg ?? '');
  const [recipientName, setRecipientName] = useState(app.coverLetter?.recipientName ?? '');
  const [subjectRole, setSubjectRole] = useState(app.coverLetter?.subjectRole ?? '');
  const [paragraphs, setParagraphs] = useState<string[]>([...(app.coverLetter?.paragraphs ?? [''])]);

  const toggleProject = (id: string) =>
    setFeaturedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const updateParagraph = (i: number, value: string) =>
    setParagraphs((prev) => prev.map((p, idx) => (idx === i ? value : p)));

  const addParagraph = () => setParagraphs((prev) => [...prev, '']);
  const removeParagraph = (i: number) =>
    setParagraphs((prev) => prev.filter((_, idx) => idx !== i));

  const buildConfig = (): Omit<ApplicationConfig, 'status'> => ({
    id: staticApp.id,
    company,
    role,
    language,
    font,
    ...(url && { url }),
    ...(appliedDate && { appliedDate }),
    ...(summaryOverride && { summaryOverride }),
    featuredProjectIds: featuredIds,
    ...(hasCoverLetter && {
      coverLetter: {
        recipientOrg,
        ...(recipientName && { recipientName }),
        date: formatDateLong(dateISO, language),
        subjectRole: subjectRole || role,
        paragraphs: paragraphs.filter(Boolean),
      },
    }),
  });

  // Snapshot of the form's initial values — never updated, since saving or
  // resetting always immediately navigates away rather than staying on the page.
  const [initialSnapshot] = useState(() => JSON.stringify(buildConfig()));
  const isFormDirty = JSON.stringify(buildConfig()) !== initialSnapshot;

  // Save/Reset trigger their own deliberate navigation right after already
  // persisting or discarding the changes — never block those. skipBlockRef is
  // mutated synchronously right before calling navigate() in the same event
  // handler, before React re-renders, so this must read it live via a
  // function (a plain boolean would bake in a stale snapshot from the last
  // render and still block that same-tick navigation).
  const skipBlockRef = useRef(false);
  const blocker = useBlocker(() => isFormDirty && !skipBlockRef.current);

  useEffect(() => {
    if (!isFormDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isFormDirty]);

  const handleSave = () => {
    save(buildConfig());
    skipBlockRef.current = true;
    navigate(`/application/${staticApp.id}`);
  };

  const handleReset = () => {
    if (!confirm('Reset all edits and restore the original config?')) return;
    reset();
    skipBlockRef.current = true;
    navigate(`/application/${staticApp.id}`);
  };

  const previewApp: ApplicationConfig = { ...buildConfig(), status: app.status };

  return (
    <div className={newAppPage}>
      <div className={editAppHeader}>
        <Link className={newAppBack} to={`/application/${staticApp.id}`}>
          ← {staticApp.company}
        </Link>
        <span className={newAppTitle}>
          Editing &nbsp;<span className={editAppCompany}>{staticApp.company}</span>
        </span>
        <div className={editAppHeaderActions}>
          {isDirty && (
            <button className={editResetBtn} onClick={handleReset}>
              Reset to default
            </button>
          )}
          <button className={editSaveBtn} onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>

      <div className={newAppBody}>
        {/* ── Form ── */}
        <div className={newAppForm}>
          <div className={nafSection}>
            <span className={nafLabel}>Company</span>
            <input className={nafInput} value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          <div className={nafSection}>
            <span className={nafLabel}>Role</span>
            <input className={nafInput} value={role} onChange={(e) => setRole(e.target.value)} />
          </div>

          <div className={nafSection}>
            <span className={nafLabel}>
              Job posting URL <span className={nafOptional}>(optional)</span>
            </span>
            <input
              className={nafInput}
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className={nafRow}>
            <div className={nafSection}>
              <span className={nafLabel}>Language</span>
              <select
                className={nafInput}
                value={language}
                onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              >
                <option value="en">English 🇬🇧</option>
                <option value="de">Deutsch 🇩🇪</option>
              </select>
            </div>
            <div className={nafSection}>
              <span className={nafLabel}>Font</span>
              <select
                className={nafInput}
                value={font}
                onChange={(e) => setFont(e.target.value as AppFont)}
              >
                {ALL_FONTS.map((f) => (
                  <option key={f} value={f}>{FONT_LABELS[f]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={nafSection}>
            <span className={nafLabel}>
              Applied date <span className={nafOptional}>(optional)</span>
            </span>
            <input
              className={nafInput}
              placeholder="e.g. July 5, 2026"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </div>

          <div className={nafSection}>
            <span className={nafLabel}>
              Profile summary override <span className={nafOptional}>(optional)</span>
            </span>
            <AutoTextarea
              className={nafTextarea}
              placeholder="Leave empty to use the default profile summary"
              value={summaryOverride}
              onChange={(e) => setSummaryOverride(e.target.value)}
            />
          </div>

          <div className={nafSection}>
            <span className={nafLabel}>Featured projects</span>
            <div className={nafCheckboxes}>
              {profile.projects.map((p) => (
                <label className={nafCheckboxLabel} key={p.id}>
                  <input
                    className={nafCheckboxInput}
                    type="checkbox"
                    checked={featuredIds.includes(p.id)}
                    onChange={() => toggleProject(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          <div className={nafSection}>
            <label className={nafCheckboxLabel}>
              <input
                className={nafCheckboxInput}
                type="checkbox"
                checked={hasCoverLetter}
                onChange={(e) => setHasCoverLetter(e.target.checked)}
              />
              Include cover letter
            </label>
          </div>

          {hasCoverLetter && (
            <>
              <div className={nafRow}>
                <div className={nafSection}>
                  <span className={nafLabel}>Cover letter date</span>
                  <input
                    type="date"
                    className={nafInput}
                    value={dateISO}
                    onChange={(e) => setDateISO(e.target.value)}
                  />
                </div>
                <div className={nafSection}>
                  <span className={nafLabel}>Subject role</span>
                  <input
                    className={nafInput}
                    placeholder="defaults to Role"
                    value={subjectRole}
                    onChange={(e) => setSubjectRole(e.target.value)}
                  />
                </div>
              </div>

              <div className={nafRow}>
                <div className={nafSection}>
                  <span className={nafLabel}>Recipient org</span>
                  <input
                    className={nafInput}
                    value={recipientOrg}
                    onChange={(e) => setRecipientOrg(e.target.value)}
                  />
                </div>
                <div className={nafSection}>
                  <span className={nafLabel}>
                    Recipient name <span className={nafOptional}>(optional)</span>
                  </span>
                  <input
                    className={nafInput}
                    placeholder="defaults to Hiring Team"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
              </div>

              <div className={nafSection}>
                <span className={nafLabel}>Cover letter paragraphs</span>
                <ImportParagraphsControl onImport={setParagraphs} />
                <ExportParagraphsButton paragraphs={paragraphs} />
                {paragraphs.map((p, i) => (
                  <div className={nafParagraphRow} key={i}>
                    <AutoTextarea
                      className={nafTextarea}
                      placeholder={`Paragraph ${i + 1}`}
                      value={p}
                      onChange={(e) => updateParagraph(i, e.target.value)}
                    />
                    {paragraphs.length > 1 && (
                      <button className={nafRemoveBtn} onClick={() => removeParagraph(i)}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button className={nafAddBtn} onClick={addParagraph}>
                  + Add paragraph
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Live preview ── */}
        <div className={newAppPreview}>
          <div className={napHeader}>
            <span className={napFilename}>
              private/applications/{toId(company)}.json
            </span>
            <span className={napLiveLabel}>live preview</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="py-8 px-5">
              <CVDocument profile={profile} application={previewApp} />
              {previewApp.coverLetter && (
                <CoverLetterDocument
                  profile={profile}
                  application={{ ...previewApp, coverLetter: previewApp.coverLetter as CoverLetter }}
                  paginate
                />
              )}
            </div>
          </div>
          <p className={napHint}>
            Changes are saved to your browser as you edit. Use the{' '}
            <code>JSON</code> button on the application page to copy the config to{' '}
            <code>private/applications/{toId(company)}.json</code> permanently.
          </p>
        </div>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesDialog
          onCancel={() => blocker.reset()}
          onDiscard={() => blocker.proceed()}
          onSave={() => {
            save(buildConfig());
            blocker.proceed();
          }}
        />
      )}
    </div>
  );
}

export function EditApplicationPage() {
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

  return <EditContent staticApp={staticApp} />;
}
