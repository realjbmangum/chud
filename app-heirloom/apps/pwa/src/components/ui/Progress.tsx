import type { HTMLAttributes } from 'react';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'gold' | 'default';
  showLabel?: boolean;
  animated?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const colorClasses: Record<string, string> = {
  green: 'bg-heritage-green',
  gold: 'bg-heirloom-gold',
  default: 'bg-heritage-green',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'default',
  showLabel = false,
  animated = true,
  className = '',
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className} {...props}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="body-sm text-charcoal-ink/60">Progress</span>
          <span className="body-sm font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`progress-bar ${sizeClasses[size]}`}>
        <div
          className={`progress-bar-fill ${colorClasses[color]} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'green' | 'gold';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = 'green',
  showValue = true,
  label,
  className = '',
}: ProgressRingProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColor = color === 'gold' ? 'var(--color-heirloom-gold)' : 'var(--color-heritage-green)';

  return (
    <div className={`progress-ring inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-charcoal-ink/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showValue && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="text-lg font-semibold text-charcoal-ink">
            {Math.round(percentage)}%
          </span>
          {label && (
            <span className="text-xs text-charcoal-ink/60">{label}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface CategoryProgressProps {
  category: string;
  icon: React.ReactNode;
  current: number;
  total: number;
  color?: string;
}

export function CategoryProgress({
  category,
  icon,
  current,
  total,
  color = 'bg-heritage-green',
}: CategoryProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex-shrink-0 w-32">
      <div className="card-interactive p-3 h-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <span className="body-sm font-medium text-charcoal-ink truncate">
            {category}
          </span>
        </div>
        <div className="progress-bar h-1.5 mb-1">
          <div
            className={`progress-bar-fill ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="caption text-charcoal-ink/50">
          {current}/{total} stories
        </span>
      </div>
    </div>
  );
}

export default ProgressBar;
