import React, { Children, useCallback, useId, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel, Scrollbar } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/scrollbar';

type HorizontalSwipeProps = {
  children: React.ReactNode;
  /** content: một khối rộng (bảng) lướt tự do; items: mỗi con là một ô (chip, thẻ) */
  variant?: 'items' | 'content';
  gap?: number;
  className?: string;
  containerProps?: {role?: string;'aria-label'?: string;};
  /** Gọi khi nội dung bắt đầu trôi — ví dụ để đóng popover đang neo vào ô */
  onMove?: () => void;
  /**
   * Cắt bằng overflow: clip thay vì hidden → khung lướt không thành vùng cuộn,
   * tiêu đề cột bên trong vẫn dính theo trang khi cuộn dọc.
   */
  clip?: boolean;
  /** Lớp thêm cho chân lướt (mũi tên + thanh kéo), ví dụ để dính đáy màn hình */
  footerClassName?: string;
  footerStyle?: React.CSSProperties;
};

const STEP = 0.8; // mỗi lần bấm mũi tên lướt 80% bề rộng khung

export function HorizontalSwipe({ children, variant = 'content', gap = 8, className = '', containerProps, onMove, clip, footerClassName = '', footerStyle }: HorizontalSwipeProps) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [edge, setEdge] = useState({ locked: true, start: true, end: true });
  // Mỗi bảng một thanh kéo riêng → selector không đụng nhau khi có nhiều bảng trên trang
  const scrollbarKey = useId().replace(/[^a-zA-Z0-9]/g, '');

  const sync = useCallback((s: SwiperInstance) => {
    const next = { locked: s.isLocked, start: s.isBeginning, end: s.isEnd };
    setEdge((p) => p.locked === next.locked && p.start === next.start && p.end === next.end ? p : next);
  }, []);

  const nudge = (dir: 1 | -1) => {
    if (!swiper) return;
    const target = Math.max(swiper.maxTranslate(), Math.min(swiper.minTranslate(), swiper.translate - dir * swiper.width * STEP));
    swiper.translateTo(target, 280, true, true);
  };

  const isContent = variant === 'content';

  return (
    <div className={`relative min-w-0 ${className}`}>
      <Swiper
        {...containerProps}
        modules={[FreeMode, Mousewheel, Scrollbar]}
        slidesPerView="auto"
        spaceBetween={isContent ? 0 : gap}
        freeMode={{ enabled: true, momentumRatio: 0.6, momentumBounce: false }}
        mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
        scrollbar={isContent ? { el: `[data-hswipe-scrollbar="${scrollbarKey}"]`, draggable: true, hide: false } : false}
        watchOverflow
        resistanceRatio={0.6}
        threshold={6}
        grabCursor
        observer
        observeParents
        observeSlideChildren
        noSwiping
        noSwipingSelector="input, textarea, select, [contenteditable='true']"
        onSwiper={(s) => {
          setSwiper(s);
          sync(s);
        }}
        onProgress={sync}
        onResize={sync}
        onLock={sync}
        onUnlock={sync}
        onUpdate={sync}
        onSliderFirstMove={() => onMove?.()}
        onScroll={() => onMove?.()}
        className={`hswipe ${clip ? 'hswipe-clip' : ''}`}>
        
        {isContent ?
        // Cả bảng là 1 slide; min-w-full để bảng ít cột vẫn giãn hết khung
        <SwiperSlide className="!h-auto !w-auto min-w-full">{children}</SwiperSlide> :

        Children.toArray(children).map((child, i) =>
        <SwiperSlide key={React.isValidElement(child) && child.key || i} className="!h-auto !w-auto">
              {child}
            </SwiperSlide>
        )
        }
      </Swiper>

      {/* Chân bảng: mũi tên + thanh kéo, ẩn khi bảng vừa khung */}
      {isContent &&
      <div className={`items-center gap-2 border-t border-gray-200 bg-white px-3 py-2 ${edge.locked ? 'hidden' : 'flex'} ${footerClassName}`} style={footerStyle}>
          <FooterArrow label="Lướt sang trái" disabled={edge.start} onClick={() => nudge(-1)}>
            <ChevronLeftIcon className="h-4 w-4" />
          </FooterArrow>
          <div data-hswipe-scrollbar={scrollbarKey} className="hswipe-scrollbar min-w-0 flex-1" />
          <FooterArrow label="Lướt sang phải" disabled={edge.end} onClick={() => nudge(1)}>
            <ChevronRightIcon className="h-4 w-4" />
          </FooterArrow>
        </div>
      }
    </div>);

}

function FooterArrow({ label, disabled, onClick, children }: {label: string;disabled: boolean;onClick: () => void;children: React.ReactNode;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
      style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
      
      {children}
    </button>);

}