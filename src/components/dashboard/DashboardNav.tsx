import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { logoutAndReload } from '../../utils/api';
import { isDemo } from '../../demo/demoMode';
import { startTour } from '../../tour/tourControl';
import { AppLogo } from '../AppLogo';
import { useTheme } from '../../hooks/useTheme';

// Each group gets its own colour (from the existing tokens), so actions of the
// same kind are recognisable at a glance: blue creates, purple manages what
// you've stored, amber is about your data as a whole.
const GROUP_COLORS = {
  create: 'var(--accent)',
  library: 'var(--status-interview)',
  data: 'var(--status-sent)',
} as const;

const groupLine = 'border-[color:color-mix(in_srgb,var(--group)_45%,transparent)]';
const item =
  '[font-family:var(--font-mono)] text-[11px] no-underline bg-transparent border-0 px-3 py-1.5 cursor-pointer ' +
  `[&:not(:first-child)]:border-l [&:not(:first-child)]:border-solid ${groupLine} ` +
  'text-[color:var(--group)] transition-colors duration-150 hover:bg-[color:color-mix(in_srgb,var(--group)_14%,transparent)]';

interface NavItemProps {
  to?: string;
  onClick?: () => void;
  /** Lets the guided tour point at this item (`data-tour`). */
  tour?: string;
  children: ReactNode;
}

function NavItem({ to, onClick, tour, children }: NavItemProps) {
  return to ? (
    <Link className={item} to={to} data-tour={tour}>{children}</Link>
  ) : (
    <button className={item} type="button" onClick={onClick} data-tour={tour}>{children}</button>
  );
}

function NavGroup({ name, children }: { name: keyof typeof GROUP_COLORS; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1" style={{ '--group': GROUP_COLORS[name] } as CSSProperties}>
      <span className="[font-family:var(--font-mono)] text-[9px] uppercase tracking-[0.14em] text-[color:var(--group)] opacity-70 pl-0.5">
        {name}
      </span>
      <div
        role="group"
        aria-label={name}
        className={`flex items-stretch rounded border ${groupLine} overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}

const accountItem =
  '[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-2)] no-underline bg-transparent border border-[color:var(--rule)] rounded px-3 py-1.5 cursor-pointer transition-colors duration-150 hover:text-[color:var(--ink-invert)] hover:border-[color:var(--ink-2)]';

interface Props {
  trashCount: number;
  onImport: () => void;
  onBackup: () => void;
}

/** The dashboard's header: title and account at the top, the grouped actions below. */
export function DashboardNav({ trashCount, onImport, onBackup }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="mb-6 sm:mb-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 [font-family:var(--font-mono)] text-[15px]">
          <AppLogo />
          <span>
            <span className="text-[color:var(--ink-3)]">~/</span>
            <span className="text-[color:var(--accent)]">applications</span>
            <span className="text-[color:var(--ink-3)] animate-pulse"> _</span>
          </span>
        </div>
        <nav className="flex items-center gap-2" aria-label="Account">
          <button
            className={accountItem}
            type="button"
            onClick={() => setTheme(theme === 'winter' ? 'default' : 'winter')}
            aria-pressed={theme === 'winter'}
            title="Toggle winter theme"
          >
            {theme === 'winter' ? '❄ winter' : '❄ default'}
          </button>
          {/* The demo has no account to manage or log out of. */}
          {!isDemo && (
            <>
              <button className={accountItem} type="button" onClick={startTour} data-tour="tour-button">tour</button>
              <Link className={accountItem} to="/account">account</Link>
              <button className={accountItem} type="button" onClick={() => void logoutAndReload()}>log out</button>
            </>
          )}
        </nav>
      </div>

      <nav className="flex flex-wrap items-end gap-x-4 gap-y-3" aria-label="Actions">
        <NavGroup name="create">
          <NavItem to="/application/new" tour="new">+ new</NavItem>
          <NavItem onClick={onImport}>import</NavItem>
        </NavGroup>
        <NavGroup name="library">
          <NavItem to="/profiles">base profiles</NavItem>
          <NavItem to="/trash">trash{trashCount > 0 ? ` (${trashCount})` : ''}</NavItem>
        </NavGroup>
        <NavGroup name="data">
          <NavItem onClick={onBackup}>backup</NavItem>
        </NavGroup>
      </nav>
    </header>
  );
}
