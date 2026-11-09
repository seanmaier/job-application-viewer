import { DEMO_TEXTS } from './demoTexts';
import { DEMO_LOCALES, demoLocale, resetDemo, setDemoLocale } from './demoMode';
import { startTour } from '../tour/tourControl';
import { LANG_FLAGS, LANGUAGE_LABELS } from '../utils/language';
import type { AppLanguage } from '../types';

const outlineButton =
  'bg-transparent border border-[color:var(--rule)] text-[color:var(--ink-2)] rounded px-2.5 py-1 cursor-pointer hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] transition-colors duration-150';

// Explains the demo to someone who lands here from a CV or a link: a bar that
// says what the app is, with the tour (which also opens by itself once),
// the demo's language and a reset.
export function DemoBanner() {
  const t = DEMO_TEXTS[demoLocale];

  return (
    <div data-tour="demo-bar" className="print:hidden bg-[color:var(--accent-bg)] border-b-2 border-[color:var(--accent)] [font-family:var(--font-mono)] text-[11.5px] text-[color:var(--ink-invert)]">
      <div className="max-w-[1220px] mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="m-0 flex items-baseline gap-2.5 min-w-0">
          <span className="shrink-0 bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold uppercase tracking-[0.08em] text-[10px] rounded px-2 py-0.5">
            {t.badge}
          </span>
          <span>{t.banner}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold border-none rounded px-3 py-1 cursor-pointer hover:brightness-110"
            onClick={startTour}
          >
            {t.startTour}
          </button>
          <select
            className={`${outlineButton} py-[3px]`}
            value={demoLocale}
            onChange={(e) => setDemoLocale(e.target.value as AppLanguage)}
            aria-label={t.language}
          >
            {DEMO_LOCALES.map((l) => (
              <option key={l} value={l}>
                {LANG_FLAGS[l]} {LANGUAGE_LABELS[l]}
              </option>
            ))}
          </select>
          <button className={outlineButton} onClick={resetDemo}>
            {t.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
