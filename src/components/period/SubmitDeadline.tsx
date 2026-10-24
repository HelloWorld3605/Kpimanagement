import React from 'react';
import { StatusPill } from '../catalog/StatusPill';
import { usePeriodScope } from '../../hooks/usePeriodScope';
import { usePermissions } from '../../hooks/usePermissions';
import { isLeader } from '../../utils/org';
import { deadlineFor, periodAppliesTo, slotLabel } from '../../utils/period';

/**
 * Nhãn "Hạn gửi đánh giá" của phiếu — lấy từ cấu hình hạn của kỳ, không suy diễn.
 * Chưa có quy tắc → "Chưa cấu hình hạn"; quy tắc chưa có căn cứ → nhãn "Cần xác nhận nghiệp vụ".
 */
export function SubmitDeadline({ periodLabel }: {periodLabel: string;}) {
  const { visible } = usePeriodScope();
  const { member } = usePermissions();
  const period = visible.find((p) => slotLabel(p.kind, p.year, p.index) === periodLabel && (!member || periodAppliesTo(p, member.unitId)));
  const d = period ? deadlineFor(period, member && isLeader(member) ? 'leader' : 'individual', member?.id) : { text: 'Chưa cấu hình hạn', state: 'unset' as const };
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      Hạn gửi đánh giá{' '}
      <span className={`rounded border px-1.5 tabular-nums ${d.state === 'unset' ? 'border-gray-200 text-gray-400' : 'border-warning-200 font-medium text-gray-900'}`}>{d.text}</span>
      {d.state === 'needs-confirmation' && <StatusPill tone="warning">Cần xác nhận nghiệp vụ</StatusPill>}
    </span>);

}