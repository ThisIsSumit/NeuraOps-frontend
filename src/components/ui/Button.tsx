import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'ghost-danger' | 'ghost-cyan' | 'outline' | 'orange' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = [
      'inline-flex items-center justify-center font-sans font-medium transition-all duration-150 cursor-pointer select-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00D9FF]',
    ];

    const variants: Record<string, string> = {
      primary: [
        'bg-[#FF6B35] text-white border-none rounded-[6px]',
        'hover:brightness-110 hover:shadow-[0_4px_20px_rgba(255,107,53,0.3)]',
        'active:brightness-95',
        'font-[Epilogue] font-bold',
      ].join(' '),
      secondary: [
        'bg-[#1E2A38] text-[#E2E8F0] border-[0.5px] border-[#2D3E50] rounded-[6px]',
        'hover:bg-[#2D3E50] hover:border-[#3D5060]',
      ].join(' '),
      ghost: [
        'bg-transparent text-[#94A3B8] border-[0.5px] border-[#1E2A38] rounded-[6px]',
        'hover:bg-[#1E2A38] hover:text-[#E2E8F0]',
      ].join(' '),
      'ghost-danger': [
        'bg-transparent text-[#FF6B35] border-[0.5px] border-[#FF6B35]/30 rounded-[6px]',
        'hover:bg-[#FF6B35]/10 hover:border-[#FF6B35]/60',
      ].join(' '),
      'ghost-cyan': [
        'bg-transparent text-[#00D9FF] border-[0.5px] border-[#00D9FF]/30 rounded-[6px]',
        'hover:bg-[#00D9FF]/08 hover:border-[#00D9FF]/60',
      ].join(' '),
      outline: [
        'bg-transparent text-[#E2E8F0] border-[0.5px] border-[#2D3E50] rounded-[6px]',
        'hover:border-[#00D9FF] hover:text-[#00D9FF]',
      ].join(' '),
      orange: [
        'bg-[#FF6B35] text-white border-none rounded-[6px]',
        'hover:brightness-110',
      ].join(' '),
      icon: [
        'bg-transparent text-[#4A5568] border-none rounded-[6px]',
        'hover:bg-[#1E2A38] hover:text-[#E2E8F0]',
      ].join(' '),
    };

    const sizes: Record<string, string> = {
      sm: 'h-[32px] px-3 text-[13px]',
      md: 'h-[36px] px-4 text-[14px]',
      lg: 'h-[44px] px-6 text-[14px]',
      icon: 'h-[32px] w-[32px] p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base.join(' '), variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
