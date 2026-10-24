import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

type FloatingPanelProps = {
  /** Phần tử neo (ô chọn) */
  anchor: HTMLElement | null;
  children: React.ReactNode;
  className?: string;
  /** Chiều cao tối đa mong muốn; tự thu nhỏ nếu không đủ chỗ */
  maxHeight?: number;
  /**
   * anchor: rộng đúng bằng ô neo.
   * content: tối thiểu bằng ô neo, nở theo nội dung (tối đa maxWidth) — dùng cho ô chọn hẹp có nhãn dài.
   */
  fit?: 'anchor' | 'content';
  maxWidth?: number;
  panelRef?: React.Ref<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
};

type Placement = {
  left?: number;
  right?: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
  maxWidth: number;
  up: boolean;
};

const GAP = 4;
const EDGE = 8;

/**
 * Lớp nổi gắn vào body, định vị theo ô neo: nằm ngoài pop up / khung cuộn nên không bị cắt
 * và không làm thay đổi kích thước vùng chứa. Tự lật lên trên khi phía dưới không đủ chỗ,
 * bám theo ô neo khi cuộn hoặc đổi kích thước cửa sổ.
 */
export function FloatingPanel({ anchor, children, className = '', maxHeight = 320, fit = 'anchor', maxWidth = 480, panelRef, onKeyDown }: FloatingPanelProps) {
  const [place, setPlace] = useState<Placement | null>(null);

  useLayoutEffect(() => {
    if (!anchor) return;
    const update = () => {
      const r = anchor.getBoundingClientRect();
      const below = window.innerHeight - r.bottom - GAP - EDGE;
      const above = r.top - GAP - EDGE;
      const up = below < Math.min(maxHeight, 200) && above > below;
      const room = up ? above : below;
      const widest = Math.max(r.width, Math.min(maxWidth, window.innerWidth - EDGE * 2));
      // Nở theo nội dung mà tràn mép phải → neo theo mép phải của ô
      const alignRight = fit === 'content' && r.left + widest > window.innerWidth - EDGE;
      setPlace({
        left: alignRight ? undefined : r.left,
        right: alignRight ? Math.max(EDGE, window.innerWidth - r.right) : undefined,
        width: r.width,
        top: up ? undefined : r.bottom + GAP,
        bottom: up ? window.innerHeight - r.top + GAP : undefined,
        maxHeight: Math.max(120, Math.min(maxHeight, room)),
        maxWidth: widest,
        up
      });
    };
    update();
    // capture: bắt cả sự kiện cuộn của pop up / khung cuộn bên trong
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    ro.observe(anchor);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [anchor, maxHeight, fit, maxWidth]);

  if (!place) return null;

  const size: React.CSSProperties =
  fit === 'content' ? { minWidth: place.width, width: 'max-content', maxWidth: place.maxWidth } : { width: place.width };

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: place.up ? 4 : -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: place.up ? 4 : -4 }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
      onKeyDown={onKeyDown}
      data-floating-panel=""
      className={`fixed z-[100] flex flex-col overflow-hidden rounded border border-gray-200 bg-white shadow-lg ${className}`}
      style={{ left: place.left, right: place.right, top: place.top, bottom: place.bottom, maxHeight: place.maxHeight, ...size }}>
      
      {children}
    </motion.div>,
    document.body
  );
}