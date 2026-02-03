import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'skeleton';

  const variantClasses: Record<string, string> = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const styles = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined),
    ...style,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{
              ...styles,
              width: i === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={styles}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="60%" className="mb-2" />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton lines={2} className="mb-3" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton width={120} height={20} className="mb-2" />
          <Skeleton width={180} height={28} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>

      {/* Progress card skeleton */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={80} height={80} />
          <div className="flex-1">
            <Skeleton width="40%" className="mb-2" />
            <Skeleton width="60%" height={12} />
          </div>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 card">
            <Skeleton width={24} height={24} className="mb-2" />
            <Skeleton width="50%" />
          </div>
        ))}
      </div>

      {/* Category progress skeleton */}
      <div>
        <Skeleton width={100} height={16} className="mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width={128} height={100} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
