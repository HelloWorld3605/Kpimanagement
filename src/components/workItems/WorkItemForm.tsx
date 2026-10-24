import React from 'react';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { FormField, inputClass, inputErrorClass } from '../catalog/FormField';
import { Select } from '../ui/Select';
import { CustomFieldInput } from '../work/CustomFieldInput';
import { KpiPeriod, KpiTask, WorkItem } from '../../types/work';
import { TaskCatalog } from '../../types/catalog';
import { UnitMember } from '../../types/org';
import { activeVersion } from '../../utils/catalog';
import { displayDate } from '../../utils/profile';
import { TODAY_ISO, fmtNumber } from '../../utils/work';
import { useWorkItemForm } from './useWorkItemForm';

type WorkItemFormProps = {
  open: boolean;
  editing?: WorkItem;
  assigned: number;
  periods: KpiPeriod[];
  catalogs: TaskCatalog[];
  items: WorkItem[];
  tasks: KpiTask[];
  me?: UnitMember;
  onClose: () => void;
  /** assignNext: lưu xong chuyển sang phân công ngay */
  onSave: (w: WorkItem, assignNext: boolean) => void;
};

const legend = 'text-[14px] font-semibold text-gray-900';

/** Bước 1 — Tạo công việc: việc gì, bao nhiêu, hạn nào. Người thực hiện chọn ở bước Phân công. */
export function WorkItemForm(props: WorkItemFormProps) {
  const { open, editing, assigned, onClose, onSave } = props;
  const f = useWorkItemForm(props);
  const { form, set, version } = f;
  const locked = Boolean(editing);
  const err = (k: string) => f.showError(k);

  const save = (assignNext: boolean) => {
    const w = f.submit();
    if (w) onSave(w, assignNext);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? `Sửa nhiệm vụ ${editing.code}` : 'Tạo nhiệm vụ KPI'}
      description="Xác định nội dung, số lượng và thời hạn. Việc chia cho đơn vị, cán bộ thực hiện ở bước Phân công."
      footer={
      <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost} style={btnTransition}>
            Huỷ
          </button>
          {editing ?
        <button type="button" onClick={() => save(false)} className={btnPrimary} style={btnTransition}>
              Lưu thay đổi
            </button> :

        <>
              <button
            type="button"
            onClick={() => save(false)}
            className="inline-flex h-10 items-center rounded-md border border-gray-300 px-4 text-[14px] font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={btnTransition}>
            
                Lưu, phân công sau
              </button>
              <button type="button" onClick={() => save(true)} className={btnPrimary} style={btnTransition}>
                Tạo và phân công
              </button>
            </>
        }
        </div>
      }>
      
      <div className="space-y-6 px-4 py-4">
        <fieldset className="space-y-3">
          <legend className={legend}>Kỳ KPI</legend>
          <Select value={form.periodId} onChange={(v) => set('periodId', v)} disabled={locked} aria-label="Kỳ KPI">
            <option value="">Chưa gán kỳ</option>
            {f.openPeriods.map((p) =>
            <option key={p.id} value={p.id}>
                {p.name} ({displayDate(p.start)} – {displayDate(p.end)})
              </option>
            )}
          </Select>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className={legend}>Nguồn nhiệm vụ</legend>
          <div role="radiogroup" aria-label="Nguồn" className="flex flex-wrap gap-2">
            {(
            [
            ['catalog', 'Theo danh mục nhiệm vụ'],
            ['adhoc', 'Nhiệm vụ phát sinh']] as
            const).
            map(([v, label]) =>
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={form.source === v}
              disabled={locked}
              onClick={() => set('source', v)}
              className={`h-9 rounded-md border px-3 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 ${
              form.source === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
              }
              style={{ transition: 'background-color 150ms ease-out, border-color 150ms ease-out' }}>
              
                {label}
              </button>
            )}
          </div>
          {form.source === 'catalog' ?
          <>
              <FormField label="Mục danh mục" htmlFor="wi-catalog" required error={err('catalogCode')}>
                <Select id="wi-catalog" value={form.catalogCode} onChange={(v) => set('catalogCode', v)} disabled={locked} invalid={Boolean(err('catalogCode'))} placeholder="Chọn mục" searchThreshold={8}>
                  <option value="">Chọn mục</option>
                  {f.usableCatalogs.map((c) =>
                <option key={c.code} value={c.code}>
                      {c.code} · {activeVersion(c)?.name}
                    </option>
                )}
                </Select>
              </FormField>
              {version &&
            <dl className="grid grid-cols-3 gap-3 rounded-md bg-gray-50 px-3 py-2.5 text-[13px]">
                  <div>
                    <dt className="text-gray-500">Đơn vị tính</dt>
                    <dd className="text-gray-900">{version.unit}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Điểm / sản phẩm</dt>
                    <dd className="tabular-nums text-gray-900">{version.score}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Phiên bản</dt>
                    <dd className="text-gray-900">v{version.version}</dd>
                  </div>
                </dl>
            }
            </> :

          <>
              <FormField label="Tên nhiệm vụ" htmlFor="wi-name" required error={err('name')}>
                <input id="wi-name" value={form.name} disabled={locked} onChange={(e) => set('name', e.target.value)} className={`${inputClass} ${err('name') ? inputErrorClass : ''}`} />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Đơn vị tính" htmlFor="wi-unit" required error={err('unit')}>
                  <input id="wi-unit" value={form.unit} disabled={locked} onChange={(e) => set('unit', e.target.value)} placeholder="Văn bản, báo cáo…" className={`${inputClass} ${err('unit') ? inputErrorClass : ''}`} />
                </FormField>
                <FormField label="Điểm / sản phẩm" htmlFor="wi-point" required error={err('point')}>
                  <input id="wi-point" inputMode="decimal" value={form.point} disabled={locked} onChange={(e) => set('point', e.target.value)} className={`${inputClass} tabular-nums ${err('point') ? inputErrorClass : ''}`} />
                </FormField>
              </div>
              <FormField label="Căn cứ" htmlFor="wi-basis" required error={err('basis')}>
                <input id="wi-basis" value={form.basis} disabled={locked} onChange={(e) => set('basis', e.target.value)} placeholder="Số văn bản, chỉ đạo của lãnh đạo…" className={`${inputClass} ${err('basis') ? inputErrorClass : ''}`} />
              </FormField>
            </>
          }
        </fieldset>

        <fieldset className="space-y-3">
          <legend className={legend}>Số lượng và thời hạn</legend>
          <div className="grid gap-3 sm:grid-cols-[160px_200px_1fr] sm:items-start">
            <FormField label="Tổng số lượng" htmlFor="wi-qty" required error={err('qty')} hint={assigned ? `Đã phân công ${assigned}` : undefined}>
              <input id="wi-qty" type="number" min={Math.max(1, assigned)} value={form.qty} onChange={(e) => set('qty', e.target.value)} className={`${inputClass} tabular-nums ${err('qty') ? inputErrorClass : ''}`} />
            </FormField>
            <FormField label="Hạn hoàn thành" htmlFor="wi-deadline" required error={err('deadline')}>
              <input
                id="wi-deadline"
                type="date"
                min={f.period ? f.period.start > TODAY_ISO ? f.period.start : TODAY_ISO : TODAY_ISO}
                max={f.period?.end}
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
                className={`${inputClass} ${err('deadline') ? inputErrorClass : ''}`} />
              
            </FormField>
            <div className="pt-6 text-[13px] text-gray-600">
              Tổng điểm M = <span className="font-semibold tabular-nums text-gray-900">{f.m === null ? '—' : fmtNumber(f.m)}</span>
            </div>
          </div>
          <FormField label="Mô tả, yêu cầu" htmlFor="wi-desc">
            <textarea id="wi-desc" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} h-auto py-2`} />
          </FormField>
        </fieldset>

        {version && version.fields.length > 0 &&
        <fieldset className="space-y-3">
            <legend className={legend}>Thông tin khác</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {version.fields.map((cf) =>
            <FormField key={cf.code} label={cf.name} htmlFor={`wi-f-${cf.code}`} required={cf.required} error={err(`f:${cf.code}`)} hint={cf.hint}>
                  <CustomFieldInput id={`wi-f-${cf.code}`} field={cf} value={form.fields[cf.code] ?? ''} invalid={Boolean(err(`f:${cf.code}`))} onChange={(v) => set('fields', { ...form.fields, [cf.code]: v })} />
                </FormField>
            )}
            </div>
          </fieldset>
        }
      </div>
    </Modal>);

}