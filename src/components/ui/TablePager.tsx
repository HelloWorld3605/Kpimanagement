import React, { useId, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Select } from './Select';
import { TableDensity, useTableDensity } from '../../hooks/useTableDensity';

type TablePagerProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  pageSizes?: number[];
  className?: string;
};

const navBtn =
'inline-flex h-8 items-center gap-1.5 rounded px-2 text-[13px] text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent';

const densities: {id: TableDensity;label: string;}[] = [
{ id: 'comfortable', label: 'Thường' },
{ id: 'compact', label: 'Gọn' }];


/**
 * Thanh chuyển trang dùng chung, dính đáy màn hình khi bảng dài hơn màn hình.
 * Trước / Tiếp bên trái; mật độ dòng, số dòng mỗi trang và tổng bản ghi bên phải.
 */
export function TablePager({ total, page, pageSize, onPageChange, onPageSizeChange, pageSizes = [10, 20, 50], className = 'mx-4 mb-4 mt-3' }: TablePagerProps) {
  const sizeId = useId();
  const navRef = useRef<HTMLElement>(null);
  const [density, setDensity] = useTableDensity();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  // Sang trang khác: đưa đầu bảng về ngay dưới thanh trên cùng để đọc từ dòng đầu
  const revealTableTop = () => {
    requestAnimationFrame(() => {
      const frame = navRef.current?.parentElement?.querySelector<HTMLElement>('[data-table-frame]');
      const scroller = frame && findScrollParent(frame);
      if (!frame || !scroller) return;
      const stickyTop = parseFloat(getComputedStyle(frame).getPropertyValue('--table-sticky-top')) || 0;
      const delta = frame.getBoundingClientRect().top - scroller.getBoundingClientRect().top - stickyTop - 8;
      if (delta < 0) scroller.scrollTo({ top: scroller.scrollTop + delta });
    });
  };

  return (
    <nav
      ref={navRef}
      aria-label="Phân trang"
      className={`sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 ${className}`}>
      
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={navBtn}
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
            revealTableTop();
          }}
          style={{ transition: 'background-color 150ms ease-out' }}>
          
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          Trước
        </button>
        <button
          type="button"
          className={navBtn}
          disabled={page >= pageCount}
          onClick={() => {
            onPageChange(page + 1);
            revealTableTop();
          }}
          style={{ transition: 'background-color 150ms ease-out' }}>
          
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
          Tiếp
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-700">
        <div role="radiogroup" aria-label="Mật độ dòng" className="hidden items-center border border-gray-300 sm:flex">
          {densities.map((d) => {
            const on = density === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setDensity(d.id)}
                className={`h-8 whitespace-nowrap px-2.5 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                on ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`
                }
                style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                
                {d.label}
              </button>);

          })}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={sizeId} className="whitespace-nowrap">
            Hiển thị
          </label>
          <Select
            id={sizeId}
            value={pageSize}
            onChange={(v) => {
              onPageSizeChange(Number(v));
              revealTableTop();
            }}
            className="h-8 w-24 rounded border border-gray-300 bg-white pl-2.5 text-[13px] text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100">
            
            {pageSizes.map((s) =>
            <option key={s} value={s}>
                {s}
              </option>
            )}
          </Select>
          <span className="whitespace-nowrap tabular-nums">
            {total === 0 ?
            '0 bản ghi' :

            <>
                {from}–{to} trên <span className="font-semibold text-gray-900">{total}</span>
              </>
            }
          </span>
        </div>
      </div>
    </nav>);

}

function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}