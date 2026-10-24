import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, FileSpreadsheetIcon, FileTextIcon, Loader2Icon, PrinterIcon } from 'lucide-react';
import { ScoresheetForm } from '../../utils/scoresheet';
import { printScoresheetPdf } from '../../utils/scoresheetPdf';
import { downloadScoresheetDocx } from '../../utils/scoresheetDocx';
import { downloadScoresheetXlsx } from '../../utils/scoresheetXlsx';

type Format = 'pdf' | 'docx' | 'xlsx';

const errorText: Record<Format, string> = {
  pdf: 'Không mở được bản in, thử lại.',
  docx: 'Không tạo được file Word, thử lại.',
  xlsx: 'Không tạo được file Excel, thử lại.'
};

/** Một nút "In / Xuất bảng điểm" mở menu PDF · Word · Excel — file ra đúng mẫu CĐKPI */
export function ScoresheetExport({ form }: {form: ScoresheetForm;}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Format | null>(null);
  const [error, setError] = useState('');
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

  const run = async (format: Format) => {
    setOpen(false);
    setError('');
    setBusy(format);
    try {
      if (format === 'pdf') printScoresheetPdf(form);else
      if (format === 'docx') await downloadScoresheetDocx(form);else
      await downloadScoresheetXlsx(form);
    } catch {
      setError(errorText[format]);
    } finally {
      setBusy(null);
    }
  };

  const items: {format: Format;icon: typeof PrinterIcon;label: string;hint: string;}[] = [
  { format: 'pdf', icon: PrinterIcon, label: 'In / Xuất PDF', hint: 'Mở hộp thoại in, chọn “Lưu dưới dạng PDF”' },
  { format: 'docx', icon: FileTextIcon, label: 'Tải Word (.docx)', hint: `Đúng ${form.code}, sửa được` },
  { format: 'xlsx', icon: FileSpreadsheetIcon, label: 'Tải Excel (.xlsx)', hint: 'Điểm dạng số, tổng và chỉ số tự tính' }];


  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy !== null}
        className="flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-brand-600 bg-white px-4 text-[14px] font-medium text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-70"
        style={{ transition: 'background-color 150ms ease-out' }}>
        
        {busy ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <PrinterIcon className="h-4 w-4" />}
        {busy === 'docx' || busy === 'xlsx' ? 'Đang tạo file…' : 'In / Xuất'}
        <ChevronDownIcon className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} style={{ transition: 'transform 150ms ease-out' }} />
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-30 mt-1.5 w-72 origin-top-right overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          
            {items.map(({ format, icon: Icon, label, hint }) =>
          <button
            key={format}
            type="button"
            role="menuitem"
            onClick={() => run(format)}
            className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
            style={{ transition: 'background-color 120ms ease-out' }}>
            
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                <span>
                  <span className="block text-[14px] font-medium text-gray-900">{label}</span>
                  <span className="block text-xs text-gray-500">{hint}</span>
                </span>
              </button>
          )}
          </motion.div>
        }
      </AnimatePresence>

      {error &&
      <p role="alert" className="absolute right-0 top-full mt-1 whitespace-nowrap text-xs text-brand-600">
          {error}
        </p>
      }
    </div>);

}