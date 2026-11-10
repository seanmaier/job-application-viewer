import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/status';
import { EditableCell } from './EditableCell';
import { NotesDialog } from '../NotesDialog';
import { LANGUAGE_LABELS } from '../../utils/language';
import type { AppLanguage, ApplicationConfig, ApplicationStatus } from '../../types';

export type DateFieldName = 'appliedDate' | 'interviewDate' | 'finalDecisionDate';

const dateCellClass = '[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] w-[88px] shrink-0 text-right truncate ml-2';
const dateInputClass = '[font-family:var(--font-mono)] text-[11px] bg-[color:var(--surface)] border border-[color:var(--rule)] rounded px-1 py-0.5 w-[88px] shrink-0 text-right ml-2 text-[color:var(--ink-invert)] [color-scheme:dark]';

const langBadgeClass = '[font-family:var(--font-mono)] uppercase tracking-[0.06em] leading-none shrink-0 text-[color:var(--ink-2)] border border-[color:var(--rule)] rounded px-1 py-[3px]';

// Card layout (below lg): dates sit in a labelled 3-column grid instead of
// fixed-width table cells.
const cardLabelClass = '[font-family:var(--font-mono)] text-[9px] uppercase tracking-[0.1em] text-[color:var(--ink-3)]';
const cardDateClass = '[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] block truncate py-1';
const cardDateInputClass = '[font-family:var(--font-mono)] text-[12px] bg-[color:var(--surface)] border border-[color:var(--rule)] rounded px-1 py-1 w-full text-[color:var(--ink-invert)] [color-scheme:dark]';

interface Props {
  application: ApplicationConfig;
  /** The effective language, including edits saved on top of the application. */
  language: AppLanguage;
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
  application, language, status, appliedDate, interviewDate, finalDecisionDate, notes, onStatusChange, onFieldChange,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [editingStatus, setEditingStatus] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

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

  const open = () => navigate(`/application/${application.id}`);
  const dateFields: { field: DateFieldName; label: string; value?: string }[] = [
    { field: 'appliedDate', label: 'applied', value: appliedDate },
    { field: 'interviewDate', label: 'interview', value: interviewDate },
    { field: 'finalDecisionDate', label: 'decision', value: finalDecisionDate },
  ];

