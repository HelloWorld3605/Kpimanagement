import React, { useEffect, useMemo, useState } from 'react';
import { InfoIcon } from 'lucide-react';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { FormField, inputClass, inputErrorClass } from '../catalog/FormField';
import { Select } from '../ui/Select';
import { StatusPill } from '../catalog/StatusPill';
import { KpiPeriod, PeriodKind } from '../../types/work';
import { findUnit, unitPath } from '../../utils/org';
import { countingRange, overlappingPeriod, PeriodSlot, periodKindLabels, periodKinds, periodName, periodRangeLabel, ROMAN } from '../../utils/period';
import { TODAY_ISO } from '../../utils/work';
import { nowStamp } from '../../utils/profile';

type PeriodFormDialogProps = {
  open: boolean;
  editing?: KpiPeriod;
  /** Điền sẵn từ ô đang chọn trên bộ chọn kỳ */
  preset?: PeriodSlot;
  /** Đơn vị được lập kỳ */
  unitIds: string[];
  defaultUnitId?: string;
  periods: KpiPeriod[];
  /** Số việc đã có trong kỳ đang sửa — có việc thì không đổi loại, số kỳ, đơn vị */
  taskCount?: number;
  by: string;
  onClose: () => void;
  onSave: (p: KpiPeriod) => void;
};

type Form = {
  kind: PeriodKind;
  year: number;
  index: number;
  unitId: string;
  includeChildren: boolean;
  start: string;
  end: string;
  rangeBasis: string;
  appraisalDeadline: string;
  reportDeadline: string;
};

const currentYear = Number(TODAY_ISO.slice(0, 4));

