import React from 'react';
import { CriteriaSection } from '../../types/criteria';
import { Mark } from '../../types/selfReview';
import { CRITERIA_MAX, fmt, sectionAchieved, sectionMax } from '../../utils/selfReview';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';

export type CriteriaLayer = {
  key: string;
  label: string;
  marks?: Record<string, Mark | undefined>;
  /** Lớp đang nhập: chọn Đảm bảo / Không đảm bảo */
  editable?: boolean;
};

type LayerCriteriaTableProps = {
  sections: CriteriaSection[];
  layers: CriteriaLayer[];
  notes?: Record<string, string>;
  onMark?: (id: string, mark: Mark) => void;
};

const th = 'border-b border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-center align-middle text-[13px] font-semibold text-gray-700';
const td = 'border-b border-r border-gray-200 px-3 py-2.5 align-middle';
const score = (marks: Record<string, Mark | undefined> | undefined, id: string, max: number) => !marks?.[id] ? null : marks[id] === 'yes' ? max : 0;

/** Bảng tiêu chí chung với nhiều cột đánh giá (Tự đánh giá · LĐ phòng · LĐ đơn vị); ô khác lớp trước được tô */
export function LayerCriteriaTable({ sections, layers, notes = {}, onMark }: LayerCriteriaTableProps) {
  return (
    <HorizontalSwipe className="overflow-hidden rounded-md border border-gray-200" containerProps={{ 'aria-label': 'Nhóm tiêu chí chung' }}>
      <table className="w-full min-w-[900px] border-collapse text-[14px] text-gray-700 [&_tbody>tr:last-child>*]:border-b-0 [&_tr>*:last-child]:border-r-0">
        <thead>
          <tr>
            <th className={`${th} w-14`}>TT</th>
            <th className={th}>Nội dung</th>
            <th className={`${th} w-20`}>Điểm tối đa</th>
            {layers.map((l) =>
            <th key={l.key} className={`${th} ${l.editable ? 'w-44 text-brand-700' : 'w-28'}`}>
                {l.label}
              </th>
            )}
            <th className={`${th} w-48`}>Ghi chú của cán bộ</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s, si) =>
          <React.Fragment key={s.id}>
              <tr className="bg-gray-50/70 font-semibold text-gray-900">
                <td className={`${td} text-center`}>{si + 1}</td>
                <td className={td}>{s.title}</td>
                <td className={`${td} text-center tabular-nums`}>{sectionMax(s)}</td>
                {layers.map((l) =>
              <td key={l.key} className={`${td} text-center tabular-nums`}>
                    {l.marks ? sectionAchieved(s, l.marks) : '—'}
                  </td>
              )}
                <td className={td} />
              </tr>
              {s.criteria.map((c, ci) =>
            <tr key={c.id}>
                  <td className={`${td} text-center tabular-nums text-gray-500`}>
                    {si + 1}.{ci + 1}
                  </td>
                  <td className={`${td} leading-6 text-gray-900`}>{c.content}</td>
                  <td className={`${td} text-center tabular-nums`}>{c.score}</td>
                  {layers.map((l, li) => {
                const v = score(l.marks, c.id, c.score);
                const prev = li > 0 ? score(layers[li - 1].marks, c.id, c.score) : v;
                const changed = li > 0 && v !== null && prev !== null && v !== prev;
                if (l.editable)
                return (
                  <td key={l.key} className={`${td} ${changed ? 'bg-warning-50' : ''}`}>
                          <div role="radiogroup" aria-label={`${si + 1}.${ci + 1} ${l.label}`} className="flex justify-center gap-1">
                            {(['yes', 'no'] as Mark[]).map((m) => {
                        const on = l.marks?.[c.id] === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => onMark?.(c.id, m)}
                            className={`h-8 rounded-md px-2.5 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                            on ? m === 'yes' ? 'bg-success-600 text-white' : 'bg-brand-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`
                            }
                            style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                            
                                  {m === 'yes' ? `Đạt ${c.score}` : 'Không'}
                                </button>);

                      })}
                          </div>
                        </td>);

                return (
                  <td key={l.key} className={`${td} text-center tabular-nums ${changed ? 'bg-warning-50 font-semibold text-brand-700' : ''}`}>
                        {v === null ? <span className="text-gray-300">–</span> : v}
                      </td>);

              })}
                  <td className={`${td} text-[13px] text-gray-600`}>{notes[c.id]}</td>
                </tr>
            )}
            </React.Fragment>
          )}
          <tr className="bg-gray-50 font-semibold text-gray-900">
            <td className={td} />
            <td className={`${td} text-center`}>Tổng điểm</td>
            <td className={`${td} text-center tabular-nums`}>{CRITERIA_MAX}</td>
            {layers.map((l) =>
            <td key={l.key} className={`${td} text-center tabular-nums ${l.editable ? 'text-brand-700' : ''}`}>
                {l.marks ? fmt(sections.reduce((a, s) => a + sectionAchieved(s, l.marks!), 0)) : '—'}
              </td>
            )}
            <td className={td} />
          </tr>
        </tbody>
      </table>
    </HorizontalSwipe>);

}