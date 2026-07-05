import { Link } from 'react-router-dom';
import { applications } from '../data/applications';
import { ApplicationCard } from '../components/dashboard/ApplicationCard';
import '../styles/dashboard.css';

export function DashboardPage() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title">Applications</div>
        <p className="dashboard-hint">
          Add a new application by creating a file in{' '}
          <code>src/data/applications/</code> and exporting it from{' '}
          <code>index.ts</code>.
        </p>
      </header>

      <main className="dashboard-grid">
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}

        <Link className="app-card app-card--new" to="#" onClick={(e) => e.preventDefault()}>
          <span className="app-card-new-icon">+</span>
          <span className="app-card-new-label">New application</span>
          <span className="app-card-new-hint">Create a file in src/data/applications/</span>
        </Link>
      </main>
    </div>
  );
}
