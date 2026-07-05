import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Profile } from '../types';
import profileData from '@private/profile.json';
import {
  nafSection, nafRow, nafLabel, nafOptional, nafInput, nafTextarea,
  nafCheckboxes, nafCheckboxLabel, nafCheckboxInput, nafParagraphRow, nafRemoveBtn, nafAddBtn,
  newAppPage, newAppHeader, newAppBack, newAppTitle, newAppBody, newAppForm,
  newAppPreview, napHeader, napFilename, napCopyBtn, napCopyBtnCopied, napCode, napHint, napHintCode,
} from '../styles/formStyles';

const profile = profileData as Profile;

function toId(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-app';
}

function generateJson(
  company: string,
  role: string,
  url: string,
  date: string,
  subjectRole: string,
  featuredIds: string[],
  paragraphs: string[],
): string {
  const id = toId(company);
  const obj: Record<string, unknown> = {
    id,
    company,
    role,
    status: 'drafting',
    ...(url && { url }),
    ...(featuredIds.length > 0 && { featuredProjectIds: featuredIds }),
    coverLetter: {
      recipientOrg: company,
      date,
      subjectRole: subjectRole || role,
      paragraphs,
    },
  };
  return JSON.stringify(obj, null, 2);
}

export function NewApplicationPage() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState('July 5, 2026');
  const [subjectRole, setSubjectRole] = useState('');
  const [featuredIds, setFeaturedIds] = useState<string[]>(profile.projects.map((p) => p.id));
  const [paragraphs, setParagraphs] = useState<string[]>(['']);
  const [copied, setCopied] = useState(false);

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

  const code = generateJson(company, role, url, date, subjectRole, featuredIds, paragraphs.filter(Boolean));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filename = `${toId(company) || 'company'}.json`;

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

          <div className={nafSection}>
            <span className={nafLabel}>Job posting URL <span className={nafOptional}>(optional)</span></span>
            <input
              className={nafInput}
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

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
        </div>

        {/* ── Code preview ── */}
        <div className={newAppPreview}>
          <div className={napHeader}>
            <span className={napFilename}>src/data/applications/{filename}</span>
            <button
              className={copied ? napCopyBtnCopied : napCopyBtn}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className={napCode}>{code}</pre>
          <p className={napHint}>
            Save as <code className={napHintCode}>src/data/applications/{filename}</code>, then add the import to{' '}
            <code className={napHintCode}>src/data/applications/index.ts</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
