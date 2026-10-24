import React, { useEffect, useRef } from 'react';
import { ArrowDownIcon, ArrowUpIcon, CornerDownRightIcon, IndentDecreaseIcon, IndentIncreaseIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { DraftRow, RowChange, levelShort, unitLevels } from '../../utils/orgEditor';
import { UnitLevel } from '../../types/org';

type OrgEditorRowProps = {
  row: DraftRow;
  number: string;
  change: RowChange;
  error?: string;
  staff: number;
  active: boolean;
  autoFocus: boolean;
  onFocused: () => void;
  onActivate: () => void;
  onEdit: (patch: Partial<DraftRow>) => void;
  onSnapshot: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddSibling: () => void;
  onAddChild: () => void;
  onRemove: () => void;
};

const changeMeta: Record<Exclude<RowChange, null>, {label: string;cls: string;}> = {
  new: { label: 'Mới', cls: 'bg-success-50 text-success-700' },
  edited: { label: 'Đã sửa', cls: 'bg-warning-50 text-warning-700' },
  moved: { label: 'Đã chuyển', cls: 'bg-warning-50 text-warning-700' }
};

const cell = 'h-8 w-full rounded border bg-white px-2 text-[14px] text-gray-900 focus:outline-none focus:ring-2';
const iconBtn =
'flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-30';
const iconTransition = { transition: 'background-color 120ms ease-out, color 120ms ease-out' };

export function OrgEditorRow(p: OrgEditorRowProps) {
  const { row, number, change, error, staff, active } = p;
  const isRoot = row.depth === 0;
  const nameRef = useRef<HTMLInputElement>(null);
  const typing = useRef(false);

  useEffect(() => {
    if (!p.autoFocus) return;
    nameRef.current?.focus();
    nameRef.current?.scrollIntoView({ block: 'nearest' });
    p.onFocused();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.autoFocus]);

  // Một bước hoàn tác cho mỗi lượt gõ vào một ô
  const beginTyping = () => {
    if (typing.current) return;
    typing.current = true;
    p.onSnapshot();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.shiftKey || isRoot ? p.onAddChild() : p.onAddSibling();
    } else if (e.key === 'Tab' && !isRoot && e.currentTarget === nameRef.current) {
      e.preventDefault();
      e.shiftKey ? p.onOutdent() : p.onIndent();
    } else if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      p.onMoveUp();
    } else if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      p.onMoveDown();
    } else if (e.key === 'Backspace' && !row.name && !isRoot && e.currentTarget === nameRef.current) {
      e.preventDefault();
      p.onRemove();
    }
  };

  return (
    <tr
      className={`group border-b border-gray-100 align-top ${active ? 'bg-brand-50/60' : ''}`}
      onFocusCapture={p.onActivate}
      onBlurCapture={() => typing.current = false}>
      
      <td className="whitespace-nowrap px-2 py-1.5 pt-3 text-[12px] tabular-nums text-gray-500">{isRoot ? 'Gốc' : number}</td>
      <td className="px-2 py-1.5">
        <div className="flex items-start" style={{ paddingLeft: row.depth * 20 }}>
          {!isRoot && <CornerDownRightIcon className="mr-1 mt-2 h-4 w-4 shrink-0 text-gray-300" aria-hidden />}
          <div className="min-w-0 flex-1">
            <input
              ref={nameRef}
              value={row.name}
              onChange={(e) => {
                beginTyping();
                p.onEdit({ name: e.target.value });
              }}
              onKeyDown={onKeyDown}
              aria-label={`Tên đơn vị ${number || 'gốc'}`}
              aria-invalid={Boolean(error)}
              placeholder="Tên đơn vị"
              className={`${cell} ${isRoot ? 'font-semibold' : ''} ${error ? 'border-brand-500 focus:ring-brand-100' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100'}`} />
            
            {error && <p className="mt-0.5 text-[12px] text-brand-600">{error}</p>}
          </div>
        </div>
      </td>
      <td className="px-2 py-1.5">
        <input
          value={row.shortName}
          onChange={(e) => {
            beginTyping();
            p.onEdit({ shortName: e.target.value });
          }}
          onKeyDown={onKeyDown}
          aria-label="Tên viết tắt"
          placeholder="—"
          className={`${cell} border-gray-300 focus:border-brand-500 focus:ring-brand-100`} />
        
      </td>
      <td className="px-2 py-1.5">
        <select
          value={row.level}
          onChange={(e) => {
            p.onSnapshot();
            p.onEdit({ level: e.target.value as UnitLevel });
          }}
          aria-label="Cấp đơn vị"
          className={`${cell} border-gray-300 focus:border-brand-500 focus:ring-brand-100`}>
          
          {unitLevels.map((l) =>
          <option key={l} value={l}>
              {levelShort(l)}
            </option>
          )}
        </select>
      </td>
      <td className="whitespace-nowrap px-2 py-1.5 pt-3 text-right text-[13px] tabular-nums text-gray-600">{staff || <span className="text-gray-300">0</span>}</td>
      <td className="whitespace-nowrap px-2 py-1.5 pt-2.5">
        {change && <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${changeMeta[change].cls}`}>{changeMeta[change].label}</span>}
      </td>
      <td className="px-1 py-1.5">
        <div className="flex items-center justify-end gap-0.5">
          <button type="button" onClick={p.onOutdent} disabled={isRoot || row.depth <= 1} aria-label="Thụt ra (lên một cấp)" title="Thụt ra · Shift+Tab" className={iconBtn} style={iconTransition}>
            <IndentDecreaseIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={p.onIndent} disabled={isRoot} aria-label="Thụt vào (thành trực thuộc đơn vị trên)" title="Thụt vào · Tab" className={iconBtn} style={iconTransition}>
            <IndentIncreaseIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={p.onMoveUp} disabled={isRoot} aria-label="Chuyển lên" title="Chuyển lên · Alt+↑" className={iconBtn} style={iconTransition}>
            <ArrowUpIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={p.onMoveDown} disabled={isRoot} aria-label="Chuyển xuống" title="Chuyển xuống · Alt+↓" className={iconBtn} style={iconTransition}>
            <ArrowDownIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={p.onAddChild} aria-label="Thêm đơn vị trực thuộc" title="Thêm trực thuộc · Shift+Enter" className={`${iconBtn} text-brand-600`} style={iconTransition}>
            <PlusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={p.onRemove}
            disabled={isRoot}
            aria-label="Xoá đơn vị (kèm trực thuộc)"
            title={staff ? `Còn ${staff} cán bộ — chuyển cán bộ trước khi lưu` : 'Xoá (kèm đơn vị trực thuộc)'}
            className={`${iconBtn} hover:text-brand-700`}
            style={iconTransition}>
            
            <Trash2Icon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>);

}