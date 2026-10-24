import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Tính chiều cao để phần tử lấp đúng phần còn lại của vùng cuộn trang, không sinh thanh cuộn dọc.
 * Chỉ áp dụng từ breakpoint `minWidth` trở lên.
 * `reserve`: ước lượng phần nằm dưới phần tử (thanh chuyển trang…). Sau mỗi lần đo,
 * nếu trang vẫn tràn thì phần tràn được trừ thẳng vào chiều cao.
 */
export function useFillHeight<T extends HTMLElement>(minWidth = 1024, reserve = 0) {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = window.matchMedia(`(min-width: ${minWidth}px)`);
    const scroller = findScrollParent(el);
    let frame = 0;
    let correction = 0;

    const estimate = () => {
      const scrollerTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewport = scroller ? scroller.clientHeight : window.innerHeight;
      const offset = el.getBoundingClientRect().top - scrollerTop + (scroller ? scroller.scrollTop : window.scrollY);
      return Math.max(240, Math.floor(viewport - offset - 22 - reserve - correction));
    };

    const settle = (target: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!scroller) return;
        const overflow = scroller.scrollHeight - scroller.clientHeight;
        if (overflow > 0 && target > 240) {
          const fix = Math.min(overflow, target - 240);
          correction += fix;
          setHeight(target - fix);
        } else if (overflow < 0) {
          correction = Math.max(0, correction + overflow);
        }
      });
    };

    const measure = () => {
      if (!media.matches) return setHeight(undefined);
      const target = estimate();
      setHeight(target);
      settle(target);
    };

    measure();
    // Đo lại khi nội dung phía trên đổi chiều cao (thanh thao tác hàng loạt, thông báo…)
    const observer = new ResizeObserver(measure);
    if (el.parentElement) observer.observe(el.parentElement);
    const onResize = () => {
      correction = 0;
      measure();
    };
    window.addEventListener('resize', onResize);
    media.addEventListener('change', onResize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      media.removeEventListener('change', onResize);
    };
  }, [minWidth, reserve]);

  return { ref, height };
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