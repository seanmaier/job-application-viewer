import type { TourTextId } from './tourTexts';

/** One step: the page it needs and the element (`data-tour="…"`) it points at. */
export interface TourStep {
  text: TourTextId;
  /** A path inside the app (or the demo), e.g. "/". */
  path: string;
  /** No target: a centered card. */
  target?: string;
  /** When several elements match but one is meant, like the first application's status. */
  firstOnly?: boolean;
}

/**
 * The tour's steps. The documents part needs an application to open; without
 * one (a fresh account) the tour shows only what is there yet.
 */
export function buildTourSteps(mode: 'demo' | 'app', exampleAppId: string | undefined): TourStep[] {
  const welcome: TourStep = { text: mode === 'demo' ? 'welcomeDemo' : 'welcomeApp', path: '/' };
  const create: TourStep = { text: 'new', path: '/', target: 'new' };
  const finish: TourStep =
    mode === 'demo'
      ? { text: 'finishDemo', path: exampleAppId ? `/application/${exampleAppId}` : '/', target: 'demo-bar' }
      : { text: 'finishApp', path: '/', target: 'tour-button' };

  if (!exampleAppId) return [welcome, create, finish];

  const app = `/application/${exampleAppId}`;
  return [
    welcome,
    { text: 'list', path: '/', target: 'app-list' },
    { text: 'status', path: '/', target: 'status', firstOnly: true },
    create,
    { text: 'documents', path: app, target: 'documents' },
    { text: 'edit', path: app, target: 'edit' },
    { text: 'export', path: app, target: 'export' },
    finish,
  ];
}
