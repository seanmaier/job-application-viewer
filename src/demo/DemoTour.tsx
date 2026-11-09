import { useEffect, useRef, useState } from 'react';
import { DEMO_TEXTS, TOUR_STEP_IDS } from './demoTexts';
import type { TourStepId } from './demoTexts';
import { demoLocale } from './demoMode';
import { dimPanels, measureTarget, placePopover, scrollDeltaFor, spotlightBox } from './tourLayout';
import type { ArrowSide, Box } from './tourLayout';

interface Props {
  onClose: () => void;
  /** Shows a page of the demo (a path inside it, e.g. "/"), if it isn't shown already. */
  navigate: (path: string) => void;
}

const EXAMPLE_APP = '/application/demo-nordlicht';

// Which page each step needs and which element it points at
// (`data-tour="…"` in the pages; `firstOnly` when several match but one is
// meant, like the first application's status). No target: a centered card.
const STEP_TARGETS: Record<TourStepId, { path: string; target?: string; firstOnly?: boolean }> = {
  welcome: { path: '/' },
  list: { path: '/', target: 'app-list' },
  status: { path: '/', target: 'status', firstOnly: true },
  new: { path: '/', target: 'new' },
  documents: { path: EXAMPLE_APP, target: 'documents' },
  edit: { path: EXAMPLE_APP, target: 'edit' },
  export: { path: EXAMPLE_APP, target: 'export' },
  demoBar: { path: EXAMPLE_APP, target: 'demo-bar' },
};

// A target that hasn't rendered by then (e.g. hidden on this screen size)
// gets a centered card instead of a spotlight on nothing.
const TARGET_TIMEOUT_MS = 1500;

// A rotated square half-hidden behind the popover's edge, bordered on the
// two sides that stick out.
const ARROW_EDGE: Record<ArrowSide, string> = {
  top: '-top-[8px] border-l border-t',
  bottom: '-bottom-[8px] border-r border-b',
  left: '-left-[8px] border-l border-b',
  right: '-right-[8px] border-r border-t',
};

const DIM = 'absolute bg-[rgba(10,14,22,0.75)]';

const secondaryButton =
  '[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--ink-2)] border border-white/12 rounded px-3.5 py-[7px] cursor-pointer hover:text-[color:var(--ink-invert)] disabled:invisible';
const primaryButton =
  '[font-family:var(--font-mono)] text-[11px] bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold border-none rounded px-4 py-[7px] cursor-pointer hover:brightness-110';

function sameBox(a: Box | null, b: Box | null): boolean {
  if (!a || !b) return a === b;
  return Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5;
}

