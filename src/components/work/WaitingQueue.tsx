import React from 'react';
import { SendIcon } from 'lucide-react';
import { KpiTask, WorkItem } from '../../types/work';
import { assignedQty } from '../../utils/workItems';
import { displayDate } from '../../utils/profile';
import { btnTransition } from '../ui/Modal';

type WaitingQueueProps = {
  items: WorkItem[];
  tasks: KpiTask[];
  canWrite: boolean;
  onAssign: (workId: string) => void;
};

/** Nhiệm vụ đã tạo nhưng còn số lượng chưa phân công — ẩn khi không còn gì chờ */
export function WaitingQueue({ items, tasks, canWrite, onAssign }: WaitingQueueProps) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="waiting-title" className="border-b border-gray-200 bg-warning-50/50 px-4 py-3">
      <h2 id="waiting-title" className="text-[14px] font-semibold text-gray-900">
        Chờ phân công <span className="tabular-nums text-warning-700">{items.length}</span>
      </h2>
      <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {items.map((w) => {
          const a = assignedQty(w, tasks);
          return (
            <li key={w.id} className="flex w-72 shrink-0 items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] text-gray-900" title={w.name}>
                  {w.name}
                </p>
                <p className="text-[12px] tabular-nums text-gray-500">
                  {w.code} · còn {w.qty - a}/{w.qty} · hạn {displayDate(w.deadline)}
                </p>
              </div>
              {canWrite &&
              <button
                type="button"
                onClick={() => onAssign(w.id)}
                aria-label={`Phân công ${w.code}`}
                title="Phân công"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                style={btnTransition}>
                
                  <SendIcon className="h-3.5 w-3.5" />
                </button>
              }
            </li>);

        })}
      </ul>
    </section>);

}