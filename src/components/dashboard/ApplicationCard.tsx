import { Link } from 'react-router-dom';
import { useApplicationStatus } from '../../hooks/useApplicationStatus';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/status';
import type { ApplicationConfig } from '../../types';

interface Props {
  application: ApplicationConfig;
}

export function ApplicationCard({ application }: Props) {
  const [status] = useApplicationStatus(application.id, application.status);

  return (
    <Link
      className="group bg-[color:var(--surface)] border-[1.5px] border-[color:var(--rule)] rounded-lg pt-[22px] px-6 pb-[18px] no-underline flex flex-col gap-1 transition-[border-color,box-shadow] duration-150 cursor-pointer hover:border-[color:var(--accent)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.10)]"
      to={`/application/${application.id}`}
    >
      <div className="flex justify-between items-start gap-2 mb-0.5">
        <div className="text-[15px] font-bold text-[color:var(--ink)] tracking-[-0.2px]">{application.company}</div>
        <span
          className="[font-family:var(--font-mono)] text-[10px] py-0.5 px-2 rounded-full border whitespace-nowrap shrink-0"
          style={{ color: STATUS_COLORS[status], borderColor: STATUS_COLORS[status] }}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="text-[12.5px] text-[color:var(--ink-2)]">{application.role}</div>
      {application.appliedDate && (
        <div className="[font-family:var(--font-mono)] text-[10px] text-[color:var(--ink-3)] mt-1">Sent {application.appliedDate}</div>
      )}
      <div className="[font-family:var(--font-mono)] text-[10.5px] text-[color:var(--accent)] mt-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">Open →</div>
    </Link>
  );
}
