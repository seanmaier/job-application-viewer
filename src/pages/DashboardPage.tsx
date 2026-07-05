import { Link } from 'react-router-dom';
import { applications } from '../data/applications';
import { ApplicationCard } from '../components/dashboard/ApplicationCard';

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] pt-12 px-10 pb-20 max-w-[960px] mx-auto">
      <header className="mb-9 flex items-baseline justify-between gap-6 flex-wrap border-b-[1.5px] border-[color:var(--rule)] pb-5">
        <div className="text-[22px] font-bold text-[color:var(--ink)] tracking-[-0.4px]">Applications</div>
      </header>

      <main className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}

        <Link
          className="bg-[color:var(--surface)] border-[1.5px] border-dashed border-[color:var(--rule)] rounded-lg pt-[22px] px-6 pb-[18px] no-underline flex flex-col items-center justify-center text-center gap-1.5 min-h-[120px] transition-[border-color,box-shadow] duration-150 cursor-pointer hover:border-[color:var(--ink-3)]"
          to="/application/new"
        >
          <span className="text-[28px] text-[color:var(--ink-3)] leading-none">+</span>
          <span className="text-[13px] font-semibold text-[color:var(--ink-2)]">New application</span>
          <span className="[font-family:var(--font-mono)] text-[10px] text-[color:var(--ink-3)]">Fill in the form, copy the generated code</span>
        </Link>
      </main>
    </div>
  );
}
