// === КОМПОНЕНТ: INPUT ===

import { cn } from '@/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm text-[#8a8273]">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2',
            'text-[#d1c7b7] placeholder-[#555]',
            'focus:outline-none focus:border-[#b8860b] focus:ring-1 focus:ring-[#b8860b]',
            'transition-colors duration-200',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
