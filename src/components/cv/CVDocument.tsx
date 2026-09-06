import type React from 'react';
import type { ApplicationConfig, Profile } from '../../types';
import { FONT_STACKS } from '../../utils/fonts';
import { joinLines } from '../../utils/lines';
import '../../styles/document.css';

interface Props {
  profile: Profile;
  application: ApplicationConfig;
}

const LABELS = {
  en: {
    contact: 'Contact',
    education: 'Education',
    languages: 'Languages',
    beyondWork: 'Beyond work',
    profile: 'Profile',
    experience: 'Experience',
    projects: 'Projects',
  },
  de: {
    contact: 'Kontakt',
    education: 'Ausbildung',
    languages: 'Sprachen',
    beyondWork: 'Neben der Arbeit',
    profile: 'Profil',
    experience: 'Berufserfahrung',
    projects: 'Projekte',
  },
} as const;

export function CVDocument({ profile, application }: Props) {
  const t = LABELS[application.language ?? 'en'];
  const summary = application.summaryOverride ?? profile.summary;

  const projects = application.featuredProjectIds
    ? profile.projects.filter((p) => application.featuredProjectIds!.includes(p.id))
    : profile.projects;

  const fontStyle = application.font
    ? ({ '--font-sans': FONT_STACKS[application.font] } as React.CSSProperties)
    : undefined;

  return (
    <div className="doc-page" style={fontStyle}>
      <header className="cv-header">
        <div>
          <div className="cv-name">{profile.name}</div>
          <div className="cv-role">{profile.role}</div>
        </div>
        <nav className="cv-contact" aria-label={t.contact}>
          {joinLines([
            profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>,
            profile.website && <a href={`https://${profile.website}`} target="_blank" rel="noopener">{profile.website}</a>,
            profile.github && <a href={`https://${profile.github}`} target="_blank" rel="noopener">{profile.github}</a>,
            profile.linkedin && <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener">{profile.linkedin}</a>,
            profile.city,
          ])}
        </nav>
      </header>

      <div className="cv-body">
        <aside>
          {profile.skillGroups.map((group) => (
            <div className="sidebar-section" key={group.label}>
              <span className="doc-label">{group.label}</span>
              <div className="skill-tags">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className={group.variant === 'learning' ? 'skill-tag skill-tag--learning' : 'skill-tag'}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="sidebar-section">
            <span className="doc-label">{t.education}</span>
            <div className="edu-degree">{profile.education.degree}</div>
            <div className="edu-school">
              {profile.education.school}
              {profile.education.schoolDetail && (
                <>
                  <br />
                  {profile.education.schoolDetail}
                </>
              )}
            </div>
            <div className="edu-year">{profile.education.dates}</div>
          </div>

          <div className="sidebar-section">
            <span className="doc-label">{t.languages}</span>
            <ul className="sidebar-list">
              {profile.languages.map((lang) => (
                <li key={lang.name}>
                  {lang.name}. {lang.level}
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <span className="doc-label">{t.beyondWork}</span>
            <ul className="sidebar-list">
              {profile.interests.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          </div>
        </aside>

        <main>
          <section className="main-section">
            <span className="doc-label">{t.profile}</span>
            <p className="summary-text">{summary}</p>
          </section>

          <section className="main-section">
            <span className="doc-label">{t.experience}</span>
            {profile.experience.map((exp) => (
              <div className="exp-entry" key={exp.company + exp.dates}>
                <div className="exp-header">
                  <span className="exp-title">{exp.title}</span>
                  <span className="exp-dates">{exp.dates}</span>
                </div>
                <div className="exp-company">
                  {exp.company}
                  {exp.companyNote && (
                    <span style={{ fontWeight: 400, opacity: 0.8 }}> · {exp.companyNote}</span>
                  )}
                </div>
                <ul className="exp-bullets">
                  {exp.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="main-section">
            <span className="doc-label">{t.projects}</span>
            {projects.map((project) => (
              <div className="project-entry" key={project.id}>
                <div className="project-header">
                  <span className="project-name">
                    {project.name}
                    {project.hackathonLabel && (
                      <span className="project-hackathon"> &nbsp;{project.hackathonLabel}</span>
                    )}
                  </span>
                  {project.link && (
                    <a
                      className="project-link"
                      href={project.link}
                      target="_blank"
                      rel="noopener"
                    >
                      {project.linkLabel ?? project.link}
                    </a>
                  )}
                </div>
                <div className="project-stack">{project.stack}</div>
                <div className="project-desc">{project.description}</div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
