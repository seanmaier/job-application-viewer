import { useEffect, useState } from 'react';
import { Tour } from './Tour';
import { buildTourSteps } from './tourSteps';
import type { TourStep } from './tourSteps';
import { storage } from '../utils/storage';
import { applications } from '../data/applications';
import { getLocalApplications } from '../utils/localApplications';
import { isDemo } from '../demo/demoMode';
import { onStartTour } from './tourControl';

// Stored with the user's data, so the tour opens once per account rather
// than once per device. In the demo that storage is the browser tab, so a
// reset or a language switch brings the tour back.
const SEEN_KEY = 'tour-seen';

// The tour shows the first application on the dashboard, as it is when the tour starts.
function currentSteps(): TourStep[] {
  const first = [...applications, ...getLocalApplications()][0];
  return buildTourSteps(isDemo ? 'demo' : 'app', first?.id);
}

interface Props {
  /** Shows a page (a path inside the app), if it isn't shown already. */
  navigate: (path: string) => void;
}

/** Owns when the tour is open: once by itself, then whenever startTour() is called. */
export function TourHost({ navigate }: Props) {
  const [steps, setSteps] = useState<TourStep[] | null>(() => (storage.getItem(SEEN_KEY) ? null : currentSteps()));
  // Bumped on every start, so a restart begins at step one even if the tour was open.
  const [run, setRun] = useState(0);

  useEffect(
    () =>
      onStartTour(() => {
        setSteps(currentSteps());
        setRun((r) => r + 1);
      }),
    [],
  );

  if (!steps) return null;
  return (
    <Tour
      key={run}
      steps={steps}
      navigate={navigate}
      onClose={() => {
        storage.setItem(SEEN_KEY, '1');
        setSteps(null);
      }}
    />
  );
}
