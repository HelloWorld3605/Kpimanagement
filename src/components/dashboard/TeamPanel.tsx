import React from 'react';
import { Link } from 'react-router-dom';
import { StatusPill } from '../catalog/StatusPill';
import { RankBadge } from '../selfReview/RankBadge';
import { SelfReview, Rank } from '../../types/selfReview';
import { KpiTask } from '../../types/work';
import { UnitMember } from '../../types/org';
import { fmt, finalTotal, rankFromScore, rankOptions, selfTotal, statusMeta } from '../../utils/selfReview';
import { isOverdue } from '../../utils/work';
import { assigneeUnitId } from '../../utils/work';

type TeamPanelProps = {members: UnitMember[];reviews: SelfReview[];tasks: KpiTask[];period: string;};

const th = 'border-b border-gray-200 px-3 py-2 text-left text-[13px] font-semibold text-gray-600';
const rankColor: Record<Rank, string> = { excellent: 'bg-success-600', good: 'bg-brand-600', done: 'bg-gray-400', fail: 'bg-warning-600' };

/** Góc nhìn phòng: phân bố xếp loại và bảng cán bộ của kỳ */
export function TeamPanel({ members, reviews, tasks, period }: TeamPanelProps) {
  const rows = members.map((m) => {
    const r = reviews.find((x) => x.memberId === m.id && x.period === period);
    const final = r ? finalTotal(r) : null;
    const self = r && r.status !== 'draft' ? selfTotal(r) : null;
    const rank: Rank | null = r?.appraisal?.rank ?? (final !== null ? rankFromScore(final) : null);
    const overdue = tasks.filter((t) => t.assignee.kind === 'member' && t.assignee.memberId === m.id && isOverdue(t)).length;
    return { m, r, self, final, rank, overdue };
  });
  const ranked = rows.filter((x) => x.rank);
  const dist = rankOptions.map((o) => ({ ...o, n: ranked.filter((x) => x.rank === o.value).length }));
  const submitted = rows.filter((x) => x.r && x.r.status !== 'draft').length;
  const unitOverdue = tasks.filter((t) => t.assignee.kind === 'unit' && isOverdue(t) && members.some((m) => m.unitId === assigneeUnitId(t.assignee))).length;

  return (
    <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
      <div className="space-y-6">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-[12px] text-gray-500">Đã gửi phiếu</dt>
            <dd className="text-2xl font-semibold tabular-nums text-gray-900">
              {submitted}
              <span className="text-[14px] font-normal text-gray-400">/{rows.length}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-gray-500">Việc quá hạn</dt>
            <dd className={`text-2xl font-semibold tabular-nums ${unitOverdue + rows.reduce((s, x) => s + x.overdue, 0) ? 'text-brand-600' : 'text-gray-900'}`}>
              {unitOverdue + rows.reduce((s, x) => s + x.overdue, 0)}
            </dd>
          </div>
        </dl>
        <div>
          <p className="text-[13px] font-medium text-gray-700">Phân bố xếp loại ({ranked.length} đã có kết quả)</p>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-gray-100" aria-hidden>
            {dist.map((d) => d.n > 0 && <div key={d.value} className={rankColor[d.value]} style={{ width: `${d.n / Math.max(1, ranked.length) * 100}%` }} />)}
          </div>
          <ul className="mt-3 space-y-1.5 text-[13px]">
            {dist.map((d) =>
            <li key={d.value} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className={`h-2.5 w-2.5 rounded-sm ${rankColor[d.value]}`} aria-hidden />
                  {d.label}
                </span>
                <span className="tabular-nums font-medium text-gray-900">{d.n}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th className={th}>Cán bộ</th>
              <th className={th}>Phiếu {period}</th>
              <th className={`${th} text-right`}>Tự chấm</th>
              <th className={`${th} text-right`}>Kết quả cuối</th>
              <th className={th}>Xếp loại</th>
              <th className={`${th} text-right`}>Quá hạn</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ m, r, self, final, rank, overdue }) =>
            <tr key={m.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2.5">
                  <p className="text-gray-900">{m.name}</p>
                  <p className="text-[12px] text-gray-500">{m.position}</p>
                </td>
                <td className="px-3 py-2.5">
                  {r ?
                <Link to={`/tham-dinh/${r.id}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      <StatusPill tone={statusMeta[r.status].tone}>{statusMeta[r.status].label}</StatusPill>
                    </Link> :

                <span className="text-[13px] text-gray-400">Chưa có phiếu</span>
                }
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{self === null ? <span className="text-gray-300">—</span> : fmt(self)}</td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-gray-900">{final === null ? <span className="font-normal text-gray-300">—</span> : fmt(final)}</td>
                <td className="px-3 py-2.5">{rank ? <RankBadge rank={rank} /> : <span className="text-gray-300">—</span>}</td>
                <td className={`px-3 py-2.5 text-right tabular-nums ${overdue ? 'font-semibold text-brand-600' : 'text-gray-400'}`}>{overdue}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}