import { DataTable } from '../ui/DataTable';
import React from 'react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { StatusPill } from '../catalog/StatusPill';
import { EmptyMark } from '../ui/EmptyMark';
import { btnSecondary, btnTransition } from '../ui/Modal';
import { DeadlineRule, KpiPeriod } from '../../types/work';
import { ruleStatusMeta, ruleTarget } from '../../utils/period';
import { displayDate } from '../../utils/profile';
import { periodTh } from './PeriodTasksTab';

type DeadlineRulesTabProps = {
  period: KpiPeriod;
  canWrite: boolean;
  onAdd: () => void;
  onEdit: (r: DeadlineRule) => void;
  onRemove: (r: DeadlineRule) => void;
};

const iconBtn =
'rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

/** Tab "Hạn tự đánh giá": quy tắc theo loại hồ sơ / đối tượng, trạng thái quy tắc và căn cứ */
export function DeadlineRulesTab({ period, canWrite, onAdd, onEdit, onRemove }: DeadlineRulesTabProps) {
  const editable = canWrite && period.phase !== 'closed';
  return (
    <section aria-label="Hạn gửi tự đánh giá">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-[13px] text-gray-500">
          Cấu hình riêng theo loại hồ sơ hoặc đối tượng. Chưa có căn cứ đủ rõ thì để "Cần xác nhận nghiệp vụ". Hệ thống không tự suy diễn hạn; mỗi thay đổi phải nhập căn cứ.
        </p>
        {editable &&
        <button type="button" onClick={onAdd} className={btnSecondary} style={btnTransition}>
            <PlusIcon className="h-4 w-4" aria-hidden />
            Thêm quy tắc hạn
          </button>
        }
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <DataTable className="w-full min-w-[760px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th scope="col" className={periodTh}>Áp dụng cho</th>
              <th scope="col" className={periodTh}>Hạn gửi</th>
              <th scope="col" className={periodTh}>Trạng thái quy tắc</th>
              <th scope="col" className={periodTh}>Căn cứ</th>
              {editable && <th scope="col" className={`${periodTh} w-24 text-center`}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {period.deadlineRules.length === 0 &&
            <tr>
                <td colSpan={editable ? 5 : 4} className="py-12 text-center">
                  <EmptyMark />
                  <p className="mt-2 font-medium text-gray-700">Chưa cấu hình hạn</p>
                  <p className="mt-1 text-[13px] text-gray-500">Hồ sơ của kỳ này hiện "Chưa cấu hình hạn" cho đến khi có quy tắc.</p>
                </td>
              </tr>
            }
            {period.deadlineRules.map((r) =>
            <tr key={r.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2.5 font-medium text-gray-900">{ruleTarget(r)}</td>
                <td className={`whitespace-nowrap px-3 py-2.5 tabular-nums ${r.deadline ? 'text-gray-900' : 'text-gray-400'}`}>{r.deadline ? displayDate(r.deadline) : 'Chưa cấu hình hạn'}</td>
                <td className="px-3 py-2.5">
                  <StatusPill tone={ruleStatusMeta[r.status].tone}>{ruleStatusMeta[r.status].label}</StatusPill>
                </td>
                <td className="px-3 py-2.5 text-[13px] text-gray-600">{r.basis || '—'}</td>
                {editable &&
              <td className="px-3 py-2.5 text-center">
                    <button type="button" onClick={() => onEdit(r)} aria-label={`Sửa hạn ${ruleTarget(r)}`} className={iconBtn} style={btnTransition}>
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => onRemove(r)} aria-label={`Xoá quy tắc ${ruleTarget(r)}`} className={iconBtn} style={btnTransition}>
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </td>
              }
              </tr>
            )}
          </tbody>
        </DataTable>
      </div>
    </section>);

}