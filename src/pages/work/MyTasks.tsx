import { DataTable } from '../../components/ui/DataTable';
import React, { useMemo, useState } from 'react';
import { TableFrame, HiddenColumns } from '../../components/ui/TableFrame';
import { toast } from 'sonner';
import { FilterField, TableToolbar, toolbarField } from '../../components/ui/TableToolbar';
import { TableColumn, useTableColumns, hiddenIndexes } from '../../hooks/useTableColumns';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { PageHeader } from '../../components/PageHeader';
import { StatusPill } from '../../components/catalog/StatusPill';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { Select } from '../../components/ui/Select';
import { TaskUpdateDrawer } from '../../components/myTasks/TaskUpdateDrawer';
import { useWork } from '../../contexts/WorkContext';
import { usePermissions } from '../../hooks/usePermissions';
import { KpiTask, TaskProduct } from '../../types/work';
import { MyTaskTab, isLead, isMyTask, matchesTab, myTaskTabs, productCounts, productSuggestions } from '../../utils/myTasks';
import { TODAY_LABEL, isOverdue, kpiStatusMeta } from '../../utils/work';
import { displayDate } from '../../utils/profile';
import { normalize } from '../../utils/org';

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700';

const myTaskColumns: TableColumn[] = [
  { id: 'index', label: 'STT', locked: true },
  { id: 'task', label: 'Nhiệm vụ', locked: true },
  { id: 'role', label: 'Vai trò' },
  { id: 'deadline', label: 'Hạn' },
  { id: 'progress', label: 'Tiến độ sản phẩm' },
  { id: 'status', label: 'Trạng thái' },
  { id: 'actions', label: 'Thao tác', locked: true }
];

