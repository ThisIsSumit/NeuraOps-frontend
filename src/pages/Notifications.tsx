import { Bell, CheckCircle2, AlertCircle, Info, Trash2, Check, Clock } from 'lucide-react';
import { useAppStore } from '../store';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const TYPE_CONFIG = {
  info: { icon: Info, color: '#38BDF8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)' },
  success: { icon: CheckCircle2, color: '#00DF99', bg: 'rgba(0,223,153,0.08)', border: 'rgba(0,223,153,0.2)' },
  warning: { icon: AlertCircle, color: '#FF6B35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.2)' },
  error: { icon: AlertCircle, color: '#FF4444', bg: 'rgba(255,68,68,0.08)', border: 'rgba(255,68,68,0.2)' },
};

const LEFT_BORDER_COLORS = {
  info: '#38BDF8',
  success: '#00DF99',
  warning: '#FF6B35',
  error: '#FF4444',
};

export const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, removeNotification } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter(n => filter === 'all' || !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[720px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-[Epilogue] text-[28px] font-[800] text-[#E2E8F0]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00D9FF] font-mono text-[10px] font-bold text-[#090C10]">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost-danger" size="sm" onClick={clearNotifications}>
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b-[0.5px] border-[#1E2A38]">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'relative px-4 py-2.5 font-sans text-[13px] font-medium capitalize transition-colors',
              filter === f ? 'text-[#E2E8F0]' : 'text-[#4A5568] hover:text-[#94A3B8]'
            )}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-[rgba(0,217,255,0.1)] px-1.5 py-0.5 font-mono text-[10px] text-[#00D9FF]">
                {unreadCount}
              </span>
            )}
            {filter === f && (
              <motion.div
                layoutId="notif-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D9FF]"
                style={{ boxShadow: '0 0 8px rgba(0,217,255,0.4)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.length > 0 ? (
            filtered.map((n, i) => {
              const config = TYPE_CONFIG[n.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  layout
                >
                  <div
                    onClick={() => !n.read && markAsRead(n.id)}
                    className={cn(
                      'group relative flex items-start gap-4 rounded-[10px] p-4 transition-all cursor-default',
                      'border-[0.5px] overflow-hidden',
                      n.read
                        ? 'bg-[#0D1117] border-[#1E2A38] hover:border-[#2D3E50]'
                        : 'bg-[#0D1117] border-[#1E2A38] hover:border-[#2D3E50]',
                    )}
                    style={{
                      borderLeft: `2px solid ${LEFT_BORDER_COLORS[n.type]}`,
                      opacity: n.read ? 0.6 : 1,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ background: config.bg, border: `0.5px solid ${config.border}` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: config.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'font-sans text-[14px] font-semibold leading-tight',
                          n.read ? 'text-[#94A3B8]' : 'text-[#E2E8F0]'
                        )}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Clock className="h-3 w-3 text-[#4A5568]" />
                          <span className="font-mono text-[10px] text-[#4A5568] whitespace-nowrap">
                            {formatTime(n.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="font-sans text-[13px] text-[#4A5568] leading-snug">{n.message}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className="flex items-start pt-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ background: config.color, boxShadow: `0 0 8px ${config.color}` }}
                        />
                      </div>
                    )}

                    {/* Delete on hover */}
                    <button
                      onClick={e => { e.stopPropagation(); removeNotification(n.id); }}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4A5568] hover:text-[#FF4444]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-20"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E2A38] text-[#4A5568]">
                <Bell className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-[Epilogue] text-[20px] font-bold text-[#E2E8F0]">All caught up</p>
                <p className="mt-1 font-sans text-[14px] text-[#4A5568]">
                  No {filter === 'unread' ? 'unread' : ''} notifications right now.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
