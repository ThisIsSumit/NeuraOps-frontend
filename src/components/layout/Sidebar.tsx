import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Server, Globe, Bot, Settings, X, LogOut } from 'lucide-react';
import { useAppStore } from '../../store';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  onMobileClose?: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Server, label: 'Services', path: '/services' },
  { icon: Globe, label: 'DNS Manager', path: '/dns' },
  { icon: Bot, label: 'AI Agent', path: '/ai-agent', badge: true },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = ({ onMobileClose }: SidebarProps) => {
  const { user, sidebarCollapsed } = useAppStore();

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col',
        'border-r-[0.5px] border-[#1E2A38] bg-[#090C10]',
        'transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-[240px]',
      )}
    >
      {/* Logo */}
      <div className="flex h-[56px] items-center border-b-[0.5px] border-[#1E2A38] px-4">
        <div className="flex items-center gap-2.5">
          <span className="text-[20px] text-[#00D9FF] shrink-0 select-none">◈</span>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="font-[Epilogue] text-[18px] font-bold text-[#E2E8F0] whitespace-nowrap"
              >
                NeuraOps
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="ml-auto rounded-md p-1 text-[#4A5568] hover:bg-[#1E2A38] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            title={sidebarCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex h-[44px] items-center gap-3 rounded-[6px] pl-3 pr-2 transition-all duration-150',
                'font-sans text-[14px] font-medium',
                isActive
                  ? 'bg-[rgba(0,217,255,0.05)] text-[#00D9FF]'
                  : 'text-[#4A5568] hover:bg-[#1E2A38]/60 hover:text-[#94A3B8]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active left border */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-border"
                    className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-[#00D9FF]"
                  />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* AI badge */}
                {item.badge && !sidebarCollapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#A78BFA]" style={{
                    boxShadow: '0 0 8px rgba(167,139,250,0.6)',
                    animation: 'pulse-dot 2s ease-in-out infinite'
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-4 border-t-[0.5px] border-[#1E2A38] p-3">
        {/* WS status */}
        <div className="flex items-center gap-2 px-1">
          <span
            className="relative flex h-1.5 w-1.5 shrink-0"
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D9FF]" />
          </span>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[11px] text-[#00D9FF]"
              >
                Connected
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[rgba(0,217,255,0.12)] text-[#00D9FF] text-[12px] font-bold border-[0.5px] border-[#00D9FF]/20">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col overflow-hidden min-w-0"
              >
                <span className="truncate font-sans text-[13px] font-medium text-[#E2E8F0]">
                  {user?.name || 'Admin User'}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#4A5568]">
                  {user?.role || 'DevOps'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
};
