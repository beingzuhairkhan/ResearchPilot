import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const titleMap: Record<string, string> = {
  '/': 'New Research',
  '/history': 'Research History',
  '/settings': 'Settings',
};

function getTitle(pathname: string): string {
  if (pathname === '/') return 'New Research';
  if (pathname.startsWith('/research/') && pathname.endsWith('/report')) return 'Research Report';
  if (pathname.startsWith('/research/')) return 'Research Progress';
  if (pathname.startsWith('/history')) return 'Research History';
  if (pathname.startsWith('/settings')) return 'Settings';
  return titleMap[pathname] ?? 'ResearchPilot';
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header title={getTitle(location.pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  );
}

export default AppLayout;
