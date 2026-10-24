import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EyeIcon, LockIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useWork } from '../../contexts/WorkContext';
import { usePermissions } from '../../hooks/usePermissions';
import { usePeriodScope } from '../../hooks/usePeriodScope';
import { PageHeader } from '../../components/PageHeader';
import { FilterField, TableToolbar, toolbarField } from '../../components/ui/TableToolbar';
import { Select } from '../../components/ui/Select';
import { StatusPill } from '../../components/catalog/StatusPill';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { btnPrimary, btnTransition } from '../../components/ui/Modal';
import { PeriodPicker } from '../../components/period/PeriodPicker';
import { PeriodFormDialog } from '../../components/period/PeriodFormDialog';
import { DeadlineCell } from '../../components/period/DeadlineCell';
import { ReasonDialog } from '../../components/period/ReasonDialog';
import { periodTh } from '../../components/period/PeriodTasksTab';
import { KpiPeriod, PeriodKind, PeriodPhase } from '../../types/work';
import { periodKindLabels, periodKinds, periodRangeLabel, ruleSummary, unitShort } from '../../utils/period';
import { findUnit, normalize } from '../../utils/org';
import { phaseMeta } from '../../utils/work';
import { phaseOrder } from '../../components/period/usePeriodDetail';
import { ExportFormat, exportTable } from '../../utils/tableExport';

type Filters = {query: string;kind: '' | PeriodKind;unitId: string;phase: '' | PeriodPhase;};
const empty: Filters = { query: '', kind: '', unitId: '', phase: '' };

const iconBtn =
'rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

