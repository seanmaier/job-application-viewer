import { useEffect, useState } from 'react';
import { Link, useBlocker } from 'react-router-dom';
import type {
  AppLanguage, ApplicationConfig, Profile,
  Experience, Project, HumanLanguage,
} from '../types';
import { getProfile, getStaticProfile } from '../data/profiles';
import { setProfileOverride, clearProfileOverride, hasProfileOverride } from '../utils/profileStorage';
import { CVDocument } from '../components/cv/CVDocument';
import { AutoTextarea } from '../components/AutoTextarea';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';
import { SkillGroupsEditor } from '../components/SkillGroupsEditor';
import {
  nafSection, nafRow, nafLabel, nafOptional, nafInput, nafTextarea,
  nafParagraphRow, nafRemoveBtn, nafAddBtn,
} from '../styles/formStyles';

// ── helpers ─────────────────────────────────────────────────────────────────

function at<T>(arr: T[], i: number, patch: Partial<T>): T[] {
  return arr.map((item, idx) => (idx === i ? { ...item, ...patch } : item));
}
function without<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}

// ── primitives ───────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={nafLabel}>{title}</span>
      <div className="flex-1 h-px bg-[color:var(--rule)]" />
    </div>
  );
}

function EntryCard({ children, onRemove, removeLabel = 'Remove' }: {
  children: React.ReactNode;
  onRemove: () => void;
  removeLabel?: string;
}) {
  return (
    <div className="border border-[color:var(--rule)] rounded p-3.5 flex flex-col gap-3">
      {children}
      <button className={nafRemoveBtn + ' self-start'} onClick={onRemove}>{removeLabel}</button>
    </div>
  );
}

// ── constants ────────────────────────────────────────────────────────────────

const PREVIEW_APP: ApplicationConfig = { id: 'profile-preview', company: '', role: '', status: 'drafting' };

