import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// The CV and cover letter are laid out at a fixed A4 width (794px). On
// screens narrower than that they're scaled down as a whole instead of
// overflowing, the way a PDF viewer fits a page to the window. A transform
// (not CSS zoom) keeps offsetTop/offsetHeight unscaled, which the cover
// letter's page-break preview measures against. Print always uses full size.
export function FitToWidth({ width = 794, children }: { width?: number; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const update = () => {
      const s = Math.min(1, outer.clientWidth / width);
      setScale(s);
      // The transform doesn't shrink the box it occupies, so reserve only
      // the scaled height to avoid a tall empty gap below the document.
      setHeight(s < 1 ? inner.offsetHeight * s : undefined);
    };
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    update();
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={outerRef} className="w-full print:!h-auto" style={{ height }}>
      <div
        ref={innerRef}
        className="flow-root mx-auto origin-top-left print:![transform:none]"
        style={{ width, transform: scale < 1 ? `scale(${scale})` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
