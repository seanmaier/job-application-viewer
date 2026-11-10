// Server logging in logfmt, the `key=value` line format of Go's slog, Heroku
// and Grafana Loki: every event is exactly one line starting with
// `time=<ISO 8601> level=<DEBUG|INFO|WARN|ERROR> msg=<text>`, followed by its
// fields. One line per event matters because Docker stores each output line
// as its own log entry, so a stack trace goes into a quoted `stack` field
// with escaped line breaks instead of spanning lines. Warnings and errors go
// to stderr, everything else to stdout. LOG_LEVEL (debug, info, warn, error;
// default info) hides everything below it.
import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { getConnInfo } from '@hono/node-server/conninfo';
import type { RequestIdVariables } from 'hono/request-id';
import type { User } from './auth.ts';

type Level = 'debug' | 'info' | 'warn' | 'error';
export type LogFields = Record<string, string | number | boolean | null | undefined>;

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function isLevel(value: string): value is Level {
  return Object.hasOwn(LEVELS, value);
}

const configuredLevel = process.env.LOG_LEVEL?.toLowerCase() ?? 'info';
const threshold = LEVELS[isLevel(configuredLevel) ? configuredLevel : 'info'];

// Bare values stay bare. Anything that would break the key=value split or
// the line (spaces, quotes, `=`, backslashes, control characters) is quoted,
// with JSON's escapes, which logfmt parsers read the same way.
function formatValue(value: string | number | boolean | null): string {
  const text = String(value);
  // oxlint-disable-next-line no-control-regex
  return text === '' || /[\s"=\\\x00-\x1f\x7f]/.test(text) ? JSON.stringify(text) : text;
}

function write(level: Level, message: string, fields: LogFields = {}, error?: unknown): void {
  if (LEVELS[level] < threshold) return;
  const record: LogFields = { time: new Date().toISOString(), level: level.toUpperCase(), msg: message, ...fields };
  if (error !== undefined) {
    record.err = String(error);
    if (error instanceof Error) record.stack = error.stack;
  }
  const line = Object.entries(record)
    .filter((entry): entry is [string, string | number | boolean | null] => entry[1] !== undefined)
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(' ');
  (LEVELS[level] >= LEVELS.warn ? process.stderr : process.stdout).write(line + '\n');
}

export const log = {
  debug: (message: string, fields?: LogFields) => write('debug', message, fields),
  info: (message: string, fields?: LogFields) => write('info', message, fields),
  warn: (message: string, fields?: LogFields) => write('warn', message, fields),
  error: (message: string, fields?: LogFields, error?: unknown) => write('error', message, fields, error),
};

if (!isLevel(configuredLevel)) log.warn('Unknown LOG_LEVEL, using info', { LOG_LEVEL: process.env.LOG_LEVEL });

type Env = { Variables: RequestIdVariables & { user?: User } };

/**
 * The client's address. The app is only reachable through the reverse proxy,
 * so the proxy's X-Forwarded-For is the useful value; the socket address is
 * the fallback for local runs.
 */
export function clientIp(c: Context): string | undefined {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  try {
    return getConnInfo(c).remote.address;
  } catch {
    return undefined;
  }
}

/** The fields that tie an event to the request it happened in. */
export function requestFields(c: Context): LogFields {
  // Typed loosely so every router's Context fits; both values may be unset.
  const user = c.get('user') as User | undefined;
  const requestId = c.get('requestId') as string | undefined;
  return { method: c.req.method, path: c.req.path, user: user?.username, ip: clientIp(c), rid: requestId };
}

/**
 * Access log: one line per request once it's answered, at a level that
 * follows the status (5xx error, 4xx warn, otherwise info). Paths only, never
 * query strings, headers or bodies, so passwords and tokens can't leak in.
 */
export const accessLog = createMiddleware<Env>(async (c, next) => {
  const start = performance.now();
  await next();
  const status = c.res.status;
  const level: Level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  const { method, path, ...context } = requestFields(c);
  write(level, 'request', { method, path, status, ms: Math.round(performance.now() - start), ...context });
});
