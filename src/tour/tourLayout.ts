// Pure geometry for the demo tour: where the spotlight and the step popover
// go for a given target, kept apart from the React component so it stays
// easy to reason about.

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** The popover's edge the arrow sits on, pointing at the target; none when centered or overlapping. */
export type ArrowSide = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverLayout {
  top: number;
  left: number;
  arrow: { side: ArrowSide; offset: number } | null;
}

const ARROW = 14;

const MARGIN = 12;
const GAP = 14;
export const SPOTLIGHT_PADDING = 6;

/**
 * The bounding box of the visible elements matching a selector (all of them,
 * or with `firstOnly` just the first), or null if none is shown.
 */
export function measureTarget(selector: string, firstOnly = false): Box | null {
  const visible = [...document.querySelectorAll(selector)]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0);
  const rects = firstOnly ? visible.slice(0, 1) : visible;
  if (!rects.length) return null;
  const top = Math.min(...rects.map((r) => r.top));
  const left = Math.min(...rects.map((r) => r.left));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  const right = Math.max(...rects.map((r) => r.right));
  return { top, left, width: right - left, height: bottom - top };
}

/** The target padded for the spotlight and cut to the viewport, so a tall one stays visible. */
export function spotlightBox(target: Box, vw: number, vh: number): Box {
  const top = Math.max(target.top - SPOTLIGHT_PADDING, 4);
  const left = Math.max(target.left - SPOTLIGHT_PADDING, 4);
  const bottom = Math.min(target.top + target.height + SPOTLIGHT_PADDING, vh - 4);
  const right = Math.min(target.left + target.width + SPOTLIGHT_PADDING, vw - 4);
  return { top, left, width: Math.max(right - left, 0), height: Math.max(bottom - top, 0) };
}

/**
 * Four panels that dim everything around the spotlight, instead of one
 * element with a page-sized box-shadow, so each frame paints less.
 */
export function dimPanels(spot: Box, vw: number, vh: number): Box[] {
  const bottom = spot.top + spot.height;
  const right = spot.left + spot.width;
  return [
    { top: 0, left: 0, width: vw, height: spot.top },
    { top: bottom, left: 0, width: vw, height: Math.max(vh - bottom, 0) },
    { top: spot.top, left: 0, width: spot.left, height: spot.height },
    { top: spot.top, left: right, width: Math.max(vw - right, 0), height: spot.height },
  ];
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

/**
 * Puts the popover below the spotlight if it fits, else above, else beside
 * it (for a target taller than the screen), and only as a last resort over
 * the target's lower part. Without a target it is centered.
 */
export function placePopover(spot: Box | null, width: number, height: number, vw: number, vh: number): PopoverLayout {
  if (!spot) {
    return { top: Math.max((vh - height) / 2, MARGIN), left: (vw - width) / 2, arrow: null };
  }

  const centerX = spot.left + spot.width / 2;
  const left = clamp(centerX - width / 2, MARGIN, vw - width - MARGIN);
  const horizontalArrow = clamp(centerX - left - ARROW / 2, 18, width - 18 - ARROW);
  const below = spot.top + spot.height + GAP;
  if (below + height <= vh - MARGIN) return { top: below, left, arrow: { side: 'top', offset: horizontalArrow } };
  const above = spot.top - GAP - height;
  if (above >= MARGIN) return { top: above, left, arrow: { side: 'bottom', offset: horizontalArrow } };

  // Beside a tall target, level with its top so the arrow points at where it starts.
  const top = clamp(spot.top, MARGIN, vh - height - MARGIN);
  const verticalArrow = clamp(spot.top + 24 - top, 18, height - 18 - ARROW);
  const right = spot.left + spot.width + GAP;
  if (right + width <= vw - MARGIN) return { top, left: right, arrow: { side: 'left', offset: verticalArrow } };
  const leftSide = spot.left - GAP - width;
  if (leftSide >= MARGIN) return { top, left: leftSide, arrow: { side: 'right', offset: verticalArrow } };

  return { top: vh - height - MARGIN, left, arrow: null };
}

/**
 * How far to scroll so the target is in view with room for the popover: a
 * small one is centered, a tall one starts just below where the popover sits.
 */
export function scrollDeltaFor(target: Box, popoverHeight: number, vh: number): number {
  const room = popoverHeight + GAP + MARGIN + SPOTLIGHT_PADDING;
  if (target.height + room <= vh) {
    const bottom = target.top + target.height;
    // Already on screen with space for the popover on one side: don't move.
    const settled = target.top >= 0 && bottom <= vh && (bottom + room <= vh || target.top >= room);
    return settled ? 0 : target.top + target.height / 2 - vh / 2;
  }
  return target.top - room;
}
