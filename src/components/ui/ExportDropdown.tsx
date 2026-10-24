import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, DownloadIcon, FileSpreadsheetIcon, FileTextIcon, Loader2Icon } from 'lucide-react';
import { ExportFormat } from '../../utils/tableExport';

type ExportDropdownProps = {
  onExport: (format: ExportFormat) => void | Promise<void>;
  buttonClassName: string;
};

const formats: {id: ExportFormat;label: string;hint: string;icon: React.ComponentType<{className?: string;}>;}[] = [
{ id: 'xlsx', label: 'Excel (.xlsx)', hint: 'Giữ định dạng cột, có bộ lọc', icon: FileSpreadsheetIcon },
{ id: 'csv', label: 'CSV (.csv)', hint: 'Văn bản thuần, mở được ở mọi phần mềm', icon: FileTextIcon }];


/** Nút "Xuất" dùng chung: chọn định dạng rồi tải danh sách đang lọc */
export function ExportDropdown({ onExport, buttonClassName }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
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

  const run = async (f: ExportFormat) => {
    setOpen(false);
    setBusy(true);
    try {
      await onExport(f);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${buttonClassName} ${open ? 'bg-gray-50' : ''} disabled:cursor-wait`}
        style={{ transition: 'background-color 150ms ease-out' }}>
        
        {busy ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <DownloadIcon className="h-4 w-4" aria-hidden />}
        {busy ? 'Đang xuất…' : 'Xuất'}
        <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden />
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-40 mt-2 w-64 origin-top-right rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg">
          
            <p className="px-3 pb-1.5 pt-1 text-[12px] text-gray-500">Xuất danh sách đang lọc</p>
            {formats.map(({ id, label, hint, icon: Icon }) =>
          <button
            key={id}
            type="button"
            role="menuitem"
            onClick={() => run(id)}
            className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
            style={{ transition: 'background-color 120ms ease-out' }}>
            
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-gray-900">{label}</span>
                  <span className="block text-[12px] text-gray-500">{hint}</span>
                </span>
              </button>
          )}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}