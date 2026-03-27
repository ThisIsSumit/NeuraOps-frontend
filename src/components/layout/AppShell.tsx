import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAppStore } from '../../store';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CommandPalette } from '../ui/CommandPalette';
import { X } from 'lucide-react';

export const AppShell = () => {
  const { sidebarCollapsed, setSidebarCollapsed, notifications, removeNotification } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarCollapsed(true);
      else setSidebarCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const unread = notifications.filter(n => !n.read);

  return (
    <div className="noise relative flex h-screen w-full overflow-hidden bg-[#090C10]">
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-[#090C10]/80 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar - Fixed to viewport */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-[240px]'
        )}
      >
        <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main
          className={cn(
            'flex-1 overflow-y-auto transition-all duration-300',
            sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[240px]'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Stack */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 w-[320px]">
        <AnimatePresence initial={false}>
          {unread.slice(0, 4).map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'relative flex w-full items-start gap-3 overflow-hidden rounded-[8px]',
                'bg-[#0D1117] border-[0.5px] border-[#1E2A38] p-3',
                'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l-[8px]',
                toast.type === 'success' && 'before:bg-[#00DF99]',
                toast.type === 'error' && 'before:bg-[#FF4444]',
                toast.type === 'warning' && 'before:bg-[#FF6B35]',
                toast.type === 'info' && 'before:bg-[#00D9FF]',
              )}
            >
              <div className="flex-1 pl-1 min-w-0">
                <p className="font-sans text-[14px] font-medium text-[#E2E8F0] leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 font-sans text-[13px] text-[#4A5568] leading-snug">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(toast.id)}
                className="mt-0.5 shrink-0 text-[#4A5568] hover:text-[#E2E8F0] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Progress bar */}
              <motion.div
                className={cn(
                  'absolute bottom-0 left-0 h-[2px]',
                  toast.type === 'success' && 'bg-[#00DF99]',
                  toast.type === 'error' && 'bg-[#FF4444]',
                  toast.type === 'warning' && 'bg-[#FF6B35]',
                  toast.type === 'info' && 'bg-[#00D9FF]',
                )}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                onAnimationComplete={() => removeNotification(toast.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <CommandPalette />
    </div>
  );
};
