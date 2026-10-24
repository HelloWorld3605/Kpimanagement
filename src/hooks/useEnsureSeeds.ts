import { Dispatch, SetStateAction, useEffect } from 'react';

/**
 * Bổ sung bản ghi mẫu mới vào bộ sưu tập đã đồng bộ trước đó (dữ liệu Firestore cũ không có).
 * Chỉ thêm bản ghi còn thiếu theo mã, không ghi đè bản ghi đã có.
 */
export function useEnsureSeeds<T>(items: T[], setItems: Dispatch<SetStateAction<T[]>>, seeds: T[], idOf: (t: T) => string) {
  useEffect(() => {
    const have = new Set(items.map(idOf));
    const missing = seeds.filter((s) => !have.has(idOf(s)));
    if (missing.length) setItems((prev) => [...prev, ...missing.filter((s) => !prev.some((p) => idOf(p) === idOf(s)))]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
}