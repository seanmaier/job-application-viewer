import { Link } from 'react-router-dom';
import { applications } from '../data/applications';
import { ApplicationCard } from '../components/dashboard/ApplicationCard';
import '../styles/dashboard.css';

export function DashboardPage() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title">Applications</div>
      </header>

      <main className="dashboard-grid">
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}

        <Link className="app-card app-card--new" to="/application/new">
          <span className="app-card-new-icon">+</span>
          <span className="app-card-new-label">New application</span>
          <span className="app-card-new-hint">Fill in the form, copy the generated code</span>
        </Link>
      </main>
    </div>
  );
}
