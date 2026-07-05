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
cp private/profile.example.json private/profile.json
cp private/applications/example.json private/applications/<your-application-id>.json
```

Fill in your own details, then register the new application file in
`src/data/applications/index.ts`, importing it via the `@private/applications/...`
alias.

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
