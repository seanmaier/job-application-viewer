import { useEffect, useState } from 'react';
import '../styles/export-modal.css';

interface Props {
  text: string;
  onClose: () => void;
}

export function ExportModal({ text, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <span className="export-modal-title">LLM Export</span>
          <div className="export-modal-actions">
            <button className={`export-copy-btn ${copied ? 'export-copy-btn--copied' : ''}`} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <button className="export-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        <pre className="export-text">{text}</pre>
      </div>
    </div>
  );
}
