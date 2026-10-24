import { useLayoutEffect, useRef, useState } from 'react';
import { STICKY_TOP_EVENT, readStickyTop } from '../utils/stickyTop';

/**
 * Chiều cao cho một cột phụ dính (sticky) trong vùng cuộn chính của ứng dụng:
 * luôn vừa khít phần màn hình còn thấy — ở đầu trang thì trừ phần phía trên,
 * khi đã dính dưới thanh trên cùng + hàng tab thì cao gần trọn màn hình. Trang chính vẫn là nơi cuộn.
 */
export function useStickyPanelHeight<T extends HTMLElement>(bottom = 18, minWidth = 1024) {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scroller = el.closest<HTMLElement>('[data-app-scroll]');
    const media = window.matchMedia(`(min-width: ${minWidth}px)`);
    let raf = 0;

    const measure = () => {
      if (!scroller || !media.matches) {
        setHeight(undefined);
        return;
      }
      const top = readStickyTop(scroller);
      const offset = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      setHeight(Math.max(240, Math.floor(scroller.clientHeight - Math.max(offset, top) - bottom)));
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    scroller?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener(STICKY_TOP_EVENT, schedule);
    media.addEventListener('change', measure);
    return () => {
      cancelAnimationFrame(raf);
      scroller?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener(STICKY_TOP_EVENT, schedule);
      media.removeEventListener('change', measure);
    };
  }, [bottom, minWidth]);

  return { ref, height };
}