/** Danh sách kỳ KPI. Tháng, quý, năm là ba loại kỳ độc lập — mỗi kỳ chấm điểm riêng. */
export function KpiPeriodList() {
  const navigate = useNavigate();
  const { kpiTasks, addPeriod, updatePeriod, deletePeriod, periodSlot, setPeriodSlot } = useWork();
  const { visible, unitIds, homeUnitId } = usePeriodScope();
  const { member, can } = usePermissions();
  const by = member?.name ?? 'Quản trị hệ thống';
  const canWrite = can('kpi-period', 'write');
  const canDelete = can('kpi-period', 'delete');

  const [f, setF] = useState<Filters>(empty);
  const [form, setForm] = useState<{open: boolean;editing?: KpiPeriod;}>({ open: false });
  const [removing, setRemoving] = useState<KpiPeriod | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    kpiTasks.forEach((t) => t.periodId && (c[t.periodId] = (c[t.periodId] ?? 0) + 1));
    return c;
  }, [kpiTasks]);

  const rows = useMemo(() => {
    const q = normalize(f.query);
    return visible.
    filter((p) => (!f.kind || p.kind === f.kind) && (!f.unitId || p.unitId === f.unitId) && (!f.phase || p.phase === f.phase) && (!q || normalize(p.name).includes(q))).
    sort((a, b) => b.end.localeCompare(a.end) || a.kind.localeCompare(b.kind));
  }, [visible, f]);

  const active = [f.kind, f.unitId, f.phase].filter(Boolean).length;
  const unitOptions = [...new Set(visible.map((p) => p.unitId))];

  const save = (p: KpiPeriod) => {
    if (form.editing) {
      updatePeriod(p.id, () => p);
      toast.success('Đã lưu thay đổi kỳ');
    } else {
      addPeriod(p);
      setPeriodSlot({ kind: p.kind, year: p.year, index: p.index });
      toast.success(`Đã tạo ${p.name}`);
    }
    setForm({ open: false });
  };

  const exportRows = (format: ExportFormat) =>
  exportTable<KpiPeriod>(
    'Ky-KPI',
    [
    { header: 'Tên kỳ', value: (p) => p.name },
    { header: 'Loại', value: (p) => periodKindLabels[p.kind] },
    { header: 'Đơn vị', value: (p) => findUnit(p.unitId)?.name ?? p.unitId },
    { header: 'Kiểm đếm', value: (p) => periodRangeLabel(p) },
    { header: 'Hạn tự đánh giá', value: (p) => p.deadlineRules.map(ruleSummary).join('; ') || 'Chưa cấu hình hạn' },
    { header: 'Giai đoạn', value: (p) => phaseMeta[p.phase].label },
    { header: 'Số việc KPI', value: (p) => counts[p.id] ?? 0 }],

    rows,
    format
  );

  return (
    <div className="bg-white">
      <PageHeader />
      <PeriodPicker
        periods={visible}
        unitId={homeUnitId}
        value={periodSlot}
        onChange={setPeriodSlot}
        trailing={(p) =>
        p ?
        <button type="button" onClick={() => navigate(`/ky-kpi/${p.id}`)} className="text-[13px] font-medium text-brand-600 hover:text-brand-700">
              Mở kỳ
            </button> :
        canWrite ?
        <button type="button" onClick={() => setForm({ open: true })} className="text-[13px] font-medium text-brand-600 hover:text-brand-700">
              Tạo kỳ này
            </button> :
        null
        } />
      
      <TableToolbar
        query={f.query}
        onQuery={(query) => setF((x) => ({ ...x, query }))}
        placeholder="Tìm tên kỳ…"
        activeFilters={active}
        onClearFilters={() => setF((x) => ({ ...empty, query: x.query }))}
        onExport={(format) => exportRows(format)}
        filters={
        <>
            <FilterField label="Loại kỳ">
              <Select value={f.kind} onChange={(v) => setF((x) => ({ ...x, kind: v as Filters['kind'] }))} className={toolbarField} aria-label="Loại kỳ">
                <option value="">Tất cả</option>
                {periodKinds.map((k) =>
              <option key={k} value={k}>
                    {periodKindLabels[k]}
                  </option>
              )}
              </Select>
            </FilterField>
            <FilterField label="Đơn vị">
              <Select value={f.unitId} onChange={(v) => setF((x) => ({ ...x, unitId: v }))} className={toolbarField} aria-label="Đơn vị">
                <option value="">Tất cả</option>
                {unitOptions.map((u) =>
              <option key={u} value={u}>
                    {findUnit(u)?.name ?? u}
                  </option>
              )}
              </Select>
            </FilterField>
            <FilterField label="Giai đoạn">
              <Select value={f.phase} onChange={(v) => setF((x) => ({ ...x, phase: v as Filters['phase'] }))} className={toolbarField} aria-label="Giai đoạn">
                <option value="">Tất cả</option>
                {phaseOrder.map((p) =>
              <option key={p} value={p}>
                    {phaseMeta[p].label}
                  </option>
              )}
              </Select>
            </FilterField>
          </>
        }
        leading={<span className="text-[13px] text-gray-500">{rows.length} kỳ</span>}
        actions={
        canWrite &&
        <button type="button" onClick={() => setForm({ open: true })} className={btnPrimary} style={btnTransition}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Tạo kỳ
            </button>

        } />
      

      <div className="overflow-x-auto px-4 py-4">
        <table className="w-full min-w-[1080px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th scope="col" className={`${periodTh} w-12 text-center`}>STT</th>
              <th scope="col" className={periodTh}>Tên kỳ</th>
              <th scope="col" className={periodTh}>Loại</th>
              <th scope="col" className={periodTh}>Đơn vị</th>
              <th scope="col" className={periodTh}>Kiểm đếm</th>
              <th scope="col" className={periodTh}>Hạn tự đánh giá</th>
              <th scope="col" className={periodTh}>Giai đoạn</th>
              <th scope="col" className={`${periodTh} text-right`}>Số việc KPI</th>
              <th scope="col" className={`${periodTh} w-28 text-center`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 &&
            <tr>
                <td colSpan={9} className="py-14 text-center">
                  <EmptyMark />
                  <p className="mt-2 text-gray-500">Không có kỳ nào khớp bộ lọc.</p>
                </td>
              </tr>
            }
            {rows.map((p, i) => {
              const n = counts[p.id] ?? 0;
              const deletable = canDelete && p.phase === 'draft' && n === 0;
              const editable = canWrite && p.phase !== 'closed' && !p.countingLocked;
              return (
                <tr key={p.id} className="border-b border-gray-100 align-top hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
                  <td className="px-3 py-3 text-center tabular-nums text-gray-500">{i + 1}</td>
                  <td className="px-3 py-3">
                    <button type="button" onClick={() => navigate(`/ky-kpi/${p.id}`)} className="text-left font-medium text-gray-900 hover:text-brand-700">
                      {p.name}
                    </button>
                  </td>
                  <td className="px-3 py-3">{periodKindLabels[p.kind]}</td>
                  <td className="px-3 py-3 text-gray-600">
                    {unitShort(p.unitId)}
                    {p.includeChildren && <span className="block text-[12px] text-gray-400">và trực thuộc</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                    {periodRangeLabel(p)}
                    {p.rangeStatus === 'needs-confirmation' &&
                    <span className="mt-1 block">
                        <StatusPill tone="warning">Cần xác nhận nghiệp vụ</StatusPill>
                      </span>
                    }
                  </td>
                  <td className="px-3 py-3">
                    <DeadlineCell period={p} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill tone={phaseMeta[p.phase].tone}>{phaseMeta[p.phase].label}</StatusPill>
                    {p.countingLocked &&
                    <span className="mt-1 flex items-center gap-1 text-[12px] text-gray-500">
                        <LockIcon className="h-3 w-3" aria-hidden />
                        Đã khoá kiểm đếm
                      </span>
                    }
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{n}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-center">
                    <button type="button" onClick={() => navigate(`/ky-kpi/${p.id}`)} aria-label={`Xem ${p.name}`} className={iconBtn} style={btnTransition}>
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {editable &&
                    <button type="button" onClick={() => setForm({ open: true, editing: p })} aria-label={`Sửa ${p.name}`} className={iconBtn} style={btnTransition}>
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    }
                    {deletable &&
                    <button type="button" onClick={() => setRemoving(p)} aria-label={`Xoá ${p.name}`} className={iconBtn} style={btnTransition}>
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    }
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>

      <PeriodFormDialog
        open={form.open}
        editing={form.editing}
        preset={periodSlot}
        unitIds={unitIds}
        defaultUnitId={homeUnitId}
        periods={visible}
        taskCount={form.editing ? counts[form.editing.id] ?? 0 : 0}
        by={by}
        onClose={() => setForm({ open: false })}
        onSave={save} />
      
      <ReasonDialog
        open={Boolean(removing)}
        title={removing ? `Xoá ${removing.name}?` : ''}
        description="Chỉ xoá được kỳ ở giai đoạn Nháp và chưa có việc nào."
        reasonRequired={false}
        reasonLabel="Ghi chú"
        confirmLabel="Xoá kỳ"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            deletePeriod(removing.id);
            toast.success(`Đã xoá ${removing.name}`);
          }
          setRemoving(null);
        }} />
      
    </div>);

}