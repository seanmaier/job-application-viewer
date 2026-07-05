import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applications } from '../data/applications';
import type { ApplicationConfig, Profile } from '../types';
import profileData from '../data/profile.json';
import { useApplication } from '../hooks/useApplication';

const profile = profileData as Profile;
import '../styles/new-application-page.css';
import '../styles/edit-application-page.css';

function toId(company: string) {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-app';
}

function generateJson(app: ApplicationConfig): string {
  const obj: Record<string, unknown> = {
    id: app.id,
    company: app.company,
    role: app.role,
    status: app.status,
    ...(app.url && { url: app.url }),
    ...(app.appliedDate && { appliedDate: app.appliedDate }),
    ...(app.summaryOverride && { summaryOverride: app.summaryOverride }),
    ...(app.featuredProjectIds?.length && { featuredProjectIds: app.featuredProjectIds }),
    coverLetter: {
      recipientOrg: app.coverLetter.recipientOrg,
      ...(app.coverLetter.recipientName && { recipientName: app.coverLetter.recipientName }),
      date: app.coverLetter.date,
      subjectRole: app.coverLetter.subjectRole,
      paragraphs: app.coverLetter.paragraphs,
    },
  };
  return JSON.stringify(obj, null, 2);
}

// Inner component — staticApp is guaranteed to exist
function EditContent({ staticApp }: { staticApp: ApplicationConfig }) {
  const { app, save, reset, isDirty } = useApplication(staticApp);
  const navigate = useNavigate();

  const [company, setCompany] = useState(app.company);
  const [role, setRole] = useState(app.role);
  const [url, setUrl] = useState(app.url ?? '');
  const [appliedDate, setAppliedDate] = useState(app.appliedDate ?? '');
  const [summaryOverride, setSummaryOverride] = useState(app.summaryOverride ?? '');
  const [featuredIds, setFeaturedIds] = useState<string[]>(
    app.featuredProjectIds ?? profile.projects.map((p) => p.id),
  );
  const [date, setDate] = useState(app.coverLetter.date);
  const [recipientOrg, setRecipientOrg] = useState(app.coverLetter.recipientOrg);
  const [recipientName, setRecipientName] = useState(app.coverLetter.recipientName ?? '');
  const [subjectRole, setSubjectRole] = useState(app.coverLetter.subjectRole);
  const [paragraphs, setParagraphs] = useState<string[]>([...app.coverLetter.paragraphs]);

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
    ...(url && { url }),
    ...(appliedDate && { appliedDate }),
    ...(summaryOverride && { summaryOverride }),
    featuredProjectIds: featuredIds,
    coverLetter: {
      recipientOrg,
      ...(recipientName && { recipientName }),
      date,
      subjectRole: subjectRole || role,
      paragraphs: paragraphs.filter(Boolean),
    },
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
    <div className="new-app-page">
      <div className="edit-app-header">
        <Link className="new-app-back" to={`/application/${staticApp.id}`}>
          ← {staticApp.company}
        </Link>
        <span className="new-app-title">
          Editing &nbsp;<span className="edit-app-company">{staticApp.company}</span>
        </span>
        <div className="edit-app-header-actions">
          {isDirty && (
            <button className="edit-reset-btn" onClick={handleReset}>
              Reset to default
            </button>
          )}
          <button
            className={`edit-save-btn ${saved ? 'edit-save-btn--saved' : ''}`}
            onClick={handleSave}
          >
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="new-app-body">
        {/* ── Form ── */}
        <div className="new-app-form">
          <div className="naf-section">
            <span className="naf-label">Company</span>
            <input className="naf-input" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          <div className="naf-section">
            <span className="naf-label">Role</span>
            <input className="naf-input" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>

          <div className="naf-section">
            <span className="naf-label">
              Job posting URL <span className="naf-optional">(optional)</span>
            </span>
            <input
              className="naf-input"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="naf-row">
            <div className="naf-section">
              <span className="naf-label">
                Applied date <span className="naf-optional">(optional)</span>
              </span>
              <input
                className="naf-input"
                placeholder="e.g. July 5, 2026"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
              />
            </div>
            <div className="naf-section">
              <span className="naf-label">Cover letter date</span>
              <input
                className="naf-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="naf-row">
            <div className="naf-section">
              <span className="naf-label">Recipient org</span>
              <input
                className="naf-input"
                value={recipientOrg}
                onChange={(e) => setRecipientOrg(e.target.value)}
              />
            </div>
            <div className="naf-section">
              <span className="naf-label">
                Recipient name <span className="naf-optional">(optional)</span>
              </span>
              <input
                className="naf-input"
                placeholder="defaults to Hiring Team"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
          </div>

          <div className="naf-section">
            <span className="naf-label">Subject role</span>
            <input
              className="naf-input"
              placeholder="defaults to Role"
              value={subjectRole}
              onChange={(e) => setSubjectRole(e.target.value)}
            />
          </div>

          <div className="naf-section">
            <span className="naf-label">
              Profile summary override <span className="naf-optional">(optional)</span>
            </span>
            <textarea
              className="naf-textarea"
              placeholder="Leave empty to use the default profile summary"
              rows={3}
              value={summaryOverride}
              onChange={(e) => setSummaryOverride(e.target.value)}
            />
          </div>

          <div className="naf-section">
            <span className="naf-label">Featured projects</span>
            <div className="naf-checkboxes">
              {profile.projects.map((p) => (
                <label className="naf-checkbox-label" key={p.id}>
                  <input
                    type="checkbox"
                    checked={featuredIds.includes(p.id)}
                    onChange={() => toggleProject(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          <div className="naf-section">
            <span className="naf-label">Cover letter paragraphs</span>
            {paragraphs.map((p, i) => (
              <div className="naf-paragraph-row" key={i}>
                <textarea
                  className="naf-textarea"
                  placeholder={`Paragraph ${i + 1}`}
                  value={p}
                  rows={4}
                  onChange={(e) => updateParagraph(i, e.target.value)}
                />
                {paragraphs.length > 1 && (
                  <button className="naf-remove-btn" onClick={() => removeParagraph(i)}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button className="naf-add-btn" onClick={addParagraph}>
              + Add paragraph
            </button>
          </div>
        </div>

        {/* ── Code preview ── */}
        <div className="new-app-preview">
          <div className="nap-header">
            <span className="nap-filename">
              src/data/applications/{toId(company)}.json
            </span>
            <span className="nap-live-label">live preview</span>
          </div>
          <pre className="nap-code">{generateJson(previewApp)}</pre>
          <p className="nap-hint">
            Changes are saved to your browser. Copy the JSON above to update{' '}
            <code>src/data/applications/{toId(company)}.json</code> permanently.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EditApplicationPage() {
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

  return <EditContent staticApp={staticApp} />;
}
