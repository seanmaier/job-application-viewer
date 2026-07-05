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
    <Link className="app-card" to={`/application/${application.id}`}>
      <div className="app-card-top">
        <div className="app-card-company">{application.company}</div>
        <span
          className="app-card-status"
          style={{ color: STATUS_COLORS[status], borderColor: STATUS_COLORS[status] }}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="app-card-role">{application.role}</div>
      {application.appliedDate && (
        <div className="app-card-date">Sent {application.appliedDate}</div>
      )}
      <div className="app-card-arrow">Open →</div>
    </Link>
  );
}
