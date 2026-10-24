import React from 'react';
import { StatusPill } from '../catalog/StatusPill';
import { DossierType, KpiPeriod } from '../../types/work';
import { deadlineOverview } from '../../utils/period';
import { displayDate } from '../../utils/profile';

const short: Record<DossierType, string> = { individual: 'Cá nhân', leader: 'LĐ, CH', collective: 'Tập thể' };

/** Ô "Hạn tự đánh giá" trong danh sách kỳ: hạn theo từng loại hồ sơ, kèm nhãn trạng thái quy tắc */
export function DeadlineCell({ period }: {period: KpiPeriod;}) {
  const { rules, extra } = deadlineOverview(period);
  const pending = (period.deadlineRules ?? []).some((r) => r.status === 'needs-confirmation');
  if (rules.length === 0 && extra === 0) return <span className="text-[13px] text-gray-400">Chưa cấu hình hạn</span>;
  return (
    <div className="space-y-0.5 text-[13px]">
      {rules.map((r) =>
      <p key={r.id} className="whitespace-nowrap">
          <span className="text-gray-500">{r.dossier ? short[r.dossier] : ''}: </span>
          <span className={`tabular-nums ${r.deadline ? 'text-gray-800' : 'text-gray-400'}`}>{r.deadline ? displayDate(r.deadline) : 'Chưa cấu hình'}</span>
        </p>
      )}
      {extra > 0 && <p className="text-gray-500">+{extra} đối tượng riêng</p>}
      {pending &&
      <div className="pt-0.5">
          <StatusPill tone="warning">Cần xác nhận nghiệp vụ</StatusPill>
        </div>
      }
    </div>);

}