import React, { useMemo, useState } from 'react';
import { TableFrame } from '../../components/ui/TableFrame';
import { PageHeader } from '../../components/PageHeader';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { Select } from '../../components/ui/Select';
import { useWork } from '../../contexts/WorkContext';
import { usePermissions } from '../../hooks/usePermissions';
import { KpiTask, ProductStatus } from '../../types/work';
import { isMyTask } from '../../utils/myTasks';
import { trackedTasks } from '../../utils/taskTracking';
import { TODAY_ISO, assigneeLabel, isOverdue } from '../../utils/work';
import { displayDate } from '../../utils/profile';
import { isLeader } from '../../utils/org';

type Scope = 'mine' | 'team';

const DAY = 86400000;
const toMs = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const dotColor: Record<ProductStatus, string> = { approved: 'bg-success-600', pending: 'bg-warning-600', returned: 'bg-brand-600' };

function barTone(t: KpiTask) {
  if (t.status === 'reported') return 'bg-success-600/20 border-success-600';
  if (isOverdue(t)) return 'bg-brand-600/15 border-brand-600';
  return 'bg-gray-200 border-gray-400';
}

/** Biểu đồ sự kiện: mỗi nhiệm vụ một dòng trên trục thời gian của kỳ — hạn, sản phẩm báo cáo, hôm nay */
export function EventTimeline() {
  const { kpiTasks, periods } = useWork();
  const { member } = usePermissions();
  const leader = Boolean(member && isLeader(member));
  const [scope, setScope] = useState<Scope>('mine');

  const pool = useMemo(() => scope === 'team' ? trackedTasks(kpiTasks, member) : kpiTasks.filter((t) => isMyTask(t, member?.id)), [scope, kpiTasks, member]);
  const options = periods.filter((p) => pool.some((t) => t.periodId === p.id)).sort((a, b) => b.start.localeCompare(a.start));
  const current = options.find((p) => p.start <= TODAY_ISO && p.end >= TODAY_ISO) ?? options[0];
  const [periodId, setPeriodId] = useState('');
  const period = options.find((p) => p.id === periodId) ?? current;

  const rows = period ? pool.filter((t) => t.periodId === period.id).sort((a, b) => a.deadline.localeCompare(b.deadline)) : [];
  const start = period ? toMs(period.start) : 0;
  const end = period ? toMs(period.end) : 1;
  const span = Math.max(DAY, end - start + DAY);
  const pos = (iso: string) => `${Math.max(0, Math.min(100, (toMs(iso) - start) / span * 100))}%`;
  const ticks: string[] = [];
  for (let ms = start; ms <= end; ms += 7 * DAY) ticks.push(toIso(ms));
  const todayIn = period && TODAY_ISO >= period.start && TODAY_ISO <= period.end;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <PageHeader />
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
        {leader &&
        <div role="tablist" aria-label="Phạm vi" className="flex rounded-md border border-gray-300 p-0.5">
            {(
          [
          ['mine', 'Của tôi'],
          ['team', 'Phòng / đơn vị']] as
          [Scope, string][]).
          map(([id, label]) =>
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={scope === id}
            onClick={() => {
              setScope(id);
              setPeriodId('');
            }}
            className={`h-8 rounded px-3 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${scope === id ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
            
                {label}
              </button>
          )}
          </div>
        }
        {options.length > 0 &&
        <Select value={period?.id ?? ''} onChange={setPeriodId} aria-label="Kỳ KPI" wrapperClassName="w-52">
            {options.map((p) =>
          <option key={p.id} value={p.id}>
                {p.name}
              </option>
          )}
          </Select>
        }
        {period &&
        <span className="text-[13px] tabular-nums text-gray-500">
            Kiểm đếm {displayDate(period.start)} – {displayDate(period.end)} · {rows.length} nhiệm vụ
          </span>
        }
        <ul className="ml-auto flex flex-wrap items-center gap-4 text-[12px] text-gray-600" aria-label="Chú thích">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success-600" aria-hidden />
            Sản phẩm đã duyệt
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-warning-600" aria-hidden />
            Chờ duyệt
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden />
            Bị trả lại
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-gray-900" aria-hidden />
            Hạn
          </li>
        </ul>
      </div>

      {!period || rows.length === 0 ?
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <EmptyMark size="lg" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">{period ? 'Không có nhiệm vụ nào trong kỳ' : 'Chưa có kỳ KPI'}</h2>
          <p className="mt-1 max-w-md text-[14px] text-gray-500">
            {period ? 'Nhiệm vụ KPI được giao trong kỳ này sẽ hiện trên biểu đồ theo ngày.' : 'Chọn một kỳ KPI để xem biểu đồ sự kiện.'}
          </p>
        </div> :

      <TableFrame label="Biểu đồ sự kiện" className="mx-4 my-4" reserve={0}>
          <div className="min-w-[960px]">
            <div className="grid grid-cols-[280px_1fr] border-b border-gray-200 pb-2 text-[12px] text-gray-500">
              <span className="font-semibold text-gray-700">Nhiệm vụ</span>
              <div className="relative h-4">
                {ticks.map((d) =>
              <span key={d} className="absolute -translate-x-1/2 tabular-nums" style={{ left: pos(d) }}>
                    {displayDate(d).slice(0, 5)}
                  </span>
              )}
              </div>
            </div>
            <ul>
              {rows.map((t) => {
              const who = assigneeLabel(t.assignee);
              return (
                <li key={t.id} className="grid grid-cols-[280px_1fr] items-center border-b border-gray-100 py-2">
                    <div className="min-w-0 pr-4">
                      <p className="truncate text-[14px] text-gray-900" title={t.name}>
                        {t.name}
                      </p>
                      <p className="truncate text-[12px] text-gray-500">
                        {t.code}
                        {scope === 'team' && ` · ${who.primary}`} · {t.approved}/{t.qty}
                      </p>
                    </div>
                    <div className="relative h-8">
                      {ticks.map((d) =>
                    <span key={d} className="absolute inset-y-0 w-px bg-gray-100" style={{ left: pos(d) }} aria-hidden />
                    )}
                      {todayIn && <span className="absolute inset-y-0 w-0.5 bg-brand-600/60" style={{ left: pos(TODAY_ISO) }} aria-hidden />}
                      <div
                      className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-sm border ${barTone(t)}`}
                      style={{ left: 0, width: pos(t.deadline > period.end ? period.end : t.deadline) }}
                      aria-hidden />
                    
                      <span className="absolute top-0.5 h-7 w-0.5 bg-gray-900" style={{ left: pos(t.deadline) }} title={`Hạn ${displayDate(t.deadline)}`} aria-hidden />
                      {(t.products ?? []).map((p) =>
                    <span
                      key={p.id}
                      className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${dotColor[p.status]}`}
                      style={{ left: pos(p.doneAt) }}
                      title={`${p.name} · ${displayDate(p.doneAt)}`} />

                    )}
                      <span className="sr-only">
                        Hạn {displayDate(t.deadline)}, {(t.products ?? []).length} sản phẩm đã báo cáo{isOverdue(t) ? ', quá hạn' : ''}
                      </span>
                    </div>
                  </li>);

            })}
            </ul>
            {todayIn &&
          <div className="grid grid-cols-[280px_1fr] pt-1 text-[12px] font-medium text-brand-600">
                <span />
                <div className="relative h-4">
                  <span className="absolute -translate-x-1/2 tabular-nums" style={{ left: pos(TODAY_ISO) }}>
                    Hôm nay
                  </span>
                </div>
              </div>
          }
          </div>
        </TableFrame>
      }
    </div>);

}