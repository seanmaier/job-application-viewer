import { useEffect, useRef, useState } from 'react';
import type { ApplicationConfig } from '../types';
import '../styles/json-edit-modal.css';

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
    if (!cfg.coverLetter || typeof cfg.coverLetter !== 'object') {
      setError('Missing required field: "coverLetter"');
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
    <div className="json-overlay" onClick={onClose}>
      <div className="json-modal" onClick={(e) => e.stopPropagation()}>
        <div className="json-modal-header">
          <div className="json-modal-title-group">
            <span className="json-modal-title">JSON Editor</span>
            <span className="json-modal-subtitle">{app.company} · {app.role}</span>
          </div>
          <div className="json-modal-actions">
            <span className="json-status-note">status is managed via the toolbar dropdown</span>
            <button
              className={`json-save-btn ${saved ? 'json-save-btn--saved' : ''}`}
              onClick={handleSave}
            >
              {saved ? 'Saved!' : 'Save'}
            </button>
            <button className="json-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {error && <div className="json-error">{error}</div>}

        <textarea
          ref={textareaRef}
          className="json-textarea"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(null); }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
