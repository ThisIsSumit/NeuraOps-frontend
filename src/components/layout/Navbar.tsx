import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { useAppStore } from '../../store';
import { cn } from '../../lib/utils';

interface NavbarProps {
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  services: 'Services',
  dns: 'DNS Manager',
  'ai-agent': 'AI Agent',
  settings: 'Settings',
  notifications: 'Notifications',
};

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const location = useLocation();
  const { sidebarCollapsed, notifications } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  const segment = location.pathname.split('/')[1];
  const pageTitle = PAGE_TITLES[segment] || 'NeuraOps';

  return (
    <header
      className={cn(
        'relative flex h-[56px] w-full shrink-0 items-center',
        'border-b-[0.5px] border-[#1E2A38] bg-[#090C10]/85',
        'backdrop-blur-md px-4 md:px-6 z-30'
      )}
    >
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="rounded-[6px] p-1.5 text-[#4A5568] hover:bg-[#1E2A38] hover:text-[#E2E8F0] transition-colors lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="font-[Epilogue] text-[22px] font-bold text-[#E2E8F0] whitespace-nowrap">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Search */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4A5568] pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search... (Ctrl+K)"
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
              document.dispatchEvent(event);
            }}
            className={cn(
              'h-[34px] w-[340px] cursor-pointer rounded-[6px]',
              'border-[0.5px] border-[#1E2A38] bg-[#0F141A]',
              'pl-9 pr-4 font-mono text-[13px] text-[#E2E8F0]',
              'placeholder:text-[#4A5568]',
              'focus:border-[#00D9FF] focus:shadow-[0_0_16px_rgba(0,217,255,0.15)]',
              'outline-none transition-all duration-150'
            )}
          />
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden font-mono text-[12px] text-[#00D9FF] sm:block">↑ 4 deploys today</span>

        <Link
          to="/notifications"
          className="relative rounded-[6px] p-1.5 text-[#4A5568] hover:bg-[#1E2A38] hover:text-[#E2E8F0] transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-[7px] w-[7px] rounded-full bg-[#00D9FF] shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
          )}
        </Link>
      </div>
    </header>
  );
};
