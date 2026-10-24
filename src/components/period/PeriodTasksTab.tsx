import { DataTable } from '../ui/DataTable';
import React from 'react';
import { PlusIcon } from 'lucide-react';
import { StatusPill } from '../catalog/StatusPill';
import { EmptyMark } from '../ui/EmptyMark';
import { btnSecondary, btnTransition } from '../ui/Modal';
import { KpiPeriod, KpiTask } from '../../types/work';
import { assigneeLabel, fmtNumber, kpiStatusMeta, periodLockReason } from '../../utils/work';
import { displayDate } from '../../utils/profile';

export const periodTh = 'border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700';

type PeriodTasksTabProps = {
  period: KpiPeriod;
  tasks: KpiTask[];
  canAdd: boolean;
  onAdd: () => void;
};

/** Tab "Công việc trong kỳ" — chỉ kỳ còn nhận việc mới có nút Thêm việc vào kỳ */
export function PeriodTasksTab({ period, tasks, canAdd, onAdd }: PeriodTasksTabProps) {
  const lock = periodLockReason(period);
  return (
    <section aria-label="Nhiệm vụ trong kỳ">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-gray-500">{lock ?? 'Một việc KPI chỉ thuộc một kỳ. Muốn tính ở cả kỳ tháng và kỳ quý thì giao thành hai việc riêng.'}</p>
        {!lock && canAdd &&
        <button type="button" onClick={onAdd} className={btnSecondary} style={btnTransition}>
            <PlusIcon className="h-4 w-4" aria-hidden />
            Thêm việc vào kỳ
          </button>
        }
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <DataTable className="w-full min-w-[820px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th scope="col" className={periodTh}>Mã</th>
              <th scope="col" className={periodTh}>Tên việc</th>
              <th scope="col" className={periodTh}>Người thực hiện</th>
              <th scope="col" className={`${periodTh} text-right`}>Số lượng</th>
              <th scope="col" className={`${periodTh} text-right`}>Điểm cơ sở</th>
              <th scope="col" className={periodTh}>Hạn</th>
              <th scope="col" className={periodTh}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 &&
            <tr>
                <td colSpan={7} className="py-12 text-center">
                  <EmptyMark />
                  <p className="mt-2 text-gray-500">Kỳ chưa có việc KPI.</p>
                </td>
              </tr>
            }
            {tasks.map((t) => {
              const a = assigneeLabel(t.assignee);
              return (
                <tr key={t.id} className="border-b border-gray-100 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[13px] text-gray-600">{t.code}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{t.name}</td>
                  <td className="px-3 py-2.5">
                    <p className="text-gray-900">{a.primary}</p>
                    <p className="text-[12px] text-gray-500">{a.secondary}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {fmtNumber(t.qty)} <span className="text-gray-500">{t.unit}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmtNumber(t.point)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">{displayDate(t.deadline)}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill tone={kpiStatusMeta[t.status].tone}>{kpiStatusMeta[t.status].label}</StatusPill>
                  </td>
                </tr>);

            })}
          </tbody>
        </DataTable>
      </div>
    </section>);

}