/** Nhiệm vụ KPI được giao cho cán bộ đăng nhập: báo cáo sản phẩm, nạp từ Excel, báo cáo hoàn thành */
export function MyTasks() {
  const { kpiTasks, periods, updateKpiTask } = useWork();
  const { member } = usePermissions();
  const by = member?.name ?? '';
  const [tab, setTab] = useState<MyTaskTab>('all');
  const [query, setQuery] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const { hidden, toggle: toggleColumn } = useTableColumns('my-tasks');

  const mine = useMemo(() => kpiTasks.filter((t) => isMyTask(t, member?.id)), [kpiTasks, member?.id]);
  const periodOptions = periods.filter((p) => mine.some((t) => t.periodId === p.id));
  const inScope = mine.filter((t) => !periodId || t.periodId === periodId);
  const q = normalize(query.trim());
  const rows = inScope.
  filter((t) => matchesTab(t, tab) && (!q || normalize(`${t.code} ${t.name}`).includes(q))).
  sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)) || a.deadline.localeCompare(b.deadline));
  const openTask = kpiTasks.find((t) => t.id === openId) ?? null;
  const suggestions = useMemo(() => productSuggestions(mine), [mine]);

  const log = (t: KpiTask, text: string) => [...t.history, { at: TODAY_LABEL, by, text }];

  const addProduct = (task: KpiTask, p: TaskProduct) => {
    updateKpiTask(task.id, (t) => ({
      ...t,
      status: t.status === 'assigned' ? 'in-progress' : t.status,
      products: [...(t.products ?? []), p],
      history: log(t, `Báo cáo sản phẩm “${p.name}”`)
    }));
    toast.success('Đã thêm sản phẩm — chờ lãnh đạo duyệt');
  };

  const removeProduct = (task: KpiTask, pid: string) => {
    const p = task.products?.find((x) => x.id === pid);
    updateKpiTask(task.id, (t) => ({ ...t, products: (t.products ?? []).filter((x) => x.id !== pid), history: log(t, `Xoá sản phẩm “${p?.name ?? ''}”`) }));
  };

  const report = (task: KpiTask) => {
    updateKpiTask(task.id, (t) => ({ ...t, status: 'reported', history: log(t, 'Báo cáo hoàn thành nhiệm vụ') }));
    toast.success(`Đã báo cáo hoàn thành ${task.code}`);
  };

  const counts = Object.fromEntries(myTaskTabs.map((t) => [t.id, inScope.filter((x) => matchesTab(x, t.id)).length])) as Record<MyTaskTab, number>;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <PageHeader />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4">
        <div role="tablist" aria-label="Lọc nhiệm vụ" className="flex gap-1">
          {myTaskTabs.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setTab(t.id)}
                className={`-mb-px flex h-11 items-center gap-1.5 border-b-2 px-3 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                on ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`
                }
                style={{ transition: 'color 150ms ease-out, border-color 150ms ease-out' }}>
                
                {t.label}
                <span className={`tabular-nums ${t.id === 'overdue' && counts.overdue ? 'text-brand-600' : 'text-gray-400'}`}>{counts[t.id]}</span>
              </button>);

          })}
        </div>
      </div>
      <TableToolbar
        className="border-b border-gray-200 px-4 py-3"
        query={query}
        onQuery={setQuery}
        placeholder="Tìm theo mã, tên nhiệm vụ…"
        filters={<FilterField label="Kỳ KPI">
          <Select value={periodId} onChange={setPeriodId} aria-label="Kỳ KPI" className={toolbarField}>
            <option value="">Tất cả kỳ</option>
            {periodOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </FilterField>}
        activeFilters={periodId ? 1 : 0}
        onClearFilters={() => setPeriodId('')}
        leading={<p className="text-[13px] text-gray-500">{rows.length} nhiệm vụ · {periodOptions.length} kỳ</p>}
        columns={myTaskColumns}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onRefresh={() => toast.success('Danh sách nhiệm vụ đã được cập nhật')}
        onExport={(format) => exportTable('nhiem-vu-cua-toi', visibleExportColumns([
          { id: 'task', header: 'Mã nhiệm vụ', value: (t: KpiTask) => t.code },
          { id: 'task', header: 'Nhiệm vụ', value: (t: KpiTask) => t.name },
          { id: 'role', header: 'Vai trò', value: (t: KpiTask) => isLead(t, member?.id) ? 'Chủ trì' : 'Phối hợp' },
          { id: 'deadline', header: 'Hạn', value: (t: KpiTask) => displayDate(t.deadline) },
          { id: 'status', header: 'Trạng thái', value: (t: KpiTask) => kpiStatusMeta[t.status].label },
          { id: 'progress', header: 'Sản phẩm', value: (t: KpiTask) => `${productCounts(t).approved}/${t.qty} đã duyệt` }
        ], hidden), rows, format)} />

      <HiddenColumns indexes={hiddenIndexes(myTaskColumns, hidden)}>
      <TableFrame label="Nhiệm vụ của tôi" className="mx-4 my-4" reserve={0}>
        <DataTable className="w-full min-w-[960px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th scope="col" className={`${th} w-12 text-center`}>STT</th>
              <th scope="col" className={th}>Nhiệm vụ</th>
              <th scope="col" className={th}>Vai trò</th>
              <th scope="col" className={th}>Hạn</th>
              <th scope="col" className={`${th} w-56`}>Tiến độ sản phẩm</th>
              <th scope="col" className={th}>Trạng thái</th>
              <th scope="col" className={`${th} w-28 text-center`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-14 text-center"><EmptyMark size="lg" /><p className="mt-3 text-gray-500">Không có nhiệm vụ nào khớp bộ lọc hoặc bạn chưa được giao nhiệm vụ KPI.</p></td></tr>}
            {rows.map((t, i) => {
              const c = productCounts(t);
              const overdue = isOverdue(t);
              const meta = kpiStatusMeta[t.status];
              return (
                <tr key={t.id} className="border-b border-gray-100 align-top hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
                  <td className="px-3 py-3 text-center tabular-nums text-gray-500">{i + 1}</td>
                  <td className="px-3 py-3">
                    <button type="button" onClick={() => setOpenId(t.id)} className="text-left font-medium text-gray-900 hover:text-brand-700">
                      {t.name}
                    </button>
                    <p className="text-[12px] text-gray-500">
                      {t.code} · {t.unit} · {t.point} điểm/sản phẩm
                    </p>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{isLead(t, member?.id) ? 'Chủ trì' : 'Phối hợp'}</td>
                  <td className={`whitespace-nowrap px-3 py-3 tabular-nums ${overdue ? 'font-semibold text-brand-600' : ''}`}>
                    {displayDate(t.deadline)}
                    {overdue && <span className="block text-[12px] font-medium">Quá hạn</span>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div className="bg-success-600" style={{ width: `${c.approved / Math.max(1, t.qty) * 100}%` }} />
                      <div className="bg-warning-600" style={{ width: `${c.pending / Math.max(1, t.qty) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-[12px] tabular-nums text-gray-600">
                      {c.approved}/{t.qty} đã duyệt
                      {c.pending > 0 && ` · ${c.pending} chờ duyệt`}
                      {c.returned > 0 && <span className="text-brand-600"> · {c.returned} bị trả lại</span>}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setOpenId(t.id)}
                      className="h-8 rounded-md px-3 text-[13px] font-medium text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      style={{ transition: 'background-color 150ms ease-out' }}>
                      
                      {t.status === 'reported' ? 'Xem' : 'Cập nhật'}
                    </button>
                  </td>
                </tr>);

            })}
          </tbody>
        </DataTable>
      </TableFrame>
      </HiddenColumns>

      <TaskUpdateDrawer
        task={openTask}
        memberId={member?.id}
        suggestions={suggestions}
        onClose={() => setOpenId(null)}
        onAdd={addProduct}
        onRemove={removeProduct}
        onReport={report} />
      
    </div>);

}