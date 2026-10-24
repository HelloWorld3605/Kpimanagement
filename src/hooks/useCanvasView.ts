import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type View = {x: number;y: number;scale: number;};

const MIN_SCALE = 0.25;
const MAX_SCALE = 2;
const PAD = 48;
const STEP = 1.2;
const PAN_STEP = 60;

const DEFAULT_SCALE = 0.7;
const STORE_KEY = 'org-canvas-view';

const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

/** Vị trí/mức thu phóng đã lưu theo từng gốc sơ đồ — giữ khi chuyển trang và khi tải lại trong cùng phiên */
const saved: Record<string, View> = (() => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
})();

const persist = () => {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(saved));
  } catch {

    /* bộ nhớ phiên không khả dụng → chỉ giữ trong bộ nhớ */}
};

/** Thu phóng bằng cuộn chuột (quanh vị trí con trỏ), kéo để di chuyển, phím + − 0 và mũi tên. */
export function useCanvasView(fitKey: string) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [animated, setAnimated] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{sx: number;sy: number;ox: number;oy: number;} | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  // Người dùng đã thao tác (kéo, thu phóng, vừa màn hình) với gốc hiện tại chưa
  const touched = useRef(false);
  const skipSave = useRef(false);

  const zoomAt = useCallback((factor: number, px: number, py: number, animate: boolean) => {
    touched.current = true;
    setAnimated(animate);
    setView((v) => {
      const scale = clamp(v.scale * factor);
      const r = scale / v.scale;
      return { scale, x: px - (px - v.x) * r, y: py - (py - v.y) * r };
    });
  }, []);

  const zoomBy = useCallback(
    (factor: number) => {
      const el = viewportRef.current;
      if (el) zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2, true);
    },
    [zoomAt]
  );

  const fit = useCallback((animate = true) => {
    const vp = viewportRef.current;
    const c = contentRef.current;
    if (!vp || !c) return;
    const cw = c.offsetWidth;
    const ch = c.offsetHeight;
    const scale = clamp(Math.min(1, (vp.clientWidth - PAD * 2) / cw, (vp.clientHeight - PAD * 2) / ch));
    touched.current = true;
    setAnimated(animate);
    setView({ scale, x: (vp.clientWidth - cw * scale) / 2, y: Math.max(PAD, (vp.clientHeight - ch * scale) / 2) });
  }, []);

  const resetZoom = () => zoomBy(1 / viewRef.current.scale);

  /** Mặc định: 70%, căn giữa theo chiều ngang; nếu sơ đồ thấp hơn khung thì căn giữa cả chiều dọc */
  const center = useCallback(() => {
    const vp = viewportRef.current;
    const c = contentRef.current;
    if (!vp || !c) return;
    const scale = DEFAULT_SCALE;
    const cw = c.offsetWidth * scale;
    const ch = c.offsetHeight * scale;
    setAnimated(false);
    setView({ scale, x: (vp.clientWidth - cw) / 2, y: Math.max(PAD, (vp.clientHeight - ch) / 2) });
  }, []);

  useLayoutEffect(() => {
    const prev = saved[fitKey];
    touched.current = !!prev;
    // Lần lưu ngay sau khi đổi gốc vẫn mang khung nhìn của gốc cũ → bỏ qua
    skipSave.current = true;
    if (prev) {
      setAnimated(false);
      setView(prev);
    } else center();
  }, [fitKey, center]);

  // Khung đổi kích thước khi chưa thao tác (lần đo chiều cao đầu tiên, đổi cỡ cửa sổ) → căn giữa lại
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(() => {
      if (!touched.current) center();
    });
    ro.observe(vp);
    return () => ro.disconnect();
  }, [center]);

  // Lưu lại mỗi khi người dùng thay đổi khung nhìn
  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    if (!touched.current) return;
    saved[fitKey] = view;
    persist();
  }, [view, fitKey]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top, false);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, a')) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: viewRef.current.x, oy: viewRef.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    setAnimated(false);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    touched.current = true;
    setView((v) => ({ ...v, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }));
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const pan = (dx: number, dy: number) => {
      touched.current = true;
      setAnimated(false);
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    };
    const actions: Record<string, () => void> = {
      '+': () => zoomBy(STEP),
      '=': () => zoomBy(STEP),
      '-': () => zoomBy(1 / STEP),
      '0': () => fit(),
      ArrowLeft: () => pan(PAN_STEP, 0),
      ArrowRight: () => pan(-PAN_STEP, 0),
      ArrowUp: () => pan(0, PAN_STEP),
      ArrowDown: () => pan(0, -PAN_STEP)
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  return {
    viewportRef,
    contentRef,
    view,
    animated,
    dragging,
    handlers: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onKeyDown },
    zoomIn: () => zoomBy(STEP),
    zoomOut: () => zoomBy(1 / STEP),
    fit: () => fit(),
    resetZoom,
    canZoomIn: view.scale < MAX_SCALE - 0.001,
    canZoomOut: view.scale > MIN_SCALE + 0.001
  };
}