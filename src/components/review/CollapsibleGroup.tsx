import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, ChevronDownIcon } from 'lucide-react';
import { fmtScore } from '../../utils/kpi';

type ScoreColumn = {label: string;value: number | null;accent?: boolean;};

type CollapsibleGroupProps = {
  title: string;
  description?: React.ReactNode;
  max: number;
  columns: ScoreColumn[];
  /** Dòng cảnh báo khi còn mục chưa nhập */
  alert?: string;
  /** Nút thao tác bên phải (vd. "Đảm bảo các tiêu chí còn trống") */
  action?: React.ReactNode;
  defaultOpen?: boolean;
  /** Mở ra khi có lỗi cần sửa */
  forceOpen?: boolean;
  children: React.ReactNode;
};

/** Khung nhóm tiêu chí trên phiếu: tiêu đề, điểm từng lớp, mũi tên mở / thu gọn nội dung */
export function CollapsibleGroup({ title, description, max, columns, alert, action, defaultOpen = true, forceOpen, children }: CollapsibleGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  return (
    <div className="overflow-hidden rounded-md border border-gray-200">
      <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex min-w-0 items-start gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={id}
            aria-label={open ? `Thu gọn ${title}` : `Mở ${title}`}
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
            
            <ChevronDownIcon className="h-4 w-4" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
          </button>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-gray-900">
              {title} ({max} điểm)
            </h3>
            {description && <div className="mt-1.5 text-[13px] leading-5 text-gray-600">{description}</div>}
            {alert &&
            <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-brand-600" role="alert">
                <AlertTriangleIcon className="h-4 w-4" aria-hidden />
                {alert}
              </p>
            }
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
          <dl className="flex gap-6">
            <div className="text-center">
              <dt className="text-[12px] text-gray-500">Điểm tối đa</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-gray-900">{max}</dd>
            </div>
            {columns.map((c) =>
            <div key={c.label} className="text-center">
                <dt className="whitespace-nowrap text-[12px] text-gray-500">{c.label}</dt>
                <dd className={`mt-0.5 text-lg font-semibold tabular-nums ${c.value === null ? 'text-gray-300' : c.accent ? 'text-brand-700' : 'text-gray-900'}`}>
                  {c.value === null ? '—' : fmtScore(c.value)}
                </dd>
              </div>
            )}
          </dl>
          {action}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open &&
        <motion.div
          id={id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden border-t border-gray-200">
          
            <div className="p-3">{children}</div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}