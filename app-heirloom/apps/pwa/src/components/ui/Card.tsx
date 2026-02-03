import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'floating' | 'interactive';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'card',
  elevated: 'card-elevated',
  floating: 'card-floating',
  interactive: 'card-interactive',
};

const paddingClasses: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const classes = [
      variantClasses[variant],
      padding !== 'md' ? paddingClasses[padding] : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between mb-4 ${className}`}
        {...props}
      >
        <div>
          <h3 className="heading-4">{title}</h3>
          {subtitle && <p className="body-sm text-charcoal-ink/60 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export default Card;
