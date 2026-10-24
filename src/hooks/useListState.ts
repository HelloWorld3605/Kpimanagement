import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';

/**
 * Trạng thái danh sách (tìm kiếm, bộ lọc, trang, sắp xếp) giữ nguyên khi mở chi tiết rồi quay lại.
 * Lưu trong bộ nhớ + sessionStorage → còn sau khi tải lại trang, mất khi đóng tab.
 */
const memory = new Map<string, unknown>();
const PREFIX = 'list-state:';

function read<T>(key: string, initial: T): T {
  if (memory.has(key)) return memory.get(key) as T;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as T;
      // Đối tượng: trộn với mặc định để thêm trường mới không làm vỡ dữ liệu cũ
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && initial && typeof initial === 'object') return { ...initial, ...parsed };
      return parsed;
    }
  } catch {

    /* bỏ qua: dùng mặc định */}
  return initial;
}

export function useListState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => read(key, initial));
  useEffect(() => {
    memory.set(key, value);
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {

      /* chỉ giữ trong bộ nhớ */}
  }, [key, value]);
  return [value, setValue];
}

/* ---------- Vị trí cuộn ---------- */

const scrollMemory = new Map<string, number>();
let skipNextReset = false;

export const getAppScroller = () => document.querySelector<HTMLElement>('[data-app-scroll]');

/** Khung ứng dụng gọi khi đổi trang: true = danh sách vừa tự khôi phục vị trí, không cuộn về đầu */
export function consumeScrollRestore() {
  const skip = skipNextReset;
  skipNextReset = false;
  return skip;
}

/** Nhớ vị trí cuộn của một màn danh sách và trả lại khi quay về */
export function useListScrollMemory(key: string) {
  useLayoutEffect(() => {
    const scroller = getAppScroller();
    if (!scroller) return;
    const saved = scrollMemory.get(key);
    if (saved) {
      scroller.scrollTop = saved;
      skipNextReset = true;
      // Khung bảng có thể đổi chiều cao ngay sau lần vẽ đầu → đặt lại một lần nữa
      requestAnimationFrame(() => {
        if (Math.abs(scroller.scrollTop - saved) > 1) scroller.scrollTop = saved;
      });
    }
    let last = scroller.scrollTop;
    const onScroll = () => {
      last = scroller.scrollTop;
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      scrollMemory.set(key, last);
    };
  }, [key]);
}