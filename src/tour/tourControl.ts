const START_EVENT = 'app-tour:start';

/** Opens the tour from anywhere, e.g. a button in the dashboard or the demo bar. */
export function startTour(): void {
  window.dispatchEvent(new Event(START_EVENT));
}

/** Calls `open` whenever startTour() is called; returns the unsubscribe. */
export function onStartTour(open: () => void): () => void {
  window.addEventListener(START_EVENT, open);
  return () => window.removeEventListener(START_EVENT, open);
}
