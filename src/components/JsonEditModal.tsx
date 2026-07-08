import { useEffect, useRef, useState } from 'react';
import type { ApplicationConfig } from '../types';

type StorableConfig = Omit<ApplicationConfig, 'status'>;

interface Props {
  app: ApplicationConfig;
  onSave: (updated: StorableConfig) => void;
  onClose: () => void;
}

function toEditable(app: ApplicationConfig): StorableConfig {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { status: _status, ...rest } = app;
  return rest;
}

export function JsonEditModal({ app, onSave, onClose }: Props) {
  const [text, setText] = useState(() =>
    JSON.stringify(toEditable(app), null, 2),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on open
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError(`Invalid JSON: ${(e as SyntaxError).message}`);
      return;
    }

    const cfg = parsed as Record<string, unknown>;

    if (!cfg.company || typeof cfg.company !== 'string') {
      setError('Missing required field: "company"');
      return;
    }
    if (!cfg.role || typeof cfg.role !== 'string') {
      setError('Missing required field: "role"');
      return;
    }
    onSave({ ...(cfg as StorableConfig), id: app.id });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(20,28,46,0.65)] flex items-center justify-center z-[100] p-6" onClick={onClose}>
      <div
        className="bg-[#1a2236] rounded-lg w-full max-w-[760px] h-[80vh] flex flex-col shadow-[0_20px_60px_rgba(20,28,46,0.40)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center py-3 px-5 border-b border-white/7 shrink-0 gap-4">
          <div className="flex items-baseline gap-2.5 overflow-hidden">
            <span className="[font-family:var(--font-mono)] text-[11px] font-semibold text-[color:var(--surface)] tracking-[0.08em] uppercase shrink-0">JSON Editor</span>
            <span className="[font-family:var(--font-mono)] text-[11px] text-[#4A5568] whitespace-nowrap overflow-hidden text-ellipsis">{app.company} · {app.role}</span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="[font-family:var(--font-mono)] text-[10px] text-[#4A5568] italic">status is managed via the toolbar dropdown</span>
            <button
              className={
                saved
                  ? '[font-family:var(--font-mono)] text-[11px] bg-[color:var(--status-offer)] text-white border-none rounded px-4 py-1.5 pointer-events-none'
                  : '[font-family:var(--font-mono)] text-[11px] bg-[color:var(--accent)] text-white border-none rounded px-4 py-1.5 cursor-pointer transition-colors duration-150 hover:bg-[#1d4ed8]'
              }
              onClick={handleSave}
            >
              {saved ? 'Saved!' : 'Save'}
            </button>
            <button
              className="text-[14px] bg-transparent border-none text-[#4A5568] cursor-pointer py-1 px-2 rounded leading-none hover:bg-white/7 hover:text-[color:var(--surface)]"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--status-rejected)] bg-[rgba(220,38,38,0.10)] border-b border-[rgba(220,38,38,0.20)] py-2 px-5 shrink-0">
            {error}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="flex-1 [font-family:var(--font-mono)] text-[12.5px] leading-[1.65] text-[#c9d1e0] bg-transparent border-none p-5 resize-none outline-none whitespace-pre [overflow-wrap:normal] overflow-auto"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(null); }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
