import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationPage } from './pages/ApplicationPage';
import { NewApplicationPage } from './pages/NewApplicationPage';
import { EditApplicationPage } from './pages/EditApplicationPage';
import { BaseProfilesPage } from './pages/BaseProfilesPage';
import { BaseProfileEditPage } from './pages/BaseProfileEditPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { TrashPage } from './pages/TrashPage';
import { fetchCurrentUser, fetchUserData, refreshUserData } from './utils/api';
import { hasPendingWrites, hydrate, onSyncStatus, setStorageBackend } from './utils/storage';
import { DEMO_BASENAME, demoLocale, isDemo, loadDemoData, saveDemoData } from './demo/demoMode';
import { DemoBanner } from './demo/DemoBanner';
import { TourHost } from './tour/TourHost';

// The demo has no account (password, API tokens), so it has no account page.
const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/profiles', element: <BaseProfilesPage /> },
  ...(isDemo ? [] : [{ path: '/account', element: <AccountPage /> }]),
  { path: '/profiles/:id', element: <BaseProfileEditPage /> },
  { path: '/trash', element: <TrashPage /> },
  { path: '/application/new', element: <NewApplicationPage /> },
  { path: '/application/:id/edit', element: <EditApplicationPage /> },
  { path: '/application/:id', element: <ApplicationPage /> },
], isDemo ? { basename: DEMO_BASENAME } : undefined);

// The demo skips the login and keeps every edit in this tab, so the server
// (and any real user's data) is never touched.
if (isDemo) {
  setStorageBackend(saveDemoData);
  hydrate(loadDemoData());
  document.documentElement.lang = demoLocale;
}

/** Shows a page for the tour (a path inside the app or the demo), unless it's already the current one. */
function tourNavigate(path: string) {
  const base = isDemo ? DEMO_BASENAME : '';
  const current = window.location.pathname.slice(base.length).replace(/\/$/, '') || '/';
  if (current !== path) void router.navigate(path);
}

type AuthState = { kind: 'loading' } | { kind: 'anonymous' } | { kind: 'ready' } | { kind: 'error'; message: string };

const centered = 'min-h-screen bg-[color:var(--bg)] flex items-center justify-center [font-family:var(--font-mono)] text-[12px]';

// Every page reads storage synchronously while rendering, so the router only
// mounts once the user's data has been loaded into it.
export function App() {
  const [auth, setAuth] = useState<AuthState>(isDemo ? { kind: 'ready' } : { kind: 'loading' });
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      hydrate(await fetchUserData());
      setAuth({ kind: 'ready' });
    } catch (e) {
      setAuth({ kind: 'error', message: e instanceof Error ? e.message : 'Loading data failed.' });
    }
  };

  useEffect(() => {
    if (isDemo) return;
    fetchCurrentUser()
      .then((user) => (user ? loadData() : setAuth({ kind: 'anonymous' })))
      .catch((e) => setAuth({ kind: 'error', message: e instanceof Error ? e.message : 'Server unreachable.' }));
  }, []);

  useEffect(() => onSyncStatus(setSyncError), []);

  // Pick up changes made elsewhere (another device, the /api/v1 API) when the
  // tab comes back into view. Pages show them on their next render or visit.
  useEffect(() => {
    if (auth.kind !== 'ready' || isDemo) return;
    const refresh = () => {
      if (document.visibilityState === 'visible') refreshUserData().catch(() => {});
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [auth.kind]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (hasPendingWrites()) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  if (auth.kind === 'loading') return <div className={`${centered} text-[color:var(--ink-3)]`}>loading…</div>;
  if (auth.kind === 'error') return <div className={`${centered} text-[color:var(--status-rejected)]`}>{auth.message}</div>;
  if (auth.kind === 'anonymous') return <LoginPage onLoggedIn={() => void loadData()} />;

  return (
    <>
      {isDemo && <DemoBanner />}
      <RouterProvider router={router} />
      <TourHost navigate={tourNavigate} />
      {syncError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] [font-family:var(--font-mono)] text-[11px] bg-[color:var(--status-rejected)] text-[color:var(--ink)] font-semibold px-4 py-2 rounded shadow">
          {syncError} Retrying…
        </div>
      )}
    </>
  );
}
