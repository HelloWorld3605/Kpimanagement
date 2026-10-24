import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BellRingIcon, CalendarOffIcon, ChevronDownIcon, ChevronRightIcon, ClipboardListIcon, EyeIcon, FileUpIcon, ListTodoIcon, PencilIcon, PlusCircleIcon, PlusIcon, SendIcon } from 'lucide-react';
import { ImportTasksDialog } from '../../components/work/ImportTasksDialog';
import { TablePager } from '../../components/ui/TablePager';
import { ImportRow, productOptions } from '../../utils/importTasks';
import { newProduct } from '../../utils/myTasks';
import { PageTabs } from '../../components/PageTabs';
import { ReadOnlyNote } from '../../components/ReadOnlyNote';
import { StatusPill } from '../../components/catalog/StatusPill';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { Select } from '../../components/ui/Select';
import { btnTransition } from '../../components/ui/Modal';
import { HiddenColumns, TableFrame } from '../../components/ui/TableFrame';
import { FilterField, TableToolbar, toolbarField } from '../../components/ui/TableToolbar';
import { ProductReviewDrawer } from '../../components/tracking/ProductReviewDrawer';
import { ChildTaskDialog } from '../../components/tracking/ChildTaskDialog';
import { WorkItemForm } from '../../components/workItems/WorkItemForm';
import { AssignWorkDialog } from '../../components/work/AssignWorkDialog';
import { WaitingQueue } from '../../components/work/WaitingQueue';
import { KpiTaskDrawer } from '../../components/work/KpiTaskDrawer';
import { KpiTaskForm } from '../../components/work/KpiTaskForm';
import { MovePeriodDialog } from '../../components/work/MovePeriodDialog';
import { DailyTaskList } from '../../components/work/DailyTaskList';
import { DailyTaskForm } from '../../components/work/DailyTaskForm';
import { useWork } from '../../contexts/WorkContext';
import { useTaskCatalog } from '../../contexts/TaskCatalogContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePermissions } from '../../hooks/usePermissions';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { KpiTask, TaskProduct, WorkItem } from '../../types/work';
import { activeVersion } from '../../utils/catalog';
import { ancestorIds, flattenTree, nextChildCode, pendingCount, splitQty, taskStart, taskStateLabel, trackedTasks } from '../../utils/taskTracking';
import { productCounts } from '../../utils/myTasks';
import { remainingQty } from '../../utils/workItems';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { TODAY_ISO, TODAY_LABEL, assigneeLabel, canRemind, isOverdue, scopeUnitIds } from '../../utils/work';
import { displayDate } from '../../utils/profile';
import { findMember, normalize, unitMembers } from '../../utils/org';

type Tab = 'kpi' | 'daily';
type MoveState = {ids: string[];from: string | null;} | null;

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const pad = (n: number) => String(n).padStart(2, '0');

const columns: TableColumn[] = [
{ id: 'code', label: 'Mã nhiệm vụ', locked: true },
{ id: 'name', label: 'Tên nhiệm vụ', locked: true },
{ id: 'start', label: 'Ngày bắt đầu' },
{ id: 'deadline', label: 'Hạn hoàn thành' },
{ id: 'assignee', label: 'Người thực hiện' },
{ id: 'progress', label: 'Tiến độ' },
{ id: 'status', label: 'Trạng thái' },
{ id: 'actions', label: '#', locked: true }];


const th = 'border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700';
const iconBtn = 'rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';
const iconTransition = { transition: 'background-color 150ms ease-out, color 150ms ease-out' };
const primaryBtn =
'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md bg-brand-600 px-3.5 text-[14px] font-medium text-white hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';
const secondaryBtn =
'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-brand-600 bg-white px-3.5 text-[14px] font-medium text-brand-700 hover:bg-brand-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

/**
 * Quản lý nhiệm vụ — gộp Tạo nhiệm vụ, Phân công và Theo dõi nhiệm vụ.
 * Lãnh đạo tạo nhiệm vụ, phân công cho cán bộ (nhiệm vụ hiện ở "Nhiệm vụ của tôi" của cán bộ),
 * theo dõi theo nhóm cha → con, duyệt kết quả và tạo nhiệm vụ con từ bất kỳ nhiệm vụ nào.
 */
