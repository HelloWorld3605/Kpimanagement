import React from 'react';
import { TriangleAlertIcon } from 'lucide-react';
import { Select } from '../ui/Select';
import { KpiPeriod, KpiTask } from '../../types/work';
import { TaskCatalog } from '../../types/catalog';
import { UnitMember } from '../../types/org';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { FormField, inputClass, inputErrorClass } from '../catalog/FormField';
import { GroupBadge } from '../catalog/GroupBadge';
import { AssigneeSelect } from './AssigneeSelect';
import { MemberMultiSelect } from './MemberMultiSelect';
import { CustomFieldInput } from './CustomFieldInput';
import { useKpiTaskForm } from './useKpiTaskForm';
import { activeVersion } from '../../utils/catalog';
import { displayDate } from '../../utils/profile';
import { fmtNumber, nextAdhocCode, periodRange, phaseMeta } from '../../utils/work';

type KpiTaskFormProps = {
  open: boolean;
  editing?: KpiTask;
  initialPeriodId: string | null;
  periods: KpiPeriod[];
  catalogs: TaskCatalog[];
  tasks: KpiTask[];
  me?: UnitMember;
  unitIds: string[];
  onClose: () => void;
  onSave: (t: KpiTask) => void;
};

export function KpiTaskForm(props: KpiTaskFormProps) {
  const { open, editing, periods, catalogs, tasks, me, unitIds, onClose, onSave } = props;
  const f = useKpiTaskForm({ open, editing, initialPeriodId: props.initialPeriodId, periods, catalogs, tasks, me });
  const { form, set } = f;
  const locked = Boolean(editing);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = f.submit();
    if (t) onSave(t);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title={editing ? `Sửa việc ${editing.code}` : 'Giao việc KPI'}
      description={editing ? 'Kỳ, mục danh mục và phiên bản giữ nguyên như lúc giao.' : 'Chỉ huy giao việc trong đơn vị mình. Việc được tính điểm theo M = số lượng × điểm/SP.'}
      onSubmit={submit}
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex flex-wrap items-center gap-2 text-[14px] text-gray-600">
            Tổng điểm giao
            <span className="text-lg font-semibold tabular-nums text-brand-700">{f.m !== null ? `M = ${fmtNumber(f.m)}` : 'M = –'}</span>
            {Number.isFinite(f.point) && f.point > 0 && f.point <= 100 &&
          <span className="flex items-center gap-1 text-xs text-gray-500">
                <GroupBadge score={f.point} /> theo điểm/SP
              </span>
          }
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnGhost}>
              Huỷ
            </button>
            <button type="submit" className={btnPrimary} style={btnTransition}>
              {editing ? 'Lưu thay đổi' : 'Giao việc'}
            </button>
          </div>
        </div>
      }>
      
      {f.attempted && Object.keys(f.errors).length > 0 &&
      <p role="alert" className="shrink-0 border-b border-brand-100 bg-brand-50 px-5 py-2.5 text-[13px] text-brand-700">
          Còn {Object.keys(f.errors).length} mục chưa hợp lệ — xem các ô viền đỏ.
        </p>
      }
      {/* 4 cột ngang tương ứng 4 phần; mỗi cột cuộn riêng. Màn hẹp thì xếp dọc. */}
      <div className="divide-y divide-gray-200 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.25fr)_minmax(0,1.1fr)] lg:divide-x lg:divide-y-0">

        <Step n={1} title="Kỳ">
          {locked ?
          <ReadOnly value={f.period ? `${f.period.name} (${periodRange(f.period)})` : 'Chưa gán kỳ'} hint="Đổi kỳ bằng thao tác Chuyển kỳ trong panel chi tiết." /> :

          <FormField label="Kỳ đánh giá" htmlFor="kf-period" hint="Chỉ có các kỳ còn nhận việc. Chọn “Chưa gán kỳ” nếu chưa xác định được.">
              <Select id="kf-period" value={form.periodId} onChange={(v) => set('periodId', v)}>
                <option value="">Chưa gán kỳ</option>
                {f.openPeriods.map((p) =>
              <option key={p.id} value={p.id}>
                    {p.name} · {periodRange(p)} · {phaseMeta[p.phase].label}
                  </option>
              )}
              </Select>
            </FormField>
          }
        </Step>

        <Step n={2} title="Nguồn">
          {!locked &&
          <div role="radiogroup" aria-label="Nguồn việc" className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {(
            [
            ['catalog', 'Theo danh mục', 'Lấy tên, đơn vị tính, điểm chuẩn từ danh mục'],
            ['adhoc', 'Việc phát sinh', 'Không có trong danh mục — cần căn cứ giao']] as
            const).
            map(([value, label, desc]) =>
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 ${form.source === value ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
              style={{ transition: 'background-color 150ms ease-out, border-color 150ms ease-out' }}>
              
                  <input type="radio" name="kf-source" checked={form.source === value} onChange={() => set('source', value)} className="mt-0.5 h-4 w-4 accent-brand-600" />
                  <span>
                    <span className="block text-[14px] font-medium text-gray-900">{label}</span>
                    <span className="block text-xs text-gray-500">{desc}</span>
                  </span>
                </label>
            )}
            </div>
          }

          {form.source === 'catalog' ?
          locked ?
          <ReadOnly value={`${editing?.code} · v${editing?.version} — ${editing?.name}`} /> :

          <>
                <FormField label="Mục danh mục" htmlFor="kf-catalog" required error={f.showError('catalogCode')} hint="Chỉ các mục đang sử dụng và có phiên bản đang áp dụng.">
                  <Select
                id="kf-catalog"
                value={form.catalogCode}
                invalid={Boolean(f.showError('catalogCode'))}
                onChange={(v) => f.setForm((s) => ({ ...s, catalogCode: v, fields: {} }))}
                placeholder="Chọn mục danh mục">
                
                    {f.usableCatalogs.map((c) => {
                  const v = activeVersion(c)!;
                  return (
                    <option key={c.code} value={c.code}>
                          {c.code} · {v.name}
                        </option>);

                })}
                  </Select>
                </FormField>
                {f.version &&
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-gray-50 px-4 py-3 text-[14px]">
                    <Info label="Phiên bản" value={`v${f.version.version}`} />
                    <Info label="Sản phẩm" value={f.version.output} />
                    <Info label="Đơn vị tính" value={f.version.unit} />
                    <Info label="Điểm chuẩn" value={String(f.version.score)} />
                  </dl>
            }
              </> :


          <div className="grid grid-cols-2 gap-4">
              {!locked &&
            <p className="col-span-2 text-[13px] text-gray-500">
                  Mã cấp tự động: <span className="font-medium tabular-nums text-gray-900">{nextAdhocCode(tasks)}</span> · việc được đánh dấu{' '}
                  <span className="font-medium text-warning-700">ngoại lệ</span> để xem xét khi đánh giá.
                </p>
            }
              <FormField label="Tên việc" htmlFor="kf-name" required error={f.showError('name')} className="col-span-2">
                <input id="kf-name" disabled={locked} value={form.name} onChange={(e) => set('name', e.target.value)} className={cls(f.showError('name'))} />
              </FormField>
              <FormField label="Đơn vị tính" htmlFor="kf-unit" required error={f.showError('unit')}>
                <input id="kf-unit" disabled={locked} value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="Văn bản, Phương án…" className={cls(f.showError('unit'))} />
              </FormField>
              <FormField label="Điểm / sản phẩm" htmlFor="kf-point" required error={f.showError('point')} hint="Trên 0, tối đa 100">
                <input id="kf-point" disabled={locked} inputMode="decimal" value={form.point} onChange={(e) => set('point', e.target.value)} className={cls(f.showError('point'))} />
              </FormField>
              <FormField label="Căn cứ giao" htmlFor="kf-basis" required error={f.showError('basis')} hint="Ví dụ: số, ngày văn bản chỉ đạo" className="col-span-2">
                <input id="kf-basis" disabled={locked} value={form.basis} onChange={(e) => set('basis', e.target.value)} placeholder="Chỉ thị 12/CT-BTL ngày 02/10/2026" className={cls(f.showError('basis'))} />
              </FormField>
            </div>
          }
        </Step>

        <Step n={3} title="Giao">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p id="kf-mode-label" className="mb-1.5 text-[13px] font-medium text-gray-600">
                Hình thức phân công
              </p>
              <div role="radiogroup" aria-labelledby="kf-mode-label" className="inline-flex border border-gray-300 bg-white">
                {(
                [
                ['unit', 'Giao cho đơn vị'],
                ['member', 'Giao cho cá nhân']] as
                const).
                map(([mode, label], i) => {
                  const on = form.assignMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        if (on) return;
                        // Đổi hình thức thì phải chọn lại chủ trì
                        f.setForm((s) => ({ ...s, assignMode: mode, assignee: '' }));
                      }}
                      className={`relative h-9 px-5 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                      i > 0 ? 'border-l border-gray-300' : ''} ${
                      on ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                      
                      {label}
                      {on && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-600" aria-hidden />}
                    </button>);

                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {form.assignMode === 'unit' ? 'Việc tính vào KPI tập thể của đơn vị chủ trì.' : 'Việc tính vào KPI của cán bộ trực tiếp thực hiện.'}
              </p>
            </div>
            <FormField
              label={form.assignMode === 'unit' ? 'Đơn vị chủ trì' : 'Cán bộ trực tiếp thực hiện'}
              htmlFor="kf-assignee"
              required
              error={f.showError('assignee')}
              className="col-span-2">
              
              <AssigneeSelect
                id="kf-assignee"
                value={form.assignee}
                onChange={(v) =>
                f.setForm((s) => ({
                  ...s,
                  assignee: v,
                  collaboratorIds: s.collaboratorIds.filter((id) => `m:${id}` !== v),
                  watcherIds: s.watcherIds.filter((id) => `m:${id}` !== v)
                }))
                }
                unitIds={unitIds}
                allowUnits
                only={form.assignMode}
                placeholder={form.assignMode === 'unit' ? 'Chọn đơn vị chủ trì' : 'Chọn cán bộ'}
                excludeMemberIds={me ? [me.id] : []}
                invalid={Boolean(f.showError('assignee'))} />
              
            </FormField>
            <FormField
              label="Người phối hợp"
              htmlFor="kf-collab"
              hint={form.collaboratorIds.length ? `Đã chọn ${form.collaboratorIds.length} người phối hợp.` : 'Không bắt buộc · chọn được nhiều người.'}
              className="col-span-2">
              
              <MemberMultiSelect
                id="kf-collab"
                value={form.collaboratorIds}
                onChange={(ids) => set('collaboratorIds', ids)}
                unitIds={unitIds}
                excludeIds={[...(me ? [me.id] : []), ...(f.assigneeMemberId ? [f.assigneeMemberId] : []), ...form.watcherIds]}
                placeholder="Chọn người phối hợp" />
              
            </FormField>
            <FormField label="Người theo dõi" htmlFor="kf-watch" hint="Người theo dõi chỉ nhận thông báo, không được giao việc." className="col-span-2">
              <MemberMultiSelect
                id="kf-watch"
                value={form.watcherIds}
                onChange={(ids) => set('watcherIds', ids)}
                unitIds={unitIds}
                excludeIds={[...(f.assigneeMemberId ? [f.assigneeMemberId] : []), ...form.collaboratorIds]}
                placeholder="Chọn người theo dõi" />
              
            </FormField>
            <FormField
              label="Số lượng"
              htmlFor="kf-qty"
              required
              error={f.showError('qty')}
              hint={editing ? `Đã duyệt ${editing.approved} sản phẩm` : undefined}>
              
              <input id="kf-qty" inputMode="numeric" value={form.qty} onChange={(e) => set('qty', e.target.value)} className={cls(f.showError('qty'))} />
            </FormField>
            <FormField
              label="Thời hạn"
              htmlFor="kf-deadline"
              required
              error={f.showError('deadline')}
              hint={f.period ? `Trong ${displayDate(f.period.start)} – ${displayDate(f.period.end)}` : undefined}>
              
              <input
                id="kf-deadline"
                type="date"
                value={form.deadline}
                min={f.period?.start}
                max={f.period?.end}
                onChange={(e) => set('deadline', e.target.value)}
                className={cls(f.showError('deadline'))} />
              
            </FormField>
            <div className="col-span-2">
              <p className="mb-1.5 text-[13px] font-medium text-gray-600">Tổng điểm giao</p>
              <p className="flex h-10 items-center rounded-md bg-gray-50 px-3 text-[14px] tabular-nums text-gray-700">
                {f.m !== null ?
                <>
                    {form.qty} × {f.point} = <span className="ml-1 font-semibold text-gray-900">{fmtNumber(f.m)}</span>
                  </> :

                <span className="text-gray-400">Nhập số lượng</span>
                }
              </p>
            </div>
            {f.overload?.overloaded && f.overload.average !== null &&
            <p className="flex gap-2 rounded-md border border-warning-200 bg-warning-50 px-3 py-2.5 text-[13px] text-warning-700 col-span-2">
                <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Có thể giao quá tải: tổng M trong kỳ sẽ là {fmtNumber(f.overload.current)}, gấp{' '}
                {(f.overload.current / f.overload.average).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} lần trung bình 2 kỳ gần nhất (
                {fmtNumber(Math.round(f.overload.average))}). Vẫn giao được.
              </p>
            }
          </div>
        </Step>

        <Step n={4} title="Thông tin khác" hint={f.version && f.version.fields.length > 0 ? `Trường riêng của ${form.catalogCode || editing?.code}. Dấu * là bắt buộc.` : undefined}>
          {!f.version || f.version.fields.length === 0 ?
          <p className="rounded-md bg-gray-50 px-4 py-6 text-center text-[13px] text-gray-500">
              {form.source === 'adhoc' ?
            'Việc phát sinh không có trường riêng.' :
            f.version ?
            `${form.catalogCode || editing?.code} không có trường riêng.` :
            'Chọn mục danh mục ở phần 2 để hiện các trường riêng.'}
            </p> :

          <div className="grid gap-4">
              {f.version.fields.map((field) => {
              const err = f.showError(`f:${field.code}`);
              return (
                <FormField
                  key={field.id}
                  label={field.name}
                  htmlFor={`kf-f-${field.code}`}
                  required={field.required}
                  error={err}
                  hint={field.hint}>
                  
                    <CustomFieldInput
                    id={`kf-f-${field.code}`}
                    field={field}
                    value={form.fields[field.code] ?? ''}
                    invalid={Boolean(err)}
                    onChange={(v) => f.setForm((s) => ({ ...s, fields: { ...s.fields, [field.code]: v } }))} />
                  
                  </FormField>);

            })}
            </div>
          }
        </Step>
      </div>
    </Modal>);

}

const cls = (err?: string) => `${inputClass} ${err ? inputErrorClass : ''}`;

function Step({ n, title, hint, children }: {n: number;title: string;hint?: string;children: React.ReactNode;}) {
  return (
    <section aria-labelledby={`kf-step-${n}`} className="px-5 py-5 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
      <div className="mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{n}</span>
          <h3 id={`kf-step-${n}`} className="text-[15px] font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        {hint && <p className="mt-1 pl-[34px] text-[13px] leading-5 text-gray-500">{hint}</p>}
      </div>
      {children}
    </section>);

}

function ReadOnly({ value, hint }: {value: string;hint?: string;}) {
  return (
    <div>
      <p className="flex min-h-[40px] items-center rounded-md bg-gray-50 px-3 text-[14px] text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>);

}

function Info({ label, value }: {label: string;value: string;}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="truncate font-medium text-gray-900">{value}</dd>
    </div>);

}