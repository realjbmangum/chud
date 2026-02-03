import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-heritage-green/10 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="heading-3 text-center mb-2">{title}</h3>
      {description && (
        <p className="body-md text-charcoal-ink/60 text-center max-w-sm mx-auto">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="empty-state">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="heading-3 text-center mb-2">{title}</h3>
      <p className="body-md text-charcoal-ink/60 text-center max-w-sm mx-auto">
        {description}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-6">
          Try Again
        </Button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="empty-state">
      <div className="flex justify-center mb-4">
        <svg
          className="animate-spin h-8 w-8 text-heritage-green"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="body-md text-charcoal-ink/60 text-center">{message}</p>
    </div>
  );
}

export default EmptyState;
