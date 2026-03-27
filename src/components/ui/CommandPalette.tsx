import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Server, Globe, Bot, Settings, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'dashboard', label: 'Dashboard', description: 'View infrastructure overview', icon: <LayoutDashboard className="h-4 w-4" />, action: () => navigate('/dashboard'), group: 'Navigation' },
    { id: 'services', label: 'Services', description: 'Manage deployed containers', icon: <Server className="h-4 w-4" />, action: () => navigate('/services'), group: 'Navigation' },
    { id: 'dns', label: 'DNS Manager', description: 'Manage Cloudflare DNS records', icon: <Globe className="h-4 w-4" />, action: () => navigate('/dns'), group: 'Navigation' },
    { id: 'ai', label: 'AI Agent', description: 'Query infrastructure with AI', icon: <Bot className="h-4 w-4" />, action: () => navigate('/ai-agent'), group: 'Navigation' },
    { id: 'settings', label: 'Settings', description: 'Manage profile and API keys', icon: <Settings className="h-4 w-4" />, action: () => navigate('/settings'), group: 'Navigation' },
    { id: 'new-service', label: 'Deploy New Service', description: 'Launch a new Docker container', icon: <Plus className="h-4 w-4" />, action: () => navigate('/services/new'), group: 'Actions' },
  ];

  const filtered = query
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    if (e.key === 'ArrowUp') setActiveIndex(i => Math.max(i - 1, 0));
    if (e.key === 'Enter') {
      filtered[activeIndex]?.action();
      setOpen(false);
    }
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100]"
            style={{ backdropFilter: 'blur(16px) brightness(0.3)', backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[20%] z-[101] w-full max-w-[580px] -translate-x-1/2 overflow-hidden rounded-[12px] bg-[#0D1117] border-[0.5px] border-[#2D3E50] shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b-[0.5px] border-[#1E2A38] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-[#4A5568]" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder="Search pages, actions..."
                className="flex-1 bg-transparent font-mono text-[15px] text-[#E2E8F0] placeholder:text-[#4A5568] outline-none"
              />
              <kbd className="rounded-[4px] bg-[#1E2A38] px-1.5 py-0.5 font-mono text-[10px] text-[#4A5568]">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto py-2">
              {Object.entries(grouped).map(([group, cmds]) => (
                <div key={group}>
                  <div className="px-4 py-2">
                    <span className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[#4A5568]">
                      {group}
                    </span>
                  </div>
                  {cmds.map(cmd => {
                    flatIndex++;
                    const isActive = activeIndex === flatIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => { cmd.action(); setOpen(false); }}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          isActive
                            ? 'bg-[rgba(0,217,255,0.06)]'
                            : 'hover:bg-[rgba(255,255,255,0.02)]'
                        )}
                      >
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px]',
                          isActive ? 'bg-[rgba(0,217,255,0.12)] text-[#00D9FF]' : 'bg-[#1E2A38] text-[#4A5568]'
                        )}>
                          {cmd.icon}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className={cn('font-sans text-[14px] font-medium', isActive ? 'text-[#E2E8F0]' : 'text-[#94A3B8]')}>
                            {cmd.label}
                          </span>
                          {cmd.description && (
                            <span className="font-sans text-[12px] text-[#4A5568]">{cmd.description}</span>
                          )}
                        </div>
                        {isActive && (
                          <div className="ml-auto flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#00D9FF]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-8 text-center font-mono text-[13px] text-[#4A5568]">
                  No results for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
