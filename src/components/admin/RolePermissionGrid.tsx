import React, { useMemo, useState } from 'react';
import { CheckIcon, MinusIcon, SearchIcon } from 'lucide-react';
import { featureGroups, featureLabels } from '../../data/roles';
import { actionChips, featureDescriptions } from '../../data/permissions';
import { ACTIONS, featureActions, grantedCount, setAction, setAllFeatures, setColumnAll, setFeatureAll, totalPermissionCount } from '../../utils/permissions';
import { normalize } from '../../utils/org';
import { FeatureId, RoleFeatures, RoleId } from '../../types/access';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';

type RolePermissionGridProps = {
  value: RoleFeatures[RoleId];
  editing: boolean;
  onChange: (next: RoleFeatures[RoleId]) => void;
  /** Chỉ hiện chức năng đã được cấp ít nhất một thao tác (khi xem) */
  grantedOnly?: boolean;
};

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700';
const smallBtn =
'inline-flex h-8 items-center whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50';

/** Bảng quyền của một vai trò: mỗi dòng một chức năng, mỗi cột một thao tác */
export function RolePermissionGrid({ value, editing, onChange, grantedOnly }: RolePermissionGridProps) {
  const [filter, setFilter] = useState('');
  const q = normalize(filter.trim());

  const groups = useMemo(
    () =>
    featureGroups.
    map((g) => ({
      ...g,
      features: g.features.filter(
        (f) => (!grantedOnly || editing || (value[f]?.length ?? 0) > 0) && (!q || normalize(`${featureLabels[f]} ${featureDescriptions[f]}`).includes(q))
      )
    })).
    filter((g) => g.features.length),
    [grantedOnly, editing, value, q]
  );
  const shown: FeatureId[] = groups.flatMap((g) => g.features);
  const granted = grantedCount(value);

  // Ô "chọn tất cả" của cột / dòng: tick khi đủ, gạch ngang khi một phần
  const columnState = (a: (typeof ACTIONS)[number]) => {
    const applicable = shown.filter((f) => featureActions[f].includes(a));
    const on = applicable.filter((f) => value[f]?.includes(a)).length;
    return { on, total: applicable.length };
  };
  const rowState = (f: FeatureId) => ({ on: value[f]?.length ?? 0, total: featureActions[f].length });
  const allShown = shown.reduce((n, f) => n + featureActions[f].length, 0);
  const allOn = shown.reduce((n, f) => n + (value[f]?.length ?? 0), 0);

  return (
    <div>
      {editing &&
      <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Lọc theo chức năng"
            aria-label="Lọc theo chức năng"
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-[14px] text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <p className="mr-1 text-[13px] text-gray-500" aria-live="polite">
              <span className="font-semibold tabular-nums text-gray-900">{granted}</span>
              <span className="tabular-nums">/{totalPermissionCount}</span> quyền đã cấp
            </p>
            <button type="button" onClick={() => onChange(setAllFeatures(value, shown, true))} disabled={allOn === allShown} className={smallBtn} style={{ transition: 'background-color 150ms ease-out' }}>
              Cấp tất cả
            </button>
            <button
            type="button"
            onClick={() => onChange(setAllFeatures(value, shown, false))}
            disabled={allOn === 0}
            className="inline-flex h-8 items-center whitespace-nowrap rounded-md px-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
            
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      }

      {!groups.length ?
      <p className="rounded-md border border-dashed border-gray-300 px-4 py-8 text-center text-[14px] text-gray-500">
          {q ? `Không có chức năng khớp “${filter.trim()}”.` : 'Vai trò chưa được cấp quyền nào.'}
        </p> :

      <div className="overflow-hidden rounded-md border border-gray-200">
          <HorizontalSwipe containerProps={{ 'aria-label': 'Quyền của vai trò' }}>
            <table className="w-full min-w-[760px] border-collapse text-[14px] text-gray-700">
              <thead>
                <tr>
                  <th scope="col" className={`${th} w-[30%]`}>
                    {editing ?
                  <label className="flex cursor-pointer items-center gap-2.5">
                        <TriCheckbox on={allOn} total={allShown} onChange={(on) => onChange(setAllFeatures(value, shown, on))} label="Chọn tất cả chức năng đang hiển thị" />
                        Chức năng
                      </label> :

                  'Chức năng'
                  }
                  </th>
                  <th scope="col" className={th}>
                    Mô tả
                  </th>
                  {ACTIONS.map((a) => {
                  const s = columnState(a);
                  return (
                    <th key={a} scope="col" className={`${th} w-28 text-center`}>
                        <span className="block">{actionChips[a]}</span>
                        {editing &&
                      <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-normal tabular-nums text-gray-500">
                            <TriCheckbox on={s.on} total={s.total} onChange={(on) => onChange(setColumnAll(value, shown, a, on))} label={`Chọn cả cột ${actionChips[a]}`} />
                            {s.on}/{s.total}
                          </label>
                      }
                      </th>);

                })}
                </tr>
              </thead>
              <tbody>
                {groups.map((g) =>
              <React.Fragment key={g.label}>
                    <tr>
                      <th scope="rowgroup" colSpan={2 + ACTIONS.length} className="border-b border-gray-200 bg-gray-50/60 px-3 py-1.5 text-left text-[12px] font-semibold text-gray-500">
                        {g.label}
                      </th>
                    </tr>
                    {g.features.map((f) => {
                  const held = value[f] ?? [];
                  const r = rowState(f);
                  return (
                    <tr key={f} className={`border-b border-gray-200 last:border-b-0 ${editing && r.on ? 'bg-brand-50/40' : ''}`} style={{ transition: 'background-color 120ms ease-out' }}>
                          <th scope="row" className="px-3 py-2.5 text-left font-medium text-gray-900">
                            {editing ?
                        <label className="flex cursor-pointer items-center gap-2.5">
                                <TriCheckbox on={r.on} total={r.total} onChange={(on) => onChange(setFeatureAll(value, f, on))} label={`Cấp mọi thao tác · ${featureLabels[f]}`} />
                                {featureLabels[f]}
                              </label> :

                        featureLabels[f]
                        }
                          </th>
                          <td className="px-3 py-2.5 text-[13px] text-gray-500">{featureDescriptions[f]}</td>
                          {ACTIONS.map((a) => {
                        const applicable = featureActions[f].includes(a);
                        const on = held.includes(a);
                        return (
                          <td key={a} className="px-3 py-2.5 text-center">
                                {!applicable ?
                            <span className="text-gray-300" aria-label="Không áp dụng">
                                    —
                                  </span> :
                            editing ?
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={(e) => onChange(setAction(value, f, a, e.target.checked))}
                              aria-label={`${actionChips[a]} · ${featureLabels[f]}`}
                              className="theme-check" /> :

                            on ?
                            <CheckIcon className="mx-auto h-4 w-4 text-brand-600" aria-label="Có" /> :

                            <MinusIcon className="mx-auto h-4 w-4 text-gray-300" aria-label="Không" />
                            }
                              </td>);

                      })}
                        </tr>);

                })}
                  </React.Fragment>
              )}
              </tbody>
            </table>
          </HorizontalSwipe>
        </div>
      }
    </div>);

}

/** Ô chọn ba trạng thái: trống / một phần (gạch ngang) / đủ */
function TriCheckbox({ on, total, onChange, label }: {on: number;total: number;onChange: (on: boolean) => void;label: string;}) {
  return (
    <input
      type="checkbox"
      ref={(el) => {
        if (el) el.indeterminate = on > 0 && on < total;
      }}
      checked={total > 0 && on === total}
      disabled={total === 0}
      onChange={() => onChange(on < total)}
      aria-label={label}
      className="theme-check" />);


}