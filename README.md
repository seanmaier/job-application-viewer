# Job Applications

A small React + TypeScript app for managing job applications: it generates a
print-ready CV and cover letter from structured JSON data, and tracks each
application's status (drafting, sent, interview, etc.) from a single dashboard.

This is a personal tool, shared as a template — clone it, fill in your own
data, and use it to manage your own applications.

## Features

- Dashboard listing all applications with status tracking
- Print-optimized CV and cover letter documents (clean 2-page PDF export)
- Plain-text export for pasting into LLMs or application forms
- Form-based and raw-JSON editing for each application
- Your personal data (profile, cover letters) is kept out of git entirely

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router

## Getting started

```bash
git clone https://github.com/seanmaier/job-application-viewer.git
cd job-application-viewer
npm install
```

Your profile and application data live in `private/`, which is gitignored and
never committed. Set it up from the provided examples:

```bash
cp private/profiles/en.example.json private/profiles/en.json
cp private/profiles/de.example.json private/profiles/de.json
cp private/applications/example.json private/applications/<your-application-id>.json
```

Fill in your own details. Application files under `private/applications/` are
picked up automatically — no need to register them anywhere. The app also
runs fine with none of this in place (e.g. straight after cloning); it just
falls back to the example profile and shows an empty dashboard.

Then start the dev server:

```bash
npm run dev
```

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run Oxlint
- `npm run preview` — preview the production build locally

## License

MIT — see [LICENSE](LICENSE).
