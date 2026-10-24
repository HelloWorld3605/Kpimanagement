import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FloatingPanel } from '../ui/FloatingPanel';
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';
import { directMembers, findMember, findUnit, normalize } from '../../utils/org';

type MemberMultiSelectProps = {
  id: string;
  value: string[];
  onChange: (ids: string[]) => void;
  unitIds: string[];
  /** Không cho chọn (đã là chủ trì, đã ở danh sách khác…) */
  excludeIds?: string[];
  placeholder?: string;
};

/** Chọn nhiều cán bộ trong một dropdown: người đã chọn hiện thành thẻ trong ô, có nút xoá tất cả. */
export function MemberMultiSelect({ id, value, onChange, unitIds, excludeIds = [], placeholder = 'Chọn cán bộ' }: MemberMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    requestAnimationFrame(() => searchRef.current?.focus());
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    return unitIds.
    map((uid) => ({
      unit: findUnit(uid),
      members: directMembers(uid).filter(
        (m) => !excludeIds.includes(m.id) && (!q || normalize(m.name).includes(q) || normalize(m.position).includes(q))
      )
    })).
    filter((g) => g.unit && g.members.length > 0);
  }, [unitIds, excludeIds, query]);

  const toggle = (mid: string) => onChange(value.includes(mid) ? value.filter((x) => x !== mid) : [...value, mid]);

  return (
    <div ref={rootRef} className="relative">
      <div
        ref={fieldRef}
        className={`flex min-h-[40px] w-full items-center gap-1 rounded border bg-white py-1 pl-1.5 pr-1 ${
        open ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-300'}`
        }>
        
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[30px] min-w-0 flex-1 flex-wrap items-center gap-1 text-left focus:outline-none">
          
          {value.length === 0 && <span className="px-1.5 text-[14px] text-gray-400">{placeholder}</span>}
          {value.map((mid) =>
          <span key={mid} className="inline-flex h-7 items-center gap-1 rounded-sm bg-gray-100 pl-2 pr-1 text-[13px] font-medium text-gray-800">
              {findMember(mid)?.name ?? mid}
              <span
              role="button"
              tabIndex={0}
              aria-label={`Bỏ ${findMember(mid)?.name}`}
              onClick={(e) => {
                e.stopPropagation();
                toggle(mid);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle(mid);
                }
              }}
              className="flex h-5 w-5 items-center justify-center rounded-sm text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
                <XIcon className="h-3.5 w-3.5" />
              </span>
            </span>
          )}
        </button>
        {value.length > 0 &&
        <button
          type="button"
          onClick={() => onChange([])}
          aria-label="Xoá tất cả"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
            <XIcon className="h-4 w-4" />
          </button>
        }
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen((o) => !o)}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-gray-500">
          
          <ChevronDownIcon className="h-4 w-4" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms ease-out' }} />
        </button>
      </div>

      <AnimatePresence>
        {open &&
        <FloatingPanel
          anchor={fieldRef.current}
          panelRef={panelRef}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
            }
          }}>
          
            <div className="relative shrink-0 border-b border-gray-200">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, chức vụ"
              aria-label="Tìm cán bộ"
              className="h-10 w-full bg-transparent pl-9 pr-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none" />
            
            </div>
            <ul id={listId} role="listbox" aria-multiselectable className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
              {groups.length === 0 && <li className="px-3 py-3 text-[13px] text-gray-500">Không có cán bộ phù hợp.</li>}
              {groups.map((g) =>
            <li key={g.unit!.id} role="presentation">
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold text-gray-500">{g.unit!.name}</p>
                  <ul role="group" aria-label={g.unit!.name}>
                    {g.members.map((m) => {
                  const on = value.includes(m.id);
                  return (
                    <li
                      key={m.id}
                      role="option"
                      aria-selected={on}
                      tabIndex={0}
                      onClick={() => toggle(m.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggle(m.id);
                        }
                      }}
                      className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-[14px] focus:outline-none focus-visible:bg-gray-100 ${on ? 'bg-brand-50' : 'hover:bg-gray-50'}`}>
                      
                          <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white'}`}
                        aria-hidden>
                        
                            {on && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className="text-gray-900">{m.name}</span>
                          <span className="truncate text-xs text-gray-500">{m.position}</span>
                        </li>);

                })}
                  </ul>
                </li>
            )}
            </ul>
          </FloatingPanel>
        }
      </AnimatePresence>
    </div>);

}