import { useCallback, useEffect, useState } from 'react';

export type TableColumn = {
  id: string;
  label: string;
  /** Không cho ẩn (cột định danh như STT, tên) */
  locked?: boolean;
};

const PREFIX = 'kpi-table-columns:';

/** Cột đang ẩn của một bảng — nhớ theo từng bảng trong trình duyệt */
export function useTableColumns(key: string, defaultHidden: string[] = []) {
  const [hidden, setHidden] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch {

      /* bỏ qua */}
    return new Set(defaultHidden);
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify([...hidden]));
    } catch {

      /* trình duyệt chặn lưu trữ */}
  }, [key, hidden]);

  const toggle = useCallback(
    (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    }),
    []
  );

  return { hidden, toggle };
}

/** Vị trí (1-based) các cột đang ẩn, theo đúng thứ tự cột đang có trên bảng; offset = số cột đứng trước (ô chọn) */
export function hiddenIndexes(columns: TableColumn[], hidden: Set<string>, offset = 0) {
  return columns.flatMap((c, i) => hidden.has(c.id) && !c.locked ? [i + 1 + offset] : []);
}