import React, { useEffect, useState } from 'react';
import { TriangleAlertIcon } from 'lucide-react';
import { KpiPeriod, KpiTask } from '../../types/work';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { displayDate } from '../../utils/profile';
import { inPeriod, periodAccepting, periodRange, phaseMeta } from '../../utils/work';

type MovePeriodDialogProps = {
  open: boolean;
  tasks: KpiTask[];
  periods: KpiPeriod[];
  /** Kỳ hiện tại của các việc; null khi gán từ "Chưa gán kỳ" */
  fromPeriodId: string | null;
  onClose: () => void;
  onConfirm: (periodId: string) => void;
};

/** Gán vào kỳ / chuyển kỳ — chỉ liệt kê kỳ còn nhận việc, cảnh báo việc có hạn ngoài thời gian kỳ đích */
export function MovePeriodDialog({ open, tasks, periods, fromPeriodId, onClose, onConfirm }: MovePeriodDialogProps) {
  const targets = periods.filter((p) => periodAccepting(p) && p.id !== fromPeriodId).sort((a, b) => a.start.localeCompare(b.start));
  const [target, setTarget] = useState('');

  useEffect(() => {
    if (open) setTarget(targets[0]?.id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const targetPeriod = periods.find((p) => p.id === target);
  const outside = targetPeriod ? tasks.filter((t) => !inPeriod(t.deadline, targetPeriod)) : [];
  const verb = fromPeriodId ? 'Chuyển' : 'Gán';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fromPeriodId ? 'Chuyển kỳ' : 'Gán vào kỳ'}
      description={`${tasks.length} việc được chọn`}
      onSubmit={(e) => {
        e.preventDefault();
        if (target) onConfirm(target);
      }}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost}>
            Huỷ
          </button>
          <button type="submit" disabled={!target} className={btnPrimary} style={btnTransition}>
            {verb} {tasks.length} việc
          </button>
        </div>
      }>
      
      <div className="space-y-4 px-5 py-5">
        {targets.length === 0 ?
        <p className="text-[14px] text-gray-600">Không có kỳ nào khác còn nhận việc. Tạo kỳ mới ở màn Kỳ đánh giá.</p> :

        <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-gray-600">Kỳ đích</legend>
            <div className="space-y-2">
              {targets.map((p) =>
            <label
              key={p.id}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 ${target === p.id ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
              style={{ transition: 'background-color 150ms ease-out, border-color 150ms ease-out' }}>
              
                  <input type="radio" name="target-period" checked={target === p.id} onChange={() => setTarget(p.id)} className="h-4 w-4 accent-brand-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-gray-900">{p.name}</span>
                    <span className="block text-xs text-gray-500">
                      {periodRange(p)} · {phaseMeta[p.phase].label}
                    </span>
                  </span>
                </label>
            )}
            </div>
          </fieldset>
        }

        {outside.length > 0 && targetPeriod &&
        <div className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2.5 text-[13px] text-warning-700">
            <p className="flex items-center gap-1.5 font-medium">
              <TriangleAlertIcon className="h-4 w-4" aria-hidden />
              {outside.length} việc có hạn nằm ngoài {targetPeriod.name}
            </p>
            <ul className="mt-1 space-y-0.5 pl-[22px]">
              {outside.map((t) =>
            <li key={t.id}>
                  {t.code} · hạn {displayDate(t.deadline)}
                </li>
            )}
            </ul>
            <p className="mt-1 pl-[22px]">Vẫn {verb.toLowerCase()} được; nên sửa hạn trong panel chi tiết của việc.</p>
          </div>
        }
      </div>
    </Modal>);

}