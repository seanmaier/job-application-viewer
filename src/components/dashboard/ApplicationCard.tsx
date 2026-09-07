import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/status';
import { EditableCell } from './EditableCell';
import type { ApplicationConfig, ApplicationStatus } from '../../types';

const LANG_FLAGS: Record<string, string> = { en: '🇬🇧', de: '🇩🇪' };

export type DateFieldName = 'appliedDate' | 'interviewDate' | 'finalDecisionDate';

const dateCellClass = '[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] w-[100px] shrink-0 text-right truncate ml-2';
const dateInputClass = '[font-family:var(--font-mono)] text-[11px] bg-[color:var(--surface)] border border-[color:var(--rule)] rounded px-1 py-0.5 w-[100px] shrink-0 text-right ml-2 text-[color:var(--ink-invert)] [color-scheme:dark]';

interface Props {
  application: ApplicationConfig;
  status: ApplicationStatus;
  appliedDate?: string;
  interviewDate?: string;
  finalDecisionDate?: string;
  notes?: string;
  onStatusChange: (status: ApplicationStatus) => void;
  onFieldChange: (field: DateFieldName | 'notes', value: string) => void;
  onDelete?: () => void;
}

export function ApplicationCard({
  application, status, appliedDate, interviewDate, finalDecisionDate, notes, onStatusChange, onFieldChange,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [editingStatus, setEditingStatus] = useState(false);
  const langFlag = LANG_FLAGS[application.language ?? 'en'];

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStatus(true);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onStatusChange(e.target.value as ApplicationStatus);
    setEditingStatus(false);
  };

  const handleStatusBlur = () => setEditingStatus(false);

  return (
    <div
      className="group flex items-center border-b border-[color:var(--rule)] py-2.5 cursor-pointer transition-colors duration-100 hover:bg-[color:var(--surface)]"
      onClick={() => navigate(`/application/${application.id}`)}
    >
      {/* Company */}
      <div className="flex items-center gap-1.5 w-[190px] shrink-0 min-w-0">
        <span className="[font-family:var(--font-mono)] text-[12.5px] text-[color:var(--ink-invert)] truncate">{application.company}</span>
        <span className="text-[10px] leading-none shrink-0 opacity-60" title={application.language ?? 'en'}>{langFlag}</span>
      </div>

      {/* Role */}
      <div className="flex-1 [font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] truncate min-w-0">
        {application.role}
      </div>

      {/* URL icon */}
      <div className="w-[28px] shrink-0 flex items-center justify-center">
        {application.url && (
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            className="[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-3)] no-underline hover:text-[color:var(--accent)] transition-colors duration-100"
            onClick={(e) => e.stopPropagation()}
            title={application.url}
          >
            ↗
          </a>
        )}
      </div>

      {/* Status — inline select on click */}
      <div className="w-[116px] shrink-0 flex items-center justify-end pr-1">
        {editingStatus ? (
          <select
            autoFocus
            className="[font-family:var(--font-mono)] text-[11px] bg-[color:var(--surface)] border border-[color:var(--rule)] rounded px-1.5 py-0.5 cursor-pointer w-full"
            value={status}
            style={{ color: STATUS_COLORS[status] }}
            onChange={handleStatusChange}
            onBlur={handleStatusBlur}
            onClick={(e) => e.stopPropagation()}
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v} className="text-[color:var(--ink-invert)] bg-[color:var(--surface)]">{l}</option>
            ))}
          </select>
        ) : (
          <span
            className="[font-family:var(--font-mono)] text-[11px] cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: STATUS_COLORS[status] }}
            onClick={handleStatusClick}
            title="Click to change status"
          >
            [{STATUS_LABELS[status]}]
          </span>
        )}
      </div>

      {/* Applied date */}
      <EditableCell
        value={appliedDate ?? ''}
        onCommit={(v) => onFieldChange('appliedDate', v)}
        className={dateCellClass}
        editClassName={dateInputClass}
        isDate
        language={application.language}
        title="Click to edit applied date"
      />

      {/* Interview date */}
      <EditableCell
        value={interviewDate ?? ''}
        onCommit={(v) => onFieldChange('interviewDate', v)}
        className={dateCellClass}
        editClassName={dateInputClass}
        isDate
        language={application.language}
        title="Click to edit interview date"
      />

      {/* Final decision date */}
      <EditableCell
        value={finalDecisionDate ?? ''}
        onCommit={(v) => onFieldChange('finalDecisionDate', v)}
        className={dateCellClass}
        editClassName={dateInputClass}
        isDate
        language={application.language}
        title="Click to edit final decision date"
      />

      {/* Notes */}
      <EditableCell
        value={notes ?? ''}
        onCommit={(v) => onFieldChange('notes', v)}
        className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] w-[170px] shrink-0 pl-3 truncate"
        editClassName="[font-family:var(--font-mono)] text-[11px] bg-[color:var(--surface)] border border-[color:var(--rule)] rounded px-1.5 py-1 w-[170px] shrink-0 ml-3 resize-none"
        multiline
        title="Click to edit notes"
      />

      {/* Delete (local apps only) */}
      {onDelete ? (
        <button
          className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] bg-transparent border-none cursor-pointer w-[28px] shrink-0 text-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-[color:var(--status-rejected)]"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
        >
          ✕
        </button>
      ) : (
        <div className="w-[28px] shrink-0" />
      )}
    </div>
  );
}
