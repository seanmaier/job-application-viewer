import type { SkillGroup } from '../types';
import { MoveButtons } from './MoveButtons';
import { DragHandle } from './DragHandle';
import { move } from '../utils/move';
import { useDragReorder } from '../hooks/useDragReorder';
import {
  nafSection, nafRow, nafLabel, nafInput, nafParagraphRow,
  nafRemoveBtn, nafAddBtn, nafCheckboxLabel, nafCheckboxInput,
  dropBefore, dropAfter,
} from '../styles/formStyles';

interface Props {
  skillGroups: SkillGroup[];
  onChange: (next: SkillGroup[]) => void;
}

function at<T>(arr: T[], i: number, patch: Partial<T>): T[] {
  return arr.map((item, idx) => (idx === i ? { ...item, ...patch } : item));
}
function without<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}

function dropClass(side: 'before' | 'after' | null): string {
  return side === 'before' ? dropBefore : side === 'after' ? dropAfter : '';
}

export function SkillGroupsEditor({ skillGroups, onChange }: Props) {
  const setGroup = (i: number, patch: Partial<SkillGroup>) => onChange(at(skillGroups, i, patch));
  const drag = useDragReorder((from, to) => onChange(move(skillGroups, from, to)));

  return (
    <div className="flex flex-col gap-3">
      {skillGroups.map((group, gi) => (
        <div
          {...drag.rowProps(gi)}
          className={`border border-[color:var(--rule)] rounded p-3.5 flex flex-col gap-3 ${dropClass(drag.dropSide(gi))} ${drag.isDragging(gi) ? 'opacity-40' : ''}`}
          key={gi}
        >
          <div className="flex gap-2 items-end">
            <DragHandle {...drag.handleProps(gi)} />
            <div className={`${nafRow} flex-1`}>
              <div className={nafSection}>
                <span className={nafLabel}>Label</span>
                <input className={nafInput} value={group.label} onChange={(e) => setGroup(gi, { label: e.target.value })} />
              </div>
              <div className="flex items-end pb-1">
                <label className={nafCheckboxLabel}>
                  <input
                    type="checkbox"
                    className={nafCheckboxInput}
                    checked={group.variant === 'learning'}
                    onChange={(e) => setGroup(gi, { variant: e.target.checked ? 'learning' : undefined })}
                  />
                  learning variant
                </label>
              </div>
            </div>
          </div>
          <SkillList skills={group.skills} onChange={(skills) => setGroup(gi, { skills })} />
          <div className="flex justify-between">
            <button className={nafRemoveBtn} onClick={() => onChange(without(skillGroups, gi))}>Remove</button>
            <MoveButtons index={gi} length={skillGroups.length} onMove={(to) => onChange(move(skillGroups, gi, to))} />
          </div>
        </div>
      ))}
      <button className={nafAddBtn} onClick={() => onChange([...skillGroups, { label: '', skills: [''] }])}>
        + Add skill group
      </button>
    </div>
  );
}

// The skills of one group, reorderable by drag handle or ↑/↓. A component of
// its own because every group needs its own drag state.
function SkillList({ skills, onChange }: { skills: string[]; onChange: (next: string[]) => void }) {
  const drag = useDragReorder((from, to) => onChange(move(skills, from, to)));

  return (
    <div className={nafSection}>
      <span className={nafLabel}>Skills</span>
      {skills.map((skill, si) => (
        <div
          key={si}
          {...drag.rowProps(si)}
          className={`${nafParagraphRow} rounded ${dropClass(drag.dropSide(si))} ${drag.isDragging(si) ? 'opacity-40' : ''}`}
        >
          <DragHandle {...drag.handleProps(si)} />
          <input className={nafInput} value={skill} onChange={(e) => onChange(skills.map((s, i) => (i === si ? e.target.value : s)))} />
          {skills.length > 1 && (
            <>
              <MoveButtons index={si} length={skills.length} onMove={(to) => onChange(move(skills, si, to))} />
              <button className={nafRemoveBtn} onClick={() => onChange(without(skills, si))}>✕</button>
            </>
          )}
        </div>
      ))}
      <button className={nafAddBtn} onClick={() => onChange([...skills, ''])}>+ Add skill</button>
    </div>
  );
}
