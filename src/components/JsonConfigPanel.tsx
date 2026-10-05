import { useState } from 'react';
import type { ApplicationConfig } from '../types';
import { parseApplicationConfig } from '../utils/parseApplicationConfig';

interface Props {
  text: string;
  onTextChange: (text: string) => void;
  onApply: (config: ApplicationConfig) => void;
}

// Raw JSON view of an application config, shown in place of the live preview
// on the edit page. "Apply JSON" validates it and hands the parsed config back.
export function JsonConfigPanel({ text, onTextChange, onApply }: Props) {
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleApply = () => {
    const result = parseApplicationConfig(text);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    onApply(result.config);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {errors.length > 0 && (
        <div className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--status-rejected)] bg-[rgba(220,38,38,0.10)] border-b border-[rgba(220,38,38,0.20)] py-2 px-5 shrink-0 flex flex-col gap-1 max-h-[140px] overflow-y-auto">
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
      <textarea
        className="flex-1 [font-family:var(--font-mono)] text-[12.5px] leading-[1.65] text-[#c9d1e0] bg-transparent border-none p-5 resize-none outline-none whitespace-pre [overflow-wrap:normal] overflow-auto"
        value={text}
        onChange={(e) => { onTextChange(e.target.value); setErrors([]); }}
        spellCheck={false}
      />
      <div className="flex justify-end gap-2 py-2.5 px-5 border-t border-white/8 shrink-0">
        <button
          className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[#8896AB] border border-white/12 rounded px-3.5 py-1.5 cursor-pointer hover:text-[color:var(--ink-invert)]"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
        <button
          className="[font-family:var(--font-mono)] text-[11px] bg-[color:var(--accent)] text-[color:var(--ink)] border-none rounded px-4 py-1.5 cursor-pointer hover:opacity-90"
          onClick={handleApply}
        >
          Apply JSON
        </button>
      </div>
    </div>
  );
}
