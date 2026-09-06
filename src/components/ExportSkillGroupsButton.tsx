import { useState } from 'react';
import type { SkillGroup } from '../types';
import { nafAddBtn } from '../styles/formStyles';

interface Props {
  skillGroups: SkillGroup[];
}

export function ExportSkillGroupsButton({ skillGroups }: Props) {
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    await navigator.clipboard.writeText(JSON.stringify(skillGroups, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={nafAddBtn} onClick={handleExport}>
      {copied ? 'Copied!' : 'Copy skill groups as JSON'}
    </button>
  );
}
