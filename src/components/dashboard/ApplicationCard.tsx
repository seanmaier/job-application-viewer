import { useNavigate } from 'react-router-dom';
import { useApplicationStatus } from '../../hooks/useApplicationStatus';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/status';
import type { ApplicationConfig } from '../../types';

const LANG_FLAGS: Record<string, string> = { en: '🇬🇧', de: '🇩🇪' };

interface Props {
  application: ApplicationConfig;
  onDelete?: () => void;
}

export function ApplicationCard({ application, onDelete }: Props) {
  const navigate = useNavigate();
  const [status] = useApplicationStatus(application.id, application.status);
  const langFlag = LANG_FLAGS[application.language ?? 'en'];

  return (
    <div
      className="group flex items-center border-b border-[color:var(--rule)] py-2.5 cursor-pointer hover:bg-[color:var(--surface)] transition-colors duration-100"
      onClick={() => navigate(`/application/${application.id}`)}
    >
      {/* Company */}
      <div className="flex items-center gap-1.5 w-[190px] shrink-0 min-w-0 pl-1">
        <span className="[font-family:var(--font-mono)] text-[12.5px] text-[color:var(--ink-invert)] truncate">{application.company}</span>
        <span className="text-[10px] leading-none shrink-0 opacity-60" title={application.language ?? 'en'}>{langFlag}</span>
      </div>

      {/* Role */}
      <div className="flex-1 [font-family:var(--font-mono)] text-[12px] text-[color:var(--ink-2)] truncate min-w-0">
        {application.role}
      </div>

      {/* URL icon — always reserves column space */}
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

      {/* Status */}
      <span
        className="[font-family:var(--font-mono)] text-[11px] w-[116px] shrink-0 text-right pr-1"
        style={{ color: STATUS_COLORS[status] }}
      >
        [{STATUS_LABELS[status]}]
      </span>

      {/* Date */}
      <span className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] w-[90px] shrink-0 text-right">
        {application.appliedDate ?? ''}
      </span>

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
