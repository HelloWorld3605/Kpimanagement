import { useEffect, useMemo, useState } from 'react';
import { KpiPeriod, KpiTask } from '../../types/work';
import { TaskCatalog } from '../../types/catalog';
import { UnitMember } from '../../types/org';
import { activeVersion } from '../../utils/catalog';
import { displayDate } from '../../utils/profile';
import { assigneeKey, assigneeLabel, inPeriod, nextAdhocCode, overloadInfo, parseAssigneeKey, periodAccepting, TODAY_ISO, TODAY_LABEL } from '../../utils/work';

export type KpiFormState = {
  periodId: string;
  source: 'catalog' | 'adhoc';
  catalogCode: string;
  name: string;
  unit: string;
  point: string;
  basis: string;
  /** Hình thức phân công — chọn trước, rồi mới chọn đơn vị chủ trì hoặc cán bộ thực hiện */
  assignMode: 'unit' | 'member';
  assignee: string;
  collaboratorIds: string[];
  watcherIds: string[];
  qty: string;
  deadline: string;
  fields: Record<string, string>;
};

type Options = {
  open: boolean;
  editing?: KpiTask;
  initialPeriodId: string | null;
  periods: KpiPeriod[];
  catalogs: TaskCatalog[];
  tasks: KpiTask[];
  me?: UnitMember;
};

const blank = (periodId: string | null): KpiFormState => ({
  periodId: periodId ?? '',
  source: 'catalog',
  catalogCode: '',
  name: '',
  unit: '',
  point: '',
  basis: '',
  assignMode: 'unit',
  assignee: '',
  collaboratorIds: [],
  watcherIds: [],
  qty: '1',
  deadline: '',
  fields: {}
});

const fromTask = (t: KpiTask): KpiFormState => ({
  periodId: t.periodId ?? '',
  source: t.source,
  catalogCode: t.source === 'catalog' ? t.code : '',
  name: t.name,
  unit: t.unit,
  point: String(t.point),
  basis: t.basis ?? '',
  assignMode: t.assignee.kind,
  assignee: assigneeKey(t.assignee),
  collaboratorIds: t.collaboratorIds ?? [],
  watcherIds: t.watcherIds ?? [],
  qty: String(t.qty),
  deadline: t.deadline,
  fields: { ...t.fields }
});

const parseNum = (s: string) => s.trim() === '' ? NaN : Number(s.replace(',', '.'));

