import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, History, Settings, PenLine, X, Sparkles } from 'lucide-react';

const navItems = [
  { to: '/', label: 'New Research', icon: PenLine, end: true },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-neutral-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-semibold text-neutral-900">ResearchPilot</span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-neutral-400">AI Research Agent</span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.end ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2.5">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <div>
              <p className="text-xs font-medium text-neutral-700">Track 01 — AI Agents</p>
              <p className="text-[10px] text-neutral-400">SerpApi India Hackathon 2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function useSidebar() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}

export default Sidebar;
