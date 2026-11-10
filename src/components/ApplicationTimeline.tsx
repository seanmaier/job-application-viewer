import { STATUS_COLORS } from '../utils/status';
import { formatDateNumeric, formatDateTime, numericDateToIso, toIsoDate } from '../utils/date';
import { linkify } from '../utils/linkify';
import type { ApplicationConfig, ApplicationStatus, AppLanguage } from '../types';

interface Props {
  app: ApplicationConfig;
  status: ApplicationStatus;
  language: AppLanguage;
  onDeleteNote: (id: string) => void;
}

interface TimelineEvent {
  key: string;
  /**
   * Sorts the timeline: "YYYY-MM-DD" for status dates, "YYYY-MM-DDTHH:MM:SS"
   * (local time) for notes, so on the same day the status date comes first.
   * '' when unknown — such events go to the top.
   */
  sortKey: string;
  dateLabel: string;
  label: string;
  color: string;
  text?: string;
  noteId?: string;
}

const DECISION_LABELS: Partial<Record<ApplicationStatus, string>> = {
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

function statusEvent(key: string, label: string, color: string, value: string | undefined, language: AppLanguage): TimelineEvent[] {
  if (!value) return [];
  const iso = numericDateToIso(value);
  return [{ key, sortKey: iso, dateLabel: iso ? formatDateNumeric(iso, language) : value, label, color }];
}

function noteSortKey(createdAt: string | undefined): string {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return `${toIsoDate(date)}T${date.toTimeString().slice(0, 8)}`;
}

/**
 * The application's history in chronological order: its notes together with
 * the status dates (applied, interview, decision). The earliest note is
 * labelled as the initial one.
 */
function buildTimeline(app: ApplicationConfig, status: ApplicationStatus, language: AppLanguage): TimelineEvent[] {
  const decisionLabel = DECISION_LABELS[status];
  const events: TimelineEvent[] = [
    ...statusEvent('applied', 'Applied', STATUS_COLORS.sent, app.appliedDate, language),
    ...statusEvent('interview', 'Interview', STATUS_COLORS.interview, app.interviewDate, language),
    ...statusEvent(
      'decision',
      decisionLabel ?? 'Final decision',
      decisionLabel ? STATUS_COLORS[status] : 'var(--ink-2)',
      app.finalDecisionDate,
      language,
    ),
    ...(app.notes ?? []).map((note) => ({
      key: note.id,
      sortKey: noteSortKey(note.createdAt),
      dateLabel: note.createdAt ? formatDateTime(note.createdAt, language) : 'undated',
      label: 'Note',
      color: 'var(--accent)',
      text: note.text,
      noteId: note.id,
    })),
  ];
  events.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  const firstNote = events.find((e) => e.noteId);
  if (firstNote) firstNote.label = 'Initial note';
  return events;
}

// The notes panel of the application page: a log of what happened, from the
// first note through applying and interviews to the decision.
export function ApplicationTimeline({ app, status, language, onDeleteNote }: Props) {
  const events = buildTimeline(app, status, language);

  if (events.length === 0) {
    return <p className="[font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] italic m-0">No notes yet.</p>;
  }

  return (
    <ol className="list-none m-0 p-0 flex flex-col">
      {events.map((event, i) => (
        <li key={event.key} className="group/event relative pl-5 pb-4 last:pb-0">
          {i < events.length - 1 && (
            <span aria-hidden className="absolute left-[4px] top-[12px] bottom-[-2px] w-px bg-[color:var(--rule)]" />
          )}
          <span aria-hidden className="absolute left-0 top-[4px] w-[9px] h-[9px] rounded-full" style={{ background: event.color }} />
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
              <span className="[font-family:var(--font-mono)] text-[11px] font-semibold" style={{ color: event.color }}>
                {event.label}
              </span>
              <span className="[font-family:var(--font-mono)] text-[10px] text-[color:var(--ink-3)]">{event.dateLabel}</span>
            </div>
            {event.noteId && (
              <button
                type="button"
                className="[font-family:var(--font-mono)] text-[10px] text-[color:var(--ink-3)] bg-transparent border-none cursor-pointer opacity-0 group-hover/event:opacity-100 focus:opacity-100 hover:text-[color:var(--status-rejected)] transition-opacity"
                onClick={() => onDeleteNote(event.noteId!)}
                aria-label="Delete note"
              >
                ✕
              </button>
            )}
          </div>
          {event.text && (
            <div className="[font-family:var(--font-mono)] text-[12.5px] leading-[1.6] text-[color:var(--ink-invert)] whitespace-pre-wrap [overflow-wrap:anywhere] mt-1">
              {linkify(event.text)}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
