import { useState } from 'react';

interface Props {
  value: string;
  onCommit: (value: string) => void;
  className: string;
  editClassName: string;
  placeholder?: string;
  multiline?: boolean;
  title?: string;
}

export function EditableCell({ value, onCommit, className, editClassName, placeholder, multiline = false, title }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(value);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
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
