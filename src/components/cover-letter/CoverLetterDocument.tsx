import type { ApplicationConfig, Profile } from '../../types';
import '../../styles/document.css';

interface Props {
  profile: Profile;
  application: ApplicationConfig;
}

export function CoverLetterDocument({ profile, application }: Props) {
  const { coverLetter: cl } = application;

  return (
    <div className="doc-page">
      <header className="cl-header">
        <div>
          <div className="cl-sender-name">{profile.name}</div>
          <div className="cl-sender-sub">Software Engineer</div>
        </div>
        <nav className="cl-contact-right" aria-label="Contact">
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
          {cl.recipientName ?? 'Hiring Team'}
          <br />
          {cl.recipientOrg}
          <br />
          {profile.city}
        </div>
      </div>

      <div className="cl-subject">Re: {cl.subjectRole}</div>

      <div className="cl-body">
        {cl.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="cl-sign">
        Sincerely,
        <br />
        <span className="cl-sign-name">{profile.name}</span>
      </div>
    </div>
  );
}
