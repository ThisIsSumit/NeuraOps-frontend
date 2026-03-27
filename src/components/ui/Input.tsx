import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  purple?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, iconPosition = 'left', purple, ...props }, ref) => {
    return (
      <div className="relative flex-1">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'h-[36px] w-full rounded-[6px] bg-[#070A0E]',
            'border-[0.5px]',
            error ? 'border-[#FF6B35]' : 'border-[#1E2A38]',
            'px-3 py-2',
            icon && iconPosition === 'left' ? 'pl-9' : '',
            icon && iconPosition === 'right' ? 'pr-9' : '',
            'font-mono text-[13px] text-[#E2E8F0]',
            'placeholder:text-[#4A5568]',
            'outline-none transition-all duration-150',
            !error && !purple && 'focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.08)]',
            error && 'focus:border-[#FF6B35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)]',
            purple && 'focus:border-[rgba(167,139,250,0.4)] focus:shadow-[0_0_0_3px_rgba(167,139,250,0.06)]',
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-[6px] bg-[#070A0E]',
        'border-[0.5px]',
        error ? 'border-[#FF6B35]' : 'border-[#1E2A38]',
        'px-3 py-2',
        'font-mono text-[13px] text-[#E2E8F0]',
        'placeholder:text-[#4A5568]',
        'outline-none transition-all duration-150 resize-none',
        !error && 'focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.08)]',
        error && 'focus:border-[#FF6B35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)]',
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';