export function useKpiTaskForm({ open, editing, initialPeriodId, periods, catalogs, tasks, me }: Options) {
  const [form, setForm] = useState<KpiFormState>(() => blank(initialPeriodId));
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? fromTask(editing) : blank(initialPeriodId));
    setAttempted(false);
  }, [open, editing, initialPeriodId]);

  const set = <K extends keyof KpiFormState,>(key: K, value: KpiFormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  /** Kỳ còn nhận việc, sắp theo thời gian */
  const openPeriods = useMemo(() => periods.filter((p) => periodAccepting(p)).sort((a, b) => a.start.localeCompare(b.start)), [periods]);
  const period = periods.find((p) => p.id === form.periodId);

  /** Mục danh mục chọn được: đang sử dụng và có phiên bản đang áp dụng */
  const usableCatalogs = useMemo(() => catalogs.filter((c) => c.status === 'active' && activeVersion(c)), [catalogs]);
  const catalog = catalogs.find((c) => c.code === form.catalogCode);
  const version = editing?.source === 'catalog' ? catalog?.versions.find((v) => v.version === editing.version) : catalog ? activeVersion(catalog) : undefined;

  const point = form.source === 'catalog' ? version?.score ?? NaN : parseNum(form.point);
  const qty = parseNum(form.qty);
  const validPoint = Number.isFinite(point) && point > 0 && point <= 100;
  const validQty = Number.isInteger(qty) && qty >= 1;
  const m = validPoint && validQty ? point * qty : null;
  const assignee = parseAssigneeKey(form.assignee);

  const overload =
  assignee && form.periodId && m !== null ? overloadInfo(tasks, periods, assignee, form.periodId, m, editing?.id) : null;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.source === 'catalog') {
      if (!form.catalogCode) e.catalogCode = 'Chọn mục trong danh mục';
    } else {
      if (!form.name.trim()) e.name = 'Nhập tên việc';
      if (!form.unit.trim()) e.unit = 'Nhập đơn vị tính';
      if (!validPoint) e.point = 'Điểm lớn hơn 0 và tối đa 100';
      if (form.basis.trim().length < 10) e.basis = 'Căn cứ giao ít nhất 10 ký tự, ví dụ số văn bản chỉ đạo';
    }
    if (!assignee) e.assignee = form.assignMode === 'unit' ? 'Chọn đơn vị chủ trì' : 'Chọn cán bộ trực tiếp thực hiện';
    if (!validQty) e.qty = 'Số nguyên, từ 1 trở lên';else
    if (editing && qty < editing.approved) e.qty = `Đã duyệt ${editing.approved} sản phẩm — không giảm dưới số này`;
    if (!form.deadline) e.deadline = 'Chọn thời hạn';else
    if (period && !inPeriod(form.deadline, period)) e.deadline = `Hạn phải trong ${period.name} (${displayDate(period.start)} – ${displayDate(period.end)})`;else
    if (!editing && form.deadline < TODAY_ISO) e.deadline = 'Hạn không được trước hôm nay';
    version?.fields.forEach((f) => {
      const v = (form.fields[f.code] ?? '').trim();
      if (f.required && !v) e[`f:${f.code}`] = `Nhập ${f.name.toLowerCase()}`;else
      if (v && f.type === 'number' && !Number.isFinite(parseNum(v))) e[`f:${f.code}`] = 'Phải là số';
    });
    return e;
  }, [form, validPoint, validQty, qty, assignee, period, version, editing]);

  const showError = (key: string) => attempted ? errors[key] : undefined;

  /** Trả về việc đã tạo / sửa, hoặc null nếu còn lỗi */
  function submit(): KpiTask | null {
    setAttempted(true);
    if (Object.keys(errors).length > 0 || !assignee || !me) return null;
    const fields = Object.fromEntries((version?.fields ?? []).map((f) => [f.code, (form.fields[f.code] ?? '').trim()]));

    if (editing) {
      const changes: string[] = [];
      if (assigneeKey(editing.assignee) !== form.assignee) changes.push(`chủ trì → ${assigneeLabel(assignee).primary}`);
      if (editing.qty !== qty) changes.push(`số lượng ${editing.qty} → ${qty}`);
      if (editing.deadline !== form.deadline) changes.push(`hạn ${displayDate(editing.deadline)} → ${displayDate(form.deadline)}`);
      if (JSON.stringify(editing.collaboratorIds ?? []) !== JSON.stringify(form.collaboratorIds)) changes.push('người phối hợp');
      if (JSON.stringify(editing.watcherIds ?? []) !== JSON.stringify(form.watcherIds)) changes.push('người theo dõi');
      if (JSON.stringify(editing.fields) !== JSON.stringify(fields)) changes.push('thông tin khác');
      return {
        ...editing,
        assignee,
        collaboratorIds: form.collaboratorIds,
        watcherIds: form.watcherIds,
        qty,
        deadline: form.deadline,
        fields,
        history: changes.length ? [...editing.history, { at: TODAY_LABEL, by: me.name, text: `Sửa nội dung giao: ${changes.join(', ')}` }] : editing.history
      };
    }

    const adhoc = form.source === 'adhoc';
    const where = period ? `Tạo trong ${period.name}` : 'Tạo, chưa gán kỳ';
    return {
      id: `k${Date.now()}`,
      code: adhoc ? nextAdhocCode(tasks) : form.catalogCode,
      source: form.source,
      version: adhoc ? undefined : version?.version,
      name: adhoc ? form.name.trim() : version?.name ?? '',
      unit: adhoc ? form.unit.trim() : version?.unit ?? '',
      point,
      qty,
      approved: 0,
      deadline: form.deadline,
      periodId: form.periodId || null,
      assignee,
      collaboratorIds: form.collaboratorIds,
      watcherIds: form.watcherIds,
      assignedById: me.id,
      basis: adhoc ? form.basis.trim() : undefined,
      fields,
      status: 'assigned',
      reminders: 0,
      history: [{ at: TODAY_LABEL, by: me.name, text: adhoc ? `${where} (việc phát sinh)` : where }]
    };
  }

  const assigneeMemberId = assignee?.kind === 'member' ? assignee.memberId : undefined;

  return { form, set, setForm, assigneeMemberId, openPeriods, period, usableCatalogs, version, point, m, overload, errors, showError, submit, attempted };
}