import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AppLanguage, ApplicationConfig } from '../types';
import { getProfile } from '../data/profiles';
import { saveLocalApplication } from '../utils/localApplications';
import {
  nafSection, nafRow, nafLabel, nafOptional, nafInput, nafTextarea,
  nafCheckboxes, nafCheckboxLabel, nafCheckboxInput, nafParagraphRow, nafRemoveBtn, nafAddBtn,
  newAppPage, newAppHeader, newAppBack, newAppTitle, newAppBody, newAppForm,
  newAppPreview, napHeader, napFilename, napCopyBtn, napCopyBtnCopied, napCode, napHint, napHintCode,
  editSaveBtn,
} from '../styles/formStyles';

function toId(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-app';
}

function buildConfig(
  company: string,
  role: string,
  url: string,
  language: AppLanguage,
  featuredIds: string[],
  hasCoverLetter: boolean,
  date: string,
  subjectRole: string,
  paragraphs: string[],
): ApplicationConfig {
  return {
    id: toId(company),
    company,
    role,
    status: 'drafting',
    language,
    ...(url && { url }),
    ...(featuredIds.length > 0 && { featuredProjectIds: featuredIds }),
    ...(hasCoverLetter && {
      coverLetter: {
        recipientOrg: company,
        date,
        subjectRole: subjectRole || role,
        paragraphs,
      },
    }),
  };
}

export function NewApplicationPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [hasCoverLetter, setHasCoverLetter] = useState(false);
  const [date, setDate] = useState('July 8, 2026');
  const [subjectRole, setSubjectRole] = useState('');
  const [paragraphs, setParagraphs] = useState<string[]>(['']);
  const [copied, setCopied] = useState(false);

  const profile = getProfile(language);
  const [featuredIds, setFeaturedIds] = useState<string[]>(() => getProfile('en').projects.map((p) => p.id));

  const toggleProject = (id: string) => {
    setFeaturedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const updateParagraph = (i: number, value: string) => {
    setParagraphs((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  };

  const addParagraph = () => setParagraphs((prev) => [...prev, '']);
  const removeParagraph = (i: number) => setParagraphs((prev) => prev.filter((_, idx) => idx !== i));

  const config = buildConfig(company, role, url, language, featuredIds, hasCoverLetter, date, subjectRole, paragraphs.filter(Boolean));
  const code = JSON.stringify(config, null, 2);
  const filename = `${config.id || 'company'}.json`;

  const canSave = company.trim() !== '' && role.trim() !== '';

  const handleSave = () => {
    if (!canSave) return;
    saveLocalApplication(config);
    navigate(`/application/${config.id}`);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={newAppPage}>
      <div className={newAppHeader}>
        <Link className={newAppBack} to="/">← Dashboard</Link>
        <span className={newAppTitle}>New Application</span>
      </div>

      <div className={newAppBody}>
        {/* ── Form ── */}
        <div className={newAppForm}>
          <div className={nafSection}>
            <span className={nafLabel}>Company</span>
            <input
              className={nafInput}
              placeholder="e.g. Vattenfall"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className={nafSection}>
            <span className={nafLabel}>Role</span>
            <input
              className={nafInput}
              placeholder="e.g. Backend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className={nafRow}>
            <div className={nafSection}>
              <span className={nafLabel}>Job posting URL <span className={nafOptional}>(optional)</span></span>
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
                  <span className={nafLabel}>Subject role <span className={nafOptional}>(if different)</span></span>
                  <input
                    className={nafInput}
                    placeholder="defaults to Role"
                    value={subjectRole}
                    onChange={(e) => setSubjectRole(e.target.value)}
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
                      <button className={nafRemoveBtn} onClick={() => removeParagraph(i)}>✕</button>
                    )}
                  </div>
                ))}
                <button className={nafAddBtn} onClick={addParagraph}>+ Add paragraph</button>
              </div>
            </>
          )}

          <button
            className={editSaveBtn}
            style={{ opacity: canSave ? 1 : 0.4, cursor: canSave ? 'pointer' : 'not-allowed' }}
            onClick={handleSave}
            disabled={!canSave}
          >
            Save application
          </button>
        </div>

        {/* ── Code preview ── */}
        <div className={newAppPreview}>
          <div className={napHeader}>
            <span className={napFilename}>private/applications/{filename}</span>
            <button
              className={copied ? napCopyBtnCopied : napCopyBtn}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
          <pre className={napCode}>{code}</pre>
          <p className={napHint}>
            To commit permanently, save as{' '}
            <code className={napHintCode}>private/applications/{filename}</code> and add the import to{' '}
            <code className={napHintCode}>src/data/applications/index.ts</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
