import { useState } from 'react';
import { formatDateLong, parseToIsoDate } from '../../utils/date';
import type { AppLanguage } from '../../types';

interface Props {
  value: string;
  onCommit: (value: string) => void;
  className: string;
  editClassName: string;
  placeholder?: string;
  multiline?: boolean;
  isDate?: boolean;
  language?: AppLanguage;
  title?: string;
}

export function EditableCell({
  value, onCommit, className, editClassName, placeholder, multiline = false, isDate = false, language, title,
}: Props) {
  const toDraft = (v: string) => (isDate ? parseToIsoDate(v) : v);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => toDraft(value));

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(toDraft(value));
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    if (draft === toDraft(value)) return;
    onCommit(isDate ? formatDateLong(draft, language ?? 'en') : draft);
  };

  const cancel = () => {
    setDraft(toDraft(value));
    setEditing(false);
  };

  if (editing) {
    if (isDate) {
      return (
        <input
          type="date"
          autoFocus
          className={editClassName}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Escape') cancel(); }}
        />
      );
    }

    const shared = {
      autoFocus: true,
      className: editClassName,
      value: draft,
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      onBlur: commit,
    };
    return multiline ? (
      <textarea
        {...shared}
        rows={2}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') cancel(); }}
      />
    ) : (
      <input
        {...shared}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
          if (e.key === 'Escape') cancel();
        }}
      />
    );
  }

  return (
    <span
      className={`${className} cursor-pointer hover:opacity-70 transition-opacity ${value ? '' : 'opacity-40'}`}
      onClick={startEdit}
      title={title}
    >
      {value || placeholder || '—'}
    </span>
  );
}
