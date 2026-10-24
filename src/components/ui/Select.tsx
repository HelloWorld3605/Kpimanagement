import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';
import { inputClass, inputErrorClass } from '../catalog/FormField';
import { normalize } from '../../utils/org';

type SelectProps = {
  value: string | number;
  onChange: (value: string) => void;
  /** Dùng <option> / <optgroup> như thẻ select gốc */
  children: React.ReactNode;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Hiện khi giá trị không khớp lựa chọn nào */
  placeholder?: string;
  /** Lớp của ô chọn — mặc định giống ô nhập trong form */
  className?: string;
  /** Lớp của khối bao (độ rộng trong thanh lọc, lưới form…) */
  wrapperClassName?: string;
  /** Hiện ô tìm khi số lựa chọn vượt ngưỡng này */
  searchThreshold?: number;
  /** Mở sẵn danh sách khi vừa hiện (vd. dòng "thêm vai trò") */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type Opt = {value: string;label: string;disabled?: boolean;group?: string;};

/**
 * Ô chọn dùng chung toàn hệ thống: thay cho thẻ select gốc.
 * Danh sách nổi trên mọi lớp (kể cả pop up), tự lật lên khi thiếu chỗ, nở theo nhãn dài,
 * có ô tìm khi nhiều lựa chọn và điều khiển đủ bằng bàn phím.
 */
export function Select({
  value,
  onChange,
  children,
  id,
  disabled,
  invalid,
  placeholder = 'Chọn',
  className = inputClass,
  wrapperClassName = '',
  searchThreshold = 8,
  defaultOpen = false,
  onOpenChange,
  ...aria
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const mounted = useRef(false);

  // Mở sẵn sau khi ô chọn đã có vị trí trên màn hình
  useEffect(() => {
    if (defaultOpen) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted.current) onOpenChange?.(open);else
    mounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ text: '', at: 0 });
  const listId = useId();

  const options = useMemo(() => collectOptions(children), [children]);
  const current = String(value);
  const selected = options.find((o) => o.value === current);
  const searchable = options.length > searchThreshold;

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return q ? options.filter((o) => normalize(o.label).includes(q) || o.group && normalize(o.group).includes(q)) : options;
  }, [options, query]);

  // Mở: đưa vạch chọn về mục đang chọn; đóng: xoá ô tìm
  useEffect(() => {
    if (open) {
      setActive(Math.max(0, visible.findIndex((o) => o.value === current)));
      requestAnimationFrame(() => (searchable ? searchRef.current : listRef.current)?.focus());
    } else setQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) setActive(visible.findIndex((o) => !o.disabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (o: Opt) => {
    if (o.disabled) return;
    if (o.value !== current) onChange(o.value);
    close();
  };

  const move = (dir: 1 | -1) => {
    if (visible.length === 0) return;
    let i = active;
    for (let n = 0; n < visible.length; n++) {
      i = (i + dir + visible.length) % visible.length;
      if (!visible[i].disabled) break;
    }
    setActive(i);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(-1);
        break;
      case 'Home':
        e.preventDefault();
        setActive(visible.findIndex((o) => !o.disabled));
        break;
      case 'End':
        e.preventDefault();
        setActive(visible.length - 1 - [...visible].reverse().findIndex((o) => !o.disabled));
        break;
      case 'Enter':
        e.preventDefault();
        if (visible[active]) choose(visible[active]);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case 'Tab':
        close(false);
        break;
      default:
        // Gõ chữ để nhảy tới lựa chọn (khi không có ô tìm)
        if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          const now = Date.now();
          const t = typeahead.current;
          t.text = now - t.at > 600 ? e.key : t.text + e.key;
          t.at = now;
          const q = normalize(t.text);
          const i = visible.findIndex((o) => !o.disabled && normalize(o.label).startsWith(q));
          if (i >= 0) setActive(i);
        }
    }
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        {...aria}
        className={`${className} relative flex items-center !pr-9 text-left ${invalid ? inputErrorClass : ''} ${
        open ? '!border-brand-500 ring-2 ring-brand-100' : ''}`
        }>
        
        <span className={`block min-w-0 flex-1 truncate ${selected ? '' : 'text-gray-400'}`}>{selected?.label ?? placeholder}</span>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden />
      </button>

      <AnimatePresence>
        {open &&
        <FloatingPanel anchor={triggerRef.current} panelRef={panelRef} fit="content" onKeyDown={onListKey}>
            {searchable &&
          <div className="relative shrink-0 border-b border-gray-200">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhanh"
              aria-label="Tìm trong danh sách"
              aria-controls={listId}
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              className="h-10 w-full bg-transparent pl-9 pr-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none" />
            
              </div>
          }
            <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={aria['aria-label']}
            aria-labelledby={aria['aria-labelledby'] ?? id}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 focus:outline-none">
            
              {visible.length === 0 && <li className="px-3 py-3 text-[13px] text-gray-500">Không có lựa chọn phù hợp.</li>}
              {visible.map((o, i) => {
              const isSelected = o.value === current;
              const showGroup = o.group && o.group !== visible[i - 1]?.group;
              return (
                <React.Fragment key={`${o.group ?? ''}:${o.value}`}>
                    {showGroup &&
                  <li role="presentation" className="px-3 pb-1 pt-2.5 text-xs font-semibold text-gray-500">
                        {o.group}
                      </li>
                  }
                    <li
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={o.disabled || undefined}
                    onMouseMove={() => !o.disabled && active !== i && setActive(i)}
                    onClick={() => choose(o)}
                    className={`relative flex cursor-pointer items-center gap-3 py-2 pr-3 text-[14px] ${o.group ? 'pl-5' : 'pl-3'} ${
                    o.disabled ?
                    'cursor-not-allowed text-gray-300' :
                    isSelected ?
                    `font-semibold text-brand-800 ${active === i ? 'bg-brand-100/70' : 'bg-brand-50'}` :
                    `text-gray-800 ${active === i ? 'bg-gray-100' : ''}`}`
                    }>
                    
                      {/* Vạch vàng bên trái — cùng cách đánh dấu mục đang mở trên sidebar */}
                      {isSelected && <span className="absolute inset-y-0 left-0 w-[3px] bg-gold-400" aria-hidden />}
                      <span className="min-w-0 flex-1 whitespace-normal break-words">{o.label}</span>
                      {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />}
                    </li>
                  </React.Fragment>);

            })}
            </ul>
          </FloatingPanel>
        }
      </AnimatePresence>
    </div>);

}

/** Đọc các thẻ <option> / <optgroup> (kể cả lồng trong mảng, Fragment) thành danh sách phẳng */
function collectOptions(children: React.ReactNode, group?: string): Opt[] {
  const out: Opt[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as {value?: string | number;label?: string;disabled?: boolean;children?: React.ReactNode;};
    if (child.type === React.Fragment) out.push(...collectOptions(props.children, group));else
    if (child.type === 'optgroup') out.push(...collectOptions(props.children, props.label));else
    if (child.type === 'option') {
      const label = textOf(props.children);
      out.push({ value: String(props.value ?? label), label, disabled: props.disabled, group });
    }
  });
  return out;
}

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement(node)) return textOf((node.props as {children?: React.ReactNode;}).children);
  return '';
}