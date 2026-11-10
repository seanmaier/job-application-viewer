import { useMemo } from 'react';
import type { ApplicationConfig } from '../../types';
import { STATUS_COLORS } from '../../utils/status';
import { countStat, type StatKey } from '../../utils/applicationStats';

interface Stat {
  key: StatKey;
  label: string;
  value: number;
  color?: string;
}

interface Props {
  applications: ApplicationConfig[];
  activeFilter: StatKey | null;
  onSelect: (key: StatKey) => void;
}

/** A row of small KPI cards summarising the whole application list, shown above the filters. Click one to filter the list to it. */
export function StatsBar({ applications, activeFilter, onSelect }: Props) {
  const stats = useMemo<Stat[]>(() => [
    { key: 'total', label: 'total', value: countStat(applications, 'total') },
    { key: 'thisMonth', label: 'this month', value: countStat(applications, 'thisMonth') },
    { key: 'active', label: 'active', value: countStat(applications, 'active'), color: STATUS_COLORS.sent },
    { key: 'interviews', label: 'interviews', value: countStat(applications, 'interviews'), color: STATUS_COLORS.interview },
    { key: 'offers', label: 'offers', value: countStat(applications, 'offers'), color: STATUS_COLORS.offer },
  ], [applications]);

  if (applications.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6" data-tour="stats">
      {stats.map((stat) => {
        const isActive = activeFilter === stat.key;
        return (
          <button
            key={stat.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(stat.key)}
            className={`flex-1 min-w-[108px] border rounded px-3 py-2 text-left cursor-pointer transition-colors ${
              isActive
                ? 'border-[color:var(--accent)] bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]'
                : 'border-[color:var(--rule)] hover:border-[color:var(--ink-2)]'
            }`}
          >
            <div className="[font-family:var(--font-mono)] text-[20px] leading-none" style={{ color: stat.color ?? 'var(--ink-invert)' }}>
              {stat.value}
            </div>
            <div className="[font-family:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--ink-3)] mt-1">
              {stat.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
