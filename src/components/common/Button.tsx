// === КОМПОНЕНТ: КНОПКА ===

import { cn } from '@/utils/cn';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  isLoading,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#8b0000] hover:bg-[#a00000] text-white border border-[#5c0000] shadow-lg shadow-red-900/20',
    secondary: 'bg-[#1a1a1a] hover:bg-[#252525] text-[#d1c7b7] border border-[#333] shadow-lg',
    danger: 'bg-red-900 hover:bg-red-800 text-white border border-red-700',
    ghost: 'bg-transparent hover:bg-[#1a1a1a] text-[#8a8273] hover:text-[#d1c7b7] border border-transparent',
    gold: 'bg-gradient-to-b from-[#b8860b] to-[#8b6914] hover:from-[#d4a017] hover:to-[#b8860b] text-black border border-[#d4a017] shadow-lg shadow-amber-900/20',
  };
  
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Загрузка...
        </>
      ) : (
        children
      )}
    </button>
  );
}
