import { DataTable } from '../ui/DataTable';
import React from 'react';
import { EmptyMark } from '../ui/EmptyMark';
import { KpiPeriod } from '../../types/work';
import { memberName } from '../../utils/work';
import { periodTh } from './PeriodTasksTab';

const actionLabels = { create: 'Thêm', update: 'Sửa', delete: 'Xoá' } as const;

/** Tab "Lịch sử cấu hình hạn": người thực hiện, thời điểm, trước / sau, căn cứ */
export function DeadlineHistoryTab({ period }: {period: KpiPeriod;}) {
  return (
    <section aria-label="Lịch sử cấu hình hạn">
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <DataTable className="w-full min-w-[900px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th scope="col" className={periodTh}>Thời điểm</th>
              <th scope="col" className={periodTh}>Người thực hiện</th>
              <th scope="col" className={periodTh}>Quy tắc</th>
              <th scope="col" className={periodTh}>Thao tác</th>
              <th scope="col" className={periodTh}>Trước</th>
              <th scope="col" className={periodTh}>Sau</th>
              <th scope="col" className={periodTh}>Căn cứ</th>
            </tr>
          </thead>
          <tbody>
            {period.deadlineHistory.length === 0 &&
            <tr>
                <td colSpan={7} className="py-12 text-center">
                  <EmptyMark />
                  <p className="mt-2 text-gray-500">Chưa có thay đổi cấu hình hạn.</p>
                </td>
              </tr>
            }
            {period.deadlineHistory.map((h) =>
            <tr key={h.id} className="border-b border-gray-100 align-top last:border-0">
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-gray-600">{h.at}</td>
                <td className="px-3 py-2.5 text-gray-900">{h.by}</td>
                <td className="px-3 py-2.5">{h.rule}</td>
                <td className="px-3 py-2.5">{actionLabels[h.action]}</td>
                <td className="px-3 py-2.5 text-[13px] text-gray-500">{h.before}</td>
                <td className="px-3 py-2.5 text-[13px] font-medium text-gray-900">{h.after}</td>
                <td className="px-3 py-2.5 text-[13px] text-gray-600">{h.basis}</td>
              </tr>
            )}
          </tbody>
        </DataTable>
      </div>
    </section>);

}

/** Tab "Nhật ký kỳ": chuyển giai đoạn, khoá / mở khoá kiểm đếm, mở lại kỳ */
export function PeriodEventsTab({ period }: {period: KpiPeriod;}) {
  const events = [...period.events].reverse();
  if (events.length === 0)
  return (
    <div className="py-12 text-center">
        <EmptyMark />
        <p className="mt-2 text-[14px] text-gray-500">Chưa có thao tác nào trên kỳ.</p>
      </div>);

  return (
    <ol aria-label="Nhật ký kỳ" className="max-w-3xl">
      {events.map((e, i) =>
      <li key={`${e.at}-${i}`} className="grid grid-cols-[132px_1fr] gap-4 border-b border-gray-100 py-3 last:border-0">
          <span className="tabular-nums text-[13px] text-gray-500">{e.at}</span>
          <div>
            <p className="text-[14px] text-gray-900">
              <span className="font-medium">{e.text}</span>
              <span className="text-gray-500"> · {e.by}</span>
            </p>
            {e.reason && <p className="mt-0.5 text-[13px] text-gray-600">Lý do: {e.reason}</p>}
            {e.approvedBy && <p className="mt-0.5 text-[13px] text-gray-600">Người duyệt: {memberName(e.approvedBy)}</p>}
          </div>
        </li>
      )}
    </ol>);

}