import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RefreshCwIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';
import { ColumnMenu } from './ColumnMenu';
import { ExportDropdown } from './ExportDropdown';
import { Select } from './Select';
import { TableColumn } from '../../hooks/useTableColumns';
import { ExportFormat } from '../../utils/tableExport';
import { useTableSearch } from '../../contexts/TableSearchContext';

/** Ô chọn trong bảng lọc nâng cao */
export const toolbarField =
'h-10 w-full rounded-md border border-gray-300 bg-white pl-3 text-[14px] text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';
export const toolbarBtn =
'flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

/** Chờ người dùng ngừng gõ rồi mới lọc */
const SEARCH_DELAY = 200;

type TableToolbarProps = {
  query: string;
  onQuery: (q: string) => void;
  placeholder?: string;
  /** Nội dung bảng "Lọc nâng cao" (các FilterField). Không truyền → ẩn nút */
  filters?: React.ReactNode;
  /** Số điều kiện lọc đang bật (không tính ô tìm kiếm) */
  activeFilters?: number;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  /** Đang tải lại do trang tự quản; không truyền thì nút tự quay ngắn */
  refreshing?: boolean;
  columns?: TableColumn[];
  hidden?: Set<string>;
  onToggleColumn?: (id: string) => void;
  onExport?: (format: ExportFormat) => void | Promise<void>;
  /** Sau nút lọc: số bản ghi, ghi chú… */
  leading?: React.ReactNode;
  /** Cuối hàng: Tạo mới, Sửa… */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Thanh công cụ dùng chung phía trên mọi bảng danh sách:
 * Tìm kiếm · Lọc nâng cao — (đẩy phải) Làm mới · Cột · Xuất · thao tác chính.
 * Hàng dưới: thẻ các bộ lọc đang bật, bấm ✕ để bỏ riêng từng bộ lọc.
 */
export function TableToolbar({
  query,
  onQuery,
  placeholder = 'Tìm kiếm…',
  filters,
  activeFilters = 0,
  onClearFilters,
  onRefresh,
  refreshing,
  columns,
  hidden,
  onToggleColumn,
  onExport,
  leading,
  actions,
  className = 'border-b border-gray-200 px-4 py-3'
}: TableToolbarProps) {
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const refresh = () => {
    onRefresh?.();
    setSpinning(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSpinning(false), 500);
  };
  const spin = refreshing ?? spinning;

  /* ----- Ô tìm kiếm: gõ mượt, lọc sau 200ms ----- */
  const [text, setText] = useState(query);
  const sent = useRef(query);
  const onQueryRef = useRef(onQuery);
  onQueryRef.current = onQuery;
  const inputRef = useRef<HTMLInputElement>(null);

  // Trang đổi từ khoá từ bên ngoài (xoá bộ lọc, khôi phục khi quay lại) → cập nhật ô nhập
  useEffect(() => {
    if (query !== sent.current) {
      sent.current = query;
      setText(query);
    }
  }, [query]);

  useEffect(() => {
    if (text === sent.current) return;
    const t = window.setTimeout(() => {
      sent.current = text;
      onQueryRef.current(text);
    }, SEARCH_DELAY);
    return () => window.clearTimeout(t);
  }, [text]);

  const flush = (value: string) => {
    sent.current = value;
    onQueryRef.current(value);
  };

  // Báo từ khoá cho khung bảng để tô chữ trùng
  const { setQuery: publishQuery } = useTableSearch();
  useEffect(() => {
    publishQuery(query);
  }, [query, publishQuery]);
  useEffect(() => () => publishQuery(''), [publishQuery]);

  // Phím "/" nhảy vào ô tìm kiếm
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const input = inputRef.current;
      if (!input || !input.offsetParent) return;
      e.preventDefault();
      input.focus();
      input.select();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const chips = filters ? collectChips(filters) : [];

  return (
    <div role="search" className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      <div className="relative w-full min-w-[200px] sm:max-w-md sm:flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') flush(text);
            if (e.key === 'Escape' && text) {
              e.stopPropagation();
              setText('');
              flush('');
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-keyshortcuts="/"
          className="peer h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-9 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        
        {!text &&
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 min-w-[20px] -translate-y-1/2 items-center justify-center rounded border border-gray-300 bg-gray-50 px-1 font-sans text-[11px] text-gray-500 peer-focus:hidden">
          
            /
          </kbd>
        }
      </div>
      {filters &&
      <FilterPopover active={activeFilters} onClear={onClearFilters}>
          {filters}
        </FilterPopover>
      }
      {leading}

      <div className="ml-auto flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={refresh} aria-label="Làm mới" title="Làm mới" className={`${toolbarBtn} w-10 justify-center px-0`} style={{ transition: 'background-color 150ms ease-out' }}>
          <RefreshCwIcon className={`h-4 w-4 ${spin ? 'animate-spin' : ''}`} aria-hidden />
        </button>
        {columns && hidden && onToggleColumn && <ColumnMenu columns={columns} hidden={hidden} onToggle={onToggleColumn} buttonClassName={toolbarBtn} />}
        {onExport && <ExportDropdown onExport={onExport} buttonClassName={toolbarBtn} />}
        {actions}
      </div>

      {chips.length > 0 &&
      <ul aria-label="Bộ lọc đang bật" className="flex basis-full flex-wrap items-center gap-1.5">
          {chips.map((c) =>
        <li key={c.key}>
              <span className="inline-flex h-7 items-center gap-1 rounded-md border border-brand-200 bg-brand-50 pl-2.5 pr-1 text-[13px] text-brand-800">
                <span className="text-brand-700">{c.label}:</span>
                <span className="max-w-[220px] truncate font-medium">{c.value}</span>
                <button
              type="button"
              onClick={c.onRemove}
              aria-label={`Bỏ lọc ${c.label}: ${c.value}`}
              className="ml-0.5 rounded p-0.5 text-brand-600 hover:bg-brand-100 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{ transition: 'background-color 120ms ease-out, color 120ms ease-out' }}>
              
                  <XIcon className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            </li>
        )}
          {chips.length > 1 && onClearFilters &&
        <li>
              <button
            type="button"
            onClick={onClearFilters}
            className="h-7 rounded px-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ transition: 'color 120ms ease-out' }}>
            
                Xoá tất cả
              </button>
            </li>
        }
        </ul>
      }
    </div>);

}

/** Một điều kiện trong bảng Lọc nâng cao */
export function FilterField({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-gray-700">{label}</p>
      {children}
    </div>);

}

/* ---------- Thẻ bộ lọc: đọc thẳng từ các FilterField + Select đã truyền vào ---------- */

type Chip = {key: string;label: string;value: string;onRemove: () => void;};
type SelectProps = {value?: unknown;onChange?: (v: string) => void;children?: React.ReactNode;};

const textOf = (node: React.ReactNode) =>
React.Children.toArray(node).
map((x) => typeof x === 'string' || typeof x === 'number' ? String(x) : '').
join('');

/** Tìm nhãn của lựa chọn đang chọn; hasEmpty = có lựa chọn "Tất cả" (value rỗng) → bộ lọc bỏ được */
function scanOptions(children: React.ReactNode, value: string, acc: {label?: string;hasEmpty: boolean;}) {
  React.Children.forEach(children, (c) => {
    if (!React.isValidElement(c)) return;
    const p = c.props as {value?: unknown;children?: React.ReactNode;};
    if (c.type === 'option') {
      const v = p.value !== undefined ? String(p.value) : textOf(p.children);
      if (v === '') acc.hasEmpty = true;
      if (v === value && acc.label === undefined) acc.label = textOf(p.children);
    } else {
      scanOptions(p.children, value, acc);
    }
  });
  return acc;
}

function collectChips(node: React.ReactNode): Chip[] {
  const out: Chip[] = [];
  const walk = (n: React.ReactNode, label?: string) => {
    React.Children.forEach(n, (child) => {
      if (!React.isValidElement(child)) return;
      const props = child.props as {label?: string;children?: React.ReactNode;} & SelectProps;
      if (child.type === FilterField) {
        walk(props.children, props.label);
        return;
      }
      if (child.type === Select && label && props.onChange) {
        const value = props.value == null ? '' : String(props.value);
        if (!value) return;
        const found = scanOptions(props.children, value, { hasEmpty: false });
        if (!found.hasEmpty) return;
        const onChange = props.onChange;
        out.push({ key: `${label}:${value}`, label, value: found.label ?? value, onRemove: () => onChange('') });
        return;
      }
      walk(props.children, label);
    });
  };
  walk(node);
  return out;
}

function FilterPopover({ active, onClear, children }: {active: number;onClear?: () => void;children: React.ReactNode;}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element;
      // Danh sách của ô chọn bên trong cũng là lớp nổi riêng → không coi là bấm ra ngoài
      if (anchor?.contains(t) || t.closest?.('[data-floating-panel]')) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[data-floating-panel] [role="listbox"]')) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, anchor]);

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`${toolbarBtn} ${open || active ? 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-50' : ''}`}
        style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
        
        <SlidersHorizontalIcon className="h-4 w-4" aria-hidden />
        Lọc nâng cao
        {active > 0 &&
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-semibold tabular-nums text-white">
            {active}
          </span>
        }
      </button>
      <AnimatePresence>
        {open &&
        <FloatingPanel anchor={anchor} panelRef={panelRef} fit="content" maxWidth={380} maxHeight={520}>
            <div role="dialog" aria-label="Lọc nâng cao" className="flex w-[340px] max-w-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
                <p className="text-[14px] font-semibold text-gray-900">Lọc nâng cao</p>
                <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">{children}</div>
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2.5">
                <button
                type="button"
                onClick={onClear}
                disabled={!active || !onClear}
                className="rounded text-[13px] font-medium text-brand-600 hover:text-brand-800 disabled:cursor-not-allowed disabled:text-gray-300">
                
                  Xoá bộ lọc
                </button>
                <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 rounded-md bg-brand-600 px-3 text-[13px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                style={{ transition: 'background-color 150ms ease-out' }}>
                
                  Xong
                </button>
              </div>
            </div>
          </FloatingPanel>
        }
      </AnimatePresence>
    </>);

}