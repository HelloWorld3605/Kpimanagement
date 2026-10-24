import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, Columns3Icon, LockIcon } from 'lucide-react';
import { TableColumn } from '../../hooks/useTableColumns';

type ColumnMenuProps = {
  columns: TableColumn[];
  hidden: Set<string>;
  onToggle: (id: string) => void;
  buttonClassName: string;
};

/** Nút "Cột": bật/tắt cột hiển thị. Cột khoá không ẩn được; luôn giữ ít nhất một cột */
export function ColumnMenu({ columns, hidden, onToggle, buttonClassName }: ColumnMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const shown = columns.filter((c) => !hidden.has(c.id) || c.locked).length;

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${buttonClassName} ${open ? 'bg-gray-50' : ''}`}
        style={{ transition: 'background-color 150ms ease-out' }}>
        
        <Columns3Icon className="h-4 w-4" aria-hidden />
        Cột
        {hidden.size > 0 && <span className="text-[12px] font-normal tabular-nums text-gray-500">{shown}/{columns.length}</span>}
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-40 mt-2 max-h-[360px] w-60 origin-top-right overflow-y-auto rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg">
          
            <p className="border-b border-gray-100 px-3 pb-2 pt-1 text-[13px] font-semibold text-gray-900">Cột hiển thị</p>
            {columns.map((c) => {
            const checked = c.locked || !hidden.has(c.id);
            const disabled = c.locked || checked && shown === 1;
            return (
              <button
                key={c.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onToggle(c.id)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                
                  <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                  checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white'} ${
                  disabled ? 'opacity-50' : ''}`}
                  aria-hidden>
                  
                    {checked && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{c.label}</span>
                  {c.locked && <LockIcon className="h-3.5 w-3.5 text-gray-400" aria-label="Luôn hiện" />}
                </button>);

          })}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}