import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { Select } from '../ui/Select';
import { format, parseISO } from 'date-fns';
import { effectiveQuarterOptions } from '../../data/criteriaCatalog';
import { FormField, inputClass, inputErrorClass } from '../catalog/FormField';

type PublishDialogProps = {
  open: boolean;
  version: number;
  setLabel: string;
  onClose: () => void;
  onConfirm: (info: {decision: string;effectiveFrom: string;}) => void;
};

export function PublishDialog({ open, version, setLabel, onClose, onConfirm }: PublishDialogProps) {
  const [number, setNumber] = useState('');
  const [date, setDate] = useState('2026-10-21');
  const [from, setFrom] = useState(effectiveQuarterOptions[1]);
  const [attempted, setAttempted] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setAttempted(false);
    const t = window.setTimeout(() => firstRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const numberError = attempted && !number.trim() ? 'Nhập số quyết định' : undefined;
  const dateError = attempted && !date ? 'Chọn ngày ban hành' : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!number.trim() || !date) return;
    onConfirm({ decision: `${number.trim()} ngày ${format(parseISO(date), 'dd/MM/yyyy')}`, effectiveFrom: from });
  };

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        
          <motion.form
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-title"
          onSubmit={submit}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md rounded-lg bg-white shadow-xl">
          
            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 id="publish-title" className="text-[16px] font-semibold text-gray-900">
                  Ban hành v{version}
                </h2>
                <p className="mt-0.5 text-[13px] text-gray-500">Bộ tiêu chí {setLabel}. Sau khi ban hành, phiên bản bị khoá.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Đóng" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <FormField label="Số quyết định" htmlFor="p-number" required error={numberError}>
                <input
                ref={firstRef}
                id="p-number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="QĐ 315/QĐ-CAT"
                className={`${inputClass} ${numberError ? inputErrorClass : ''}`} />
              
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Ngày ban hành" htmlFor="p-date" required error={dateError}>
                  <input id="p-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} ${dateError ? inputErrorClass : ''}`} />
                </FormField>
                <FormField label="Áp dụng từ" htmlFor="p-from" required>
                  <Select id="p-from" value={from} onChange={setFrom}>
                    {effectiveQuarterOptions.map((q) =>
                  <option key={q}>{q}</option>
                  )}
                  </Select>
                </FormField>
              </div>
              <p className="text-xs text-gray-500">Hồ sơ đánh giá từ kỳ áp dụng dùng phiên bản mới; hồ sơ cũ giữ phiên bản của mình.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button type="button" onClick={onClose} className="h-10 rounded-md px-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100">
                Huỷ
              </button>
              <button
              type="submit"
              className="h-10 rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 active:scale-[0.98]"
              style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
              
                Ban hành v{version}
              </button>
            </div>
          </motion.form>
        </motion.div>
      }
    </AnimatePresence>);

}