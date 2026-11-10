import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from '../hooks/useTheme';

type ParticleKind = 'spring' | 'autumn' | 'winter';

// Falling symbols for the themes where something plausibly falls. Summer has
// none of these — a sun and a sandy ledge instead (see below).
const PARTICLE_SEASON: Record<ParticleKind, { symbols: readonly string[]; count: number }> = {
  spring: { symbols: ['🌸', '🌷'], count: 18 },
  autumn: { symbols: ['🍂', '🍁'], count: 16 },
  winter: { symbols: ['❄', '❅', '❆'], count: 28 },
};

// A row of rounded mounds along the bottom edge, like snow (or sand) piled up
// on a windowsill. left/width in vw, height in px.
const LEDGE_MOUNDS = [
  { left: 1, width: 13, height: 20 },
  { left: 11, width: 19, height: 34 },
  { left: 27, width: 15, height: 17 },
  { left: 39, width: 23, height: 40 },
  { left: 59, width: 17, height: 24 },
  { left: 73, width: 21, height: 36 },
  { left: 89, width: 14, height: 19 },
];

const BEACH_PROPS = [
  { symbol: '⛱️', left: 6, size: 2.4 },
  { symbol: '🐚', left: 21, size: 1.1 },
  { symbol: '🦀', left: 65, size: 1.3 },
  { symbol: '🏐', left: 82, size: 1.4 },
];

interface Particle {
  id: number;
  symbol: string;
  left: number; // vw
  size: number; // rem
  drift: number; // vw, horizontal sway over the fall
  duration: number; // s
  delay: number; // s, negative so particles start mid-fall instead of all at once
}

function makeParticles(symbols: readonly string[], count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    left: Math.random() * 100,
    size: 0.8 + Math.random() * 1.1,
    drift: (Math.random() - 0.5) * 2 * 60,
    duration: 12 + Math.random() * 12,
    delay: Math.random() * -24,
  }));
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);
  return reduced;
}

function isParticleKind(theme: string): theme is ParticleKind {
  return theme === 'spring' || theme === 'autumn' || theme === 'winter';
}

/**
 * A quiet, click-through decoration layer for the active seasonal theme:
 * falling petals/leaves/snow, a snow- or sand-capped ledge along the bottom
 * (winter/summer), and a sun for summer. Renders nothing for 'default'.
 */
export function SeasonalEffect() {
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();

  const particleKind = isParticleKind(theme) ? theme : null;
  const season = particleKind ? PARTICLE_SEASON[particleKind] : null;
  const particles = useMemo(
    () => (season && !reducedMotion ? makeParticles(season.symbols, season.count) : []),
    [season, reducedMotion],
  );

  if (theme === 'default') return null;

  return (
    <div className="seasonal-effect print:hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`seasonal-effect__particle seasonal-effect__particle--${particleKind}`}
          style={{
            left: `${p.left}vw`,
            fontSize: `${p.size}rem`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}vw`,
          } as CSSProperties}
        >
          {p.symbol}
        </span>
      ))}

      {(theme === 'winter' || theme === 'summer') && (
        <div className={`seasonal-ledge seasonal-ledge--${theme === 'winter' ? 'snow' : 'sand'}`}>
          {LEDGE_MOUNDS.map((m, i) => (
            <span
              key={i}
              className="seasonal-ledge__mound"
              style={{ left: `${m.left}vw`, width: `${m.width}vw`, height: `${m.height}px` } as CSSProperties}
            />
          ))}
        </div>
      )}

      {theme === 'summer' && (
        <>
          <span className={`seasonal-sun${reducedMotion ? '' : ' seasonal-sun--pulse'}`} />
          {BEACH_PROPS.map((p, i) => (
            <span
              key={i}
              className="seasonal-beach-prop"
              style={{ left: `${p.left}vw`, fontSize: `${p.size}rem` } as CSSProperties}
            >
              {p.symbol}
            </span>
          ))}
        </>
      )}
    </div>
  );
}
