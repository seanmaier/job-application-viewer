// Development seed: a test user with sample applications, one of them with a
// version history, so features like the history dialog can be tried in
// `npm run dev:all` right away. Runs before the dev servers start and does
// nothing once the user exists; `npm run seed -- --reset` rebuilds it.
// Never runs in production.
//
//   user:     dev
//   password: devpassword
import type { ApplicationConfig, CoverLetter, SkillGroup } from '../src/types.ts';
import { hashPassword } from './auth.ts';
import { db, transaction } from './db.ts';
import { BROWSER_AUTHOR, type VersionContent } from './history.ts';
import { KEYS, setJson, setValue } from './store.ts';

const USERNAME = 'dev';
const PASSWORD = 'devpassword';

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed test data in production.');
  process.exit(1);
}

const reset = process.argv.includes('--reset');
const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(USERNAME) as { id: number } | undefined;
if (existing && !reset) {
  console.log(`Seed: user "${USERNAME}" already exists (npm run seed -- --reset rebuilds it).`);
  process.exit(0);
}

// ---- Sample content ---------------------------------------------------------

const APP_ID = 'nordlicht-software';
const DAY = 24 * 60 * 60 * 1000;

const skills = (backend: string[], devops?: string[]): SkillGroup[] => [
  { label: 'Backend', skills: backend },
  ...(devops ? [{ label: 'DevOps', skills: devops }] : []),
  { label: 'Frontend', skills: ['TypeScript', 'React'] },
];

const letter = (overrides: Partial<CoverLetter>): CoverLetter => ({
  recipientOrg: 'Nordlicht Software GmbH',
  date: '3. November 2026',
  subjectRole: '.NET Backend Developer (m/w/d)',
  paragraphs: [
    'mit großem Interesse habe ich Ihre Stellenanzeige gelesen und bewerbe mich hiermit.',
    'In meiner aktuellen Position entwickle ich Web-APIs mit ASP.NET Core und betreue deren Betrieb.',
    'Ich freue mich auf ein persönliches Gespräch.',
  ],
  ...overrides,
});

const base: VersionContent = {
  id: APP_ID,
  company: 'Nordlicht Software GmbH',
  role: '.NET Backend Developer (m/w/d)',
  language: 'de',
  font: 'sans',
  url: 'https://example.com/jobs/nordlicht-dotnet',
  featuredProjectIds: ['example-project'],
  skillGroupsOverride: skills(['C#', '.NET', 'PHP', 'SQL']),
  coverLetter: letter({}),
};

// Oldest first: what the assistant and the user changed over a few days.
const history: { daysAgo: number; author: string; message: string | null; content: VersionContent }[] = [
  { daysAgo: 6, author: 'claude', message: 'Bewerbung aus der Stellenanzeige angelegt', content: base },
  {
    daysAgo: 5.9,
    author: 'claude',
    message: 'Summary auf .NET und Azure zugeschnitten, Docker und Kubernetes ergänzt, PHP entfernt',
    content: {
      ...base,
      summaryOverride: 'Backend-Entwickler mit Schwerpunkt auf .NET, Azure und automatisierten Deployments.',
      skillGroupsOverride: skills(['.NET', 'C#', 'SQL'], ['Docker', 'Kubernetes', 'Azure DevOps']),
    },
  },
  {
    daysAgo: 4,
    author: BROWSER_AUTHOR,
    message: 'Ansprechpartnerin ergänzt',
    content: {
      ...base,
      summaryOverride: 'Backend-Entwickler mit Schwerpunkt auf .NET, Azure und automatisierten Deployments.',
      skillGroupsOverride: skills(['.NET', 'C#', 'SQL'], ['Docker', 'Kubernetes', 'Azure DevOps']),
      coverLetter: letter({ recipientName: 'Frau Jansen' }),
    },
  },
  {
    daysAgo: 3,
    author: BROWSER_AUTHOR,
    message: null,
    content: {
      ...base,
      role: 'Software Developer .NET / DevOps (m/w/d)',
      font: 'serif',
      summaryOverride: 'Backend-Entwickler mit Schwerpunkt auf .NET, Azure und automatisierten Deployments.',
      skillGroupsOverride: skills(['.NET', 'C#', 'SQL'], ['Docker', 'Kubernetes', 'Azure DevOps']),
      coverLetter: letter({ recipientName: 'Frau Jansen' }),
    },
  },
  {
    daysAgo: 1,
    author: 'claude',
    message: 'Anschreiben überarbeitet: Projektbeispiel konkreter, Schlussabsatz gekürzt',
    content: {
      ...base,
      role: 'Software Developer .NET / DevOps (m/w/d)',
      font: 'serif',
      summaryOverride: 'Backend-Entwickler mit Schwerpunkt auf .NET, Azure und automatisierten Deployments.',
      skillGroupsOverride: skills(['.NET', 'C#', 'SQL', 'Entity Framework'], ['Docker', 'Kubernetes', 'Azure DevOps']),
      coverLetter: letter({
        recipientName: 'Frau Jansen',
        date: '9. November 2026',
        paragraphs: [
          'mit großem Interesse habe ich Ihre Stellenanzeige gelesen und bewerbe mich hiermit.',
          'In meiner aktuellen Position entwickle ich Web-APIs mit ASP.NET Core und habe deren Deployment auf Kubernetes mit Azure DevOps automatisiert.',
          'Die Kombination aus Entwicklung und Betrieb, die Sie beschreiben, entspricht genau dem, was ich in den letzten Jahren gemacht habe.',
          'Ich freue mich auf Ihre Rückmeldung.',
        ],
      }),
    },
  },
];

// A second application without history, to try how the first change gets one.
const withoutHistory: ApplicationConfig = {
  id: 'fjordbyte',
  company: 'Fjordbyte AB',
  role: 'Fullstack Developer',
  status: 'drafting',
  language: 'en',
};

// ---- Write ------------------------------------------------------------------

const passwordHash = await hashPassword(PASSWORD);
transaction(() => {
  if (existing) db.prepare('DELETE FROM users WHERE id = ?').run(existing.id);
  const { lastInsertRowid } = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(USERNAME, passwordHash);
  const userId = Number(lastInsertRowid);

  const current = history[history.length - 1].content;
  setJson(userId, KEYS.localApps, [{ ...base, status: 'drafting' }, withoutHistory]);
  setJson(userId, KEYS.appConfig(APP_ID), current);
  setValue(userId, KEYS.status(APP_ID), 'drafting');
  setValue(userId, 'tour-seen', '1');

  const insert = db.prepare(
    'INSERT INTO app_versions (user_id, app_id, created_at, author, message, content) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const now = Date.now();
  for (const v of history) {
    insert.run(userId, APP_ID, Math.round(now - v.daysAgo * DAY), v.author, v.message, JSON.stringify(v.content));
  }
});

console.log(`Seed: created user "${USERNAME}" (password "${PASSWORD}") with sample applications.`);
console.log(`      History demo: http://localhost:5173/application/${APP_ID}/edit → History`);
