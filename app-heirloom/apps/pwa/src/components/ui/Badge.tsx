import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'gold';
type BadgeCategory =
  | 'early-life'
  | 'school'
  | 'career'
  | 'love'
  | 'parenting'
  | 'adventures'
  | 'traditions'
  | 'values'
  | 'health'
  | 'legacy';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  category?: BadgeCategory;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-charcoal-ink/10 text-charcoal-ink',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  gold: 'bg-heirloom-gold/20 text-heirloom-gold',
};

const categoryClasses: Record<BadgeCategory, string> = {
  'early-life': 'badge-early-life',
  'school': 'badge-school',
  'career': 'badge-career',
  'love': 'badge-love',
  'parenting': 'badge-parenting',
  'adventures': 'badge-adventures',
  'traditions': 'badge-traditions',
  'values': 'badge-values',
  'health': 'badge-health',
  'legacy': 'badge-legacy',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  category,
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full font-medium';

  let colorClasses: string;
  if (category) {
    colorClasses = categoryClasses[category];
  } else {
    colorClasses = variantClasses[variant];
  }

  const classes = [baseClasses, sizeClasses[size], colorClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: 'active' | 'idle' | 'away' }) {
  const colors = {
    active: 'bg-green-500',
    idle: 'bg-amber-500',
    away: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[status]}`}
      aria-label={status}
    />
  );
}

export default Badge;
