import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import {
  checkCredentials,
  clearFailures,
  createApiToken,
  createSession,
  deleteExpiredSessions,
  deleteSession,
  getApiTokenUser,
  getSessionUser,
  isLockedOut,
  listApiTokens,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  recordFailure,
  revokeApiToken,
  setPassword,
  SESSION_TTL_MS,
  type User,
} from './auth.ts';
import { db, transaction } from './db.ts';
import { v1 } from './v1.ts';

const PORT = Number(process.env.PORT ?? 3000);
const STATIC_DIR = process.env.STATIC_DIR ?? './dist';
// On in production (behind the HTTPS reverse proxy), off for local http dev.
const SECURE_COOKIE = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production';
const COOKIE = 'session';

const app = new Hono<{ Variables: { user: User } }>();

// CSRF only threatens cookie auth. A bearer-token request to /api/v1 can't be
// forged cross-site: browsers never add an Authorization header on their own,
// and a page setting one triggers a CORS preflight this server never allows.
// Without this, body-less script calls (DELETE, POST …/restore) count as
// text/plain form posts and are refused.
const csrfCheck = csrf();
app.use('/api/*', (c, next) =>
  c.req.path.startsWith('/api/v1/') && c.req.header('authorization') !== undefined ? next() : csrfCheck(c, next),
);
app.use('/api/*', bodyLimit({ maxSize: 10 * 1024 * 1024 }));

function startSession(c: Context, userId: number) {
  setCookie(c, COOKIE, createSession(userId), {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

app.post('/api/login', async (c) => {
  const body: { username?: unknown; password?: unknown } = await c.req.json().catch(() => ({}));
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!username || !password) return c.json({ error: 'Username and password are required.' }, 400);
  if (isLockedOut(username)) return c.json({ error: 'Too many failed attempts. Try again in 15 minutes.' }, 429);

  const user = await checkCredentials(username, password);
  if (!user) {
    recordFailure(username);
    return c.json({ error: 'Invalid username or password.' }, 401);
  }

  clearFailures(username);
  startSession(c, user.id);
  return c.json(user);
});

app.post('/api/logout', (c) => {
  const token = getCookie(c, COOKIE);
  if (token) deleteSession(token);
  deleteCookie(c, COOKIE, { path: '/' });
  return c.body(null, 204);
});

const requireUser = createMiddleware<{ Variables: { user: User } }>(async (c, next) => {
  const token = getCookie(c, COOKIE);
  const user = token ? getSessionUser(token) : null;
  if (!user) return c.json({ error: 'Not logged in.' }, 401);
  c.set('user', user);
  await next();
});

// /api/v1 also accepts `Authorization: Bearer <api token>`, so scripts can
// call it without a password. Tokens are deliberately not accepted on the
// routes above: they can't change the password or overwrite raw storage.
const requireUserOrToken = createMiddleware<{ Variables: { user: User } }>(async (c, next) => {
  const auth = c.req.header('authorization');
  if (auth !== undefined) {
    const match = /^Bearer\s+(\S+)$/i.exec(auth);
    const user = match ? getApiTokenUser(match[1]) : null;
    if (!user) return c.json({ error: 'Invalid API token.' }, 401);
    c.set('user', user);
    return next();
  }
  return requireUser(c, next);
});

app.get('/api/health', (c) => c.json({ ok: true }));

app.get('/api/me', requireUser, (c) => c.json(c.get('user')));

// A logged-in user changes their own password. The current one is required
// so a session left open on another device can't be used to take over the
// account, and wrong guesses count toward the same lockout as logins.
app.post('/api/password', requireUser, async (c) => {
  const body: { currentPassword?: unknown; newPassword?: unknown } = await c.req.json().catch(() => ({}));
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  if (!currentPassword || !newPassword) return c.json({ error: 'Current and new password are required.' }, 400);
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return c.json({ error: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, 400);
  }
  if (newPassword.length > MAX_PASSWORD_LENGTH) {
    return c.json({ error: `The new password must be at most ${MAX_PASSWORD_LENGTH} characters.` }, 400);
  }

  const { id, username } = c.get('user');
  if (isLockedOut(username)) return c.json({ error: 'Too many failed attempts. Try again in 15 minutes.' }, 429);
  if (!(await checkCredentials(username, currentPassword))) {
    recordFailure(username);
    // 403, not 401: the session itself is fine, only the password was wrong.
    return c.json({ error: 'The current password is incorrect.' }, 403);
  }

  clearFailures(username);
  // Ends every session, this one included, then logs this device back in so
  // only the other devices are signed out.
  await setPassword(id, newPassword);
  startSession(c, id);
  return c.body(null, 204);
});

// Users manage their own API tokens from the account page. These routes take
// the session cookie only: a token must not be able to mint or revoke tokens.
app.get('/api/tokens', requireUser, (c) => c.json(listApiTokens(c.get('user').id)));

app.post('/api/tokens', requireUser, async (c) => {
  const body: { name?: unknown } = await c.req.json().catch(() => ({}));
  const result = createApiToken(c.get('user').id, typeof body.name === 'string' ? body.name : '');
  if (!result.ok) return c.json({ error: result.error }, result.status);
  return c.json({ token: result.token }, 201);
});

app.delete('/api/tokens/:name', requireUser, (c) => {
  if (!revokeApiToken(c.get('user').id, c.req.param('name'))) return c.json({ error: 'No such token.' }, 404);
  return c.body(null, 204);
});

app.get('/api/data', requireUser, (c) => {
  const rows = db.prepare('SELECT key, value FROM kv WHERE user_id = ?').all(c.get('user').id) as {
    key: string;
    value: string;
  }[];
  return c.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

// One request carries every write the frontend batched since its last flush,
// applied atomically so a restore-from-backup can't land half-way.
app.put('/api/data', requireUser, async (c) => {
  const body = await c.req.json<{ set?: unknown; remove?: unknown }>().catch(() => null);
  const set = body?.set ?? {};
  const remove = body?.remove ?? [];
  if (
    typeof set !== 'object' || set === null || Array.isArray(set) ||
    !Object.values(set).every((v) => typeof v === 'string') ||
    !Array.isArray(remove) || !remove.every((k) => typeof k === 'string')
  ) {
    return c.json({ error: 'Expected { set: Record<string, string>, remove: string[] }.' }, 400);
  }

  const userId = c.get('user').id;
  const upsert = db.prepare(
    'INSERT INTO kv (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value',
  );
  const del = db.prepare('DELETE FROM kv WHERE user_id = ? AND key = ?');
  transaction(() => {
    for (const key of remove as string[]) del.run(userId, key);
    for (const [key, value] of Object.entries(set as Record<string, string>)) upsert.run(userId, key, value);
  });
  return c.body(null, 204);
});

app.use('/api/v1/*', requireUserOrToken);
app.route('/api/v1', v1);

app.all('/api/*', (c) => c.json({ error: 'Not found.' }, 404));

// The frontend is a client-routed SPA: serve real files when they exist,
// otherwise index.html so deep links like /application/foo still load.
app.use('/*', serveStatic({ root: STATIC_DIR }));
app.get('/*', serveStatic({ root: STATIC_DIR, path: 'index.html' }));

deleteExpiredSessions();
setInterval(deleteExpiredSessions, 60 * 60 * 1000).unref();

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});
