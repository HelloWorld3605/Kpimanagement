import React, { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { HorizontalSwipe } from './HorizontalSwipe';
import { foldText, useTableSearch } from '../../contexts/TableSearchContext';
import { STICKY_TOP_EVENT, readStickyTop } from '../../utils/stickyTop';

/** Vị trí (1-based) các cột đang ẩn qua nút "Cột" của thanh công cụ bảng */
const HiddenColumnsContext = createContext<number[]>([]);

export function HiddenColumns({ indexes, children }: {indexes: number[];children: React.ReactNode;}) {
  return <HiddenColumnsContext.Provider value={indexes}>{children}</HiddenColumnsContext.Provider>;
}

type TableFrameProps = {
  label: string;
  children: React.ReactNode;
  /** Chừa chỗ phía dưới khung (thanh chuyển trang + lề ≈ 82px); sai số được tự bù khi đo. 0 = không có thanh chuyển trang */
  reserve?: number;
  className?: string;
};

/** Cỡ giao diện chung (html.ui-compact = 80%) — các khoảng ước lượng bên dưới thu theo */
const uiScale = () => parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 0.8;
/** Lề dưới khung nội dung (pb-5) + viền */
const BOTTOM = 18;
/** Chiều cao thanh chuyển trang dính đáy — chân lướt ngang dính ngay phía trên */
const PAGER = 40;

type Layout = {top: number;minHeight?: number;};

type HighlightRegistry = {set: (name: string, h: unknown) => void;delete: (name: string) => void;};
type HighlightCtor = new (...ranges: Range[]) => unknown;

/**
 * Khung bảng dùng chung cho mọi màn danh sách:
 * - Cả trang cuộn dọc, bảng dài theo dữ liệu; tiêu đề cột dính dưới thanh trên cùng.
 * - Bảng rộng hơn khung: lướt ngang bằng HorizontalSwipe (kéo, cuộn ngang, mũi tên + thanh kéo ở chân),
 *   chân lướt dính đáy màn hình ngay trên thanh chuyển trang.
 * - Ít hoặc không có dữ liệu: khung vẫn kéo tới đáy màn hình, trang không cuộn.
 * - Nằm trong một vùng cuộn riêng (cột chi tiết của màn chia đôi): dính theo vùng đó.
 * - Đang tìm kiếm: tô nền chữ trùng từ khoá trong thân bảng (không phân biệt dấu).
 */
export function TableFrame({ label, children, reserve = 82, className = 'mx-4' }: TableFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>({ top: 0 });
  const hiddenCols = useContext(HiddenColumnsContext);
  const { query } = useTableSearch();
  const scope = useId().replace(/[^a-zA-Z0-9]/g, '');
  const highlightName = `ts-${scope}`;
  // Ẩn cột bằng CSS theo vị trí: ô gộp cột (dòng trống, dòng mở rộng) không bị ẩn
  const hideCss = hiddenCols.length ?
  `${hiddenCols.map((n) => `[data-tf="${scope}"] tr > :nth-child(${n}):not([colspan])`).join(',')}{display:none}` :
  '';
  const highlightCss = `::highlight(${highlightName}){background-color:rgb(var(--warning-200));color:rgb(var(--gray-900))}`;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = window.matchMedia('(min-width: 768px)');

    // Đo và bù sai số trong cùng một lượt, trước khi trình duyệt vẽ → khung không giật khi vừa vào trang
    const measure = () => {
      const table = el.querySelector('table');
      const scroller = findScrollParent(el);
      const inApp = !!scroller?.hasAttribute('data-app-scroll');
      const top = inApp ? readStickyTop(scroller) : 0;

      if (!scroller || !inApp || !media.matches) {
        el.style.minHeight = '';
        setLayout({ top });
        return;
      }
      const offset = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      let minHeight = Math.max(200, Math.floor(scroller.clientHeight - offset - BOTTOM - reserve * uiScale()));
      el.style.minHeight = `${minHeight}px`;
      // Ước lượng lệch vài px khiến trang có thanh cuộn dù bảng ít dòng → trừ thẳng phần tràn
      const overflow = scroller.scrollHeight - scroller.clientHeight;
      const natural = table?.offsetHeight ?? 0;
      if (overflow > 0 && natural < minHeight) {
        const fix = Math.min(overflow, minHeight - Math.max(natural, 200));
        if (fix > 0) minHeight -= fix;
      }
      el.style.minHeight = `${minHeight}px`;
      setLayout({ top, minHeight });
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (el.parentElement) observer.observe(el.parentElement);
    const table = el.querySelector('table');
    if (table) observer.observe(table);
    window.addEventListener('resize', measure);
    window.addEventListener(STICKY_TOP_EVENT, measure);
    media.addEventListener('change', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener(STICKY_TOP_EVENT, measure);
      media.removeEventListener('change', measure);
    };
  }, [reserve]);

  // Tô chữ trùng bằng CSS Custom Highlight (không đụng vào DOM của bảng); trình duyệt cũ thì bỏ qua
  useEffect(() => {
    const registry = (window.CSS as unknown as {highlights?: HighlightRegistry;}).highlights;
    const Highlight = (window as unknown as {Highlight?: HighlightCtor;}).Highlight;
    const el = ref.current;
    const q = foldText(query.trim());
    if (!registry || !Highlight || !el) return;
    if (!q) {
      registry.delete(highlightName);
      return;
    }
    let frame = 0;
    const paint = () => {
      const ranges: Range[] = [];
      el.querySelectorAll('tbody').forEach((body) => {
        const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          const text = node.nodeValue ?? '';
          if (text.length >= q.length) {
            const folded = foldText(text);
            let i = folded.indexOf(q);
            while (i !== -1) {
              const r = document.createRange();
              r.setStart(node, i);
              r.setEnd(node, i + q.length);
              ranges.push(r);
              i = folded.indexOf(q, i + q.length);
            }
          }
          node = walker.nextNode();
        }
      });
      registry.set(highlightName, new Highlight(...ranges));
    };
    paint();
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    });
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      registry.delete(highlightName);
    };
  }, [query, highlightName]);

  return (
    <div
      ref={ref}
      data-table-frame
      data-tf={scope}
      className={`table-page flex flex-col rounded-md border border-gray-200 bg-white [overflow:clip] ${className}`}
      style={{ minHeight: layout.minHeight, ['--table-sticky-top' as string]: `${layout.top}px` }}>
      
      <style>{hideCss + highlightCss}</style>
      <HorizontalSwipe
        clip
        containerProps={{ role: 'region', 'aria-label': label }}
        className="flex-1"
        footerClassName={`sticky z-10 ${reserve > 0 ? '' : 'bottom-0'}`}
        footerStyle={reserve > 0 ? { bottom: PAGER } : undefined}>
        
        {children}
      </HorizontalSwipe>
    </div>);

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