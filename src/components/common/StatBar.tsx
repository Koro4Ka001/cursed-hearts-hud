// === КОМПОНЕНТ: STAT BAR ===

import { cn } from '@/utils/cn';

interface StatBarProps {
  current: number;
  max: number;
  temp?: number;
  color: 'hp' | 'mana' | 'resource';
  label?: string;
  showNumbers?: boolean;
  className?: string;
}

const colorMap = {
  hp: {
    bar: 'bg-gradient-to-r from-[#8b0000] to-[#b22222]',
    temp: 'bg-gradient-to-r from-[#4a4a4a] to-[#666]',
    glow: 'shadow-red-900/50',
    text: 'text-red-400',
  },
  mana: {
    bar: 'bg-gradient-to-r from-[#0047ab] to-[#1e90ff]',
    temp: 'bg-gradient-to-r from-[#4a4a4a] to-[#666]',
    glow: 'shadow-blue-900/50',
    text: 'text-blue-400',
  },
  resource: {
    bar: 'bg-gradient-to-r from-[#6b3fa0] to-[#9b59b6]',
    temp: 'bg-gradient-to-r from-[#4a4a4a] to-[#666]',
    glow: 'shadow-purple-900/50',
    text: 'text-purple-400',
  },
};

export function StatBar({
  current,
  max,
  temp = 0,
  color,
  label,
  showNumbers = true,
  className,
}: StatBarProps) {
  const percentage = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const tempPercentage = max > 0 ? Math.min(100 - percentage, (temp / max) * 100) : 0;
  const colors = colorMap[color];
  
  return (
    <div className={cn('w-full', className)}>
      {/* Label и числа */}
      {(label || showNumbers) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className={cn('text-sm font-medium', colors.text)}>{label}</span>
          )}
          {showNumbers && (
            <span className="text-sm text-[#8a8273]">
              {current}{temp > 0 && <span className="text-[#666]">+{temp}</span>}/{max}
            </span>
          )}
        </div>
      )}
      
      {/* Bar container */}
      <div className="relative h-4 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#333]">
        {/* Main bar */}
        <div
          className={cn(
            'absolute h-full transition-all duration-300 ease-out',
            colors.bar,
            colors.glow,
            'shadow-lg'
          )}
          style={{ width: `${percentage}%` }}
        />
        
        {/* Temp bar */}
        {temp > 0 && (
          <div
            className={cn(
              'absolute h-full transition-all duration-300 ease-out',
              colors.temp
            )}
            style={{ 
              left: `${percentage}%`,
              width: `${tempPercentage}%` 
            }}
          />
        )}
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      </div>
    </div>
  );
}
