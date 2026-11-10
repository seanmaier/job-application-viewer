import type { AppLanguage } from '../types';

interface DemoTexts {
  badge: string;
  banner: string;
  startTour: string;
  reset: string;
  language: string;
}

// The demo bar's wording; the tour itself is translated in tour/tourTexts.ts
// and the sample data in applications.ts and profiles/.
export const DEMO_TEXTS: Record<AppLanguage, DemoTexts> = {
  en: {
    badge: 'demo',
    banner: 'Vita tracks job applications and generates a tailored, print-ready CV and cover letter for each one. All data is fictional.',
    startTour: 'start tour',
    reset: 'reset demo',
    language: 'Language',
  },
  de: {
    badge: 'Demo',
    banner: 'Vita verwaltet Bewerbungen und erzeugt für jede Stelle einen passenden, druckfertigen Lebenslauf samt Anschreiben. Alle Daten sind erfunden.',
    startTour: 'Tour starten',
    reset: 'Demo zurücksetzen',
    language: 'Sprache',
  },
  sv: {
    badge: 'demo',
    banner: 'Vita håller koll på jobbansökningar och skapar ett anpassat, utskriftsklart CV och personligt brev för varje tjänst. All data är påhittad.',
    startTour: 'starta guiden',
    reset: 'återställ demon',
    language: 'Språk',
  },
};
