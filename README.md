# Vita

**One CV per job.** Vita is a small React + TypeScript app for managing job
applications: it generates a print-ready CV and cover letter, tailored to
each job, from structured JSON data, and tracks each application's status
(drafting, sent, interview, etc.) from a single dashboard.

This is a personal tool, shared as a template — clone it, fill in your own
data, and use it to manage your own applications.

## Features

- Dashboard listing all applications with status tracking
- Applications still marked as sent 30 days after applying move to **ghosted** automatically
- Each application's notes and status dates read as one timeline on its page, next to a link to the job posting
- Print-optimized CV and cover letter documents in English, German or Swedish (clean 2-page PDF export)
- A login-free demo at `/demo` for showing the app to others
- A guided tour that opens once for every user (and in the demo) and can be restarted via **tour** on the dashboard
- Plain-text export for pasting into LLMs or application forms
- Form-based and raw-JSON editing for each application
- Per-user login; all edits are stored on the server, not in the browser
- Users change their own password and manage their API tokens under **account** on the dashboard
- Your personal data (profile, cover letters) is kept out of git entirely
- Token-authenticated `/api/v1` and Claude Code skills for AI-assisted applications
- Deleted applications and base profiles go to a trash for 7 days (restore or delete permanently), then the server purges them

## Demo

`/demo` (e.g. `http://localhost:5173/demo`, or `/demo` on the deployed app)
runs the app without a login on a fictional sample profile with five
applications, one per status. A guided tour opens on the first visit: each
step spotlights the part of the UI it explains (dashboard, status, CV and
cover letter, export), switching pages as needed. It can be restarted from
the demo bar. The demo speaks the browser's language (English, German or
Swedish, falling back to English); the bar switches it. Edits stay in the
browser tab (`sessionStorage`) and never reach the server; **reset demo**
starts over. The login screen links to it. Sample data and tour texts live
in `src/demo/`.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router

Backend: Hono on Node 24 · SQLite (`node:sqlite`) · session cookie login

## Getting started

```bash
git clone https://github.com/seanmaier/vita.git
cd vita
npm install
```

Your profile and application data live in `private/`, which is gitignored and
never committed. Set it up from the provided examples:

```bash
cp private/profiles/en.example.json private/profiles/en.json
cp private/profiles/de.example.json private/profiles/de.json
cp private/profiles/sv.example.json private/profiles/sv.json   # optional, Swedish
cp private/applications/example.json private/applications/<your-application-id>.json
```

Fill in your own details. Application files under `private/applications/` are
picked up automatically — no need to register them anywhere. The app also
runs fine with none of this in place (e.g. straight after cloning); it just
falls back to the example profile and shows an empty dashboard.

Then create a user and start the API and the dev server (Node 22.18+):

```bash
npm run users -- add <username>      # prints a generated password
npm run dev:server                   # API on :3000, SQLite in ./data/app.db
npm run dev                          # Vite on :5173, proxies /api
```

Or start both with `npm run dev:all`. It first seeds a test user **`dev`**
with the password **`devpassword`** and sample applications, one of them
with a version history to try the editor's **History** button. Seeding
skips a user that already exists; `npm run seed -- --reset` rebuilds it,
and it never runs with `NODE_ENV=production`.

All edits (applications, statuses, notes, base profiles) are stored per user
on the server. To move data over from the old browser-only version, export a
backup there and restore it after logging in.

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run Oxlint
- `npm run preview` — preview the production build locally
- `npm run dev:server` — run the API with auto-reload
- `npm run dev:all` — seed the test user, then run the API and the dev server together
- `npm run seed [-- --reset]` — create (or rebuild) the `dev` test user with sample data
- `npm run users -- <add|passwd|remove|list> [username] [password]` — manage users
  (`passwd` is for resetting a forgotten password; users change their own in the app)
- `npm run users -- <token-add|token-revoke> <username> <name>` / `token-list <username>` —
  manage API tokens as admin (users do it themselves on the account page)
- `npm run api -- <GET|POST|PUT|PATCH|DELETE> <path> [body.json]` — call `/api/v1`

## AI-assisted applications

The repo ships two Claude Code skills that work against your deployed data:

- `/basiswissen` interviews you and builds `private/knowledge/about-me.md`
  (gitignored, template: `about-me.example.md`): the stories, numbers and
  honest skill levels behind your CV.
- `/bewerbung <job ad URL or text>` picks a base profile, tailors skills,
  summary and featured projects, drafts the cover letter and, after you
  confirm, saves it as a `drafting` application. When three or more
  applications share the same tailoring, it proposes a new base profile.
  `/bewerbung muster` runs only that analysis, `/bewerbung aufraeumen`
  moves unused, superseded base profiles to the trash.

Setup:

1. In the app, open **account** → **API tokens** and create one, e.g. `claude`.
   It is shown only once; revoke it there when it's no longer needed.
2. `cp .env.assistant.example .env.assistant` and fill in the URL and token.
3. Check it: `npm run api -- GET me`.

### `/api/v1`

Authenticated with `Authorization: Bearer <token>` (or the session cookie).
Tokens work only here, not on login, password, token or raw-data routes.

