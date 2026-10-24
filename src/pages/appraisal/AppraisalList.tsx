import React, { useMemo, useState } from 'react';
import { TableFrame } from '../../components/ui/TableFrame';
import { useNavigate } from 'react-router-dom';
import { HistoryIcon } from 'lucide-react';
import { FilterField, TableToolbar, toolbarField } from '../../components/ui/TableToolbar';
import { TableColumn, useTableColumns, hiddenIndexes } from '../../hooks/useTableColumns';
import { HiddenColumns } from '../../components/ui/TableFrame';
import { exportTable } from '../../utils/tableExport';
import { PageHeader } from '../../components/PageHeader';
import { StatusPill } from '../../components/catalog/StatusPill';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { Select } from '../../components/ui/Select';
import { ReviewStepper } from '../../components/review/ReviewStepper';
import { FlowDialog } from '../../components/review/FlowDialog';
import { useSelfReview } from '../../contexts/SelfReviewContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ReviewStep, SelfReview } from '../../types/selfReview';
import { actingLayer, inAppraisalScope } from '../../utils/appraisal';
import { reviewKind, stepOf } from '../../utils/reviewFlow';
import { fmt, layerTotal, selfTotal, statusMeta } from '../../utils/selfReview';
import { findMember, findUnit, normalize } from '../../utils/org';

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700';
const appraisalColumns: TableColumn[] = [
  { id: 'index', label: 'STT', locked: true },
  { id: 'staff', label: 'Cán bộ', locked: true },
  { id: 'unit', label: 'Đơn vị' },
  { id: 'form', label: 'Mẫu' },
  { id: 'self', label: 'Tự đánh giá' },
  { id: 'dept', label: 'LĐ phòng' },
  { id: 'unitScore', label: 'LĐ đơn vị' },
  { id: 'status', label: 'Trạng thái' },
  { id: 'actions', label: 'Thao tác', locked: true }
];

