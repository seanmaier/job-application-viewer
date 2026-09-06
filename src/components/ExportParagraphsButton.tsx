import { useState } from 'react';
import { nafAddBtn } from '../styles/formStyles';

interface Props {
  paragraphs: string[];
}

export function ExportParagraphsButton({ paragraphs }: Props) {
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    await navigator.clipboard.writeText(JSON.stringify(paragraphs.filter(Boolean), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={nafAddBtn} onClick={handleExport}>
      {copied ? 'Copied!' : 'Copy paragraphs as JSON'}
    </button>
  );
}
