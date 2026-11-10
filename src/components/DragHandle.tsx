import type { DragEvent } from 'react';
import { nafDragHandle } from '../styles/formStyles';

interface Props {
  draggable: boolean;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

// The ⠿ grip that starts a drag; pass it useDragReorder().handleProps(index).
export function DragHandle(props: Props) {
  return (
    <span {...props} className={nafDragHandle} title="Drag to reorder" aria-hidden="true">
      <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
        {[3, 8, 13].map((cy) => [2.5, 7.5].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" />))}
      </svg>
    </span>
  );
}