// A classic product tour: each step dims the page, cuts a spotlight around
// the element it talks about and points at it from a popover, switching
// between dashboard and application as needed. Arrow keys step, Esc closes.
export function DemoTour({ onClose, navigate }: Props) {
  const t = DEMO_TEXTS[demoLocale];
  const [index, setIndex] = useState(0);
  const id = TOUR_STEP_IDS[index];
  const step = t.steps[id];
  const { path, target, firstOnly = false } = STEP_TARGETS[id];
  const isFirst = index === 0;
  const isLast = index === TOUR_STEP_IDS.length - 1;

  const [box, setBox] = useState<Box | null>(null);
  const [viewport, setViewport] = useState({ vw: window.innerWidth, vh: window.innerHeight });
  const [popoverHeight, setPopoverHeight] = useState(240);
  const popoverRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    navigate(path);
  }, [navigate, path]);

  // Follow the target every frame: it may only appear after a page switch,
  // move while scrolling, or shift as fonts and layout settle.
  // Until the new target shows up (e.g. while the page switches), the
  // spotlight stays where it was, so it glides from step to step.
  useEffect(() => {
    if (!target) {
      setBox(null);
      return;
    }
    const selector = `[data-tour="${target}"]`;
    const started = performance.now();
    let scrolled = false;
    let frame = 0;
    const tick = () => {
      const measured = measureTarget(selector, firstOnly);
      if (measured && !scrolled) {
        scrolled = true;
        const delta = scrollDeltaFor(measured, popoverRef.current?.offsetHeight ?? 240, window.innerHeight);
        if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'smooth' });
      }
      const timedOut = !measured && performance.now() - started > TARGET_TIMEOUT_MS;
      setBox((prev) => (measured ? (sameBox(prev, measured) ? prev : measured) : timedOut ? null : prev));
      setViewport((prev) =>
        prev.vw === window.innerWidth && prev.vh === window.innerHeight ? prev : { vw: window.innerWidth, vh: window.innerHeight },
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, firstOnly]);

  // The popover's height decides whether it fits below or above the target.
  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setPopoverHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    primaryRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, TOUR_STEP_IDS.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { vw, vh } = viewport;
  const spot = box ? spotlightBox(box, vw, vh) : null;
  const popoverWidth = Math.min(380, vw - 24);
  const layout = placePopover(spot, popoverWidth, popoverHeight, vw, vh);

  return (
    <div className="print:hidden fixed inset-0 z-[300]" role="presentation">
      {/* Blocks the page while the tour runs and dims all but the spotlight. */}
      {spot ? (
        dimPanels(spot, vw, vh).map((panel, i) => (
          <div key={i} className={`${DIM} transition-all duration-300 ease-out`} style={panel} />
        ))
      ) : (
        <div className={`${DIM} inset-0`} />
      )}
      {spot && (
        <div
          aria-hidden="true"
          className="absolute rounded-md border-2 border-[color:var(--accent)] pointer-events-none transition-all duration-300 ease-out shadow-[0_0_0_4px_rgba(121,192,255,0.25)]"
          style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
        />
      )}
      {/* The spotlit element stays visible but not clickable during the tour. */}
      {spot && <div className="absolute" style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }} />}

      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-tour-title"
        className="absolute bg-[#1a2236] border border-[color:var(--rule)] rounded-lg p-5 sm:p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-[top,left] duration-300 ease-out"
        style={{ top: layout.top, left: layout.left, width: popoverWidth }}
      >
        {layout.arrow && (
          <span
            aria-hidden="true"
            className={`absolute w-3.5 h-3.5 rotate-45 bg-[#1a2236] border-[color:var(--rule)] ${ARROW_EDGE[layout.arrow.side]}`}
            style={layout.arrow.side === 'top' || layout.arrow.side === 'bottom' ? { left: layout.arrow.offset } : { top: layout.arrow.offset }}
          />
        )}

        <button
          className="absolute top-2.5 right-3 bg-transparent border-none text-[color:var(--ink-3)] text-[18px] leading-none cursor-pointer p-1 hover:text-[color:var(--ink-invert)]"
          onClick={onClose}
          aria-label={t.close}
        >
          ×
        </button>

        <div className="flex items-center gap-3 [font-family:var(--font-mono)] text-[10.5px] uppercase tracking-[0.08em]">
          <span className="bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold rounded px-2 py-0.5">{t.badge}</span>
          <span className="text-[color:var(--ink-2)]">{t.stepOf(index + 1, TOUR_STEP_IDS.length)}</span>
        </div>

        {/* Progress: one segment per step, clickable to jump. */}
        <div className="flex gap-1.5">
          {TOUR_STEP_IDS.map((stepId, i) => (
            <button
              key={stepId}
              aria-label={t.steps[stepId].title}
              aria-current={i === index ? 'step' : undefined}
              className={`h-1 flex-1 rounded-full border-none p-0 cursor-pointer transition-colors duration-200 ${
                i <= index ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--rule)]'
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h2 id="demo-tour-title" className="m-0 [font-family:var(--font-mono)] text-[15px] font-semibold text-[color:var(--ink-invert)]">
            {step.title}
          </h2>
          <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--ink-2)]">{step.body}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button className={secondaryButton} onClick={() => setIndex(index - 1)} disabled={isFirst}>
            ← {t.back}
          </button>
          <div className="flex flex-wrap gap-2 justify-end">
            {!isLast && (
              <button className={`${secondaryButton} border-transparent`} onClick={onClose}>
                {t.skip}
              </button>
            )}
            <button ref={primaryRef} className={primaryButton} onClick={isLast ? onClose : () => setIndex(index + 1)}>
              {isLast ? t.done : `${t.next} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
