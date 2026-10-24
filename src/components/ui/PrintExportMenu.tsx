import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, Loader2Icon, PrinterIcon } from 'lucide-react';
import { toast } from 'sonner';

export type PrintExportOption = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{className?: string;}>;
  run: () => void | Promise<void>;
  /** Thông báo khi lỗi; mặc định "Không tạo được file, thử lại." */
  errorText?: string;
};

type PrintExportMenuProps = {
  options: PrintExportOption[];
  /** Dòng mô tả đầu menu, vd. "Danh sách đang lọc" */
  caption?: string;
  className?: string;
};

/** Nút "In / Xuất" dùng chung cho mọi màn: cùng nhãn, biểu tượng, kích thước và menu định dạng */
export function PrintExportMenu({ options, caption, className = '' }: PrintExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const run = async (o: PrintExportOption) => {
    setOpen(false);
    setBusy(o.id);
    try {
      await o.run();
    } catch {
      toast.error(o.errorText ?? 'Không tạo được file, thử lại.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy !== null}
        className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-wait disabled:opacity-70 ${
        open ? 'bg-gray-50' : ''}`
        }
        style={{ transition: 'background-color 150ms ease-out' }}>
        
        {busy ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <PrinterIcon className="h-4 w-4" aria-hidden />}
        {busy ? 'Đang tạo…' : 'In / Xuất'}
        <ChevronDownIcon
          className="h-4 w-4 text-gray-500"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease-out' }}
          aria-hidden />
        
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-40 mt-2 w-72 origin-top-right rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg">
          
            {caption && <p className="px-3 pb-1.5 pt-1 text-[12px] text-gray-500">{caption}</p>}
            {options.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.id}
                type="button"
                role="menuitem"
                onClick={() => run(o)}
                className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
                style={{ transition: 'background-color 120ms ease-out' }}>
                
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium text-gray-900">{o.label}</span>
                    {o.hint && <span className="block text-[12px] text-gray-500">{o.hint}</span>}
                  </span>
                </button>);

          })}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}