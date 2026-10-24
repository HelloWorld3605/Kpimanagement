/** tt: tập thể (đơn vị) · ldch: cá nhân là lãnh đạo, chỉ huy · cn: cán bộ, chiến sĩ không giữ chức vụ */
export type ScoresheetKind = 'tt' | 'ldch' | 'cn';

/** Một phần sản phẩm được duyệt cùng mức. pct: % điểm được tính; times: số lần phải sửa / bị nhắc (khi pct < 100) */
export type LevelPart = {count: number;pct: number;times?: number;};

export type ScoreTask = {
  id: string;
  name: string;
  product: string;
  /** Điểm của 1 sản phẩm công việc — cột (4) */
  point: number;
  /** Số lượng giao — cột (5) */
  qty: number;
  /** Số lượng hoàn thành — cột (7) */
  done: number;
  quality: LevelPart[];
  progress: LevelPart[];
  note?: string;
};

export type ScoresheetData = {
  kind: ScoresheetKind;
  tasks: ScoreTask[];
  /** Chỉ mẫu LĐCH: số tập thể, cá nhân thuộc quyền được đánh giá */
  dTotal?: number;
  /** Chỉ mẫu LĐCH: số được đánh giá hoàn thành nhiệm vụ trở lên */
  dDone?: number;
};