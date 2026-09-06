import type React from 'react';
import { Fragment } from 'react';
import type { ApplicationConfig, CoverLetter, Profile } from '../../types';
import { FONT_STACKS } from '../../utils/fonts';
import { usePagedBlocks } from './usePagedBlocks';
import type { Block } from './usePagedBlocks';
import { joinLines } from '../../utils/lines';
import '../../styles/document.css';

interface Props {
  profile: Profile;
  application: Omit<ApplicationConfig, 'coverLetter'> & { coverLetter: CoverLetter };
  /** Visually split content across simulated print pages — for live-preview panels only. */
  paginate?: boolean;
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

export function CoverLetterDocument({ profile, application, paginate = false }: Props) {
  const t = LABELS[application.language ?? 'en'];
  const { coverLetter: cl } = application;
  const fontStyle = application.font
    ? ({ '--font-sans': FONT_STACKS[application.font] } as React.CSSProperties)
    : undefined;

  const blocks: Block[] = [
    {
      key: 'header',
      node: (
        <header className="cl-header">
          <div>
            <div className="cl-sender-name">{profile.name}</div>
            <div className="cl-sender-sub">{profile.role}</div>
          </div>
          <nav className="cl-contact-right" aria-label={t.contact}>
            {joinLines([
              profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>,
              profile.website && <a href={`https://${profile.website}`} target="_blank" rel="noopener">{profile.website}</a>,
              profile.github && <a href={`https://${profile.github}`} target="_blank" rel="noopener">{profile.github}</a>,
              profile.city,
            ])}
          </nav>
        </header>
      ),
    },
    {
      key: 'meta',
      node: (
        <div className="cl-meta">
          {cl.date && <div className="cl-date">{cl.date}</div>}
          <div className="cl-recipient">
            {joinLines([
              cl.recipientName ?? t.recipientFallback,
              cl.recipientOrg,
              profile.city,
            ])}
          </div>
        </div>
      ),
    },
    { key: 'subject', node: <div className="cl-subject">{t.subjectPrefix} {cl.subjectRole}</div> },
    ...cl.paragraphs.map((p, i) => ({
      key: `p-${i}`,
      node: <p className="cl-paragraph">{p}</p>,
    })),
    {
      key: 'sign',
      node: (
        <div className="cl-sign">
          {t.sign}
          <br />
          <span className="cl-sign-name">{profile.name}</span>
        </div>
      ),
    },
  ];

  const { measureRef, pages } = usePagedBlocks(blocks, paginate);
  const byKey = new Map(blocks.map((b) => [b.key, b.node]));

  return (
    <>
      {paginate && (
        <div className="doc-page--measuring">
          <div ref={measureRef} className="doc-page" style={fontStyle}>
            {blocks.map((b) => <Fragment key={b.key}>{b.node}</Fragment>)}
          </div>
        </div>
      )}
      {pages.map((pageKeys, i) => (
        <div className="doc-page" style={fontStyle} key={i}>
          {paginate && pages.length > 1 && (
            <span className="doc-page-badge">Page {i + 1} of {pages.length}</span>
          )}
          {pageKeys.map((k) => <Fragment key={k}>{byKey.get(k)}</Fragment>)}
        </div>
      ))}
    </>
  );
}
