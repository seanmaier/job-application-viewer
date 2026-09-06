import type React from 'react';
import type { ApplicationConfig, CoverLetter, Profile } from '../../types';
import { FONT_STACKS } from '../../utils/fonts';
import '../../styles/document.css';

interface Props {
  profile: Profile;
  application: Omit<ApplicationConfig, 'coverLetter'> & { coverLetter: CoverLetter };
}

const LABELS = {
  en: {
    contact: 'Contact',
    recipientFallback: 'Hiring Team',
    subjectPrefix: 'Re:',
    sign: 'Sincerely,',
  },
  de: {
    contact: 'Kontakt',
    recipientFallback: 'Personalabteilung',
    subjectPrefix: 'Betreff:',
    sign: 'Mit freundlichen Grüßen',
  },
} as const;

export function CoverLetterDocument({ profile, application }: Props) {
  const t = LABELS[application.language ?? 'en'];
  const { coverLetter: cl } = application;
  const fontStyle = application.font
    ? ({ '--font-sans': FONT_STACKS[application.font] } as React.CSSProperties)
    : undefined;

  return (
    <div className="doc-page" style={fontStyle}>
      <header className="cl-header">
        <div>
          <div className="cl-sender-name">{profile.name}</div>
          <div className="cl-sender-sub">{profile.role}</div>
        </div>
        <nav className="cl-contact-right" aria-label={t.contact}>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <br />
          <a href={`https://${profile.website}`} target="_blank" rel="noopener">{profile.website}</a>
          <br />
          <a href={`https://${profile.github}`} target="_blank" rel="noopener">{profile.github}</a>
          <br />
          {profile.city}
        </nav>
      </header>

      <div className="cl-meta">
        <div className="cl-date">{cl.date}</div>
        <div className="cl-recipient">
          {cl.recipientName ?? t.recipientFallback}
          <br />
          {cl.recipientOrg}
          <br />
          {profile.city}
        </div>
      </div>

      <div className="cl-subject">{t.subjectPrefix} {cl.subjectRole}</div>

      <div className="cl-body">
        {cl.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="cl-sign">
        {t.sign}
        <br />
        <span className="cl-sign-name">{profile.name}</span>
      </div>
    </div>
  );
}
