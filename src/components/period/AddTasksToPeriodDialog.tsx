import React, { useEffect, useState } from 'react';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { EmptyMark } from '../ui/EmptyMark';
import { KpiPeriod, KpiTask } from '../../types/work';
import { assigneeLabel, inPeriod } from '../../utils/work';
import { displayDate } from '../../utils/profile';
import { periodRangeLabel } from '../../utils/period';

type AddTasksToPeriodDialogProps = {
  open: boolean;
  period: KpiPeriod;
  /** Việc chưa gắn kỳ trong phạm vi */
  candidates: KpiTask[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
};

/** Chọn nhiều việc "Chưa gắn kỳ" đưa vào kỳ. Hạn của việc phải nằm trong khoảng kiểm đếm. */
export function AddTasksToPeriodDialog({ open, period, candidates, onClose, onConfirm }: AddTasksToPeriodDialogProps) {
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => {
    if (open) setPicked([]);
  }, [open]);

  const toggle = (id: string) => setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Thêm việc vào kỳ"
      description={`${period.name} · kiểm đếm ${periodRangeLabel(period)}`}
      footer={
      <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] text-gray-500">Đã chọn {picked.length} việc</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnGhost} style={btnTransition}>
              Huỷ
            </button>
            <button type="button" disabled={!picked.length} onClick={() => onConfirm(picked)} className={btnPrimary} style={btnTransition}>
              Thêm vào kỳ
            </button>
          </div>
        </div>
      }>
      
      {candidates.length === 0 ?
      <div className="px-4 py-12 text-center">
          <EmptyMark />
          <p className="mt-2 text-[14px] text-gray-500">Không có việc nào đang chờ gắn kỳ.</p>
        </div> :

      <ul className="divide-y divide-gray-100">
          {candidates.map((t) => {
          const fits = inPeriod(t.deadline, period);
          const a = assigneeLabel(t.assignee);
          return (
            <li key={t.id}>
                <label className={`flex items-start gap-3 px-4 py-3 ${fits ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60'}`} style={{ transition: 'background-color 120ms ease-out' }}>
                  <input
                  type="checkbox"
                  disabled={!fits}
                  checked={picked.includes(t.id)}
                  onChange={() => toggle(t.id)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-gray-900">
                      <span className="mr-2 font-mono text-[13px] text-gray-500">{t.code}</span>
                      {t.name}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-gray-500">
                      {a.primary} · hạn {displayDate(t.deadline)}
                      {!fits && <span className="ml-1 font-medium text-brand-700">— hạn nằm ngoài kỳ</span>}
                    </span>
                  </span>
                </label>
              </li>);

        })}
        </ul>
      }
    </Modal>);

}