import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Profile } from '../types';
import profileData from '@private/profile.json';
import '../styles/new-application-page.css';

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
    <div className="new-app-page">
      <div className="new-app-header">
        <Link className="new-app-back" to="/">← Dashboard</Link>
        <span className="new-app-title">New Application</span>
      </div>

      <div className="new-app-body">
        {/* ── Form ── */}
        <div className="new-app-form">
          <div className="naf-section">
            <span className="naf-label">Company</span>
            <input
              className="naf-input"
              placeholder="e.g. Vattenfall"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="naf-section">
            <span className="naf-label">Role</span>
            <input
              className="naf-input"
              placeholder="e.g. Backend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="naf-section">
            <span className="naf-label">Job posting URL <span className="naf-optional">(optional)</span></span>
            <input
              className="naf-input"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="naf-row">
            <div className="naf-section">
              <span className="naf-label">Cover letter date</span>
              <input
                className="naf-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="naf-section">
              <span className="naf-label">Subject role <span className="naf-optional">(if different)</span></span>
              <input
                className="naf-input"
                placeholder="defaults to Role"
                value={subjectRole}
                onChange={(e) => setSubjectRole(e.target.value)}
              />
            </div>
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
                  <button className="naf-remove-btn" onClick={() => removeParagraph(i)}>✕</button>
                )}
              </div>
            ))}
            <button className="naf-add-btn" onClick={addParagraph}>+ Add paragraph</button>
          </div>
        </div>

        {/* ── Code preview ── */}
        <div className="new-app-preview">
          <div className="nap-header">
            <span className="nap-filename">src/data/applications/{filename}</span>
            <button
              className={`nap-copy-btn ${copied ? 'nap-copy-btn--copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="nap-code">{code}</pre>
          <p className="nap-hint">
            Save as <code>src/data/applications/{filename}</code>, then add the import to{' '}
            <code>src/data/applications/index.ts</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
