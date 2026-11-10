import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from '../hooks/useTheme';

type SeasonKind = 'spring' | 'summer' | 'autumn' | 'winter';

// Winter/spring/autumn particles fall from the top; summer's fireflies drift
// up from the bottom instead, since nothing about summer "falls".
const SEASON: Record<SeasonKind, { symbols: readonly string[]; count: number; motion: 'fall' | 'rise' }> = {
  spring: { symbols: ['🌸', '🌷'], count: 18, motion: 'fall' },
  summer: { symbols: ['✨', '🌟'], count: 14, motion: 'rise' },
  autumn: { symbols: ['🍂', '🍁'], count: 16, motion: 'fall' },
  winter: { symbols: ['❄', '❅', '❆'], count: 28, motion: 'fall' },
};

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

/** A quiet overlay of falling/drifting symbols matching the active seasonal theme; renders nothing for the default theme. */
export function SeasonalEffect() {
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const kind = theme === 'default' ? null : theme;
  const season = kind ? SEASON[kind] : null;

  const particles = useMemo(
    () => (season ? makeParticles(season.symbols, season.count) : []),
    [season],
  );

  if (!kind || !season || reducedMotion) return null;

  return (
    <div className="seasonal-effect print:hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`seasonal-effect__particle seasonal-effect__particle--${kind} seasonal-effect__particle--${season.motion}`}
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
    </div>
  );
}
