import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, LockIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Select } from '../ui/Select';
import { CustomField } from '../../types/catalog';
import { fieldTypeOptions } from '../../data/taskCatalog';
import { emptyField, fieldErrors, slugify } from '../../utils/catalog';
import { inputClass, inputErrorClass } from './FormField';

type FieldsEditorProps = {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  lockedIds?: Set<string>;
  showErrors?: boolean;
};

const grid =
'grid grid-cols-[minmax(200px,1.4fr)_minmax(160px,1fr)_170px_96px_minmax(120px,0.8fr)_136px] items-start gap-3';
const iconBtn =
'flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

export function FieldsEditor({ fields, onChange, lockedIds, showErrors }: FieldsEditorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const errors = showErrors ? fieldErrors(fields) : {};

  const update = (id: string, patch: Partial<CustomField>) =>
  onChange(fields.map((f) => f.id === id ? { ...f, ...patch } : f));

  const move = (i: number, d: number) => {
    const next = [...fields];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  const toggle = (id: string) =>
  setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const add = () => {
    const f = emptyField();
    onChange([...fields, f]);
  };

  return (
    <div>
      {fields.length > 0 &&
      <div className="overflow-x-auto rounded-md border border-gray-200">
          <div className="min-w-[960px]">
            <div className={`${grid} border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] font-semibold text-gray-700`}>
              <span>Tên trường</span>
              <span>Mã</span>
              <span>Kiểu dữ liệu</span>
              <span>Bắt buộc</span>
              <span>Đơn vị</span>
              <span className="sr-only">Thao tác</span>
            </div>
            {fields.map((f, i) => {
            const locked = lockedIds?.has(f.id) ?? false;
            const isOpen = expanded.has(f.id);
            const err = errors[f.id];
            return (
              <div key={f.id} className="border-b border-gray-100 px-3 py-3 last:border-b-0">
                  <div className={grid}>
                    <div>
                      <input
                      aria-label="Tên trường"
                      value={f.name}
                      placeholder="Ví dụ: Số quyết định"
                      onChange={(e) => {
                        const name = e.target.value;
                        const autoCode = !locked && (f.code === '' || f.code === slugify(f.name));
                        update(f.id, autoCode ? { name, code: slugify(name) } : { name });
                      }}
                      className={`${inputClass} ${err?.name ? inputErrorClass : ''}`} />
                    
                      {err?.name && <p className="mt-1 text-xs text-brand-600">{err.name}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <input
                        aria-label="Mã trường"
                        value={f.code}
                        disabled={locked}
                        placeholder="ma_truong"
                        onChange={(e) => update(f.id, { code: e.target.value.toLowerCase() })}
                        className={`${inputClass} pr-9 font-mono text-[13px] ${err?.code ? inputErrorClass : ''}`} />
                      
                        {locked &&
                      <LockIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-label="Mã đã khoá" />
                      }
                      </div>
                      {err?.code && <p className="mt-1 text-xs text-brand-600">{err.code}</p>}
                    </div>
                    <Select
                    aria-label="Kiểu dữ liệu"
                    value={f.type}
                    onChange={(v) => {
                      const type = v as CustomField['type'];
                      update(f.id, { type, unit: type === 'number' ? f.unit : undefined });
                      if (type === 'select') setExpanded((p) => new Set(p).add(f.id));
                    }}>
                    
                      {fieldTypeOptions.map((o) =>
                    <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                    )}
                    </Select>
                    <label className="flex h-10 cursor-pointer items-center gap-2 text-[14px] text-gray-700">
                      <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) => update(f.id, { required: e.target.checked })}
                      className="h-4 w-4 accent-brand-600" />
                    
                      {f.required ? 'Có' : 'Không'}
                    </label>
                    <input
                    aria-label="Đơn vị"
                    value={f.type === 'number' ? f.unit ?? '' : ''}
                    disabled={f.type !== 'number'}
                    placeholder={f.type === 'number' ? 'người, vụ…' : '—'}
                    onChange={(e) => update(f.id, { unit: e.target.value })}
                    className={inputClass} />
                  
                    <div className="flex h-10 items-center justify-end gap-0.5">
                      <button type="button" aria-label="Chuyển lên" className={iconBtn} disabled={i === 0} onClick={() => move(i, -1)}>
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Chuyển xuống" className={iconBtn} disabled={i === fields.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Thiết lập thêm" aria-expanded={isOpen} className={iconBtn} onClick={() => toggle(f.id)}>
                        <ChevronDownIcon
                        className={`h-4 w-4 ${isOpen ? 'rotate-180' : ''}`}
                        style={{ transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
                      
                      </button>
                      <button
                      type="button"
                      aria-label="Xoá trường"
                      className={`${iconBtn} hover:bg-brand-50 hover:text-brand-600`}
                      onClick={() => onChange(fields.filter((x) => x.id !== f.id))}>
                      
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {isOpen &&
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-[13px] font-medium text-gray-600">Gợi ý khi nhập</span>
                        <input
                      value={f.hint ?? ''}
                      placeholder="Hiện dưới ô nhập ở công việc"
                      onChange={(e) => update(f.id, { hint: e.target.value })}
                      className={inputClass} />
                    
                      </label>
                      {f.type === 'select' &&
                  <label className="block">
                          <span className="mb-1.5 block text-[13px] font-medium text-gray-600">Lựa chọn (phân cách bằng dấu phẩy)</span>
                          <input
                      value={(f.options ?? []).join(',')}
                      placeholder="Công văn, Báo cáo, Tờ trình"
                      onChange={(e) => update(f.id, { options: e.target.value.split(',') })}
                      className={inputClass} />
                    
                        </label>
                  }
                    </div>
                }
                </div>);

          })}
          </div>
        </div>
      }
      <button
        type="button"
        onClick={add}
        className="mt-3 flex h-9 items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 text-[14px] font-medium text-gray-700 hover:border-brand-500 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ transition: 'color 150ms ease-out, border-color 150ms ease-out' }}>
        
        <PlusIcon className="h-4 w-4" />
        Thêm trường
      </button>
    </div>);

}