// ── page ─────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const [lang, setLang] = useState<AppLanguage>('en');
  const [profile, setProfile] = useState<Profile>(() => getProfile('en'));
  const [isDirty, setIsDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasOverride, setHasOverride] = useState(() => hasProfileOverride('en'));

  // ── updaters ──────────────────────────────────────────────────────────────

  const set = (patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }));
    setIsDirty(true);
  };

  const setExp = (i: number, patch: Partial<Experience>) =>
    set({ experience: at(profile.experience, i, patch) });

  const setExpBullet = (ei: number, bi: number, val: string) =>
    setExp(ei, { bullets: profile.experience[ei].bullets.map((b, i) => (i === bi ? val : b)) });

  const setProj = (i: number, patch: Partial<Project>) =>
    set({ projects: at(profile.projects, i, patch) });

  const setLangItem = (i: number, patch: Partial<HumanLanguage>) =>
    set({ languages: at(profile.languages, i, patch) });

  const setInterest = (i: number, val: string) =>
    set({ interests: profile.interests.map((x, idx) => (idx === i ? val : x)) });

  // ── actions ───────────────────────────────────────────────────────────────

  const switchLang = (l: AppLanguage) => {
    setLang(l);
    setProfile(getProfile(l));
    setIsDirty(false);
    setHasOverride(hasProfileOverride(l));
  };

  const handleSave = () => {
    setProfileOverride(lang, profile);
    setHasOverride(true);
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lang}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (!confirm('Remove browser override and restore the file version?')) return;
    clearProfileOverride(lang);
    setHasOverride(false);
    setProfile(getStaticProfile(lang));
    setIsDirty(false);
  };

  // Save/Reset/language-switch all stay on this page, so unlike the
  // application editor there's no same-tick "skip the blocker" case to
  // handle — only actual route navigation (the Dashboard link, browser
  // back/forward) should ever be intercepted while dirty.
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[color:var(--ink)] flex flex-col">

      {/* Header */}
      <div className="bg-[color:var(--ink)] flex items-center justify-between px-6 h-[52px] shrink-0 gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <Link className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline hover:text-[color:var(--ink-invert)]" to="/">
            ← Dashboard
          </Link>
          <div className="[font-family:var(--font-mono)] text-[13px] flex items-center gap-2">
            <span className="text-[color:var(--ink-3)]">~/</span>
            <span className="text-[color:var(--ink-invert)] font-semibold">profile</span>
            {hasOverride && !isDirty && (
              <span className="text-[9px] tracking-[0.1em] uppercase text-[color:var(--status-sent)] border border-[color:var(--status-sent)] rounded-[10px] py-px px-[7px] opacity-80">
                local override
              </span>
            )}
            {isDirty && (
              <span className="text-[9px] tracking-[0.1em] uppercase text-[color:var(--status-sent)] border border-[color:var(--status-sent)] rounded-[10px] py-px px-[7px] opacity-80">
                unsaved
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-0 border border-white/12 rounded overflow-hidden">
            {(['en', 'de'] as AppLanguage[]).map((l) => (
              <button
                key={l}
                className={`[font-family:var(--font-mono)] text-[11px] px-3 py-[5px] border-none cursor-pointer transition-colors duration-100 ${
                  lang === l ? 'bg-[color:var(--accent)] text-[color:var(--ink)]' : 'bg-transparent text-[color:var(--ink-3)] hover:text-[color:var(--ink-invert)]'
                }`}
                onClick={() => switchLang(l)}
              >{l}</button>
            ))}
          </div>

          <button
            className={`[font-family:var(--font-mono)] text-[11px] border-none rounded px-4 py-[5px] cursor-pointer transition-colors duration-150 ${
              saved ? 'bg-[color:var(--status-offer)] text-white pointer-events-none' : 'bg-[color:var(--accent)] text-[color:var(--ink)] hover:opacity-90'
            }`}
            onClick={handleSave}
          >{saved ? 'Saved!' : 'Save to browser'}</button>

          <button className="[font-family:var(--font-mono)] text-[11px] bg-white/7 text-[color:var(--ink-invert)] border border-white/18 rounded px-3.5 py-[5px] cursor-pointer hover:bg-white/14" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button className="[font-family:var(--font-mono)] text-[11px] bg-white/7 text-[color:var(--ink-invert)] border border-white/18 rounded px-3.5 py-[5px] cursor-pointer hover:bg-white/14" onClick={handleDownload}>
            Download
          </button>
          {hasOverride && (
            <button className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--ink-3)] border border-white/12 rounded px-3 py-[5px] cursor-pointer hover:text-[color:var(--status-rejected)] hover:border-[color:var(--status-rejected)] transition-colors" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-[520px_1fr] flex-1 overflow-hidden">

        {/* Form */}
        <div className="py-7 px-7 overflow-y-auto bg-[color:var(--bg)] flex flex-col gap-6 border-r border-[color:var(--rule)]">

          {/* ── Basics ── */}
          <SectionHeader title="basics" />
          <div className="flex flex-col gap-4">
            <div className={nafRow}>
              <div className={nafSection}>
                <span className={nafLabel}>Name</span>
                <input className={nafInput} value={profile.name} onChange={(e) => set({ name: e.target.value })} />
              </div>
              <div className={nafSection}>
                <span className={nafLabel}>Role / title</span>
                <input className={nafInput} value={profile.role} onChange={(e) => set({ role: e.target.value })} />
              </div>
            </div>
            <div className={nafRow}>
              <div className={nafSection}>
                <span className={nafLabel}>Email</span>
                <input className={nafInput} value={profile.email} onChange={(e) => set({ email: e.target.value })} />
              </div>
              <div className={nafSection}>
                <span className={nafLabel}>City</span>
                <input className={nafInput} value={profile.city} onChange={(e) => set({ city: e.target.value })} />
              </div>
            </div>
            <div className={nafRow}>
              <div className={nafSection}>
                <span className={nafLabel}>Website</span>
                <input className={nafInput} value={profile.website} onChange={(e) => set({ website: e.target.value })} />
              </div>
              <div className={nafSection}>
                <span className={nafLabel}>GitHub</span>
                <input className={nafInput} value={profile.github} onChange={(e) => set({ github: e.target.value })} />
              </div>
            </div>
            <div className={nafSection}>
              <span className={nafLabel}>LinkedIn</span>
              <input className={nafInput} value={profile.linkedin} onChange={(e) => set({ linkedin: e.target.value })} />
            </div>
          </div>

          {/* ── Summary ── */}
          <SectionHeader title="summary" />
          <AutoTextarea
            className={nafTextarea}
            value={profile.summary}
            onChange={(e) => set({ summary: e.target.value })}
          />

          {/* ── Experience ── */}
          <SectionHeader title="experience" />
          <div className="flex flex-col gap-3">
            {profile.experience.map((exp, ei) => (
              <EntryCard key={ei} onRemove={() => set({ experience: without(profile.experience, ei) })}>
                <div className={nafRow}>
                  <div className={nafSection}>
                    <span className={nafLabel}>Title</span>
                    <input className={nafInput} value={exp.title} onChange={(e) => setExp(ei, { title: e.target.value })} />
                  </div>
                  <div className={nafSection}>
                    <span className={nafLabel}>Dates</span>
                    <input className={nafInput} value={exp.dates} onChange={(e) => setExp(ei, { dates: e.target.value })} />
                  </div>
                </div>
                <div className={nafRow}>
                  <div className={nafSection}>
                    <span className={nafLabel}>Company</span>
                    <input className={nafInput} value={exp.company} onChange={(e) => setExp(ei, { company: e.target.value })} />
                  </div>
                  <div className={nafSection}>
                    <span className={nafLabel}>Note <span className={nafOptional}>(optional)</span></span>
                    <input className={nafInput} value={exp.companyNote ?? ''} onChange={(e) => setExp(ei, { companyNote: e.target.value || undefined })} />
                  </div>
                </div>
                <div className={nafSection}>
                  <span className={nafLabel}>Bullets</span>
                  {exp.bullets.map((b, bi) => (
                    <div key={bi} className={nafParagraphRow}>
                      <input className={nafInput} value={b} onChange={(e) => setExpBullet(ei, bi, e.target.value)} />
                      {exp.bullets.length > 1 && (
                        <button className={nafRemoveBtn} onClick={() => setExp(ei, { bullets: without(exp.bullets, bi) })}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className={nafAddBtn} onClick={() => setExp(ei, { bullets: [...exp.bullets, ''] })}>+ Add bullet</button>
                </div>
              </EntryCard>
            ))}
            <button className={nafAddBtn} onClick={() => set({ experience: [...profile.experience, { title: '', company: '', dates: '', bullets: [''] }] })}>
              + Add experience
            </button>
          </div>

          {/* ── Projects ── */}
          <SectionHeader title="projects" />
          <div className="flex flex-col gap-3">
            {profile.projects.map((proj, pi) => (
              <EntryCard key={pi} onRemove={() => set({ projects: without(profile.projects, pi) })}>
                <div className={nafRow}>
                  <div className={nafSection}>
                    <span className={nafLabel}>Name</span>
                    <input className={nafInput} value={proj.name} onChange={(e) => setProj(pi, { name: e.target.value })} />
                  </div>
                  <div className={nafSection}>
                    <span className={nafLabel}>ID <span className={nafOptional}>(url slug)</span></span>
                    <input className={nafInput} value={proj.id} onChange={(e) => setProj(pi, { id: e.target.value })} />
                  </div>
                </div>
                <div className={nafSection}>
                  <span className={nafLabel}>Stack</span>
                  <input className={nafInput} value={proj.stack} onChange={(e) => setProj(pi, { stack: e.target.value })} />
                </div>
                <div className={nafSection}>
                  <span className={nafLabel}>Description</span>
                  <AutoTextarea className={nafTextarea} value={proj.description} onChange={(e) => setProj(pi, { description: e.target.value })} />
                </div>
                <div className={nafRow}>
                  <div className={nafSection}>
                    <span className={nafLabel}>Link <span className={nafOptional}>(optional)</span></span>
                    <input className={nafInput} value={proj.link ?? ''} onChange={(e) => setProj(pi, { link: e.target.value || undefined })} />
                  </div>
                  <div className={nafSection}>
                    <span className={nafLabel}>Link label <span className={nafOptional}>(optional)</span></span>
                    <input className={nafInput} value={proj.linkLabel ?? ''} onChange={(e) => setProj(pi, { linkLabel: e.target.value || undefined })} />
                  </div>
                </div>
                <div className={nafSection}>
                  <span className={nafLabel}>Hackathon label <span className={nafOptional}>(optional)</span></span>
                  <input className={nafInput} value={proj.hackathonLabel ?? ''} onChange={(e) => setProj(pi, { hackathonLabel: e.target.value || undefined })} />
                </div>
              </EntryCard>
            ))}
            <button className={nafAddBtn} onClick={() => set({ projects: [...profile.projects, { id: '', name: '', stack: '', description: '' }] })}>
              + Add project
            </button>
          </div>

          {/* ── Education ── */}
          <SectionHeader title="education" />
          <div className="flex flex-col gap-4">
            <div className={nafRow}>
              <div className={nafSection}>
                <span className={nafLabel}>Degree / program</span>
                <input className={nafInput} value={profile.education.degree} onChange={(e) => set({ education: { ...profile.education, degree: e.target.value } })} />
              </div>
              <div className={nafSection}>
                <span className={nafLabel}>Dates</span>
                <input className={nafInput} value={profile.education.dates} onChange={(e) => set({ education: { ...profile.education, dates: e.target.value } })} />
              </div>
            </div>
            <div className={nafRow}>
              <div className={nafSection}>
                <span className={nafLabel}>School</span>
                <input className={nafInput} value={profile.education.school} onChange={(e) => set({ education: { ...profile.education, school: e.target.value } })} />
              </div>
              <div className={nafSection}>
                <span className={nafLabel}>Detail <span className={nafOptional}>(optional)</span></span>
                <input className={nafInput} value={profile.education.schoolDetail ?? ''} onChange={(e) => set({ education: { ...profile.education, schoolDetail: e.target.value || undefined } })} />
              </div>
            </div>
          </div>

          {/* ── Skill groups ── */}
          <SectionHeader title="skill groups" />
          <SkillGroupsEditor skillGroups={profile.skillGroups} onChange={(skillGroups) => set({ skillGroups })} />

          {/* ── Languages ── */}
          <SectionHeader title="languages" />
          <div className="flex flex-col gap-2">
            {profile.languages.map((lang, li) => (
              <div key={li} className={nafParagraphRow}>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input className={nafInput} value={lang.name} placeholder="Language" onChange={(e) => setLangItem(li, { name: e.target.value })} />
                  <input className={nafInput} value={lang.level} placeholder="Level" onChange={(e) => setLangItem(li, { level: e.target.value })} />
                </div>
                {profile.languages.length > 1 && (
                  <button className={nafRemoveBtn} onClick={() => set({ languages: without(profile.languages, li) })}>✕</button>
                )}
              </div>
            ))}
            <button className={nafAddBtn} onClick={() => set({ languages: [...profile.languages, { name: '', level: '' }] })}>
              + Add language
            </button>
          </div>

          {/* ── Interests ── */}
          <SectionHeader title="interests" />
          <div className="flex flex-col gap-2">
            {profile.interests.map((interest, ii) => (
              <div key={ii} className={nafParagraphRow}>
                <input className={nafInput} value={interest} onChange={(e) => setInterest(ii, e.target.value)} />
                {profile.interests.length > 1 && (
                  <button className={nafRemoveBtn} onClick={() => set({ interests: without(profile.interests, ii) })}>✕</button>
                )}
              </div>
            ))}
            <button className={nafAddBtn} onClick={() => set({ interests: [...profile.interests, ''] })}>
              + Add interest
            </button>
          </div>

          <div className="pb-4" />
        </div>

        {/* Preview */}
        <div className="bg-[#1a2236] overflow-y-auto">
          <div className="py-8 px-5">
            <CVDocument profile={profile} application={{ ...PREVIEW_APP, language: lang }} />
          </div>
        </div>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesDialog
          onCancel={() => blocker.reset()}
          onDiscard={() => blocker.proceed()}
          onSave={() => {
            setProfileOverride(lang, profile);
            blocker.proceed();
          }}
        />
      )}
    </div>
  );
}
