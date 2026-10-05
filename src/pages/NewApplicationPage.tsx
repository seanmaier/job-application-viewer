import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AppFont, AppLanguage, ApplicationConfig, BaseProfile } from '../types';
import { ALL_FONTS, FONT_LABELS } from '../utils/fonts';
import { getProfile } from '../data/profiles';
import { getBaseProfiles } from '../utils/baseProfiles';
import { saveLocalApplication } from '../utils/localApplications';
import { AutoTextarea } from '../components/AutoTextarea';
import { ImportParagraphsControl } from '../components/ImportParagraphsControl';
import { ExportParagraphsButton } from '../components/ExportParagraphsButton';
import { FeaturedProjectsPicker } from '../components/FeaturedProjectsPicker';
import { ImportApplicationModal } from '../components/ImportApplicationModal';
import { MoveButtons } from '../components/MoveButtons';
import { move } from '../utils/move';
import { formatDateLong } from '../utils/date';
import {
  nafSection, nafRow, nafLabel, nafOptional, nafInput, nafTextarea,
  nafCheckboxLabel, nafCheckboxInput, nafParagraphRow, nafRemoveBtn, nafAddBtn,
  newAppPage, newAppHeader, newAppBack, newAppTitle, newAppBody, newAppForm,
  newAppPreview, napHeader, napFilename, napCopyBtn, napCopyBtnCopied, napCode, napHint, napHintCode,
  editSaveBtn,
} from '../styles/formStyles';

const LANG_FLAGS: Record<AppLanguage, string> = { en: '🇬🇧', de: '🇩🇪' };

function toId(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-app';
}

function buildConfig(
  company: string,
  role: string,
  url: string,
  language: AppLanguage,
  font: AppFont,
  baseProfileId: string | undefined,
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
    font,
    ...(url && { url }),
    ...(baseProfileId && { baseProfileId }),
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

// ── import from JSON ────────────────────────────────────────────────────────

// Header shortcut to create the whole application from pasted or uploaded
// JSON instead of filling in the form.
function ImportJsonButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="ml-auto [font-family:var(--font-mono)] text-[11px] bg-white/7 text-[color:var(--ink-invert)] border border-white/18 rounded px-3.5 py-[5px] cursor-pointer hover:bg-white/14"
        onClick={() => setOpen(true)}
      >
        Import JSON
      </button>
      {open && <ImportApplicationModal onClose={() => setOpen(false)} />}
    </>
  );
}

// ── base profile selection screen ────────────────────────────────────────────

