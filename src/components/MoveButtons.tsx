import { nafMoveBtn } from '../styles/formStyles';

interface Props {
  index: number;
  length: number;
  onMove: (to: number) => void;
}

// ↑/↓ controls for reordering an item within a list; each button is disabled
// at the end of the list it can't move past.
export function MoveButtons({ index, length, onMove }: Props) {
  return (
    <div className="flex gap-1 shrink-0">
      <button className={nafMoveBtn} title="Move up" disabled={index === 0} onClick={() => onMove(index - 1)}>↑</button>
      <button className={nafMoveBtn} title="Move down" disabled={index === length - 1} onClick={() => onMove(index + 1)}>↓</button>
    </div>
  );
}
