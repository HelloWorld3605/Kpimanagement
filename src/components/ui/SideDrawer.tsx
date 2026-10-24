import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Đổi giá trị này khi nội dung đổi để cuộn lên đầu */
  contentKey?: string;
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  labelledBy: string;
  /** Độ rộng tối đa của ngăn kéo */
  widthClassName?: string;
};

const ease = [0.23, 1, 0.32, 1] as const;

export function SideDrawer({ open, onClose, contentKey, header, children, footer, labelledBy, widthClassName = 'max-w-[520px]' }: SideDrawerProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus({ preventScroll: true });
    bodyRef.current?.scrollTo({ top: 0 });
  }, [open, contentKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Hộp thoại mở chồng lên drawer tự xử lý Escape
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"][aria-modal="true"]:not([data-drawer])')) onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open &&
      <>
          <motion.div
          key="overlay"
          className="fixed inset-0 z-40 bg-gray-900/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          onClick={onClose}
          aria-hidden />
        
          <motion.aside
          key="drawer"
          role="dialog"
          aria-modal="true"
          data-drawer
          aria-labelledby={labelledBy}
          className={`fixed inset-y-0 right-0 z-40 flex w-full ${widthClassName} flex-col bg-white shadow-xl`}
          initial={{ x: reduce ? 0 : 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: reduce ? 0 : 32, opacity: 0 }}
          transition={{ duration: 0.24, ease }}>
          
            <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
              <div className="min-w-0 flex-1">{header}</div>
              <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="-mr-1 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{ transition: 'background-color 120ms ease-out, color 120ms ease-out' }}>
              
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto">
              {children}
            </div>
            {footer && <div className="border-t border-gray-200 px-5 py-3.5">{footer}</div>}
          </motion.aside>
        </>
      }
    </AnimatePresence>,
    document.body
  );
}