import { Outlet } from 'react-router-dom';

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden">
      <Outlet />
    </div>
  );
}
