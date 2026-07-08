import { Link } from 'react-router-dom';
import { useApplicationStatus } from '../../hooks/useApplicationStatus';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/status';
import type { ApplicationConfig } from '../../types';

const LANG_FLAGS: Record<string, string> = { en: '🇬🇧', de: '🇩🇪' };

interface Props {
  application: ApplicationConfig;
  onDelete?: () => void;
}

export function ApplicationCard({ application, onDelete }: Props) {
  const [status] = useApplicationStatus(application.id, application.status);
  const langFlag = LANG_FLAGS[application.language ?? 'en'];

  return (
    <div className="group relative flex items-center border-b border-[color:var(--rule)] last:border-b-0">
      <Link
        className="flex-1 flex items-center gap-5 px-5 py-3.5 no-underline hover:bg-[color:var(--surface)] transition-colors duration-100"
        to={`/application/${application.id}`}
      >
        <div className="flex items-center gap-1.5 w-[200px] shrink-0 min-w-0">
          <span className="text-[13.5px] font-semibold text-[color:var(--ink)] tracking-[-0.15px] truncate">{application.company}</span>
          <span className="text-[11px] leading-none shrink-0" title={application.language ?? 'en'}>{langFlag}</span>
        </div>
        <div className="flex-1 text-[13px] text-[color:var(--ink-2)] truncate min-w-0">{application.role}</div>
        <span
          className="[font-family:var(--font-mono)] text-[10px] py-0.5 px-2.5 rounded-full border whitespace-nowrap shrink-0 w-[110px] text-center"
          style={{ color: STATUS_COLORS[status], borderColor: STATUS_COLORS[status] }}
        >
          {STATUS_LABELS[status]}
        </span>
        <span className="[font-family:var(--font-mono)] text-[10.5px] text-[color:var(--ink-3)] w-[96px] shrink-0 text-right">
          {application.appliedDate ?? ''}
        </span>
        <span className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0">→</span>
      </Link>
      {onDelete && (
        <button
          className="[font-family:var(--font-mono)] text-[11px] text-[color:var(--ink-3)] bg-transparent border-none cursor-pointer px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[color:var(--status-rejected)] shrink-0"
          onClick={() => onDelete()}
          title="Delete"
        >
          ✕
        </button>
      )}
    </div>
  );
}