/** Tạo / sửa kỳ KPI. Khoảng kiểm đếm tháng, quý tự điền theo K02; kỳ năm nhập tay. */
export function PeriodFormDialog({ open, editing, preset, unitIds, defaultUnitId, periods, taskCount = 0, by, onClose, onSave }: PeriodFormDialogProps) {
  const [form, setForm] = useState<Form>(() => initial());
  const [tried, setTried] = useState(false);

  function initial(): Form {
    if (editing)
    return {
      kind: editing.kind,
      year: editing.year,
      index: editing.index,
      unitId: editing.unitId,
      includeChildren: editing.includeChildren,
      start: editing.start,
      end: editing.end,
      rangeBasis: editing.rangeBasis ?? '',
      appraisalDeadline: editing.appraisalDeadline ?? '',
      reportDeadline: editing.reportDeadline ?? ''
    };
    const kind = preset?.kind ?? 'month';
    return {
      kind,
      year: preset?.year ?? currentYear,
      index: preset?.index ?? (kind === 'year' ? 0 : 1),
      unitId: defaultUnitId && unitIds.includes(defaultUnitId) ? defaultUnitId : unitIds[0] ?? '',
      includeChildren: true,
      start: '',
      end: '',
      rangeBasis: '',
      appraisalDeadline: '',
      reportDeadline: ''
    };
  }

  useEffect(() => {
    if (open) {
      setForm(initial());
      setTried(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing?.id]);

  const set = <K extends keyof Form,>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const structural = Boolean(editing) && taskCount > 0;
  const auto = countingRange(form.kind, form.year, form.index);
  const range = auto ?? { start: form.start, end: form.end };

  const errors = useMemo(() => {
    const e: Partial<Record<'unit' | 'range' | 'overlap' | 'past', string>> = {};
    if (!form.unitId) e.unit = 'Chọn đơn vị áp dụng';
    if (form.kind === 'year') {
      if (!form.start || !form.end) e.range = 'Nhập ngày bắt đầu và kết thúc kiểm đếm';else
      if (form.start > form.end) e.range = 'Ngày bắt đầu phải trước ngày kết thúc';
    }
    if (range.start && range.end && form.unitId) {
      const clash = overlappingPeriod(periods, { id: editing?.id ?? '', kind: form.kind, unitId: form.unitId, start: range.start, end: range.end });
      if (clash) e.overlap = `Trùng ngày với ${clash.name} (${periodRangeLabel(clash)}). Kỳ cùng loại của cùng đơn vị không được chồng ngày.`;
    }
    if (!editing && range.end && range.end < TODAY_ISO) e.past = 'Kỳ này đã kết thúc kiểm đếm — không tạo kỳ đã qua.';
    return e;
  }, [form, range.start, range.end, periods, editing]);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setTried(true);
    if (Object.keys(errors).length) return;
    const name = periodName(form.kind, form.year, form.index, form.unitId);
    const base: KpiPeriod = editing ?? {
      id: `${form.kind[0]}-${form.year}-${form.index}-${form.unitId}-${Date.now().toString(36)}`,
      name,
      kind: form.kind,
      year: form.year,
      index: form.index,
      unitId: form.unitId,
      includeChildren: form.includeChildren,
      start: range.start,
      end: range.end,
      deadlineRules: [],
      appraisalDeadline: null,
      reportDeadline: null,
      countingLocked: false,
      phase: 'draft',
      resultVersion: 1,
      deadlineHistory: [],
      events: [{ at: nowStamp(), by, text: 'Tạo kỳ' }],
      createdBy: by,
      createdAt: nowStamp()
    };
    onSave({
      ...base,
      name,
      kind: form.kind,
      year: form.year,
      index: form.index,
      unitId: form.unitId,
      includeChildren: form.includeChildren,
      start: range.start,
      end: range.end,
      rangeStatus: form.kind === 'year' ? base.rangeStatus ?? 'needs-confirmation' : undefined,
      rangeBasis: form.kind === 'year' ? form.rangeBasis.trim() || undefined : undefined,
      appraisalDeadline: form.appraisalDeadline || null,
      reportDeadline: form.reportDeadline || null
    });
  };

  const err = (k: keyof typeof errors) => tried ? errors[k] : undefined;
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? `Sửa ${editing.name}` : 'Tạo kỳ KPI'}
      description="Mỗi kỳ có việc, phiếu và điểm riêng, chấm độc lập — không chia trung bình, không cộng dồn từ kỳ khác."
      onSubmit={submit}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost} style={btnTransition}>
            Huỷ
          </button>
          <button type="submit" className={btnPrimary} style={btnTransition}>
            {editing ? 'Lưu thay đổi' : 'Tạo kỳ'}
          </button>
        </div>
      }>
      
      <div className="space-y-5 px-4 py-4">
        <FormField label="Loại kỳ" required hint={structural ? 'Kỳ đã có việc — không đổi loại, số kỳ hoặc đơn vị.' : undefined}>
          <div role="radiogroup" aria-label="Loại kỳ" className="grid grid-cols-3 gap-2">
            {periodKinds.map((k) => {
              const active = form.kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={structural}
                  onClick={() => setForm((f) => ({ ...f, kind: k, index: k === 'year' ? 0 : 1 }))}
                  className={`h-10 rounded-md border text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                  active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
                  }
                  style={{ transition: 'background-color 150ms ease-out, border-color 150ms ease-out' }}>
                  
                  {periodKindLabels[k]}
                </button>);

            })}
          </div>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Năm" required>
            <Select value={form.year} onChange={(v) => set('year', Number(v))} disabled={structural} aria-label="Năm">
              {yearOptions.map((y) =>
              <option key={y} value={y}>
                  {y}
                </option>
              )}
            </Select>
          </FormField>
          {form.kind !== 'year' &&
          <FormField label={form.kind === 'month' ? 'Tháng' : 'Quý'} required>
              <Select value={form.index} onChange={(v) => set('index', Number(v))} disabled={structural} aria-label={form.kind === 'month' ? 'Tháng' : 'Quý'}>
                {(form.kind === 'month' ? Array.from({ length: 12 }, (_, i) => i + 1) : [1, 2, 3, 4]).map((i) =>
              <option key={i} value={i}>
                    {form.kind === 'month' ? `Tháng ${String(i).padStart(2, '0')}` : `Quý ${ROMAN[i - 1]}`}
                  </option>
              )}
              </Select>
            </FormField>
          }
        </div>

        {auto ?
        <div className="flex items-start gap-2.5 rounded-md bg-gray-50 px-3 py-2.5 text-[13px] text-gray-700">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <p>
              Khoảng kiểm đếm theo K02: <span className="font-semibold tabular-nums text-gray-900">{periodRangeLabel(auto)}</span>
              <span className="text-gray-500">
                {form.kind === 'month' ? ' — từ ngày 15 tháng trước đến hết ngày 14 tháng đánh giá.' : ' — từ ngày 15 tháng cuối quý trước đến hết ngày 14 tháng cuối quý.'}
              </span>
            </p>
          </div> :

        <div className="space-y-3 rounded-md border border-warning-200 bg-warning-50 px-3 py-3">
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-warning-700">
              <StatusPill tone="warning">Cần xác nhận nghiệp vụ</StatusPill>
              Khoảng kiểm đếm năm chưa có căn cứ — nhập tay.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Bắt đầu kiểm đếm" htmlFor="pf-start" required error={err('range')}>
                <input id="pf-start" type="date" value={form.start} onChange={(e) => set('start', e.target.value)} className={`${inputClass} ${err('range') ? inputErrorClass : ''}`} />
              </FormField>
              <FormField label="Kết thúc kiểm đếm" htmlFor="pf-end" required>
                <input id="pf-end" type="date" value={form.end} onChange={(e) => set('end', e.target.value)} className={inputClass} />
              </FormField>
            </div>
            <FormField label="Ghi chú căn cứ (nếu có)" htmlFor="pf-basis">
              <input id="pf-basis" value={form.rangeBasis} onChange={(e) => set('rangeBasis', e.target.value)} className={inputClass} />
            </FormField>
          </div>
        }

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Đơn vị áp dụng" required error={err('unit')}>
            <Select value={form.unitId} onChange={(v) => set('unitId', v)} disabled={structural} invalid={Boolean(err('unit'))} aria-label="Đơn vị áp dụng">
              {unitIds.map((id) =>
              <option key={id} value={id}>
                  {'· '.repeat(Math.max(0, unitPath(id).length - unitPath(unitIds[0]).length))}
                  {findUnit(id)?.name ?? id}
                </option>
              )}
            </Select>
          </FormField>
          <label className="flex items-center gap-2.5 self-end pb-2.5 text-[14px] text-gray-700">
            <input type="checkbox" checked={form.includeChildren} onChange={(e) => set('includeChildren', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            Áp dụng cho cả đơn vị trực thuộc
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Hạn thẩm định" htmlFor="pf-appraisal" hint="Để trống nếu chưa có căn cứ.">
            <input id="pf-appraisal" type="date" value={form.appraisalDeadline} onChange={(e) => set('appraisalDeadline', e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Hạn báo cáo cấp trên" htmlFor="pf-report" hint="Để trống nếu chưa có căn cứ.">
            <input id="pf-report" type="date" value={form.reportDeadline} onChange={(e) => set('reportDeadline', e.target.value)} className={inputClass} />
          </FormField>
        </div>

        <p className="text-[13px] text-gray-500">
          Hạn gửi tự đánh giá cấu hình riêng theo loại hồ sơ hoặc đối tượng ở trang chi tiết kỳ, kèm căn cứ. Hệ thống không tự suy diễn hạn.
        </p>

        <div className="rounded-md border border-gray-200 px-3 py-2.5 text-[13px]">
          <span className="text-gray-500">Tên kỳ: </span>
          <span className="font-semibold text-gray-900">{form.unitId ? periodName(form.kind, form.year, form.index, form.unitId) : '—'}</span>
        </div>

        {tried && (errors.overlap || errors.past) &&
        <p role="alert" className="rounded-md bg-brand-50 px-3 py-2 text-[13px] text-brand-700">
            {errors.overlap ?? errors.past}
          </p>
        }
      </div>
    </Modal>);

}