import type { HTMLAttributes } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarRing = 'none' | 'gold' | 'green';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  ring?: AvatarRing;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'avatar-xs',
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
  xl: 'avatar-xl',
  '2xl': 'avatar-2xl',
};

const sizePx: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
};

const ringClasses: Record<AvatarRing, string> = {
  none: '',
  gold: 'avatar-ring-gold',
  green: 'avatar-ring-green',
};

const fontSizeClasses: Record<AvatarSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  ring = 'none',
  className = '',
  ...props
}: AvatarProps) {
  const classes = [
    sizeClasses[size],
    ringClasses[ring],
    'rounded-full overflow-hidden flex-shrink-0',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const initials = name ? getInitials(name) : '?';

  return (
    <div className={classes} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          width={sizePx[size]}
          height={sizePx[size]}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className={`w-full h-full bg-heritage-green/10 text-heritage-green flex items-center justify-center font-medium ${fontSizeClasses[size]}`}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ children, max = 4, size = 'md' }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const overflow = childArray.length - max;

  return (
    <div className="flex -space-x-2">
      {visible}
      {overflow > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-charcoal-ink/10 text-charcoal-ink flex items-center justify-center font-medium ${fontSizeClasses[size]} border-2 border-white`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default Avatar;
