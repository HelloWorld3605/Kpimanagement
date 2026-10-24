import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  /** full: pop up ngang gần kín màn hình, nội dung tự chia cột và cuộn riêng */
  size?: 'md' | 'lg' | 'xl' | 'full' | 'square';
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Nút thao tác đặt trên header, cạnh nút đóng */
  headerActions?: React.ReactNode;
  /** Bọc nội dung trong <form> để Enter gửi form */
  onSubmit?: (e: React.FormEvent) => void;
};

const widths = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[1680px] lg:h-[calc(100vh-3rem)]',
  // Vuông: rộng = cao 480px, thu nhỏ theo màn hình
  square: 'max-w-[480px] h-[min(480px,calc(100vh-2rem))]'
};
const ease = [0.23, 1, 0.32, 1] as const;

export function Modal({ open, onClose, title, description, size = 'md', children, footer, headerActions, onSubmit }: ModalProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useRef(`modal-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>('[data-autofocus], input:not([disabled]), select:not([disabled]), textarea');
      (first ?? panelRef.current)?.focus({ preventScroll: true });
    }, 40);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/40 p-4 sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        
          <motion.div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 8 }}
          transition={{ duration: 0.22, ease }}
          className={`flex max-h-[calc(100vh-2rem)] w-full ${widths[size]} flex-col rounded-lg bg-white shadow-xl focus:outline-none`}>
          
            <Shell onSubmit={onSubmit}>
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5">
                <div className="min-w-0">
                  <h2 id={titleId} className="text-[16px] font-semibold text-gray-900">
                    {title}
                  </h2>
                  {description && <div className="text-[13px] leading-snug text-gray-500">{description}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                {headerActions}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng"
                  className="-mr-1.5 shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  style={{ transition: 'background-color 120ms ease-out, color 120ms ease-out' }}>
                  
                  <XIcon className="h-4 w-4" />
                </button>
                </div>
              </div>
              <div className={`min-h-0 flex-1 overflow-y-auto ${size === 'full' ? 'lg:flex lg:flex-col lg:overflow-hidden' : size === 'square' ? 'overflow-hidden' : ''}`}>{children}</div>
              {footer && <div className="shrink-0 border-t border-gray-200 px-4 py-2 [&_button]:h-9">{footer}</div>}
            </Shell>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>,
    document.body
  );
}

function Shell({ onSubmit, children }: {onSubmit?: (e: React.FormEvent) => void;children: React.ReactNode;}) {
  const cls = 'flex min-h-0 flex-1 flex-col';
  return onSubmit ?
  <form onSubmit={onSubmit} noValidate className={cls}>
      {children}
    </form> :

  <div className={cls}>{children}</div>;

}

export const btnPrimary =
'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';
export const btnSecondary =
'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 text-[14px] font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50';
export const btnGhost =
'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';
export const btnTransition = { transition: 'background-color 150ms ease-out, transform 120ms ease-out' };