import type { SkillGroup } from '../types';
import {
  nafSection, nafRow, nafLabel, nafInput, nafParagraphRow,
  nafRemoveBtn, nafAddBtn, nafCheckboxLabel, nafCheckboxInput,
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

export function SkillGroupsEditor({ skillGroups, onChange }: Props) {
  const setGroup = (i: number, patch: Partial<SkillGroup>) => onChange(at(skillGroups, i, patch));
  const setSkill = (gi: number, si: number, val: string) =>
    setGroup(gi, { skills: skillGroups[gi].skills.map((s, i) => (i === si ? val : s)) });

  return (
    <div className="flex flex-col gap-3">
      {skillGroups.map((group, gi) => (
        <div className="border border-[color:var(--rule)] rounded p-3.5 flex flex-col gap-3" key={gi}>
          <div className={nafRow}>
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
          <div className={nafSection}>
            <span className={nafLabel}>Skills</span>
            {group.skills.map((skill, si) => (
              <div key={si} className={nafParagraphRow}>
                <input className={nafInput} value={skill} onChange={(e) => setSkill(gi, si, e.target.value)} />
                {group.skills.length > 1 && (
                  <button className={nafRemoveBtn} onClick={() => setGroup(gi, { skills: without(group.skills, si) })}>✕</button>
                )}
              </div>
            ))}
            <button className={nafAddBtn} onClick={() => setGroup(gi, { skills: [...group.skills, ''] })}>+ Add skill</button>
          </div>
          <button className={nafRemoveBtn + ' self-start'} onClick={() => onChange(without(skillGroups, gi))}>Remove</button>
        </div>
      ))}
      <button className={nafAddBtn} onClick={() => onChange([...skillGroups, { label: '', skills: [''] }])}>
        + Add skill group
      </button>
    </div>
  );
}
