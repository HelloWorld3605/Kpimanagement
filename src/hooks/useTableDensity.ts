import { useSyncExternalStore } from 'react';

export type TableDensity = 'comfortable' | 'compact';

const KEY = 'table-density';
const listeners = new Set<() => void>();

function read(): TableDensity {
  try {
    return localStorage.getItem(KEY) === 'compact' ? 'compact' : 'comfortable';
  } catch {
    return 'comfortable';
  }
}

let current: TableDensity = read();
// Gắn lên <html> để mọi bảng .data-table trong ứng dụng đổi mật độ cùng lúc
if (typeof document !== 'undefined') document.documentElement.dataset.density = current;

function setDensity(next: TableDensity) {
  current = next;
  document.documentElement.dataset.density = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {

    /* không lưu được thì chỉ giữ trong phiên */}
  listeners.forEach((l) => l());
}

/** Mật độ dòng dùng chung cho tất cả bảng danh sách, nhớ giữa các lần mở */
export function useTableDensity() {
  const density = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current
  );
  return [density, setDensity] as const;
}