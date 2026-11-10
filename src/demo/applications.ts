import type { AppLanguage, ApplicationConfig, Note } from '../types';
import { formatDateLong } from '../utils/date';
import { demoLocale } from './demoMode';

// Fictional applications for the /demo, one per stage of the pipeline so the
// dashboard shows every status at a glance. Companies and people are made up.
// Everything but the wording is the same in each language.

interface DemoText {
  role: string;
  notes?: string;
  summaryOverride?: string;
  recipientOrg?: string;
  recipientName?: string;
  paragraphs?: string[];
}

type DemoBase = Omit<ApplicationConfig, 'role' | 'notes' | 'summaryOverride' | 'coverLetter' | 'language'> & {
  text: Record<AppLanguage, DemoText>;
};

const DEMO: DemoBase[] = [
  {
    id: 'demo-nordlicht',
    company: 'Nordlicht Software',
    status: 'interview',
    appliedDate: '2026-10-06',
    interviewDate: '2026-11-18',
    url: 'https://example.com/jobs/frontend-engineer',
    featuredProjectIds: ['budget-buddy', 'trail-map'],
    text: {
      en: {
        role: 'Frontend Engineer (React)',
        notes: 'Technical interview with the frontend team lead.\nPrepare: component architecture, testing strategy, one accessibility example.',
        summaryOverride:
          'Frontend-focused developer with four years of React and TypeScript in production. I care about fast, accessible interfaces and component libraries that teams actually enjoy using.',
        recipientOrg: 'Nordlicht Software GmbH',
        recipientName: 'Ms. Jensen',
        paragraphs: [
          'Your product helps energy providers explain complex tariffs in plain language — that combination of a hard domain and a simple interface is exactly the kind of frontend work I want to do next.',
          'At Harbor Logistics I rebuilt our customer tracking portal in React and TypeScript and cut its load time by 60 %. Along the way I set up a shared component library and end-to-end tests, so the rest of the team could ship faster without breaking things.',
          'I would be glad to show you some of that work and to hear how your team approaches design systems. Thank you for your time.',
        ],
      },
      de: {
        role: 'Frontend Engineer (React)',
        notes: 'Technisches Interview mit der Frontend-Teamleitung.\nVorbereiten: Komponentenarchitektur, Teststrategie, ein Beispiel zur Barrierefreiheit.',
        summaryOverride:
          'Frontend-orientierter Entwickler mit vier Jahren React und TypeScript im Produktiveinsatz. Mir liegen schnelle, barrierefreie Oberflächen und Komponentenbibliotheken am Herzen, mit denen Teams gerne arbeiten.',
        recipientOrg: 'Nordlicht Software GmbH',
        recipientName: 'Frau Jensen',
        paragraphs: [
          'Ihr Produkt hilft Energieversorgern, komplizierte Tarife verständlich zu erklären. Genau diese Kombination aus anspruchsvoller Fachlichkeit und einfacher Oberfläche reizt mich als nächster Schritt im Frontend.',
          'Bei Harbor Logistics habe ich unser Kundenportal mit React und TypeScript neu gebaut und die Ladezeit um 60 % gesenkt. Dabei habe ich eine gemeinsame Komponentenbibliothek und End-to-End-Tests eingeführt, damit das ganze Team schneller und sicherer ausliefern kann.',
          'Gerne zeige ich Ihnen Beispiele dieser Arbeit und erfahre, wie Ihr Team Designsysteme angeht. Vielen Dank für Ihre Zeit.',
        ],
      },
      sv: {
        role: 'Frontendutvecklare (React)',
        notes: 'Teknisk intervju med frontendteamets lead.\nFörbered: komponentarkitektur, teststrategi, ett exempel på tillgänglighet.',
        summaryOverride:
          'Frontendinriktad utvecklare med fyra år av React och TypeScript i produktion. Jag brinner för snabba, tillgängliga gränssnitt och komponentbibliotek som team faktiskt tycker om att använda.',
        recipientOrg: 'Nordlicht Software AB',
        recipientName: 'Anna Jensen',
        paragraphs: [
          'Er produkt hjälper energibolag att förklara krångliga tariffer på ett enkelt sätt. Just den kombinationen av en svår domän och ett enkelt gränssnitt är den sortens frontendarbete jag vill göra härnäst.',
          'På Harbor Logistics byggde jag om vår kundportal i React och TypeScript och minskade laddningstiden med 60 %. Samtidigt införde jag ett gemensamt komponentbibliotek och end-to-end-tester, så att hela teamet kunde leverera snabbare utan att något gick sönder.',
          'Jag visar gärna exempel på det arbetet och hör hur ert team arbetar med designsystem. Tack för er tid.',
        ],
      },
    },
  },
  {
    id: 'demo-kiezkiste',
    company: 'Kiezkiste',
    status: 'sent',
    font: 'serif',
    appliedDate: '2026-10-28',
    url: 'https://example.com/jobs/fullstack',
    featuredProjectIds: ['budget-buddy', 'k8s-starter'],
    text: {
      en: {
        role: 'Full-Stack Developer',
        recipientOrg: 'Kiezkiste GmbH',
        paragraphs: [
          'Helping local shops compete with the big delivery platforms through one simple marketplace is a mission I would love to work on.',
          'In my current role I own both the React frontend and the Node.js API of our customer portal. I designed an event API that handles two million status updates a day and introduced preview deployments for every pull request.',
          'I would be happy to tell you more in a conversation about how I can support your team.',
        ],
      },
      de: {
        role: 'Full-Stack-Entwickler (m/w/d)',
        recipientOrg: 'Kiezkiste GmbH',
        paragraphs: [
          'Lokale Händler mit einer einfachen Plattform gegen die großen Lieferdienste antreten zu lassen, finde ich eine Mission, für die ich gerne arbeite.',
          'In meiner aktuellen Rolle verantworte ich sowohl das React-Frontend als auch die Node.js-API unseres Kundenportals. Ich habe eine Event-API entworfen, die täglich zwei Millionen Statusmeldungen verarbeitet, und Preview-Deployments für jeden Pull Request eingeführt.',
          'Gerne erzähle ich Ihnen in einem Gespräch mehr darüber, wie ich Ihr Team unterstützen kann.',
        ],
      },
      sv: {
        role: 'Fullstackutvecklare',
        recipientOrg: 'Kiezkiste AB',
        paragraphs: [
          'Att låta lokala butiker konkurrera med de stora leveransplattformarna genom en enkel marknadsplats är ett uppdrag jag gärna arbetar med.',
          'I min nuvarande roll ansvarar jag för både React-gränssnittet och Node.js-API:et i vår kundportal. Jag utformade ett händelse-API som hanterar två miljoner statusuppdateringar per dag och införde förhandsdriftsättningar för varje pull request.',
          'Jag berättar gärna mer i ett samtal om hur jag kan stötta ert team.',
        ],
      },
    },
  },
  {
    id: 'demo-atlas',
    company: 'Atlas Robotics',
    status: 'drafting',
    url: 'https://example.com/jobs/platform-engineer',
    featuredProjectIds: ['k8s-starter', 'trail-map'],
    text: {
      en: {
        role: 'Platform Engineer',
        notes: 'Still tailoring: lead with the Kubernetes template, mention the CI/CD work.',
        recipientOrg: 'Atlas Robotics Inc.',
        paragraphs: [
          'Draft: why robotics, why platform work.',
          'Draft: Kubernetes template, CI/CD and preview deployments at Harbor Logistics.',
        ],
      },
      de: {
        role: 'Platform Engineer',
        notes: 'Noch in Arbeit: mit der Kubernetes-Vorlage einsteigen, CI/CD-Erfahrung erwähnen.',
        recipientOrg: 'Atlas Robotics GmbH',
        paragraphs: [
          'Entwurf: Warum Robotik, warum Plattformarbeit.',
          'Entwurf: Kubernetes-Vorlage, CI/CD und Preview-Deployments bei Harbor Logistics.',
        ],
      },
      sv: {
        role: 'Plattformsutvecklare',
        notes: 'Fortfarande under arbete: börja med Kubernetes-mallen, nämn CI/CD-arbetet.',
        recipientOrg: 'Atlas Robotics AB',
        paragraphs: [
          'Utkast: varför robotik, varför plattformsarbete.',
          'Utkast: Kubernetes-mallen, CI/CD och förhandsdriftsättningar på Harbor Logistics.',
        ],
      },
    },
  },
  {
    id: 'demo-brightline',
    company: 'Brightline Health',
    status: 'offer',
    appliedDate: '2026-09-02',
    interviewDate: '2026-09-23',
    finalDecisionDate: '2026-10-14',
    featuredProjectIds: ['budget-buddy', 'trail-map', 'k8s-starter'],
    text: {
      en: { role: 'Senior Software Engineer', notes: 'Offer received. Decide by end of November.' },
      de: { role: 'Senior Software Engineer', notes: 'Angebot erhalten. Entscheidung bis Ende November.' },
      sv: { role: 'Senior mjukvaruutvecklare', notes: 'Erbjudande mottaget. Besked senast i slutet av november.' },
    },
  },
  {
    id: 'demo-fernweh',
    company: 'Fernweh Travel',
    status: 'rejected',
    appliedDate: '2026-08-12',
    finalDecisionDate: '2026-09-01',
    text: {
      en: { role: 'Web Developer', notes: 'Position went to an internal candidate.' },
      de: { role: 'Webentwickler (m/w/d)', notes: 'Stelle wurde intern besetzt.' },
      sv: { role: 'Webbutvecklare', notes: 'Tjänsten gick till en intern kandidat.' },
    },
  },
];

// Demo notes carry a plausible creation time (the day applied, when known) so
// the timestamp badge has something to show instead of "undated".
function demoNotes(id: string, language: AppLanguage, text: string | undefined, appliedDate: string | undefined): Note[] | undefined {
  if (!text) return undefined;
  return [{
    id: `${id}-${language}-note`,
    text,
    ...(appliedDate && { createdAt: `${appliedDate}T09:00:00.000Z` }),
  }];
}

function inLanguage({ text, ...base }: DemoBase, language: AppLanguage): ApplicationConfig {
  const t = text[language];
  return {
    ...base,
    language,
    role: t.role,
    notes: demoNotes(base.id, language, t.notes, base.appliedDate),
    summaryOverride: t.summaryOverride,
    coverLetter: t.paragraphs && {
      recipientOrg: t.recipientOrg ?? base.company,
      recipientName: t.recipientName,
      // A draft has no date yet; the others carry the day they were sent.
      date: base.appliedDate ? formatDateLong(base.appliedDate, language) : '',
      subjectRole: t.role,
      paragraphs: t.paragraphs,
    },
  };
}

export const demoApplications: ApplicationConfig[] = DEMO.map((app) => inLanguage(app, demoLocale));
