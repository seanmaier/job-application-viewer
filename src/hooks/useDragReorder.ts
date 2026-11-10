import { useState, type DragEvent } from 'react';

// A private MIME type: text inputs only accept text/* drops, so dragging a row
// across an input never pastes anything into it. Firefox also refuses to start
// a drag without some setData call.
const DRAG_TYPE = 'application/x-reorder';

// Native HTML5 drag-and-drop reordering for one list. Only the handle is
// draggable (so text in the row's inputs can still be selected); the whole
// row is used as drag image and drop target. Each list gets its own hook
// instance, and handlers ignore drags they didn't start — that keeps nested
// lists (skills inside skill groups) from reacting to each other's drags.
export function useDragReorder(onMove: (from: number, to: number) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleProps = (index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(DRAG_TYPE, String(index));
      const row = e.currentTarget.closest<HTMLElement>('[data-drag-row]');
      if (row) {
        const handle = e.currentTarget.getBoundingClientRect();
        const box = row.getBoundingClientRect();
        e.dataTransfer.setDragImage(row, handle.left - box.left + handle.width / 2, handle.top - box.top + handle.height / 2);
      }
      setDragIndex(index);
    },
    onDragEnd: reset,
  });

  const rowProps = (index: number) => ({
    'data-drag-row': true,
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (dragIndex === null) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      if (overIndex !== index) setOverIndex(index);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      if (dragIndex === null) return;
      e.preventDefault();
      e.stopPropagation();
      onMove(dragIndex, index);
      reset();
    },
  });

  // Where the dragged item would land relative to this row: moving down drops
  // it below the hovered row, moving up drops it above (matches move()).
  const dropSide = (index: number): 'before' | 'after' | null => {
    if (dragIndex === null || overIndex !== index || dragIndex === index) return null;
    return dragIndex < index ? 'after' : 'before';
  };

  return { handleProps, rowProps, dropSide, isDragging: (index: number) => dragIndex === index };
}
