import { cn } from '../../lib/utils';

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle = ({ checked, onCheckedChange, disabled, className }: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full',
        'border-0 outline-none transition-colors duration-200',
        'focus-visible:ring-1 focus-visible:ring-[#00D9FF] focus-visible:ring-offset-1 focus-visible:ring-offset-[#090C10]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-[#00D9FF]' : 'bg-[#1E2A38]',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-[16px] w-[16px] rounded-full bg-white shadow-sm',
          'absolute top-[2px] transition-transform duration-200',
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
        )}
      />
    </button>
  );
};
