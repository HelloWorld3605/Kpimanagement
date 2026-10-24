import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ClipboardListIcon } from 'lucide-react';
import { FloatingPanel } from '../ui/FloatingPanel';
import { KpiTask } from '../../types/work';
import { matchTasks, taskProgress } from '../../utils/importTasks';

type TaskNameComboProps = {
  id: string;
  value: string;
  linkedTask?: KpiTask;
  tasks: KpiTask[];
  invalid?: boolean;
  /** Gõ tên tự do — bỏ liên kết nhiệm vụ đã chọn */
  onType: (name: string) => void;
  onPick: (task: KpiTask) => void;
};

/** Ô "Tên nhiệm vụ": gõ để gợi ý nhiệm vụ trùng tên; chọn hoặc để nguyên tên mới */
export function TaskNameCombo({ id, value, linkedTask, tasks, invalid, onType, onPick }: TaskNameComboProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hits = matchTasks(tasks, value);
  const show = open && hits.length > 0;

  useEffect(() => setActive(0), [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!inputRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const pick = (t: KpiTask) => {
    onPick(t);
    setOpen(false);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={show}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        placeholder="Nhập tên nhiệm vụ"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onType(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!show) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(hits.length - 1, a + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            pick(hits[active]);
          } else if (e.key === 'Escape') {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        className={`h-10 w-full rounded border bg-white px-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${
        invalid ? 'border-brand-500' : 'border-gray-300'}`
        } />
      
      <p className={`mt-0.5 truncate text-[11px] ${linkedTask ? 'text-success-700' : 'text-gray-400'}`}>
        {linkedTask ? `Ghép vào ${linkedTask.code}` : value.trim() ? 'Nhiệm vụ mới' : '\u00a0'}
      </p>

      <AnimatePresence>
        {show &&
        <FloatingPanel anchor={inputRef.current} panelRef={panelRef} fit="content" maxWidth={420} maxHeight={300}>
            <p className="shrink-0 border-b border-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-500">Kết quả gợi ý ({hits.length})</p>
            <ul id={`${id}-list`} role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
              {hits.map((t, i) => {
              const pct = taskProgress(t);
              return (
                <li
                  key={t.id}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(t)}
                  className={`flex cursor-pointer items-start gap-2.5 px-3 py-2 ${i === active ? 'bg-brand-50' : ''}`}>
                  
                    <ClipboardListIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-gray-900">{t.name}</p>
                      <p className="text-[12px] text-gray-500">
                        {t.code} · {t.unit}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div className={pct >= 100 ? 'h-full bg-success-600' : 'h-full bg-brand-600'} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <span className="text-[11px] tabular-nums text-gray-500">{pct}%</span>
                      </div>
                    </div>
                  </li>);

            })}
            </ul>
          </FloatingPanel>
        }
      </AnimatePresence>
    </div>);

}