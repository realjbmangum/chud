import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showClose?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showClose = true,
  size = 'md',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div ref={contentRef} className={`modal-content ${sizeClasses[size]}`}>
        {(title || showClose) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 id="modal-title" className="heading-3">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-charcoal-ink/10 rounded-lg transition-colors ml-auto"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-charcoal-ink/60" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in"
    >
      <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-auto animate-slide-up safe-bottom">
        <div className="sticky top-0 bg-white pt-3 pb-2 px-5 border-b border-charcoal-ink/10">
          <div className="w-10 h-1 bg-charcoal-ink/20 rounded-full mx-auto mb-3" />
          {title && <h2 className="heading-3 text-center">{title}</h2>}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
