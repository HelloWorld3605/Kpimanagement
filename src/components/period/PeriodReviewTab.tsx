import { DataTable } from '../ui/DataTable';
import React, { useMemo } from 'react';
import { StatusPill } from '../catalog/StatusPill';
import { KpiPeriod, PeriodPhase } from '../../types/work';
import { findUnit, isLeader, unitMembers } from '../../utils/org';
import { deadlineFor, ruleStatusMeta } from '../../utils/period';
import { periodTh } from './PeriodTasksTab';

/** Bước đánh giá theo giai đoạn kỳ */
const stepOf: Record<PeriodPhase, string> = {
  draft: 'Chưa đến bước đánh giá',
  open: 'Chưa đến bước đánh giá',
  running: 'Đang kiểm đếm nhiệm vụ',
  review: '① Tự đánh giá',
  approval: '② – ③ Thẩm định, phê duyệt',
  closed: '④ Hoàn thành'
};

/** Tab "Tiến độ đánh giá": mỗi cán bộ thuộc kỳ, hạn áp dụng cho hồ sơ của họ và bước hiện tại */
export function PeriodReviewTab({ period }: {period: KpiPeriod;}) {
  const members = useMemo(() => unitMembers(period.unitId, period.includeChildren), [period.unitId, period.includeChildren]);
  return (
    <section aria-label="Tiến độ đánh giá">
      <p className="mb-3 text-[13px] text-gray-500">
        {members.length} cán bộ thuộc kỳ. Hạn áp dụng lấy theo quy tắc riêng của đối tượng trước, rồi theo loại hồ sơ — không suy diễn khi chưa cấu hình.
      </p>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <DataTable className="w-full min-w-[760px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th scope="col" className={periodTh}>Họ và tên</th>
              <th scope="col" className={periodTh}>Đơn vị</th>
              <th scope="col" className={periodTh}>Loại hồ sơ</th>
              <th scope="col" className={periodTh}>Hạn gửi tự đánh giá</th>
              <th scope="col" className={periodTh}>Bước hiện tại</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const leader = isLeader(m);
              const d = deadlineFor(period, leader ? 'leader' : 'individual', m.id);
              const u = findUnit(m.unitId);
              return (
                <tr key={m.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{m.name}</td>
                  <td className="px-3 py-2.5 text-gray-600">{u?.shortName ?? u?.name}</td>
                  <td className="px-3 py-2.5 text-gray-600">{leader ? 'Lãnh đạo, chỉ huy' : 'Cá nhân'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`tabular-nums ${d.state === 'unset' ? 'text-gray-400' : 'text-gray-800'}`}>{d.text}</span>
                    {d.state === 'needs-confirmation' &&
                    <span className="ml-2">
                        <StatusPill tone="warning">{ruleStatusMeta['needs-confirmation'].label}</StatusPill>
                      </span>
                    }
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">{stepOf[period.phase]}</td>
                </tr>);

            })}
          </tbody>
        </DataTable>
      </div>
    </section>);

}