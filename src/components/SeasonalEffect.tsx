import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from '../hooks/useTheme';

const SYMBOLS: Record<'winter' | 'autumn', readonly string[]> = {
  winter: ['❄', '❅', '❆'],
  autumn: ['🍂', '🍁'],
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

/** A quiet overlay of falling snowflakes (winter) or leaves (autumn); renders nothing for the default theme. */
export function SeasonalEffect() {
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const kind = theme === 'default' ? null : theme;

  const particles = useMemo(
    () => (kind ? makeParticles(SYMBOLS[kind], kind === 'winter' ? 28 : 16) : []),
    [kind],
  );

  if (!kind || reducedMotion) return null;

  return (
    <div className="seasonal-effect print:hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`seasonal-effect__particle seasonal-effect__particle--${kind}`}
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