export function TaskManagement() {
  const work = useWork();
  const { kpiTasks, periods, dailyTasks, workItems, updateKpiTask, addKpiTask, addKpiTasks, remind, setTasksPeriod, addWorkItem, updateWorkItem, addDailyTask, updateDailyTask } = work;
  const { tasks: catalogs } = useTaskCatalog();
  const { member: me, can } = usePermissions();
  const { push } = useNotifications();
  const canWrite = can('task-assign', 'write');
  const by = me?.name ?? '';
  const [params, setParams] = useSearchParams();
  const presetWork = params.get('work') ?? undefined;

  const [tab, setTab] = useState<Tab>('kpi');
  const [year, setYear] = useState(Number(TODAY_ISO.slice(0, 4)));
  const [month, setMonth] = useState<number | null>(Number(TODAY_ISO.slice(5, 7)));
  const [query, setQuery] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [product, setProduct] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { hidden, toggle: toggleColumn } = useTableColumns('task-management');

  const [reviewId, setReviewId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [splitting, setSplitting] = useState<KpiTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assigning, setAssigning] = useState<{open: boolean;workId?: string;}>(() => ({ open: Boolean(presetWork), workId: presetWork }));
  const [editing, setEditing] = useState<KpiTask | null>(null);
  const [move, setMove] = useState<MoveState>(null);
  const [dailyFormOpen, setDailyFormOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const unitIds = useMemo(() => scopeUnitIds(me?.unitId), [me?.unitId]);
  const inScope = useMemo(() => trackedTasks(kpiTasks, me), [kpiTasks, me]);
  const myDaily = useMemo(() => dailyTasks.filter((t) => t.assignedById === me?.id || unitIds.includes(findMember(t.leadId)?.unitId ?? '')), [dailyTasks, unitIds, me?.id]);
  const waitingItems = useMemo(() => workItems.filter((w) => w.status === 'open' && unitIds.includes(w.unitId) && remainingQty(w, kpiTasks) > 0), [workItems, unitIds, kpiTasks]);
  const members = me ? unitMembers(me.unitId, true).filter((m) => m.id !== me.id) : [];

  /** Sản phẩm / công việc của nhiệm vụ: mục danh mục gốc hoặc "Nhiệm vụ phát sinh" */
  const productOf = (t: KpiTask) => {
    if (t.source === 'adhoc') return { key: 'adhoc', label: `Nhiệm vụ phát sinh · ${t.unit}` };
    const code = t.code.split('.')[0];
    const cat = catalogs.find((c) => c.code === code);
    const v = cat ? cat.versions.find((x) => x.version === t.version) ?? activeVersion(cat) : undefined;
    return { key: code, label: v ? v.name : t.unit };
  };

  // Lọc theo năm / tháng: nhiệm vụ có thời gian thực hiện giao với tháng (hoặc năm) đang chọn
  const range = month ? [`${year}-${pad(month)}-01`, `${year}-${pad(month)}-31`] : [`${year}-01-01`, `${year}-12-31`];
  const inRange = (t: KpiTask) => taskStart(t) <= range[1] && t.deadline >= range[0];
  // Nhiệm vụ KPI chưa gắn kỳ: không tính điểm kỳ nào cho tới khi được gán → luôn có lối xem riêng, không phụ thuộc năm / tháng
  const unassigned = inScope.filter((t) => t.periodId === null && t.status !== 'revoked');
  const periodScoped = unassignedOnly ? unassigned : inScope.filter(inRange);

  const assigneeOptions = useMemo(() => {
    const ids = new Map<string, string>();
    inScope.forEach((t) => ids.set(t.assignee.kind === 'member' ? t.assignee.memberId : t.assignee.unitId, assigneeLabel(t.assignee).primary));
    return [...ids.entries()].sort((a, b) => a[1].localeCompare(b[1], 'vi'));
  }, [inScope]);
  const productOptions = useMemo(() => {
    const m = new Map<string, string>();
    inScope.forEach((t) => {
      const p = productOf(t);
      m.set(p.key, p.label);
    });
    return [...m.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inScope, catalogs]);

  const q = normalize(query.trim());
  const assigneeKey = (t: KpiTask) => t.assignee.kind === 'member' ? t.assignee.memberId : t.assignee.unitId;
  const hits = periodScoped.filter(
    (t) =>
    (!assigneeId || assigneeKey(t) === assigneeId) && (
    !product || productOf(t).key === product) && (
    !statusFilter || taskStateLabel(t).label === statusFilter) && (
    !q || normalize(`${t.code} ${t.name} ${assigneeLabel(t.assignee).primary}`).includes(q))
  );
  // Giữ đủ chuỗi cha để nhiệm vụ con luôn nằm trong nhóm của nhiệm vụ lớn nhất
  const keep = new Set(hits.flatMap((t) => [t.id, ...ancestorIds(t, inScope)]));
  const visible = inScope.filter((t) => keep.has(t.id));
  // Phân trang theo nhóm: một nhiệm vụ gốc cùng toàn bộ nhiệm vụ con luôn nằm chung một trang
  const groups = flattenTree(visible, collapsed).reduce<ReturnType<typeof flattenTree>[]>((g, r) => {
    if (r.depth === 0 || !g.length) g.push([r]);else
    g[g.length - 1].push(r);
    return g;
  }, []);
  const pageCount = Math.max(1, Math.ceil(groups.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const rows = groups.slice((safePage - 1) * pageSize, safePage * pageSize).flat();
  const activeFilters = [assigneeId, product, statusFilter].filter(Boolean).length;
  const years = [...new Set([year, Number(TODAY_ISO.slice(0, 4)), ...inScope.map((t) => Number(t.deadline.slice(0, 4)))])].sort();

  const log = (t: KpiTask, text: string) => [...t.history, { at: TODAY_LABEL, by, text }];
  const flash = (text: string, undo?: () => void) => toast.success(text, undo ? { duration: 6000, action: { label: 'Hoàn tác', onClick: undo } } : undefined);
  const periodName = (id: string | null) => periods.find((p) => p.id === id)?.name ?? '';

  /* ---------- Tạo nhiệm vụ → (tuỳ chọn) phân công ngay ---------- */
  const saveWorkItem = (w: WorkItem, assignNext: boolean) => {
    addWorkItem(w);
    setCreateOpen(false);
    flash(`Đã tạo nhiệm vụ ${w.code} · ${w.name}`);
    if (assignNext) setAssigning({ open: true, workId: w.id });
  };

  const closeAssign = () => {
    setAssigning({ open: false });
    if (presetWork) setParams({}, { replace: true });
  };

  /* ---------- Phân công: nhiệm vụ đi thẳng vào "Nhiệm vụ của tôi" của cán bộ ---------- */
  const assign = (item: WorkItem, list: KpiTask[]) => {
    addKpiTasks(list);
    updateWorkItem(item.id, (w) => ({ ...w, history: [...w.history, { at: TODAY_LABEL, by, text: `Phân công ${list.map((t) => `${t.qty} → ${assigneeLabel(t.assignee).primary}`).join('; ')}` }] }));
    list.forEach((t) => push({ category: 'task', title: `Nhiệm vụ mới: ${t.code}`, body: t.name, link: '/nhiem-vu-cua-toi' }));
    closeAssign();
    flash(`Đã phân công ${item.code} cho ${list.length > 1 ? `${list.length} người` : assigneeLabel(list[0].assignee).primary}`);
  };

  /* ---------- Duyệt kết quả ---------- */
  const approve = (task: KpiTask, ids: string[]) => {
    updateKpiTask(task.id, (t) => {
      const products = (t.products ?? []).map((p) => ids.includes(p.id) ? { ...p, status: 'approved' as const, reason: undefined } : p);
      const approved = Math.max(t.approved, products.filter((p) => p.status === 'approved').length);
      return { ...t, products, approved: Math.min(t.qty, approved), history: log(t, `Duyệt ${ids.length} sản phẩm`) };
    });
    push({ category: 'task', title: `${task.code}: ${ids.length} sản phẩm đã được duyệt`, body: task.name, link: '/nhiem-vu-cua-toi' });
    flash(`Đã duyệt ${ids.length} sản phẩm`);
  };

  const returnProduct = (task: KpiTask, id: string, reason: string) => {
    const p = task.products?.find((x) => x.id === id);
    updateKpiTask(task.id, (t) => ({
      ...t,
      products: (t.products ?? []).map((x) => x.id === id ? { ...x, status: 'returned' as const, reason } : x),
      history: log(t, `Yêu cầu làm lại “${p?.name ?? ''}”: ${reason}`)
    }));
    push({ category: 'task', title: `${task.code}: sản phẩm bị yêu cầu làm lại`, body: reason, link: '/nhiem-vu-cua-toi' });
    flash('Đã yêu cầu làm lại');
  };

  /* ---------- Tạo nhiệm vụ con — tự liên kết với nhiệm vụ cha đang chọn ---------- */
  const createChildren = (list: {name: string;memberId: string;qty: number;deadline: string;}[]) => {
    if (!splitting) return;
    const parent = splitting;
    const base = kpiTasks.filter((c) => c.parentId === parent.id).length;
    const created: KpiTask[] = list.map((input, i) => ({
      ...parent,
      id: `kt-${Date.now().toString(36)}-${i}`,
      code: `${parent.code}.${base + i + 1}`,
      name: input.name,
      qty: input.qty,
      approved: 0,
      deadline: input.deadline,
      assignee: { kind: 'member', memberId: input.memberId },
      collaboratorIds: [],
      watcherIds: [],
      assignedById: me?.id ?? parent.assignedById,
      status: 'assigned',
      reminders: 0,
      products: [],
      parentId: parent.id,
      workItemId: undefined,
      history: [{ at: TODAY_LABEL, by, text: `Tạo từ nhiệm vụ cha ${parent.code} (${input.qty} ${parent.unit})` }]
    }));
    created.forEach((c) => {
      addKpiTask(c);
      push({ category: 'task', title: `Nhiệm vụ mới: ${c.code}`, body: c.name, link: '/nhiem-vu-cua-toi' });
    });
    updateKpiTask(parent.id, (t) => ({ ...t, history: log(t, `Tạo ${created.length} nhiệm vụ con: ${created.map((c) => c.code).join(', ')}`) }));
    setCollapsed((s) => {
      const n = new Set(s);
      n.delete(parent.id);
      return n;
    });
    setSplitting(null);
    flash(created.length === 1 ? `Đã tạo nhiệm vụ con ${created[0].code} thuộc ${parent.code}` : `Đã tạo ${created.length} nhiệm vụ con thuộc ${parent.code}`);
  };

  /* ---------- Nạp dữ liệu sản phẩm từ Excel cho các nhiệm vụ trong phạm vi ---------- */
  const importRows = (list: ImportRow[]) => {
    const options = productOptions(catalogs);
    const productsOf = (r: ImportRow): TaskProduct[] => {
      if (r.status !== 'done') return [];
      const qty = Number(r.qty);
      const ret = Number(r.returned);
      return Array.from({ length: qty }, (_, i) => ({
        ...newProduct({ name: `${r.name} (${i + 1}/${qty})`, doneAt: r.doneAt, note: 'Nạp dữ liệu', source: 'import' }),
        ...(i < ret ? { status: 'returned' as const, reason: 'Trả lại khi nạp dữ liệu' } : {})
      }));
    };
    let adhocN = kpiTasks.filter((t) => t.code.startsWith('PS-')).length;
    let merged = 0;
    let created = 0;
    list.forEach((r, i) => {
      const products = productsOf(r);
      if (r.taskId) {
        merged++;
        updateKpiTask(r.taskId, (t) => ({
          ...t,
          status: t.status === 'assigned' ? 'in-progress' : t.status,
          products: [...(t.products ?? []), ...products],
          history: log(t, products.length ? `Nạp ${products.length} sản phẩm (${r.returned} trả lại)` : 'Nạp dữ liệu: đang thực hiện')
        }));
        return;
      }
      created++;
      const opt = options.find((o) => o.key === r.productKey) ?? options[options.length - 1];
      const code = r.productKey || `PS-${String(++adhocN).padStart(2, '0')}`;
      const cat = catalogs.find((c) => c.code === r.productKey);
      const startLabel = r.start.split('-').reverse().join('/');
      addKpiTask({
        id: `kt-imp-${Date.now().toString(36)}-${i}`,
        code,
        source: r.productKey ? 'catalog' : 'adhoc',
        version: cat ? activeVersion(cat)?.version : undefined,
        name: r.name.trim(),
        unit: opt.unit,
        point: opt.point,
        qty: Number(r.qty),
        approved: 0,
        deadline: r.deadline,
        periodId: periods.find((p) => p.start <= r.deadline && p.end >= r.deadline && p.unitId === me?.unitId)?.id ?? null,
        assignee: { kind: 'member', memberId: me?.id ?? '' },
        collaboratorIds: [],
        watcherIds: [],
        assignedById: me?.id ?? '',
        basis: r.productKey ? undefined : 'Nạp dữ liệu',
        fields: {},
        status: 'in-progress',
        reminders: 0,
        products,
        history: [{ at: startLabel, by, text: `Tạo từ Nạp dữ liệu (bắt đầu ${startLabel})` }]
      });
    });
    setImporting(false);
    flash([merged && `ghép ${merged} dòng vào nhiệm vụ đã có`, created && `tạo ${created} nhiệm vụ mới`].filter(Boolean).join(', ').replace(/^./, (c) => `Đã ${c}`));
  };

  const unassign = (ids: string[]) => {
    const from = kpiTasks.find((t) => t.id === ids[0])?.periodId ?? null;
    setTasksPeriod(ids, null, by);
    flash(`Đã bỏ ${ids.length} nhiệm vụ khỏi ${periodName(from)}`, from ? () => setTasksPeriod(ids, from, by) : undefined);
  };
  const revoke = (t: KpiTask) => {
    updateKpiTask(t.id, (x) => ({ ...x, status: 'revoked', history: [...x.history, { at: TODAY_LABEL, by, text: 'Thu hồi' }] }));
    setDetailId(null);
    flash(`Đã thu hồi ${t.code}`, () => updateKpiTask(t.id, () => t));
  };

  const toggle = (id: string) =>
  setCollapsed((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);else
    n.add(id);
    return n;
  });

  type ExportRow = {task: KpiTask;depth: number;};
  const exportColumns: ExportColumn<ExportRow>[] = [
  { header: 'STT', value: (_, i) => i + 1 },
  { id: 'code', header: 'Mã nhiệm vụ', value: (r) => r.task.code },
  { id: 'code', header: 'Nhiệm vụ cha', value: (r) => r.task.parentId ? kpiTasks.find((x) => x.id === r.task.parentId)?.code ?? '' : '' },
  { id: 'name', header: 'Tên nhiệm vụ', value: (r) => r.task.name },
  { id: 'name', header: 'Sản phẩm/công việc', value: (r) => `${productOf(r.task).label} - ${r.task.point}` },
  { id: 'start', header: 'Ngày bắt đầu', value: (r) => displayDate(taskStart(r.task)) },
  { id: 'deadline', header: 'Hạn hoàn thành', value: (r) => displayDate(r.task.deadline) },
  { id: 'assignee', header: 'Người thực hiện', value: (r) => assigneeLabel(r.task.assignee).primary },
  { id: 'progress', header: 'Đã duyệt / giao', value: (r) => `${productCounts(r.task).approved}/${r.task.qty}` },
  { id: 'status', header: 'Trạng thái', value: (r) => taskStateLabel(r.task).label }];


  const reviewTask = kpiTasks.find((t) => t.id === reviewId) ?? null;
  const detailTask = kpiTasks.find((t) => t.id === detailId);

  const actions = canWrite ?
  <div className="flex items-center gap-2">
      {tab === 'kpi' ?
    <>
          <button type="button" onClick={() => setImporting(true)} className={secondaryBtn} style={btnTransition}>
            <FileUpIcon className="h-4 w-4" aria-hidden />
            Nạp dữ liệu
          </button>
          <button type="button" onClick={() => setCreateOpen(true)} className={secondaryBtn} style={btnTransition}>
            <PlusIcon className="h-4 w-4" aria-hidden />
            Tạo nhiệm vụ
          </button>
          <button type="button" onClick={() => setAssigning({ open: true })} className={primaryBtn} style={btnTransition}>
            <SendIcon className="h-4 w-4" aria-hidden />
            Phân công nhiệm vụ
          </button>
        </> :

    <button type="button" onClick={() => setDailyFormOpen(true)} className={primaryBtn} style={btnTransition}>
          <PlusIcon className="h-4 w-4" aria-hidden />
          Giao nhiệm vụ hằng ngày
        </button>
    }
    </div> :

  <ReadOnlyNote feature="task-assign" />;


  return (
    <div className="bg-white">
      <PageTabs
        ariaLabel="Loại nhiệm vụ"
        active={tab}
        onChange={(id) => setTab(id as Tab)}
        tabs={[
        { id: 'kpi', label: 'Nhiệm vụ KPI', icon: ClipboardListIcon, count: inScope.filter((t) => t.status !== 'reported').length },
        { id: 'daily', label: 'Nhiệm vụ hằng ngày', icon: ListTodoIcon, count: myDaily.filter((t) => t.status !== 'done').length }]
        }
        actions={actions} />
      

      {tab === 'daily' ?
      <DailyTaskList
        tasks={myDaily}
        me={me}
        canWrite={canWrite}
        onCreate={() => setDailyFormOpen(true)}
        onAccept={(id) => {
          updateDailyTask(id, (t) => ({ ...t, status: 'done' }));
          flash('Đã nghiệm thu, nhiệm vụ chuyển sang Hoàn thành');
        }}
        onReturn={(id) => {
          updateDailyTask(id, (t) => ({ ...t, status: 'returned' }));
          flash('Đã trả lại, chủ trì sửa rồi gửi lại');
        }} /> :


      <>
          <WaitingQueue items={waitingItems} tasks={kpiTasks} canWrite={canWrite} onAssign={(id) => setAssigning({ open: true, workId: id })} />

          {/* Năm · Tháng — hoặc chỉ nhiệm vụ chưa gắn kỳ */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 px-4 py-3">
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${unassignedOnly ? 'pointer-events-none opacity-40' : ''}`} aria-disabled={unassignedOnly}>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-700">Năm</span>
              <Select aria-label="Năm" value={String(year)} onChange={(v) => setYear(Number(v))} wrapperClassName="w-28">
                {years.map((y) =>
                <option key={y} value={y}>
                    {y}
                  </option>
                )}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-700">Tháng</span>
              <div role="radiogroup" aria-label="Tháng" className="flex flex-wrap gap-1 rounded-md border border-gray-200 p-1">
                <button
                  type="button"
                  role="radio"
                  aria-checked={month === null}
                  onClick={() => setMonth(null)}
                  className={`h-7 rounded px-2.5 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${month === null ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={iconTransition}>
                  
                  Cả năm
                </button>
                {MONTHS.map((m) =>
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={month === m}
                  aria-label={`Tháng ${m}`}
                  onClick={() => setMonth(m)}
                  className={`h-7 w-8 rounded text-[13px] font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${month === m ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={iconTransition}>
                  
                    {pad(m)}
                  </button>
                )}
              </div>
            </div>
            </div>
            <button
            type="button"
            aria-pressed={unassignedOnly}
            onClick={() => {
              setUnassignedOnly((v) => !v);
              setPage(1);
            }}
            className={`ml-auto inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border px-3 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            unassignedOnly ? 'border-warning-600 bg-warning-50 text-warning-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
            }
            style={iconTransition}>
            
              <CalendarOffIcon className="h-4 w-4" aria-hidden />
              {unassignedOnly ? 'Đang xem: chưa gắn kỳ' : 'Chưa gắn kỳ'}
              <span className={`rounded-full px-1.5 text-[12px] tabular-nums ${unassignedOnly ? 'bg-white' : unassigned.length ? 'bg-warning-50 text-warning-700' : 'bg-gray-100 text-gray-500'}`}>{unassigned.length}</span>
            </button>
          </div>
          {unassignedOnly &&
        <p className="border-b border-gray-200 bg-warning-50 px-4 py-2 text-[13px] text-warning-700" role="status">
              Nhiệm vụ chưa gắn kỳ chưa được tính điểm KPI. Bấm “Gán kỳ” trên từng dòng để đưa vào kỳ đánh giá.
            </p>
        }

          <TableToolbar
          query={query}
          onQuery={setQuery}
          placeholder="Từ khoá: mã, tên nhiệm vụ, người thực hiện…"
          filters={
          <>
                <FilterField label="Người thực hiện">
                  <Select aria-label="Người thực hiện" value={assigneeId} onChange={setAssigneeId} className={toolbarField} searchThreshold={8}>
                    <option value="">Tất cả người thực hiện</option>
                    {assigneeOptions.map(([id, name]) =>
                <option key={id} value={id}>
                        {name}
                      </option>
                )}
                  </Select>
                </FilterField>
                <FilterField label="Sản phẩm/công việc">
                  <Select aria-label="Sản phẩm/công việc" value={product} onChange={setProduct} className={toolbarField} searchThreshold={8}>
                    <option value="">Tất cả sản phẩm/công việc</option>
                    {productOptions.map(([key, label]) =>
                <option key={key} value={key}>
                        {label}
                      </option>
                )}
                  </Select>
                </FilterField>
                <FilterField label="Trạng thái">
                  <Select aria-label="Trạng thái" value={statusFilter} onChange={setStatusFilter} className={toolbarField}>
                    <option value="">Tất cả trạng thái</option>
                    {['Mới giao', 'Đang thực hiện', 'Chờ duyệt', 'Yêu cầu làm lại', 'Hoàn thành'].map((s) =>
                <option key={s} value={s}>
                        {s}
                      </option>
                )}
                  </Select>
                </FilterField>
              </>
          }
          activeFilters={activeFilters}
          onClearFilters={() => {
            setAssigneeId('');
            setProduct('');
            setStatusFilter('');
          }}
          leading={
          <p className="text-[13px] tabular-nums text-gray-500">
                {hits.length} nhiệm vụ · {month ? `tháng ${pad(month)}/${year}` : `năm ${year}`}
              </p>
          }
          columns={columns}
          hidden={hidden}
          onToggleColumn={toggleColumn}
          onExport={(format) =>
          exportTable(
            `quan-ly-nhiem-vu_${year}${month ? `-${pad(month)}` : ''}`,
            visibleExportColumns(exportColumns, hidden),
            flattenTree(visible, new Set()).map(({ task, depth }) => ({ task, depth })),
            format
          )
          } />
        

          <HiddenColumns indexes={hiddenIndexes(columns, hidden)}>
            <TableFrame label="Quản lý nhiệm vụ" className="mx-4 my-4" reserve={0}>
              <table className="data-table w-full min-w-[1180px] text-[14px] text-gray-700">
                <thead>
                  <tr>
                    <th scope="col" className={`${th} w-36`}>Mã nhiệm vụ</th>
                    <th scope="col" className={th}>Tên nhiệm vụ</th>
                    <th scope="col" className={`${th} w-28`}>Ngày bắt đầu</th>
                    <th scope="col" className={`${th} w-32`}>Hạn hoàn thành</th>
                    <th scope="col" className={`${th} w-48`}>Người thực hiện</th>
                    <th scope="col" className={`${th} w-36`}>Tiến độ</th>
                    <th scope="col" className={`${th} w-36`}>Trạng thái</th>
                    <th scope="col" className={`${th} w-32 text-right`}>
                      <span className="sr-only">Thao tác</span>#
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 &&
                <tr>
                      <td colSpan={8} className="py-14 text-center">
                        <EmptyMark />
                        <p className="mt-2 text-gray-500">Không có nhiệm vụ nào trong {month ? `tháng ${pad(month)}/${year}` : `năm ${year}`} khớp bộ lọc.</p>
                      </td>
                    </tr>
                }
                  {rows.map(({ task: t, depth, childCount }) => {
                  const c = productCounts(t);
                  const overdue = isOverdue(t);
                  const who = assigneeLabel(t.assignee);
                  const state = taskStateLabel(t);
                  const open = !collapsed.has(t.id);
                  const free = t.qty - splitQty(t, kpiTasks);
                  const parent = t.parentId ? inScope.find((x) => x.id === t.parentId) : undefined;
                  const pend = pendingCount(t);
                  const prod = productOf(t);
                  return (
                    <tr key={t.id} className={`border-b border-gray-100 align-top hover:bg-gray-50 ${depth ? 'bg-gray-50/40' : ''}`} style={{ transition: 'background-color 120ms ease-out' }}>
                        <td className="px-3 py-3">
                          <div className="flex items-start gap-1" style={{ paddingLeft: depth * 16 }}>
                            {childCount > 0 ?
                          <button
                            type="button"
                            onClick={() => toggle(t.id)}
                            aria-expanded={open}
                            aria-label={open ? `Thu gọn nhiệm vụ con của ${t.code}` : `Mở ${childCount} nhiệm vụ con của ${t.code}`}
                            className="mt-0.5 rounded p-0.5 text-gray-500 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                            
                                <ChevronRightIcon className="h-4 w-4" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
                              </button> :

                          <span className="w-5 shrink-0" />
                          }
                            <div className="min-w-0">
                              {parent &&
                            <p className="flex items-center gap-0.5 text-[11px] tabular-nums text-brand-600" title={`Thuộc ${parent.code} · ${parent.name}`}>
                                  <ChevronDownIcon className="h-3 w-3" aria-hidden />
                                  {parent.code}
                                </p>
                            }
                              <p className="font-medium tabular-nums text-gray-900">{t.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button type="button" onClick={() => setReviewId(t.id)} className="text-left font-semibold text-gray-900 hover:text-brand-700">
                            {t.name}
                          </button>
                          {t.periodId === null && t.status !== 'revoked' &&
                        <span className="ml-2 inline-flex items-center gap-1 align-middle">
                              <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning-700">Chưa gắn kỳ</span>
                              {canWrite &&
                          <button
                            type="button"
                            onClick={() => setMove({ ids: [t.id], from: null })}
                            className="rounded text-[12px] font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                            
                                  Gán kỳ
                                </button>
                          }
                            </span>
                        }
                          <p className="mt-0.5 text-[12px] text-gray-500">
                            {prod.label} - {t.point}
                            {childCount > 0 &&
                          <span className="text-gray-400">
                                {' '}
                                · {childCount} nhiệm vụ con{free > 0 ? ` · còn ${free} chưa chia` : ''}
                              </span>
                          }
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums">{displayDate(taskStart(t))}</td>
                        <td className={`whitespace-nowrap px-3 py-3 tabular-nums ${overdue ? 'font-semibold text-brand-600' : ''}`}>
                          {displayDate(t.deadline)}
                          {overdue && <span className="block text-[12px] font-medium">Quá hạn</span>}
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-gray-900">{who.primary}</p>
                          <p className="text-[12px] text-gray-500">{who.secondary}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-100">
                            <div className="bg-success-600" style={{ width: `${c.approved / Math.max(1, t.qty) * 100}%` }} />
                            <div className="bg-warning-600" style={{ width: `${c.pending / Math.max(1, t.qty) * 100}%` }} />
                          </div>
                          <p className="mt-1 text-[12px] tabular-nums text-gray-600">
                            {c.approved}/{t.qty} đã duyệt
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          {pend > 0 ?
                        <button
                          type="button"
                          onClick={() => setReviewId(t.id)}
                          className="inline-flex h-7 items-center rounded-full bg-warning-50 px-2.5 text-[12px] font-semibold tabular-nums text-warning-700 hover:bg-warning-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          style={{ transition: 'background-color 150ms ease-out' }}>
                          
                              Chờ duyệt · {pend}
                            </button> :

                        <StatusPill tone={state.tone}>{state.label}</StatusPill>
                        }
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <button type="button" onClick={() => setReviewId(t.id)} aria-label={`Xem, duyệt kết quả ${t.code}`} title="Xem / duyệt kết quả" className={iconBtn} style={iconTransition}>
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {canWrite &&
                        <button type="button" onClick={() => setDetailId(t.id)} aria-label={`Sửa ${t.code}`} title="Sửa, chuyển kỳ, thu hồi" className={iconBtn} style={iconTransition}>
                              <PencilIcon className="h-4 w-4" />
                            </button>
                        }
                          {canRemind(t) &&
                        <button
                          type="button"
                          onClick={() => {
                            remind([t.id], by);
                            flash(`Đã nhắc hạn ${t.code}`);
                          }}
                          aria-label={`Nhắc hạn ${t.code}`}
                          title="Nhắc hạn"
                          className={iconBtn}
                          style={iconTransition}>
                          
                              <BellRingIcon className="h-4 w-4" />
                            </button>
                        }
                          {canWrite && t.status !== 'revoked' &&
                        <button type="button" onClick={() => setSplitting(t)} aria-label={`Thêm nhiệm vụ con cho ${t.code}`} title="Thêm nhiệm vụ con" className={`${iconBtn} text-brand-600`} style={iconTransition}>
                              <PlusCircleIcon className="h-4 w-4" />
                            </button>
                        }
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            </TableFrame>
          </HiddenColumns>
          <TablePager
          total={groups.length}
          page={safePage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }} />
        
        </>
      }

      <ProductReviewDrawer task={reviewTask} onClose={() => setReviewId(null)} onApprove={approve} onReturn={returnProduct} />
      <ChildTaskDialog
        parent={splitting}
        nextCode={splitting ? nextChildCode(splitting, kpiTasks) : ''}
        available={splitting ? splitting.qty - splitQty(splitting, kpiTasks) : 0}
        members={members}
        onClose={() => setSplitting(null)}
        onCreate={createChildren} />
      
      <WorkItemForm
        open={createOpen}
        assigned={0}
        periods={periods}
        catalogs={catalogs}
        items={workItems}
        tasks={kpiTasks}
        me={me}
        onClose={() => setCreateOpen(false)}
        onSave={saveWorkItem} />
      
      <AssignWorkDialog
        open={assigning.open}
        workId={assigning.workId}
        items={workItems.filter((w) => unitIds.includes(w.unitId))}
        tasks={kpiTasks}
        unitIds={unitIds}
        me={me}
        onClose={closeAssign}
        onAssign={assign} />
      
      <KpiTaskDrawer
        task={detailTask}
        periods={periods}
        catalogs={catalogs}
        canWrite={canWrite}
        onClose={() => setDetailId(null)}
        onEdit={(t) => setEditing(t)}
        onMove={(t) => setMove({ ids: [t.id], from: t.periodId })}
        onUnassign={(t) => unassign([t.id])}
        onRevoke={revoke} />
      
      <KpiTaskForm
        open={Boolean(editing)}
        editing={editing ?? undefined}
        initialPeriodId={editing?.periodId ?? null}
        periods={periods}
        catalogs={catalogs}
        tasks={kpiTasks}
        me={me}
        unitIds={unitIds}
        onClose={() => setEditing(null)}
        onSave={(t) => {
          updateKpiTask(t.id, () => t);
          setEditing(null);
          flash(`Đã lưu thay đổi cho ${t.code}`);
        }} />
      
      <MovePeriodDialog
        open={Boolean(move)}
        tasks={kpiTasks.filter((t) => move?.ids.includes(t.id))}
        periods={periods}
        fromPeriodId={move?.from ?? null}
        onClose={() => setMove(null)}
        onConfirm={(target) => {
          if (!move) return;
          setTasksPeriod(move.ids, target, by);
          flash(`Đã ${move.from ? 'chuyển' : 'gán'} ${move.ids.length} nhiệm vụ vào ${periodName(target)}`);
          setMove(null);
        }} />
      
      <ImportTasksDialog open={importing} tasks={inScope.filter((t) => t.status !== 'reported')} catalogs={catalogs} onClose={() => setImporting(false)} onSave={importRows} />
      <DailyTaskForm
        open={dailyFormOpen}
        me={me}
        unitIds={unitIds}
        onClose={() => setDailyFormOpen(false)}
        onSave={(t) => {
          addDailyTask(t);
          setDailyFormOpen(false);
          flash(`Đã giao “${t.name}”`);
        }} />
      
    </div>);

}