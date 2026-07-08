import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applications } from '../data/applications';
import { getLocalApplications } from '../utils/localApplications';
import type { ApplicationConfig, AppLanguage } from '../types';
import { getProfile } from '../data/profiles';
import { useApplication } from '../hooks/useApplication';
import {
  nafSection, nafRow, nafLabel, nafOptional, nafInput, nafTextarea,
  nafCheckboxes, nafCheckboxLabel, nafCheckboxInput, nafParagraphRow, nafRemoveBtn, nafAddBtn,
  newAppPage, newAppBack, newAppTitle, newAppBody, newAppForm,
  newAppPreview, napHeader, napFilename, napCode, napHint, napLiveLabel,
  editAppHeader, editAppCompany, editAppHeaderActions, editResetBtn, editSaveBtn, editSaveBtnSaved,
} from '../styles/formStyles';

function toId(company: string) {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-app';
}

function generateJson(app: ApplicationConfig): string {
  const obj: Record<string, unknown> = {
    id: app.id,
    company: app.company,
    role: app.role,
    status: app.status,
    language: app.language ?? 'en',
    ...(app.url && { url: app.url }),
    ...(app.appliedDate && { appliedDate: app.appliedDate }),
    ...(app.summaryOverride && { summaryOverride: app.summaryOverride }),
    ...(app.featuredProjectIds?.length && { featuredProjectIds: app.featuredProjectIds }),
    ...(app.coverLetter && {
      coverLetter: {
        recipientOrg: app.coverLetter.recipientOrg,
        ...(app.coverLetter.recipientName && { recipientName: app.coverLetter.recipientName }),
        date: app.coverLetter.date,
        subjectRole: app.coverLetter.subjectRole,
        paragraphs: app.coverLetter.paragraphs,
      },
    }),
  };
  return JSON.stringify(obj, null, 2);
}

// Inner component — staticApp is guaranteed to exist
function EditContent({ staticApp }: { staticApp: ApplicationConfig }) {
  const { app, save, reset, isDirty } = useApplication(staticApp);
  const navigate = useNavigate();

  const profile = getProfile(app.language);

  const [company, setCompany] = useState(app.company);
  const [role, setRole] = useState(app.role);
  const [url, setUrl] = useState(app.url ?? '');
  const [appliedDate, setAppliedDate] = useState(app.appliedDate ?? '');
  const [language, setLanguage] = useState<AppLanguage>(app.language ?? 'en');
  const [summaryOverride, setSummaryOverride] = useState(app.summaryOverride ?? '');
  const [featuredIds, setFeaturedIds] = useState<string[]>(
    app.featuredProjectIds ?? profile.projects.map((p) => p.id),
  );
  const [hasCoverLetter, setHasCoverLetter] = useState(!!app.coverLetter);
  const [date, setDate] = useState(app.coverLetter?.date ?? '');
  const [recipientOrg, setRecipientOrg] = useState(app.coverLetter?.recipientOrg ?? '');
  const [recipientName, setRecipientName] = useState(app.coverLetter?.recipientName ?? '');
  const [subjectRole, setSubjectRole] = useState(app.coverLetter?.subjectRole ?? '');
  const [paragraphs, setParagraphs] = useState<string[]>([...(app.coverLetter?.paragraphs ?? [''])]);

  const [saved, setSaved] = useState(false);

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
    ...(url && { url }),
    ...(appliedDate && { appliedDate }),
    ...(summaryOverride && { summaryOverride }),
    featuredProjectIds: featuredIds,
    ...(hasCoverLetter && {
      coverLetter: {
        recipientOrg,
        ...(recipientName && { recipientName }),
        date,
        subjectRole: subjectRole || role,
        paragraphs: paragraphs.filter(Boolean),
      },
    }),
  });

  const handleSave = () => {
    save(buildConfig());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!confirm('Reset all edits and restore the original config?')) return;
    reset();
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
          <button
            className={saved ? editSaveBtnSaved : editSaveBtn}
            onClick={handleSave}
          >
            {saved ? 'Saved!' : 'Save changes'}
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

          <div className={nafRow}>
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
            <textarea
              className={nafTextarea}
              placeholder="Leave empty to use the default profile summary"
              rows={3}
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
                    className={nafInput}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
                {paragraphs.map((p, i) => (
                  <div className={nafParagraphRow} key={i}>
                    <textarea
                      className={nafTextarea}
                      placeholder={`Paragraph ${i + 1}`}
                      value={p}
                      rows={4}
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

        {/* ── Code preview ── */}
        <div className={newAppPreview}>
          <div className={napHeader}>
            <span className={napFilename}>
              private/applications/{toId(company)}.json
            </span>
            <span className={napLiveLabel}>live preview</span>
          </div>
          <pre className={napCode}>{generateJson(previewApp)}</pre>
          <p className={napHint}>
            Changes are saved to your browser. Copy the JSON above to update{' '}
            <code>private/applications/{toId(company)}.json</code> permanently.
          </p>
        </div>
      </div>
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
