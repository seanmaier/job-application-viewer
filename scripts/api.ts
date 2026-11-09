// Minimal client for /api/v1, used by the assistant skills (and handy by hand):
//   node scripts/api.ts GET applications
//   node scripts/api.ts POST applications path/to/body.json
//   node scripts/api.ts PATCH applications/<id> path/to/body.json
// Paths are relative to /api/v1. Write them without a leading slash: Git Bash
// on Windows rewrites arguments like "/applications" into file system paths.
// Reads JOB_APPS_URL and JOB_APPS_TOKEN from the environment or from
// .env.assistant (gitignored). Bodies come from a file so umlauts and quotes
// survive every shell untouched.
import { existsSync, readFileSync } from 'node:fs';

const ENV_FILE = '.env.assistant';
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const METHODS = ['GET', 'POST', 'PUT', 'PATCH'];

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const [method = '', rawPath = '', bodyFile] = process.argv.slice(2);
if (!METHODS.includes(method.toUpperCase()) || !rawPath || /^[a-z]:/i.test(rawPath)) {
  fail('Usage: node scripts/api.ts <GET|POST|PUT|PATCH> <path under /api/v1, e.g. applications/acme> [body.json]');
}
const path = rawPath.replace(/^\/*/, '/');

const baseUrl = process.env.JOB_APPS_URL?.replace(/\/+$/, '');
const token = process.env.JOB_APPS_TOKEN;
if (!baseUrl || !token) {
  fail(`Set JOB_APPS_URL and JOB_APPS_TOKEN (e.g. in ${ENV_FILE}, see .env.assistant.example).`);
}

let body: string | undefined;
if (bodyFile) {
  body = readFileSync(bodyFile, 'utf8').replace(/^﻿/, '');
  try {
    JSON.parse(body);
  } catch (e) {
    fail(`${bodyFile} is not valid JSON: ${(e as Error).message}`);
  }
}

const res = await fetch(`${baseUrl}/api/v1${path}`, {
  method: method.toUpperCase(),
  headers: {
    Authorization: `Bearer ${token}`,
    ...(body !== undefined && { 'Content-Type': 'application/json' }),
  },
  body,
});

const text = await res.text();
let output = text;
try {
  output = JSON.stringify(JSON.parse(text), null, 2);
} catch {
  // Not JSON (e.g. a proxy error page): print it as is.
}
if (res.ok) {
  console.log(output);
} else {
  console.error(`HTTP ${res.status}`);
  fail(output);
}