| Method | Path | |
|--------|------|-|
| GET | `/api/v1/me` | the token's user |
| GET | `/api/v1/applications`, `/api/v1/applications/:id` | applications as the app shows them (saved edits and status merged in); the list takes `?language=en|de|sv`, leaves out trashed ones, and `?trash=true` lists only those |
| POST | `/api/v1/applications` | create; always starts as `drafting` |
| PATCH | `/api/v1/applications/:id` | update given fields, `null` removes one (not while trashed) |
| GET | `/api/v1/applications/:id/versions` | version history, newest first: `id`, `createdAt`, `author`, `message`, `content` |
| POST | `/api/v1/applications/:id/versions/:versionId/restore` | make an older version current (recorded as a new version) |
| GET | `/api/v1/base-profiles`, `/api/v1/base-profiles/:id` | base profiles; the list leaves out trashed ones, `?trash=true` lists only those (with `purgesAt`) |
| POST | `/api/v1/base-profiles` | create (`name`, `language`, `profile`, optional `id`) |
| PUT | `/api/v1/base-profiles/:id` | replace name, language and profile (not while trashed) |
| DELETE | `/api/v1/base-profiles/:id` | move to the trash; refused (409) while applications use it |
| POST | `/api/v1/base-profiles/:id/restore` | take it out of the trash |

Bodies are validated with the same parsers the app uses; unknown fields are
rejected. `POST` and `PATCH` on applications also take an optional
`changeMessage`: a short note on what changed, shown in the application's
history like a commit message.

Every change to an application's content, in the app or through the API, is
kept as a version (the last 50 per application; status and notes aren't
versioned), one per save, like a commit. The author is the API token's
name, or "you" for edits in the app, where the optional field next to
**Save changes** takes the message. The editor's **History** button shows
each version's changes field by field and can restore any of them.

Nothing is deleted for good through the API: base profiles only go to the
trash; applications are only trashed by you in the app.
Only applications stored on the server are visible, not the JSON files in
`private/applications/`. Open tabs reload their data when you switch back
to them, so they don't overwrite what the API changed.

## Deployment

Pushing to `main` builds an image and publishes it to
`ghcr.io/seanmaier/vita` (`.github/workflows/docker.yml`).
Files under `private/` are never part of the image.

1. Create the data volume once on the host:
   `docker volume create job-applications-data` (or set `DATA_VOLUME` to use
   another name). The default keeps its name from before the app was called
   Vita, since Docker can't rename volumes. It is external, so removing the
   stack or running `docker compose down -v` never deletes the database.
2. In Portainer, create a stack in Repository mode with compose path
   `deploy/docker-compose.yml`. If the GHCR package is private, add a
   registry for `ghcr.io` with a token that has `read:packages`.
3. Set the stack environment variable `PROXY_NETWORK` to the existing Docker
   network your reverse proxy or tunnel container is in. The app publishes no
   port; point the proxy at `http://vita:3000` (`http://job-applications:3000`
   still works for setups from before the rename). The proxy must
   serve the app over HTTPS, since the session cookie is `Secure`.
4. Open the container console and create a user:
   `node server/cli.ts add <username>`
5. Optional auto-redeploy: enable the stack's GitOps updates with the
   Polling mechanism and turn on "Re-pull image" and "Force redeployment"
   (the image tag stays `latest`, so the Git commit alone shows no change).

### Logs

The server writes its log to the container output (`docker logs`, or the
container's log view in Portainer) in [logfmt](https://brandur.org/logfmt),
the `key=value` format of Go's `slog`, Heroku and Grafana Loki. Every event
is exactly one line and starts with `time`, `level` and `msg`:

```
time=2026-11-10T09:12:03.512Z level=INFO msg=request method=PUT path=/api/data status=204 ms=4 user=sean ip=203.0.113.7 rid=3ca15044-…
time=2026-11-10T09:12:41.020Z level=WARN msg="Login failed" user=sean ip=203.0.113.7
```

- Every `/api` request gets a line once it's answered: `INFO` for success,
  `WARN` for 4xx, `ERROR` for 5xx. The health check and static files are left
  out; query strings, headers and bodies are never logged.
- Logins, failed logins, lockouts, password changes and created or revoked API
  tokens are logged as events.
- An unexpected error logs `err` and its `stack` (line breaks escaped as `\n`,
  so the event stays on one line) with the request's `rid`. The same ID comes
  back in the `X-Request-Id` response header and in the 500 response, so
  `docker logs vita-app-1 2>&1 | grep <rid>` finds it. An ID the proxy already
  sent in `X-Request-Id` is kept.
- `LOG_LEVEL` (`debug`, `info`, `warn`, `error`; default `info`) sets the
  lowest level shown, e.g. `warn` for errors and failed requests only. Set it
  as a stack environment variable in Portainer.

To read the log in VS Code, save it to a `.log` file and open it with the
[Log File Highlighter](https://marketplace.visualstudio.com/items?itemName=emilast.LogFileHighlighter)
extension, which colors the timestamps, levels and request IDs:

```bash
docker logs vita-app-1 > vita.log 2>&1
```

Data lives in that volume (`/data/app.db` in the container). SQLite also keeps
recent writes in `app.db-wal`, so back up the whole volume with the container
stopped:

```bash
docker stop vita-app-1        # <stack name>-app-1
docker run --rm -v job-applications-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/vita-$(date +%F).tar.gz -C /data .
docker start vita-app-1
```

## License

MIT — see [LICENSE](LICENSE).
