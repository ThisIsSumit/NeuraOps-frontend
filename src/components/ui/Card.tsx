import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverable?: boolean;
}

export const Card = ({ className, glow, hoverable, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-[10px] bg-[#0D1117] border-[0.5px] border-[#1E2A38] p-5',
        hoverable && [
          'transition-all duration-200 cursor-pointer',
          'hover:border-[#00D9FF]/50 hover:shadow-[0_0_16px_rgba(0,217,255,0.08)]',
        ],
        glow && 'shadow-[0_0_20px_rgba(0,217,255,0.04)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props}>{children}</div>
);

export const SectionLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn(
    'font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#4A5568]',
    className
  )}>
    {children}
  </span>
);
