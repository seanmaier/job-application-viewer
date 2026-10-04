import type { Project } from '../types';
import { MoveButtons } from './MoveButtons';
import { move } from '../utils/move';
import { nafCheckboxes, nafCheckboxLabel, nafCheckboxInput } from '../styles/formStyles';

interface Props {
  projects: Project[];
  featuredIds: string[];
  onChange: (next: string[]) => void;
}

// Checkbox list of the profile's projects. Featured projects are listed first,
// in the order they appear on the CV, with ↑/↓ controls to reorder them;
// the rest follow in profile order. Ticking a project appends it to the end.
export function FeaturedProjectsPicker({ projects, featuredIds, onChange }: Props) {
  const featured = featuredIds
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is Project => p !== undefined);
  const rest = projects.filter((p) => !featuredIds.includes(p.id));
  const featuredOrder = featured.map((p) => p.id);

  const toggle = (id: string) =>
    onChange(featuredIds.includes(id) ? featuredIds.filter((x) => x !== id) : [...featuredIds, id]);

  return (
    <div className={nafCheckboxes}>
      {featured.map((p, i) => (
        <div className="flex items-center justify-between gap-2" key={p.id}>
          <label className={nafCheckboxLabel}>
            <input className={nafCheckboxInput} type="checkbox" checked onChange={() => toggle(p.id)} />
            {p.name}
          </label>
          <MoveButtons index={i} length={featured.length} onMove={(to) => onChange(move(featuredOrder, i, to))} />
        </div>
      ))}
      {rest.map((p) => (
        <label className={nafCheckboxLabel} key={p.id}>
          <input className={nafCheckboxInput} type="checkbox" checked={false} onChange={() => toggle(p.id)} />
          {p.name}
        </label>
      ))}
    </div>
  );
}
