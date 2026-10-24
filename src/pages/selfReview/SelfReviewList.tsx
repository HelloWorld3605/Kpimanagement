import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, EyeIcon, UserRoundIcon, UsersIcon } from 'lucide-react';
import { useSelfReview } from '../../contexts/SelfReviewContext';
import { usePermissions } from '../../hooks/usePermissions';
import { PageTabs } from '../../components/PageTabs';
import { SubordinateReviews } from '../../components/selfReview/SubordinateReviews';
import { Rank, SelfReview } from '../../types/selfReview';
import { widestScope } from '../../utils/access';
import { StatusPill } from '../../components/catalog/StatusPill';
import { RankBadge } from '../../components/selfReview/RankBadge';
import { HiddenColumns, TableFrame } from '../../components/ui/TableFrame';
import { FilterField, TableToolbar, toolbarField } from '../../components/ui/TableToolbar';
import { Select } from '../../components/ui/Select';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { normalize } from '../../utils/org';
import { SubmitDeadline } from '../../components/period/SubmitDeadline';
import { isOwnReview } from '../../utils/reviewFlow';
import { criteriaCount, finalTotal, fmt, missingItems, rankFromScore, rankShort, selfTotal, statusMeta } from '../../utils/selfReview';

const th = 'border-b border-r border-gray-200 bg-gray-50 px-3 py-3 text-[13px] font-semibold text-gray-700';
const td = 'border-b border-r border-gray-200 px-3 py-4 align-middle';

type View = 'mine' | 'subordinates';

const pastColumns: TableColumn[] = [
{ id: 'stt', label: 'STT', locked: true },
{ id: 'period', label: 'Kỳ', locked: true },
{ id: 'status', label: 'Trạng thái' },
{ id: 'self', label: 'Tự chấm' },
{ id: 'final', label: 'Kết quả cuối' },
{ id: 'rank', label: 'Xếp loại' },
{ id: 'actions', label: 'Thao tác' }];


const pastExportColumns: ExportColumn<SelfReview>[] = [
{ header: 'STT', value: (_, i) => i + 1 },
{ id: 'period', header: 'Kỳ', value: (r) => r.period },
{ id: 'period', header: 'Biểu mẫu', value: (r) => r.template },
{ id: 'status', header: 'Trạng thái', value: (r) => statusMeta[r.status].label },
{ id: 'self', header: 'Tự chấm', value: (r) => fmt(selfTotal(r)) },
{ id: 'final', header: 'Kết quả cuối', value: (r) => fmt(finalTotal(r) ?? selfTotal(r)) },
{ id: 'rank', header: 'Xếp loại', value: (r) => rankShort(r.appraisal?.rank ?? rankFromScore(finalTotal(r) ?? selfTotal(r))) }];


export function SelfReviewList() {
  const { reviews: all } = useSelfReview();
  const { account, policy, member } = usePermissions();
  const reviews = all.filter((r) => isOwnReview(r, member?.id));
  const [view, setView] = useState<View>('mine');
  // Có phạm vi rộng hơn bản thân → thêm tab xem phiếu cấp dưới
  const scope = account ? widestScope(policy, account, 'review') : undefined;
  const hasSubordinates = Boolean(scope && scope !== 'self');
  const tabs = hasSubordinates ?
  <PageTabs
    ariaLabel="Phiếu tự đánh giá"
    active={view}
    onChange={(id) => setView(id as View)}
    tabs={[
    { id: 'mine', label: 'Phiếu của tôi', icon: UserRoundIcon },
    { id: 'subordinates', label: 'Phiếu cấp dưới', icon: UsersIcon }]
    } /> :

  null;

  if (hasSubordinates && view === 'subordinates') {
    return (
      <>
        {tabs}
        <SubordinateReviews period={reviews[0].period} />
      </>);

  }
  return (
    <>
      {tabs}
      <MyReviews reviews={reviews} />
    </>);

}