function ChooseBaseProfileScreen({
  baseProfiles, onChoose, onSkip,
}: {
  baseProfiles: BaseProfile[];
  onChoose: (bp: BaseProfile) => void;
  onSkip: (language: AppLanguage) => void;
}) {
  return (
    <div className={newAppPage}>
      <div className={newAppHeader}>
        <Link className={newAppBack} to="/">← Dashboard</Link>
        <span className={newAppTitle}>New Application</span>
        <ImportJsonButton />
      </div>

      <div className="flex-1 overflow-y-auto flex justify-center">
        <div className="w-full max-w-[560px] pt-14 px-6 flex flex-col gap-5">
          <div>
            <h1 className="text-[15px] font-semibold text-[color:var(--ink-invert)] m-0 mb-1.5">
              Choose a base profile
            </h1>
            <p className="[font-family:var(--font-mono)] text-[11.5px] text-[color:var(--ink-3)] m-0">
              Applications resolve their CV content from a base profile. Pick which one this application should use.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {baseProfiles.map((bp) => (
              <button
                key={bp.id}
                className="flex items-center gap-3 text-left bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-[6px] py-3 px-4 cursor-pointer transition-colors duration-100 hover:border-[color:var(--accent)]"
                onClick={() => onChoose(bp)}
              >
                <span className="text-[14px] leading-none">{LANG_FLAGS[bp.language]}</span>
                <span className="[font-family:var(--font-sans)] text-[13px] text-[color:var(--ink-invert)]">{bp.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-1">
            {(['en', 'de'] as AppLanguage[]).map((lang) => (
              <button
                key={lang}
                className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--ink-3)] border border-white/12 rounded px-3.5 py-[6px] cursor-pointer hover:text-[color:var(--ink-invert)]"
                onClick={() => onSkip(lang)}
              >
                Skip — {LANG_FLAGS[lang]} {lang === 'en' ? 'English' : 'Deutsch'} default
              </button>
            ))}
            <Link
              className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] no-underline hover:text-[color:var(--accent)]"
              to="/profiles"
            >
              Manage base profiles →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export function NewApplicationPage() {
  const navigate = useNavigate();
  const [baseProfiles] = useState(() => getBaseProfiles());

  const [step, setStep] = useState<'select-profile' | 'form'>(
    baseProfiles.length > 0 ? 'select-profile' : 'form',
  );
  const [baseProfileId, setBaseProfileId] = useState<string | undefined>(undefined);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [font, setFont] = useState<AppFont>('sans');
  const [hasCoverLetter, setHasCoverLetter] = useState(false);
  const [dateISO, setDateISO] = useState('');
  const [subjectRole, setSubjectRole] = useState('');
  const [paragraphs, setParagraphs] = useState<string[]>(['']);
  const [copied, setCopied] = useState(false);
  // Populated once a base profile is chosen (or skipped) below — except when
  // there are no base profiles to choose from at all, in which case the form
  // step renders immediately and this needs its usual default up front.
  const [featuredIds, setFeaturedIds] = useState<string[]>(() => (
    baseProfiles.length === 0 ? getProfile('en').projects.map((p) => p.id) : []
  ));

  const selectedBaseProfile = baseProfileId ? baseProfiles.find((p) => p.id === baseProfileId) : undefined;
  const profile = selectedBaseProfile?.profile ?? getProfile(language);

  const handleChooseProfile = (bp: BaseProfile) => {
    setBaseProfileId(bp.id);
    setLanguage(bp.language);
    setFeaturedIds(bp.profile.projects.map((p) => p.id));
    setStep('form');
  };

  // Without a base profile the application uses the chosen language's
  // default profile, so the language is picked here rather than in the form.
  const handleSkip = (lang: AppLanguage) => {
    setBaseProfileId(undefined);
    setLanguage(lang);
    setFeaturedIds(getProfile(lang).projects.map((p) => p.id));
    setStep('form');
  };

  if (step === 'select-profile') {
    return <ChooseBaseProfileScreen baseProfiles={baseProfiles} onChoose={handleChooseProfile} onSkip={handleSkip} />;
  }

  const updateParagraph = (i: number, value: string) => {
    setParagraphs((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  };

  const addParagraph = () => setParagraphs((prev) => [...prev, '']);
  const removeParagraph = (i: number) => setParagraphs((prev) => prev.filter((_, idx) => idx !== i));

  const config = buildConfig(company, role, url, language, font, baseProfileId, featuredIds, hasCoverLetter, formatDateLong(dateISO, language), subjectRole, paragraphs.filter(Boolean));
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
        <ImportJsonButton />
      </div>

      <div className={newAppBody}>
        {/* ── Form ── */}
        <div className={newAppForm}>
          <div className={nafSection}>
            <span className={nafLabel}>Base profile</span>
            <div className="flex items-center gap-2.5">
              <span className="[font-family:var(--font-sans)] text-[13px] text-[color:var(--ink-invert)] flex items-center gap-1.5">
                {selectedBaseProfile ? (
                  <>
                    <span className="text-[13px] leading-none">{LANG_FLAGS[selectedBaseProfile.language]}</span>
                    {selectedBaseProfile.name}
                  </>
                ) : (
                  <span className={nafOptional}>{LANG_FLAGS[language]} {language === 'en' ? 'English' : 'Deutsch'} default</span>
                )}
              </span>
              <button
                className="[font-family:var(--font-mono)] text-[10.5px] bg-transparent text-[color:var(--ink-3)] border border-[color:var(--rule)] rounded px-2 py-[3px] cursor-pointer hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]"
                onClick={() => setStep('select-profile')}
              >
                change
              </button>
            </div>
          </div>

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
              <span className={nafLabel}>Font</span>
              <select
                className={nafInput}
                value={font}
                onChange={(e) => setFont(e.target.value as AppFont)}
              >
                {ALL_FONTS.map((f) => (
                  <option key={f} value={f}>{FONT_LABELS[f]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={nafSection}>
            <span className={nafLabel}>Featured projects</span>
            <FeaturedProjectsPicker projects={profile.projects} featuredIds={featuredIds} onChange={setFeaturedIds} />
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
                    type="date"
                    className={nafInput}
                    value={dateISO}
                    onChange={(e) => setDateISO(e.target.value)}
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
                <ImportParagraphsControl onImport={setParagraphs} />
                <ExportParagraphsButton paragraphs={paragraphs} />
                {paragraphs.map((p, i) => (
                  <div className={nafParagraphRow} key={i}>
                    <AutoTextarea
                      className={nafTextarea}
                      placeholder={`Paragraph ${i + 1}`}
                      value={p}
                      onChange={(e) => updateParagraph(i, e.target.value)}
                    />
                    {paragraphs.length > 1 && (
                      <>
                        <MoveButtons index={i} length={paragraphs.length} onMove={(to) => setParagraphs(move(paragraphs, i, to))} />
                        <button className={nafRemoveBtn} onClick={() => removeParagraph(i)}>✕</button>
                      </>
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
