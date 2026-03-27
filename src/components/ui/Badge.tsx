import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'running' | 'stopped' | 'failed' | 'pending' | 'cyan' | 'orange' | 'default' | 'purple';
  pulse?: boolean;
}

export const Badge = ({ className, variant = 'default', pulse, children, ...props }: BadgeProps) => {
  const base = 'inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] border-[0.5px] whitespace-nowrap';

  const variants: Record<string, string> = {
    running: 'bg-[rgba(0,217,255,0.08)] text-[#00D9FF] border-[rgba(0,217,255,0.25)]',
    stopped: 'bg-[#1E2A38] text-[#4A5568] border-[#2D3E50]',
    failed: 'bg-[rgba(255,107,53,0.08)] text-[#FF6B35] border-[rgba(255,107,53,0.25)]',
    pending: 'bg-[rgba(251,191,36,0.08)] text-[#FBBF24] border-[rgba(251,191,36,0.25)]',
    cyan: 'bg-[rgba(0,217,255,0.08)] text-[#00D9FF] border-[rgba(0,217,255,0.25)]',
    orange: 'bg-[rgba(255,107,53,0.08)] text-[#FF6B35] border-[rgba(255,107,53,0.25)]',
    purple: 'bg-[rgba(167,139,250,0.08)] text-[#A78BFA] border-[rgba(167,139,250,0.25)]',
    default: 'bg-[#131820] text-[#94A3B8] border-[#1E2A38]',
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              variant === 'running' || variant === 'cyan' ? 'bg-[#00D9FF] animate-ping' : '',
              variant === 'failed' || variant === 'orange' ? 'bg-[#FF6B35] animate-ping' : '',
            )}
          />
          <span
            className={cn(
              'relative inline-flex h-1.5 w-1.5 rounded-full',
              variant === 'running' || variant === 'cyan' ? 'bg-[#00D9FF]' : '',
              variant === 'failed' || variant === 'orange' ? 'bg-[#FF6B35]' : '',
              variant === 'stopped' ? 'bg-[#4A5568]' : '',
              variant === 'pending' ? 'bg-[#FBBF24]' : '',
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
};

/* DNS Record Type Badges */
export const RecordTypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    A: 'bg-[#0D2137] text-[#00D9FF] border-[#00D9FF]/40',
    CNAME: 'bg-[#0D1F2D] text-[#38BDF8] border-[#38BDF8]/40',
    TXT: 'bg-[#1A1500] text-[#FBBF24] border-[#FBBF24]/40',
    MX: 'bg-[#1A0D00] text-[#FB923C] border-[#FB923C]/40',
    AAAA: 'bg-[#0D1520] text-[#818CF8] border-[#818CF8]/40',
  };

  const s = styles[type] || styles.A;

  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-[4px] px-2 py-0.5',
      'font-mono text-[11px] uppercase font-medium border-[0.5px]',
      s
    )}>
      {type}
    </span>
  );
};
