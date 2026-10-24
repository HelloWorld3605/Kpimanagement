import React, { useMemo } from 'react';
import { LockIcon } from 'lucide-react';
import { Select } from '../ui/Select';
import { StatusPill } from '../catalog/StatusPill';
import { KpiPeriod, PeriodKind } from '../../types/work';
import { PeriodSlot, periodKindLabels, periodKinds, periodRangeLabel, resolveSlot, slotIndexes, slotLabel, slotShort, unitShort } from '../../utils/period';
import { phaseMeta } from '../../utils/work';

type PeriodPickerProps = {
  /** Kỳ trong phạm vi người xem */
  periods: KpiPeriod[];
  /** Đơn vị người xem — chọn đúng kỳ áp dụng cho đơn vị này */
  unitId?: string;
  value: PeriodSlot;
  onChange: (slot: PeriodSlot) => void;
  /** Cuối dòng thông tin kỳ: nút mở kỳ / tạo kỳ */
  trailing?: (period: KpiPeriod | undefined) => React.ReactNode;
  className?: string;
};

/**
 * Bộ chọn chung "Năm · Loại kỳ · Kỳ". Mỗi ô trỏ tới đúng một kỳ KPI đã tạo.
 * Ô chưa có kỳ hiện mờ — không tự ghép kỳ quý / năm từ các tháng.
 */
export function PeriodPicker({ periods, unitId, value, onChange, trailing, className = 'border-b border-gray-200 px-4 py-3' }: PeriodPickerProps) {
  const years = useMemo(() => {
    const set = new Set<number>([value.year, ...periods.map((p) => p.year)]);
    return [...set].sort((a, b) => b - a);
  }, [periods, value.year]);

  const selected = resolveSlot(periods, value, unitId);

  const setKind = (kind: PeriodKind) => {
    if (kind === value.kind) return;
    const index = kind === 'year' ? 0 : kind === 'quarter' ? Math.max(1, Math.ceil((value.kind === 'month' ? value.index : 3) / 3)) : value.kind === 'quarter' ? value.index * 3 : 1;
    onChange({ kind, year: value.year, index });
  };

  return (
    <section aria-label="Chọn kỳ" className={className}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <div className="flex items-center gap-2">
          <span id="period-year" className="text-[13px] font-medium text-gray-600">
            Năm
          </span>
          <Select value={value.year} onChange={(v) => onChange({ ...value, year: Number(v) })} aria-labelledby="period-year" wrapperClassName="w-[104px]">
            {years.map((y) =>
            <option key={y} value={y}>
                {y}
              </option>
            )}
          </Select>
        </div>

        <div role="radiogroup" aria-label="Loại kỳ" className="flex rounded-md border border-gray-300 p-0.5">
          {periodKinds.map((k) => {
            const active = value.kind === k;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setKind(k)}
                className={`h-8 rounded px-3 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                active ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`
                }
                style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                
                {periodKindLabels[k]}
              </button>);

          })}
        </div>

        <div role="radiogroup" aria-label={`Chọn ${periodKindLabels[value.kind].toLowerCase()}`} className="scrollbar-none flex items-center gap-1 overflow-x-auto">
          {slotIndexes(value.kind).map((i) => {
            const slot = { kind: value.kind, year: value.year, index: i };
            const period = resolveSlot(periods, slot, unitId);
            const active = value.index === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${slotLabel(value.kind, value.year, i)}${period ? '' : ' — chưa có kỳ'}`}
                title={period ? period.name : 'Chưa có kỳ'}
                onClick={() => onChange(slot)}
                className={`h-8 min-w-[40px] shrink-0 rounded-md px-2 text-[13px] font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                active ?
                period ?
                'bg-brand-600 text-white' :
                'border border-dashed border-brand-400 bg-brand-50 text-brand-700' :
                period ?
                'text-gray-800 hover:bg-gray-100' :
                'text-gray-300 hover:bg-gray-50 hover:text-gray-400'}`
                }
                style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                
                {slotShort(value.kind, i, value.year)}
              </button>);

          })}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]" aria-live="polite">
        {selected ?
        <>
            <span className="font-semibold text-gray-900">{slotLabel(selected.kind, selected.year, selected.index)}</span>
            <span className="tabular-nums text-gray-600">Kiểm đếm {periodRangeLabel(selected)}</span>
            {selected.rangeStatus === 'needs-confirmation' && <StatusPill tone="warning">Cần xác nhận nghiệp vụ</StatusPill>}
            <span className="text-gray-500">{unitShort(selected.unitId)}</span>
            <StatusPill tone={phaseMeta[selected.phase].tone}>{phaseMeta[selected.phase].label}</StatusPill>
            {selected.countingLocked &&
          <span className="inline-flex items-center gap-1 text-gray-500">
                <LockIcon className="h-3.5 w-3.5" aria-hidden />
                Đã khoá kiểm đếm
              </span>
          }
          </> :

        <>
            <span className="font-semibold text-gray-500">{slotLabel(value.kind, value.year, value.index)}</span>
            <span className="text-gray-500">Chưa có kỳ — hệ thống không tự ghép kỳ từ các kỳ khác.</span>
          </>
        }
        {trailing && <span className="ml-auto">{trailing(selected)}</span>}
      </div>
    </section>);

}