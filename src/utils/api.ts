import { flush, hydrate, localWriteCount } from './storage';

export interface SessionUser {
  id: number;
  username: string;
}

export async function fetchCurrentUser(): Promise<SessionUser | null> {
  const res = await fetch('/api/me');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Server unreachable (HTTP ${res.status}).`);
  return res.json();
}

export async function login(username: string, password: string): Promise<SessionUser> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Login failed (HTTP ${res.status}).`);
  return body;
}

export async function logout(): Promise<void> {
  await fetch('/api/logout', { method: 'POST' });
}

/** Changes the logged-in user's password; throws with the server's message if it was refused. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch('/api/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (res.ok) return;
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error ?? `Changing the password failed (HTTP ${res.status}).`);
}

export async function fetchUserData(): Promise<Record<string, string>> {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error(`Loading data failed (HTTP ${res.status}).`);
  return res.json();
}

/**
 * Replaces the in-memory copy with the server's current data, e.g. after the
 * API changed it while this tab was in the background. Without this, the next
 * save here would write back the stale lists and undo those changes. Skipped
 * if anything was edited meanwhile, so local edits are never thrown away.
 */
export async function refreshUserData(): Promise<void> {
  await flush();
  const before = localWriteCount();
  const entries = await fetchUserData();
  if (localWriteCount() === before) hydrate(entries);
}

/** Saves any pending edits, ends the session, and returns to the login screen. */
export async function logoutAndReload(): Promise<void> {
  await flush().catch(() => {});
  await logout();
  window.location.reload();
}
