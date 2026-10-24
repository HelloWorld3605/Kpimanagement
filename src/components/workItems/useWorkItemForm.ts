import { useEffect, useMemo, useState } from 'react';
import { KpiPeriod, KpiTask, WorkItem } from '../../types/work';
import { TaskCatalog } from '../../types/catalog';
import { UnitMember } from '../../types/org';
import { activeVersion } from '../../utils/catalog';
import { displayDate } from '../../utils/profile';
import { inPeriod, periodAccepting, TODAY_ISO, TODAY_LABEL } from '../../utils/work';
import { nextAdhocWorkCode } from '../../utils/workItems';

export type WorkFormState = {
  periodId: string;
  source: 'catalog' | 'adhoc';
  catalogCode: string;
  name: string;
  unit: string;
  point: string;
  basis: string;
  description: string;
  qty: string;
  deadline: string;
  fields: Record<string, string>;
};

type Options = {
  open: boolean;
  editing?: WorkItem;
  /** Số đã phân công — không giảm tổng dưới số này */
  assigned: number;
  periods: KpiPeriod[];
  catalogs: TaskCatalog[];
  items: WorkItem[];
  tasks: KpiTask[];
  me?: UnitMember;
};

const blank = (): WorkFormState => ({ periodId: '', source: 'catalog', catalogCode: '', name: '', unit: '', point: '', basis: '', description: '', qty: '1', deadline: '', fields: {} });

const fromItem = (w: WorkItem): WorkFormState => ({
  periodId: w.periodId ?? '',
  source: w.source,
  catalogCode: w.source === 'catalog' ? w.code : '',
  name: w.name,
  unit: w.unit,
  point: String(w.point),
  basis: w.basis ?? '',
  description: w.description,
  qty: String(w.qty),
  deadline: w.deadline,
  fields: { ...w.fields }
});

const parseNum = (s: string) => s.trim() === '' ? NaN : Number(s.replace(',', '.'));

/** Bước 1 — Tạo công việc: nội dung, số lượng, hạn, kỳ. Không chọn người thực hiện. */
export function useWorkItemForm({ open, editing, assigned, periods, catalogs, items, tasks, me }: Options) {
  const [form, setForm] = useState<WorkFormState>(blank);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? fromItem(editing) : { ...blank(), periodId: periods.filter(periodAccepting).find((p) => p.start <= TODAY_ISO && p.end >= TODAY_ISO)?.id ?? '' });
    setAttempted(false);
  }, [open, editing, periods]);

  const set = <K extends keyof WorkFormState,>(key: K, value: WorkFormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const openPeriods = useMemo(() => periods.filter((p) => periodAccepting(p)).sort((a, b) => a.start.localeCompare(b.start)), [periods]);
  const period = periods.find((p) => p.id === form.periodId);
  const usableCatalogs = useMemo(() => catalogs.filter((c) => c.status === 'active' && activeVersion(c)), [catalogs]);
  const catalog = catalogs.find((c) => c.code === form.catalogCode);
  const version = editing?.source === 'catalog' ? catalog?.versions.find((v) => v.version === editing.version) : catalog ? activeVersion(catalog) : undefined;

  const point = form.source === 'catalog' ? version?.score ?? NaN : parseNum(form.point);
  const qty = parseNum(form.qty);
  const validPoint = Number.isFinite(point) && point > 0 && point <= 100;
  const validQty = Number.isInteger(qty) && qty >= 1;
  const m = validPoint && validQty ? point * qty : null;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.source === 'catalog') {
      if (!form.catalogCode) e.catalogCode = 'Chọn mục trong danh mục';
    } else {
      if (!form.name.trim()) e.name = 'Nhập tên nhiệm vụ';
      if (!form.unit.trim()) e.unit = 'Nhập đơn vị tính';
      if (!validPoint) e.point = 'Điểm lớn hơn 0 và tối đa 100';
      if (form.basis.trim().length < 10) e.basis = 'Căn cứ ít nhất 10 ký tự, ví dụ số văn bản chỉ đạo';
    }
    if (!validQty) e.qty = 'Số nguyên, từ 1 trở lên';else
    if (qty < assigned) e.qty = `Đã phân công ${assigned} — không giảm dưới số này`;
    if (!form.deadline) e.deadline = 'Chọn thời hạn';else
    if (period && !inPeriod(form.deadline, period)) e.deadline = `Hạn phải trong ${period.name} (${displayDate(period.start)} – ${displayDate(period.end)})`;else
    if (!editing && form.deadline < TODAY_ISO) e.deadline = 'Hạn không được trước hôm nay';
    version?.fields.forEach((f) => {
      const v = (form.fields[f.code] ?? '').trim();
      if (f.required && !v) e[`f:${f.code}`] = `Nhập ${f.name.toLowerCase()}`;else
      if (v && f.type === 'number' && !Number.isFinite(parseNum(v))) e[`f:${f.code}`] = 'Phải là số';
    });
    return e;
  }, [form, validPoint, validQty, qty, assigned, period, version, editing]);

  const showError = (key: string) => attempted ? errors[key] : undefined;

  function submit(): WorkItem | null {
    setAttempted(true);
    if (Object.keys(errors).length > 0 || !me) return null;
    const fields = Object.fromEntries((version?.fields ?? []).map((f) => [f.code, (form.fields[f.code] ?? '').trim()]));
    if (editing) {
      const changes: string[] = [];
      if (editing.qty !== qty) changes.push(`số lượng ${editing.qty} → ${qty}`);
      if (editing.deadline !== form.deadline) changes.push(`hạn ${displayDate(editing.deadline)} → ${displayDate(form.deadline)}`);
      if (editing.description !== form.description.trim()) changes.push('mô tả');
      if (JSON.stringify(editing.fields) !== JSON.stringify(fields)) changes.push('thông tin khác');
      return {
        ...editing,
        qty,
        deadline: form.deadline,
        description: form.description.trim(),
        fields,
        history: changes.length ? [...editing.history, { at: TODAY_LABEL, by: me.name, text: `Sửa nhiệm vụ: ${changes.join(', ')}` }] : editing.history
      };
    }
    const adhoc = form.source === 'adhoc';
    return {
      id: `w${Date.now()}`,
      code: adhoc ? nextAdhocWorkCode(items, tasks) : form.catalogCode,
      source: form.source,
      version: adhoc ? undefined : version?.version,
      name: adhoc ? form.name.trim() : version?.name ?? '',
      unit: adhoc ? form.unit.trim() : version?.unit ?? '',
      point,
      qty,
      deadline: form.deadline,
      periodId: form.periodId || null,
      basis: adhoc ? form.basis.trim() : undefined,
      description: form.description.trim(),
      fields,
      unitId: me.unitId,
      createdById: me.id,
      createdAt: TODAY_LABEL,
      status: 'open',
      history: [{ at: TODAY_LABEL, by: me.name, text: `Tạo nhiệm vụ${period ? ` trong ${period.name}` : ', chưa gán kỳ'}${adhoc ? ' (phát sinh)' : ''}` }]
    };
  }

  return { form, set, openPeriods, period, usableCatalogs, version, point, m, showError, submit };
}