/** Danh sách phiếu cần LĐ phòng / LĐ đơn vị đánh giá, lọc theo bước của luồng */
export function AppraisalList() {
  const navigate = useNavigate();
  const { reviews } = useSelfReview();
  const { member } = usePermissions();
  const [step, setStep] = useState<ReviewStep>('dept');
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('');
  const [flowOf, setFlowOf] = useState<SelfReview | null>(null);
  const { hidden, toggle: toggleColumn } = useTableColumns('appraisal-list');

  const scoped = useMemo(() => reviews.filter((r) => inAppraisalScope(r, member)), [reviews, member]);
  const periods = [...new Set(scoped.map((r) => r.period))];
  const activePeriod = period || periods[0] || '';
  const inPeriod = scoped.filter((r) => r.period === activePeriod);
  const counts = inPeriod.reduce<Partial<Record<ReviewStep, number>>>((c, r) => ({ ...c, [stepOf(r)]: (c[stepOf(r)] ?? 0) + 1 }), {});
  const q = normalize(query.trim());
  const rows = inPeriod.filter((r) => stepOf(r) === step && (!q || normalize(findMember(r.memberId as string)?.name ?? '').includes(q)));
  const mine = inPeriod.filter((r) => actingLayer(r, member)).length;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <PageHeader />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <ReviewStepper current={step} onSelect={setStep} counts={counts} />
        <p className="text-[13px] text-gray-600">
          Chờ bạn xử lý: <span className="font-semibold tabular-nums text-brand-700">{mine}</span> phiếu
        </p>
      </div>
      <TableToolbar
        className="border-b border-gray-200 px-4 py-3"
        query={query}
        onQuery={setQuery}
        placeholder="Tìm theo tên cán bộ…"
        filters={<FilterField label="Kỳ đánh giá">
          <Select value={activePeriod} onChange={setPeriod} aria-label="Kỳ đánh giá" className={toolbarField}>
            {periods.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </FilterField>}
        activeFilters={period && period !== periods[0] ? 1 : 0}
        onClearFilters={() => setPeriod('')}
        leading={<p className="text-[13px] text-gray-500">{rows.length} phiếu · Chờ bạn xử lý: <strong className="text-brand-700">{mine}</strong></p>}
        columns={appraisalColumns}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onRefresh={() => window.dispatchEvent(new Event('kpi:refresh'))}
        onExport={(format) => exportTable('phieu-tham-dinh', [
          { id: 'staff', header: 'Cán bộ', value: (r: SelfReview) => findMember(r.memberId as string)?.name ?? '' },
          { id: 'unit', header: 'Đơn vị', value: (r: SelfReview) => { const m = findMember(r.memberId as string); return m ? findUnit(m.unitId)?.name ?? '' : ''; } },
          { id: 'form', header: 'Mẫu', value: (r: SelfReview) => reviewKind(r) === 'ldch' ? 'CĐKPI-LĐCH' : 'CĐKPI-CN' },
          { id: 'self', header: 'Tự đánh giá', value: (r: SelfReview) => r.status !== 'draft' ? fmt(selfTotal(r)) : '—' },
          { id: 'dept', header: 'LĐ phòng', value: (r: SelfReview) => layerTotal(r, 'dept') ?? '—' },
          { id: 'unitScore', header: 'LĐ đơn vị', value: (r: SelfReview) => layerTotal(r, 'unit') ?? '—' },
          { id: 'status', header: 'Trạng thái', value: (r: SelfReview) => statusMeta[r.status].label }
        ], rows, format)} />

      {rows.length === 0 ?
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <EmptyMark size="lg" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Không có phiếu nào ở bước này</h2>
          <p className="mt-1 max-w-md text-[14px] text-gray-500">Chọn bước khác trên thanh tiến trình hoặc đổi kỳ đánh giá.</p>
        </div> :

      <HiddenColumns indexes={hiddenIndexes(appraisalColumns, hidden)}>
      <TableFrame label="Phiếu thẩm định" className="mx-4 my-4" reserve={0}>
        <table className="w-full min-w-[1000px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th scope="col" className={`${th} w-12 text-center`}>STT</th>
              <th scope="col" className={th}>Cán bộ</th>
              <th scope="col" className={th}>Đơn vị</th>
              <th scope="col" className={th}>Mẫu</th>
              <th scope="col" className={`${th} text-right`}>Tự đánh giá</th>
              <th scope="col" className={`${th} text-right`}>LĐ phòng</th>
              <th scope="col" className={`${th} text-right`}>LĐ đơn vị</th>
              <th scope="col" className={th}>Trạng thái</th>
              <th scope="col" className={`${th} w-40 text-center`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const owner = findMember(r.memberId as string);
              const layer = actingLayer(r, member);
              const dept = layerTotal(r, 'dept');
              const unit = layerTotal(r, 'unit');
              const meta = statusMeta[r.status];
              const hasSelf = r.status !== 'draft';
              return (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
                  <td className="px-3 py-3 text-center tabular-nums text-gray-500">{i + 1}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-900">{owner?.name}</p>
                    <p className="text-[12px] text-gray-500">{owner?.position}</p>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{owner ? findUnit(owner.unitId)?.name : ''}</td>
                  <td className="px-3 py-3 text-gray-600">{reviewKind(r) === 'ldch' ? 'CĐKPI-LĐCH' : 'CĐKPI-CN'}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{hasSelf ? fmt(selfTotal(r)) : <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{dept === null ? <span className="text-gray-300">—</span> : fmt(dept)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{unit === null ? <span className="text-gray-300">—</span> : fmt(unit)}</td>
                  <td className="px-3 py-3">
                    <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/tham-dinh/${r.id}`)}
                      className={`h-8 rounded-md px-3 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      layer ? 'bg-brand-600 text-white hover:bg-brand-700' : 'text-brand-600 hover:bg-brand-50'}`
                      }
                      style={{ transition: 'background-color 150ms ease-out' }}>
                      
                      {layer ? 'Đánh giá' : 'Xem'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlowOf(r)}
                      aria-label={`Tiến độ xử lý phiếu của ${owner?.name ?? ''}`}
                      className="ml-1 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                      
                      <HistoryIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </TableFrame>
      </HiddenColumns>
      }
      <FlowDialog open={Boolean(flowOf)} onClose={() => setFlowOf(null)} review={flowOf ?? undefined} owner={flowOf?.memberId ? findMember(flowOf.memberId) : undefined} />
    </div>);

}