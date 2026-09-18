import { Menu, Compass } from 'lucide-react';
import type { ResearchStatus } from '@/types/research';
import { StatusBadge } from '@/components/ui/Badge';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  status?: ResearchStatus;
}

export function Header({ title, onMenuClick, status }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Compass className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-base font-semibold text-neutral-900">{title}</h1>
          </div>
          {status && (
            <div className="ml-2 hidden sm:block">
              <StatusBadge status={status} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 sm:flex">
            <div className="h-2 w-2 rounded-full bg-success-500" />
            <span className="text-xs font-medium text-neutral-600">API Connected</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            RP
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
