import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Gauge } from '../components/dashboard/Gauge';
import { ScoreTrend } from '../components/dashboard/ScoreTrend';
import { TeamPanel } from '../components/dashboard/TeamPanel';
import { RankBadge } from '../components/selfReview/RankBadge';
import { useSelfReview } from '../contexts/SelfReviewContext';
import { useWork } from '../contexts/WorkContext';
import { usePermissions } from '../hooks/usePermissions';
import { ownReviews, performance, scoreTrend, taskStats } from '../utils/dashboard';
import { isMyTask } from '../utils/myTasks';
import { trackedTasks } from '../utils/taskTracking';
import { actingLayer } from '../utils/appraisal';
import { fmt, finalTotal, selfTotal, statusMeta } from '../utils/selfReview';
import { isLeader, unitMembers } from '../utils/org';
import { isOverdue } from '../utils/work';
import { displayDate } from '../utils/profile';

type View = 'personal' | 'team';

/** Tổng quan: cá nhân (hiệu suất A·B·C, điểm qua các kỳ, việc sắp đến hạn) và phòng (lãnh đạo) */
export function Dashboard() {
  const { reviews } = useSelfReview();
  const { kpiTasks } = useWork();
  const { member } = usePermissions();
  const leader = Boolean(member && isLeader(member));
  const [view, setView] = useState<View>('personal');

  const mine = useMemo(() => ownReviews(reviews, member), [reviews, member]);
  const latest = mine[mine.length - 1];
  const perf = performance(latest, member);
  const myTasks = kpiTasks.filter((t) => isMyTask(t, member?.id));
  const stats = taskStats(myTasks);
  const upcoming = myTasks.
  filter((t) => t.status === 'assigned' || t.status === 'in-progress').
  sort((a, b) => a.deadline.localeCompare(b.deadline)).
  slice(0, 5);
  const final = latest ? finalTotal(latest) : null;
  const toAppraise = reviews.filter((r) => actingLayer(r, member)).length;
  const teamTasks = trackedTasks(kpiTasks, member);
  const teamMembers = member ? unitMembers(member.unitId, true).filter((m) => m.id !== member.id) : [];
  const teamPeriod = reviews.find((r) => r.memberId && r.memberId !== member?.id)?.period ?? latest?.period ?? '';

  const statItems = [
  { label: 'Đang thực hiện', value: stats.open, to: '/nhiem-vu-cua-toi' },
  { label: 'Quá hạn', value: stats.overdue, to: '/nhiem-vu-cua-toi', alert: stats.overdue > 0 },
  { label: 'Sản phẩm chờ duyệt', value: stats.pending, to: '/nhiem-vu-cua-toi' },
  ...(leader ? [{ label: 'Phiếu chờ bạn đánh giá', value: toAppraise, to: '/tham-dinh', alert: toAppraise > 0 }] : [])];


  return (
    <div className="bg-white">
      <PageHeader />
      {leader &&
      <div role="tablist" aria-label="Góc nhìn" className="flex gap-1 border-b border-gray-200 px-4">
          {(
        [
        ['personal', 'Cá nhân'],
        ['team', 'Phòng / đơn vị']] as
        [View, string][]).
        map(([id, label]) =>
        <button
          key={id}
          role="tab"
          type="button"
          aria-selected={view === id}
          onClick={() => setView(id)}
          className={`-mb-px h-11 border-b-2 px-3 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
          view === id ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`
          }
          style={{ transition: 'color 150ms ease-out, border-color 150ms ease-out' }}>
          
              {label}
            </button>
        )}
        </div>
      }

      {view === 'team' && leader ?
      <div className="px-4 py-6">
          <TeamPanel members={teamMembers} reviews={reviews} tasks={teamTasks} period={teamPeriod} />
        </div> :

      <div className="divide-y divide-gray-200">
          <section aria-labelledby="dash-perf" className="grid gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="dash-perf" className="text-[16px] font-semibold text-gray-900">
                  Hiệu suất {latest?.period ?? ''}
                </h2>
                {latest &&
              <Link to={`/tu-danh-gia/${latest.id}`} className="inline-flex items-center gap-1 text-[14px] font-medium text-brand-600 hover:text-brand-700">
                    Mở phiếu
                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                  </Link>
              }
              </div>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Gauge label="Số lượng (A)" value={perf ? perf.a : null} hint="Hoàn thành so với giao" />
                <Gauge label="Chất lượng (B)" value={perf ? perf.b : null} hint="Theo mức chất lượng" />
                <Gauge label="Tiến độ (C)" value={perf ? perf.c : null} hint="Theo mức tiến độ" />
              </div>
            </div>
            <dl className="space-y-4 lg:border-l lg:border-gray-200 lg:pl-8">
              <div>
                <dt className="text-[13px] text-gray-500">Chỉ số KPI</dt>
                <dd className="text-3xl font-semibold tabular-nums text-brand-700">{perf ? perf.kpi.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '—'}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-gray-500">Tổng điểm {final !== null ? 'kết quả cuối' : 'tự chấm'}</dt>
                <dd className="flex items-center gap-2 text-xl font-semibold tabular-nums text-gray-900">
                  {latest ? fmt(final ?? selfTotal(latest)) : '—'}
                  <span className="text-[13px] font-normal text-gray-400">/100</span>
                  {latest?.appraisal && <RankBadge rank={latest.appraisal.rank} />}
                </dd>
              </div>
              {latest &&
            <div>
                  <dt className="text-[13px] text-gray-500">Trạng thái phiếu</dt>
                  <dd className="text-[14px] text-gray-900">{statusMeta[latest.status].label}</dd>
                </div>
            }
            </dl>
          </section>

          <section aria-label="Nhiệm vụ" className="grid grid-cols-2 gap-px bg-gray-200 sm:grid-cols-4">
            {statItems.map((s) =>
          <Link
            key={s.label}
            to={s.to}
            className="bg-white px-4 py-4 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
            style={{ transition: 'background-color 150ms ease-out' }}>
            
                <p className="text-[13px] text-gray-500">{s.label}</p>
                <p className={`mt-1 text-2xl font-semibold tabular-nums ${s.alert ? 'text-brand-600' : 'text-gray-900'}`}>{s.value}</p>
              </Link>
          )}
          </section>

          <div className="grid gap-8 px-4 py-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section aria-labelledby="dash-trend">
              <h2 id="dash-trend" className="text-[16px] font-semibold text-gray-900">
                Điểm qua các kỳ
              </h2>
              <p className="mb-3 text-[13px] text-gray-500">Vạch đứt: ngưỡng 90 · 70 · 50 điểm.</p>
              <ScoreTrend data={scoreTrend(mine)} />
            </section>
            <section aria-labelledby="dash-upcoming">
              <div className="flex items-baseline justify-between">
                <h2 id="dash-upcoming" className="text-[16px] font-semibold text-gray-900">
                  Sắp đến hạn
                </h2>
                <Link to="/lich-cong-viec" className="text-[13px] font-medium text-brand-600 hover:text-brand-700">
                  Biểu đồ sự kiện
                </Link>
              </div>
              {upcoming.length === 0 ?
            <p className="mt-6 text-[14px] text-gray-500">Không có việc đang thực hiện.</p> :

            <ul className="mt-3 divide-y divide-gray-100">
                  {upcoming.map((t) =>
              <li key={t.id} className="flex items-start justify-between gap-3 py-2.5 text-[14px]">
                      <div className="min-w-0">
                        <p className="truncate text-gray-900">{t.name}</p>
                        <p className="text-[12px] tabular-nums text-gray-500">
                          {t.code} · {t.approved}/{t.qty} {t.unit}
                        </p>
                      </div>
                      <span className={`shrink-0 tabular-nums ${isOverdue(t) ? 'font-semibold text-brand-600' : 'text-gray-600'}`}>{displayDate(t.deadline)}</span>
                    </li>
              )}
                </ul>
            }
            </section>
          </div>
        </div>
      }
    </div>);

}