function MyReviews({ reviews }: {reviews: SelfReview[];}) {
  const navigate = useNavigate();
  const [current, ...allPast] = reviews;
  const [query, setQuery] = useState('');
  const [rankFilter, setRankFilter] = useState<Rank | ''>('');
  const { hidden, toggle: toggleColumn } = useTableColumns('past-reviews');
  const rankOf = (r: SelfReview) => r.appraisal?.rank ?? rankFromScore(finalTotal(r) ?? selfTotal(r));
  const past = allPast.filter(
    (r) => (!query.trim() || normalize(r.period).includes(normalize(query.trim()))) && (!rankFilter || rankOf(r) === rankFilter)
  );
  const meta = statusMeta[current.status];
  const missing = missingItems(current);
  const totalCriteria = criteriaCount(current);
  const isDraft = current.status === 'draft';
  const currentFinal = finalTotal(current);

  return (
    <div>
      <section aria-labelledby="current-period" className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-200 px-4 py-5">
        <div>
          <p className="text-[13px] text-gray-500">Kỳ hiện tại</p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h2 id="current-period" className="text-xl font-bold text-gray-900">
              {current.period}
            </h2>
            <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
          </div>
          <p className="mt-1.5 text-[14px] text-gray-600">
            {current.template} · <SubmitDeadline periodLabel={current.period} />
            {current.submittedAt && ` · Đã gửi ${current.submittedAt}`}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Phiếu do hệ thống tạo ngày {current.createdAt} khi kết thúc kỳ
            {isDraft && ` · Đã chấm ${totalCriteria - missing.criteria}/${totalCriteria} tiêu chí, ${current.tasks.length - missing.tasks}/${current.tasks.length} nhiệm vụ`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-8">
          <dl className="flex gap-8">
            <div className="text-right">
              <dt className="text-[13px] text-gray-500">Tự chấm</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-gray-900">{isDraft ? '—' : fmt(selfTotal(current))}</dd>
            </div>
            <div className="text-right">
              <dt className="text-[13px] text-gray-500">Sau thẩm định</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-gray-900">{currentFinal === null ? '—' : fmt(currentFinal)}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => navigate(`/tu-danh-gia/${current.id}`)}
            className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] ${
            isDraft ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-brand-600 bg-white text-brand-600 hover:bg-brand-50'}`
            }
            style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
            
            {isDraft ? 'Tiếp tục đánh giá' : 'Xem phiếu'}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </section>

      <TableToolbar
        className="mb-3 border-b border-gray-200 px-4 py-3"
        query={query}
        onQuery={setQuery}
        placeholder="Tìm theo kỳ"
        filters={
        <FilterField label="Xếp loại">
            <Select aria-label="Xếp loại" value={rankFilter} onChange={(v) => setRankFilter(v as Rank | '')} className={toolbarField}>
              <option value="">Tất cả xếp loại</option>
              {(['excellent', 'good', 'done', 'fail'] as Rank[]).map((r) =>
            <option key={r} value={r}>
                  {rankShort(r)}
                </option>
            )}
            </Select>
          </FilterField>
        }
        activeFilters={rankFilter ? 1 : 0}
        onClearFilters={() => setRankFilter('')}
        leading={
        <p className="text-[13px] text-gray-500">
            <span className="font-semibold text-gray-900">Các kỳ trước</span> · {past.length} phiếu đã khoá
          </p>
        }
        columns={pastColumns}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onExport={(format) => exportTable('phieu-tu-danh-gia-cac-ky-truoc', visibleExportColumns(pastExportColumns, hidden), past, format)} />
      

      <HiddenColumns indexes={hiddenIndexes(pastColumns, hidden)}>
      <TableFrame label="Phiếu các kỳ trước" className="mx-4 mb-4" reserve={0}>
        <table className="data-table w-full min-w-[960px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th className={`${th} w-14 text-center`}>STT</th>
              <th className={`${th} text-left`}>Kỳ</th>
              <th className={`${th} text-left`}>Trạng thái</th>
              <th className={`${th} w-28 text-center`}>Tự chấm</th>
              <th className={`${th} w-32 text-center`}>Kết quả cuối</th>
              <th className={`${th} w-36 text-center`}>Xếp loại</th>
              <th className={`${th} w-20 text-center`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {past.length === 0 &&
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-500">
                  <EmptyMark />
                  <p className="mt-2">{allPast.length ? 'Không có phiếu phù hợp bộ lọc' : 'Chưa có phiếu tự đánh giá nào ở các kỳ trước'}</p>
                </td>
              </tr>
              }
            {past.map((r, i) => {
                const self = selfTotal(r);
                const final = finalTotal(r) ?? self;
                const m = statusMeta[r.status];
                const lowered = final < self;
                return (
                  <tr key={r.id} className="hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
                  <td className={`${td} text-center tabular-nums text-gray-500`}>{i + 1}</td>
                  <td className={td}>
                    <p className="font-medium text-gray-900">{r.period}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {r.template} · nộp hạn {r.deadline}
                    </p>
                  </td>
                  <td className={td}>
                    <StatusPill tone={m.tone}>{m.label}</StatusPill>
                    <p className="mt-1 text-xs text-gray-500">
                      {r.appraisal?.decision === 'rescored' ? 'Người thẩm định chấm lại' : 'Chấp thuận nguyên bản'} · khoá {r.appraisal?.at}
                    </p>
                  </td>
                  <td className={`${td} text-center tabular-nums`}>{fmt(self)}</td>
                  <td className={`${td} text-center font-semibold tabular-nums ${lowered ? 'text-warning-700' : 'text-gray-900'}`}>{fmt(final)}</td>
                  <td className={`${td} text-center`}>
                    <RankBadge rank={r.appraisal?.rank ?? rankFromScore(final)} />
                  </td>
                  <td className={`${td} text-center`}>
                    <button
                        type="button"
                        onClick={() => navigate(`/tu-danh-gia/${r.id}`)}
                        aria-label={`Xem phiếu ${r.period}`}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                        
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>);

              })}
          </tbody>
        </table>
      </TableFrame>
      </HiddenColumns>
    </div>);

}