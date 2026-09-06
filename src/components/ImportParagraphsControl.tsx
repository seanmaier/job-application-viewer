import { useState } from 'react';
import { AutoTextarea } from './AutoTextarea';
import { nafAddBtn, nafTextarea, nafRemoveBtn, editSaveBtn } from '../styles/formStyles';

interface Props {
  onImport: (paragraphs: string[]) => void;
}

function extractParagraphs(raw: string): string[] {
  const parsed: unknown = JSON.parse(raw);
  if (Array.isArray(parsed) && parsed.every((p) => typeof p === 'string')) {
    return parsed;
  }
  if (
    parsed !== null && typeof parsed === 'object' && 'paragraphs' in parsed
    && Array.isArray((parsed as { paragraphs: unknown }).paragraphs)
    && (parsed as { paragraphs: unknown[] }).paragraphs.every((p) => typeof p === 'string')
  ) {
    return (parsed as { paragraphs: string[] }).paragraphs;
  }
  throw new Error('Expected a JSON array of paragraph strings, or an object with a "paragraphs" array.');
}

export function ImportParagraphsControl({ onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setText('');
    setError(null);
  };

  const handleApply = () => {
    try {
      onImport(extractParagraphs(text));
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  if (!open) {
    return (
      <button className={nafAddBtn} onClick={() => setOpen(true)}>
        Import paragraphs from JSON
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AutoTextarea
        className={nafTextarea}
        placeholder='["First paragraph...", "Second paragraph..."]'
        value={text}
        onChange={(e) => { setText(e.target.value); setError(null); }}
      />
      {error && <span className="text-[11px] text-[color:var(--status-rejected)]">{error}</span>}
      <div className="flex gap-2">
        <button className={editSaveBtn} onClick={handleApply}>Apply</button>
        <button className={nafRemoveBtn} onClick={close}>Cancel</button>
      </div>
    </div>
  );
}
