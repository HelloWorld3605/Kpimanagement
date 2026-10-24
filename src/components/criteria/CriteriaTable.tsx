import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, LockIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { CriteriaSection, Criterion, CriterionDiff } from '../../types/criteria';
import { newId, sectionTotal, toRoman, versionTotal } from '../../utils/criteria';
import { AutoTextarea } from './AutoTextarea';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';

type CriteriaTableProps = {
  sections: CriteriaSection[];
  diff: Record<string, CriterionDiff> | null;
  prevLabel?: string;
  requiredTotal: number;
  editable: boolean;
  onChange?: (sections: CriteriaSection[]) => void;
};

const cell = 'border border-gray-800 px-3 py-2.5 align-top';
const lineInput =
'w-full bg-transparent font-serif text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none';
const iconBtn =
'flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

export function CriteriaTable({ sections, diff, prevLabel, requiredTotal, editable, onChange }: CriteriaTableProps) {
  const total = versionTotal(sections);
  const emit = (next: CriteriaSection[]) => onChange?.(next);

  const updateSection = (si: number, patch: Partial<CriteriaSection>) =>
  emit(sections.map((s, i) => i === si ? { ...s, ...patch } : s));
  const updateCriterion = (si: number, ci: number, patch: Partial<Criterion>) =>
  updateSection(si, { criteria: sections[si].criteria.map((c, i) => i === ci ? { ...c, ...patch } : c) });
  const moveCriterion = (si: number, ci: number, d: number) => {
    const list = [...sections[si].criteria];
    [list[ci], list[ci + d]] = [list[ci + d], list[ci]];
    updateSection(si, { criteria: list });
  };
  const addCriterion = (si: number) =>
  updateSection(si, { criteria: [...sections[si].criteria, { id: newId('c'), content: '', score: 0, guaranteed: false }] });
  const addSection = () => emit([...sections, { id: newId('s'), title: '', criteria: [{ id: newId('c'), content: '', score: 0, guaranteed: false }] }]);

  return (
    <div>
      <HorizontalSwipe containerProps={{ 'aria-label': 'Bảng tiêu chí' }}>
      <table className="w-full min-w-[620px] border-collapse font-serif text-[15px] text-gray-900">
        <thead>
          <tr>
            <th className={`${cell} w-24 text-center align-middle font-bold`}>Mã</th>
            <th className={`${cell} text-center align-middle font-bold`}>Nội dung tiêu chí</th>
            <th className={`${cell} w-28 text-center align-middle font-bold`}>Điểm tối đa</th>
            {editable && <th className="w-[100px]" aria-label="Thao tác" />}
          </tr>
        </thead>
        <tbody>
          {sections.map((s, si) =>
            <React.Fragment key={s.id}>
              <tr>
                <td className={`${cell} text-center font-bold`}>{toRoman(si + 1)}</td>
                <td className={`${cell} font-bold`}>
                  {editable ?
                  <input
                    aria-label={`Tên nhóm ${toRoman(si + 1)}`}
                    value={s.title}
                    placeholder="Tên nhóm tiêu chí"
                    onChange={(e) => updateSection(si, { title: e.target.value })}
                    className={`${lineInput} font-bold ${!s.title.trim() ? 'border-b border-dashed border-brand-500' : ''}`} /> :


                  s.title
                  }
                </td>
                <td className={`${cell} text-center font-bold tabular-nums`}>{sectionTotal(s)}</td>
                {editable &&
                <td className="px-2 align-middle">
                    <div className="flex items-center gap-0.5">
                      <button type="button" aria-label="Thêm tiêu chí vào nhóm" title="Thêm tiêu chí" className={iconBtn} onClick={() => addCriterion(si)}>
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button
                      type="button"
                      aria-label="Xoá nhóm"
                      title="Xoá nhóm"
                      className={`${iconBtn} hover:bg-brand-50 hover:text-brand-600`}
                      disabled={sections.length === 1}
                      onClick={() => emit(sections.filter((_, i) => i !== si))}>
                      
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                }
              </tr>
              {s.criteria.map((c, ci) => {
                const d = diff?.[c.id];
                return (
                  <tr key={c.id} className={d ? 'bg-warning-50/70' : ''}>
                    <td className={`${cell} text-center`}>
                      <div>
                        TC{si + 1}.{ci + 1}
                      </div>
                      {d?.isNew && <Tag tone="new">Mới</Tag>}
                      {!d?.isNew && d?.contentChanged && <Tag tone="edit">Sửa</Tag>}
                    </td>
                    <td className={cell}>
                      {editable ?
                      <div className="flex items-start gap-2">
                          <AutoTextarea
                          aria-label={`Nội dung TC${si + 1}.${ci + 1}`}
                          value={c.content}
                          placeholder="Nội dung tiêu chí"
                          onChange={(e) => updateCriterion(si, ci, { content: e.target.value })}
                          className={`${lineInput} flex-1 leading-6 ${!c.content.trim() ? 'border-b border-dashed border-brand-500' : ''}`} />
                        
                          <label className="mt-1 flex shrink-0 cursor-pointer items-center gap-1 font-sans text-xs text-gray-500" title="Tiêu chí đảm bảo">
                            <input
                            type="checkbox"
                            checked={c.guaranteed}
                            onChange={(e) => updateCriterion(si, ci, { guaranteed: e.target.checked })}
                            className="h-3.5 w-3.5 accent-brand-600" />
                          
                            <LockIcon className={`h-3.5 w-3.5 ${c.guaranteed ? 'text-gray-700' : 'text-gray-300'}`} />
                          </label>
                        </div> :

                      <span>
                          {c.content}
                          {c.guaranteed && <LockIcon className="ml-1.5 inline h-3.5 w-3.5 -translate-y-0.5 text-gray-500" aria-label="Tiêu chí đảm bảo" />}
                        </span>
                      }
                    </td>
                    <td className={`${cell} text-center tabular-nums`}>
                      {d?.prevScore !== undefined &&
                      <div className="font-sans text-xs text-warning-700">
                          {prevLabel}: <span className="line-through">{d.prevScore}</span>
                        </div>
                      }
                      {editable ?
                      <input
                        type="number"
                        min={0}
                        aria-label={`Điểm tối đa TC${si + 1}.${ci + 1}`}
                        value={Number.isNaN(c.score) ? '' : c.score}
                        onChange={(e) => updateCriterion(si, ci, { score: e.target.value === '' ? NaN : Number(e.target.value) })}
                        className="w-14 border-b border-dashed border-gray-400 bg-transparent text-center font-serif text-[15px] focus:border-brand-500 focus:outline-none" /> :


                      c.score
                      }
                    </td>
                    {editable &&
                    <td className="px-2 align-middle">
                        <div className="flex items-center gap-0.5">
                          <button type="button" aria-label="Chuyển lên" className={iconBtn} disabled={ci === 0} onClick={() => moveCriterion(si, ci, -1)}>
                            <ArrowUpIcon className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Chuyển xuống" className={iconBtn} disabled={ci === s.criteria.length - 1} onClick={() => moveCriterion(si, ci, 1)}>
                            <ArrowDownIcon className="h-4 w-4" />
                          </button>
                          <button
                          type="button"
                          aria-label="Xoá tiêu chí"
                          className={`${iconBtn} hover:bg-brand-50 hover:text-brand-600`}
                          onClick={() => updateSection(si, { criteria: s.criteria.filter((_, i) => i !== ci) })}>
                          
                            <Trash2Icon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    }
                  </tr>);

              })}
            </React.Fragment>
            )}
          <tr>
            <td className={cell} />
            <td className={`${cell} text-center font-bold`}>TỔNG CỘNG</td>
            <td className={`${cell} text-center font-bold tabular-nums ${total !== requiredTotal ? 'text-brand-600' : ''}`}>
              {total}
              {total !== requiredTotal && <div className="font-sans text-xs font-normal">cần {requiredTotal}</div>}
            </td>
            {editable && <td />}
          </tr>
        </tbody>
      </table>
      </HorizontalSwipe>
      {editable &&
      <button
        type="button"
        onClick={addSection}
        className="mt-3 flex h-9 items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 font-sans text-[14px] font-medium text-gray-700 hover:border-brand-500 hover:text-brand-600"
        style={{ transition: 'color 150ms ease-out, border-color 150ms ease-out' }}>
        
          <PlusIcon className="h-4 w-4" />
          Thêm nhóm tiêu chí
        </button>
      }
    </div>);

}

function Tag({ tone, children }: {tone: 'new' | 'edit';children: React.ReactNode;}) {
  return (
    <span
      className={`mt-1.5 inline-block rounded px-1.5 py-0.5 font-sans text-[11px] font-medium ${
      tone === 'new' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-200'}`
      }>
      
      {children}
    </span>);

}