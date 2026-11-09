import type { AppLanguage } from '../types';

/**
 * Every text a tour step can show. Welcome and finish differ between the
 * demo (fictional data, demo bar) and the app (your own data, tour button).
 */
export type TourTextId =
  | 'welcomeDemo'
  | 'welcomeApp'
  | 'list'
  | 'status'
  | 'new'
  | 'documents'
  | 'edit'
  | 'export'
  | 'finishDemo'
  | 'finishApp';

export interface TourText {
  title: string;
  body: string;
}

interface TourTexts {
  badge: { demo: string; app: string };
  stepOf: (current: number, total: number) => string;
  back: string;
  next: string;
  skip: string;
  close: string;
  done: string;
  steps: Record<TourTextId, TourText>;
}

// The app's own buttons stay English, so the tour quotes them by those names.
export const TOUR_TEXTS: Record<AppLanguage, TourTexts> = {
  en: {
    badge: { demo: 'demo', app: 'tour' },
    stepOf: (c, t) => `step ${c} of ${t}`,
    back: 'back',
    next: 'next',
    skip: 'skip tour',
    close: 'Close tour',
    done: 'start exploring',
    steps: {
      welcomeDemo: {
        title: 'Welcome to the demo',
        body: 'This app manages job applications end to end: one dashboard for all of them, and for each one a CV and cover letter tailored to the job. This short tour points out the important parts. Everything here is made up, and nothing you change leaves this browser tab.',
      },
      welcomeApp: {
        title: 'Welcome',
        body: 'This app manages your job applications end to end: one dashboard for all of them, and for each one a CV and cover letter tailored to the job. This short tour points out the important parts; it only shows once, and you can restart it any time.',
      },
      list: {
        title: 'Every application at a glance',
        body: 'The dashboard lists each application with its role, status, key dates and notes. Search, filter and sort it above; click a row to open the application.',
      },
      status: {
        title: 'Track the status',
        body: 'Each application moves from drafting through sent and interview to offer or rejection. Change the status right here, and the matching date is filled in for you.',
      },
      new: {
        title: 'Add a new application',
        body: '"+ new" creates an application from a job ad: pick a base profile, then adjust it for the role.',
      },
      documents: {
        title: 'A CV and cover letter per job',
        body: 'Opening an application shows its documents, ready to print. They are generated from a base profile and adjusted per job: its own summary, the most relevant projects first, the skills that fit the role.',
      },
      edit: {
        title: 'Tailor it to the job',
        body: '"Edit" is where that tailoring happens: summary, featured projects, skills and the cover letter text, with a live preview.',
      },
      export: {
        title: 'Ready to send',
        body: '"Download" turns the CV and cover letter into a clean PDF. "LLM Export" copies everything as plain text, for an AI assistant or an online application form.',
      },
      finishDemo: {
        title: 'Over to you',
        body: 'Click around freely. Up here you can restart this tour, switch the demo language or reset all changes. In the real app every user logs in, data lives on the server, and an API lets an AI assistant draft applications.',
      },
      finishApp: {
        title: 'Over to you',
        body: 'That was the tour. Whenever you want to see it again, start it from here.',
      },
    },
  },
  de: {
    badge: { demo: 'Demo', app: 'Tour' },
    stepOf: (c, t) => `Schritt ${c} von ${t}`,
    back: 'zurück',
    next: 'weiter',
    skip: 'Tour überspringen',
    close: 'Tour schließen',
    done: 'Los geht’s',
    steps: {
      welcomeDemo: {
        title: 'Willkommen zur Demo',
        body: 'Diese App begleitet Bewerbungen von Anfang bis Ende: ein Dashboard für alle Bewerbungen und zu jeder ein Lebenslauf und Anschreiben, zugeschnitten auf die Stelle. Diese kurze Tour zeigt dir die wichtigsten Stellen. Alles hier ist erfunden, und deine Änderungen verlassen diesen Browser-Tab nicht.',
      },
      welcomeApp: {
        title: 'Willkommen',
        body: 'Diese App begleitet deine Bewerbungen von Anfang bis Ende: ein Dashboard für alle Bewerbungen und zu jeder ein Lebenslauf und Anschreiben, zugeschnitten auf die Stelle. Diese kurze Tour zeigt dir die wichtigsten Stellen; sie erscheint nur einmal, du kannst sie aber jederzeit neu starten.',
      },
      list: {
        title: 'Alle Bewerbungen auf einen Blick',
        body: 'Das Dashboard listet jede Bewerbung mit Rolle, Status, wichtigen Terminen und Notizen. Darüber kannst du suchen, filtern und sortieren; ein Klick auf eine Zeile öffnet die Bewerbung.',
      },
      status: {
        title: 'Den Status verfolgen',
        body: 'Jede Bewerbung durchläuft Entwurf, versendet und Interview bis zur Zusage oder Absage. Den Status änderst du direkt hier, das passende Datum wird automatisch eingetragen.',
      },
      new: {
        title: 'Neue Bewerbung anlegen',
        body: '„+ new“ legt aus einer Stellenanzeige eine neue Bewerbung an: Basisprofil wählen und für die Stelle anpassen.',
      },
      documents: {
        title: 'Lebenslauf und Anschreiben pro Stelle',
        body: 'Eine geöffnete Bewerbung zeigt ihre Unterlagen druckfertig an. Sie entstehen aus einem Basisprofil und werden pro Stelle angepasst: eigenes Kurzprofil, die passendsten Projekte zuerst, die Skills, die zur Rolle passen.',
      },
      edit: {
        title: 'Auf die Stelle zuschneiden',
        body: 'Unter „Edit“ passiert dieses Zuschneiden: Kurzprofil, hervorgehobene Projekte, Skills und der Text des Anschreibens, mit Live-Vorschau.',
      },
      export: {
        title: 'Bereit zum Versenden',
        body: '„Download“ macht aus Lebenslauf und Anschreiben ein sauberes PDF. „LLM Export“ kopiert alles als reinen Text, etwa für einen KI-Assistenten oder ein Online-Bewerbungsformular.',
      },
      finishDemo: {
        title: 'Jetzt bist du dran',
        body: 'Klick dich frei durch. Hier oben startest du die Tour neu, wechselst die Sprache der Demo oder setzt alle Änderungen zurück. In der echten App meldet sich jeder Nutzer an, die Daten liegen auf dem Server, und über eine API kann ein KI-Assistent Bewerbungen vorbereiten.',
      },
      finishApp: {
        title: 'Jetzt bist du dran',
        body: 'Das war die Tour. Wenn du sie noch einmal sehen willst, startest du sie hier.',
      },
    },
  },
  sv: {
    badge: { demo: 'demo', app: 'guide' },
    stepOf: (c, t) => `steg ${c} av ${t}`,
    back: 'tillbaka',
    next: 'nästa',
    skip: 'hoppa över guiden',
    close: 'Stäng guiden',
    done: 'börja utforska',
    steps: {
      welcomeDemo: {
        title: 'Välkommen till demon',
        body: 'Appen hanterar jobbansökningar från början till slut: en översikt över alla ansökningar och för varje ansökan ett CV och personligt brev anpassat efter tjänsten. Den här korta guiden visar de viktigaste delarna. Allt här är påhittat, och inget du ändrar lämnar den här webbläsarfliken.',
      },
      welcomeApp: {
        title: 'Välkommen',
        body: 'Appen hanterar dina jobbansökningar från början till slut: en översikt över alla ansökningar och för varje ansökan ett CV och personligt brev anpassat efter tjänsten. Den här korta guiden visar de viktigaste delarna; den visas bara en gång, men du kan starta om den när du vill.',
      },
      list: {
        title: 'Alla ansökningar på ett ögonblick',
        body: 'Översikten listar varje ansökan med roll, status, viktiga datum och anteckningar. Ovanför kan du söka, filtrera och sortera; klicka på en rad för att öppna ansökan.',
      },
      status: {
        title: 'Följ statusen',
        body: 'Varje ansökan går från utkast via skickad och intervju till erbjudande eller avslag. Ändra statusen direkt här så fylls rätt datum i automatiskt.',
      },
      new: {
        title: 'Lägg till en ny ansökan',
        body: '”+ new” skapar en ansökan utifrån en jobbannons: välj en grundprofil och anpassa den efter rollen.',
      },
      documents: {
        title: 'Ett CV och personligt brev per tjänst',
        body: 'En öppnad ansökan visar sina dokument, redo att skriva ut. De bygger på en grundprofil och anpassas per tjänst: en egen sammanfattning, de mest relevanta projekten först och de kompetenser som passar rollen.',
      },
      edit: {
        title: 'Skräddarsy för tjänsten',
        body: 'Under ”Edit” sker anpassningen: sammanfattning, utvalda projekt, kompetenser och brevets text, med förhandsvisning direkt.',
      },
      export: {
        title: 'Redo att skicka',
        body: '”Download” gör CV och personligt brev till en snygg PDF. ”LLM Export” kopierar allt som ren text, till exempel för en AI-assistent eller ett ansökningsformulär på nätet.',
      },
      finishDemo: {
        title: 'Nu är det din tur',
        body: 'Klicka runt fritt. Här uppe startar du om guiden, byter språk för demon eller återställer alla ändringar. I den riktiga appen loggar varje användare in, datan sparas på servern och via ett API kan en AI-assistent förbereda ansökningar.',
      },
      finishApp: {
        title: 'Nu är det din tur',
        body: 'Det var guiden. Vill du se den igen startar du den här.',
      },
    },
  },
};
