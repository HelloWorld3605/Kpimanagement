import React from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { LevelPart } from '../../types/scoresheet';
import { Select } from '../ui/Select';
import { exceptionCount, findLevel, levelsFor } from '../../utils/kpi';

type LevelPartsEditorProps = {
  kind: 'q' | 'p';
  parts: LevelPart[];
  /** Số sản phẩm đã hoàn thành; null khi chưa nhập */
  done: number | null;
  point: number;
  editable: boolean;
  label: string;
  onChange: (parts: LevelPart[]) => void;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Khai các sản phẩm không đạt mức 100% (vượt / phải sửa / bị nhắc); phần còn lại tự tính là "Đảm bảo" */
export function LevelPartsEditor({ kind, parts, done, point, editable, label, onChange }: LevelPartsEditorProps) {
  const options = levelsFor(kind, point);
  const used = exceptionCount(parts);
  const ok = done === null ? 0 : done - used;
  const over = done !== null && used > done;

  if (done === null) return <span className="text-gray-300">–</span>;

  if (!editable) {
    if (!parts.length) return <span className="text-gray-700">Đảm bảo</span>;
    return (
      <ul className="space-y-0.5 text-[13px] leading-5">
        {ok > 0 && <li className="text-gray-700">Đảm bảo {pad2(ok)}</li>}
        {parts.map((p, i) => {
          const lv = findLevel(kind, p.pct);
          return (
            <li key={i} className={p.pct > 100 ? 'text-success-700' : 'text-warning-700'}>
              {lv?.short ?? `${p.pct}%`}: {pad2(p.count)} <span className="text-gray-500">({p.pct}%)</span>
            </li>);

        })}
      </ul>);

  }

  const update = (i: number, patch: Partial<LevelPart>) => onChange(parts.map((p, j) => j === i ? { ...p, ...patch } : p));
  const add = () => {
    const first = options.find((o) => !o.over)!;
    onChange([...parts, { count: 1, pct: first.pct, times: first.times }]);
  };

  return (
    <div className="space-y-1.5 text-left">
      <p className={`text-xs ${over ? 'font-medium text-brand-600' : 'text-gray-500'}`}>
        {over ? `Vượt số hoàn thành (${used}/${done})` : `Đảm bảo: ${ok}`}
      </p>
      {parts.map((p, i) =>
      <div key={i} className="flex items-center gap-1">
          <input
          type="number"
          min={1}
          max={done}
          value={p.count}
          onChange={(e) => update(i, { count: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
          aria-label={`${label} — số sản phẩm mức ${i + 1}`}
          className={`h-8 w-12 rounded-md border bg-white px-1.5 text-center text-[13px] tabular-nums text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${
          over ? 'border-brand-500' : 'border-gray-300'}`
          } />
        
          <Select
          value={p.pct}
          onChange={(v) => {
            const lv = options.find((o) => o.pct === Number(v))!;
            update(i, { pct: lv.pct, times: lv.times });
          }}
          aria-label={`${label} — mức ${i + 1}`}
          wrapperClassName="min-w-0 flex-1"
          className="h-8 w-full rounded-md border border-gray-300 bg-white px-1.5 text-[13px] text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100">
          
            {options.map((o) =>
          <option key={o.pct} value={o.pct}>
                {o.label}
              </option>
          )}
          </Select>
          <button
          type="button"
          onClick={() => onChange(parts.filter((_, j) => j !== i))}
          aria-label={`Xoá mức ${i + 1}`}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
          
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {used < done &&
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 rounded text-[13px] font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        
          <PlusIcon className="h-3.5 w-3.5" />
          {kind === 'q' ? 'Khai sửa / vượt mức' : 'Khai nhắc / vượt tiến độ'}
        </button>
      }
    </div>);

}