  return (
    <>
    {/* ── Card (below lg) ── */}
    <div
      className="lg:hidden flex flex-col gap-3 border border-[color:var(--rule)] rounded-md p-3.5 cursor-pointer transition-colors duration-100 active:bg-[color:var(--surface)]"
      onClick={open}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="[font-family:var(--font-mono)] text-[13.5px] text-[color:var(--ink-invert)] truncate">{application.company}</span>
            <span className={`${langBadgeClass} text-[10px]`} title={LANGUAGE_LABELS[language]}>{language}</span>
          </div>
          <div className="[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] mt-1 line-clamp-2">{application.role}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className="[font-family:var(--font-mono)] text-[13px] text-[color:var(--ink-3)] no-underline border border-[color:var(--rule)] rounded w-8 h-8 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              title={application.url}
              aria-label="Open job posting"
            >
              ↗
            </a>
          )}
          {onDelete && (
            <button
              className="[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] bg-transparent border border-[color:var(--rule)] rounded w-8 h-8 cursor-pointer leading-none"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Move to trash"
              aria-label="Move application to trash"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Always a select here: there's no hover on touch, and a native picker is easier to hit than a tap-to-edit label */}
      <select
        data-tour="status"
        className="self-start [font-family:var(--font-mono)] text-[12px] bg-[color:var(--surface)] border border-[color:var(--rule)] rounded px-2 py-1.5 cursor-pointer"
        value={status}
        style={{ color: STATUS_COLORS[status] }}
        onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Status"
      >
        {Object.entries(STATUS_LABELS).map(([v, l]) => (
          <option key={v} value={v} className="text-[color:var(--ink-invert)] bg-[color:var(--surface)]">{l}</option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-2">
        {dateFields.map(({ field, label, value }) => (
          <div key={field} className="min-w-0">
            <div className={cardLabelClass}>{label}</div>
            <EditableCell
              value={value ?? ''}
              onCommit={(v) => onFieldChange(field, v)}
              className={cardDateClass}
              editClassName={cardDateInputClass}
              isDate
              language={language}
              title={`Tap to edit ${label} date`}
            />
          </div>
        ))}
      </div>

      <div
        className="border-t border-[color:var(--rule)] pt-2.5"
        onClick={(e) => { e.stopPropagation(); setNotesOpen(true); }}
      >
        <div className={cardLabelClass}>notes</div>
        <p className={`[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] mt-1 line-clamp-2 whitespace-pre-line ${notes ? '' : 'opacity-40'}`}>
          {notes || 'tap to add notes'}
        </p>
      </div>
    </div>

    {/* ── Table row (lg and up) ── */}
    <div
      className="group hidden lg:flex items-center border-b border-[color:var(--rule)] py-2.5 cursor-pointer transition-colors duration-100 hover:bg-[color:var(--surface)]"
      onClick={open}
    >
      {/* Company */}
      <div className="w-[190px] shrink-0 min-w-0 [font-family:var(--font-mono)] text-[12.5px] text-[color:var(--ink-invert)] truncate">
        {application.company}
      </div>

      {/* Role */}
      <div className="flex-1 [font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] truncate min-w-[120px]">
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

      {/* Language */}
      <div className="w-[44px] shrink-0 flex items-center justify-center">
        <span className={`${langBadgeClass} text-[9.5px]`} title={LANGUAGE_LABELS[language]}>{language}</span>
      </div>

      {/* Status — inline select on click */}
      <div data-tour="status" className="w-[116px] shrink-0 flex items-center justify-end pr-1">
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
        language={language}
        title="Click to edit applied date"
      />

      {/* Interview date */}
      <EditableCell
        value={interviewDate ?? ''}
        onCommit={(v) => onFieldChange('interviewDate', v)}
        className={dateCellClass}
        editClassName={dateInputClass}
        isDate
        language={language}
        title="Click to edit interview date"
      />

      {/* Final decision date */}
      <EditableCell
        value={finalDecisionDate ?? ''}
        onCommit={(v) => onFieldChange('finalDecisionDate', v)}
        className={dateCellClass}
        editClassName={dateInputClass}
        isDate
        language={language}
        title="Click to edit final decision date"
      />

      {/* Notes — the cell only previews; editing happens in a dialog */}
      <span
        className={`[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-2)] w-[170px] shrink-0 pl-3 truncate cursor-pointer hover:opacity-70 transition-opacity ${notes ? '' : 'opacity-40'}`}
        onClick={(e) => { e.stopPropagation(); setNotesOpen(true); }}
        title={notes ? `${notes}\n\nClick to edit notes` : 'Click to add notes'}
      >
        {notes || '—'}
      </span>

      {/* Delete (local apps only) — pinned to the right edge so it stays in
          view even when the row is wider than the window and scrolls. */}
      <div className="sticky right-0 w-[36px] shrink-0 self-stretch flex items-center justify-center bg-[color:var(--bg)] group-hover:bg-[color:var(--surface)] transition-colors duration-100">
        {onDelete && (
          <button
            className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-2)] bg-transparent border border-[color:var(--rule)] rounded w-[24px] h-[22px] cursor-pointer leading-none hover:text-[color:var(--status-rejected)] hover:border-[color:var(--status-rejected)] transition-colors"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Move to trash"
          >
            ✕
          </button>
        )}
      </div>
    </div>

    {notesOpen && (
      <NotesDialog
        company={application.company}
        value={notes ?? ''}
        onSave={(v) => onFieldChange('notes', v)}
        onClose={() => setNotesOpen(false)}
      />
    )}
    </>
  );
}
