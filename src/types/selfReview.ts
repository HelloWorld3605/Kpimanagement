import { CriteriaSection } from './criteria';
import { LevelPart, ScoresheetKind } from './scoresheet';

/**
 * Nháp → (Bị trả lại) → Đã gửi → Đã khoá (chấp thuận | chấm lại).
 * Bị trả lại: người thẩm định trả về kèm lý do, cán bộ sửa rồi gửi lại.
 */
export type ReviewStatus = 'draft' | 'returned' | 'submitted' | 'accepted' | 'rescored';
export type Mark = 'yes' | 'no';
export type Rank = 'excellent' | 'good' | 'done' | 'fail';

/** ① Tự đánh giá → ② LĐ phòng đánh giá → ③ LĐ đơn vị đánh giá → ④ Hoàn thành */
export type ReviewStep = 'self' | 'dept' | 'unit' | 'done';

/** Kết quả thực hiện một nhiệm vụ. quality / progress chỉ ghi các sản phẩm KHÔNG đạt mức 100% — phần còn lại là "Đảm bảo" */
export type TaskResult = {
  done: number | null;
  quality: LevelPart[];
  progress: LevelPart[];
};

export type ReviewTask = TaskResult & {
  id: string;
  code: string;
  name: string;
  target: string;
  actual: string;
  /** Sản phẩm công việc */
  product: string;
  /** Điểm của 1 sản phẩm (≤ 100) */
  point: number;
  /** Số lượng được giao */
  qty: number;
  note: string;
};

export type Appraisal = {
  decision: 'accepted' | 'rescored';
  by: string;
  at: string;
  comment?: string;
  /** Chỉ có khi chấm lại */
  marks?: Record<string, Mark>;
  results?: Record<string, TaskResult>;
  rank: Rank;
};

/** Một bước trong "Tiến độ công việc" của phiếu: gửi, trả lại, thẩm định, duyệt */
export type FlowEntry = {
  /** dd/mm/yyyy hh:mm:ss */
  at: string;
  by: string;
  byUnit?: string;
  next?: string;
  nextUnit?: string;
  action: string;
  content?: string;
};

/** Điều chỉnh số lượng giao do lãnh đạo thực hiện khi thẩm định */
export type QtyChange = {
  taskId: string;
  taskName: string;
  before: number;
  after: number;
  by: string;
  at: string;
  reason: string;
  /** ISO yyyy-mm-dd — thời điểm áp dụng chỉ tiêu mới */
  effectiveFrom: string;
};

export type SelfReview = {
  id: string;
  /** Chủ phiếu; trống = phiếu của tài khoản đang đăng nhập (dữ liệu mẫu) */
  memberId?: string;
  /** Mẫu bảng nhiệm vụ: CĐKPI-CN hoặc CĐKPI-LĐCH; trống = theo chức vụ chủ phiếu */
  kind?: ScoresheetKind;
  period: string;
  template: string;
  criteriaLabel: string;
  /** Ngày hệ thống tạo phiếu (khi kết thúc kỳ) */
  createdAt: string;
  deadline: string;
  status: ReviewStatus;
  step?: ReviewStep;
  submittedAt?: string;
  sections: CriteriaSection[];
  marks: Record<string, Mark | undefined>;
  notes: Record<string, string>;
  tasks: ReviewTask[];
  proposedRank?: Rank;
  /** Lý do khách quan khi chưa hoàn thành 100% nhiệm vụ (CV 214) */
  objectiveReason?: string;
  appraisal?: Appraisal;
  /** Điểm thẩm định của lãnh đạo phòng */
  deptMarks?: Record<string, Mark | undefined>;
  deptResults?: Record<string, TaskResult>;
  deptBy?: string;
  /** Điểm đánh giá của lãnh đạo đơn vị */
  unitMarks?: Record<string, Mark | undefined>;
  unitResults?: Record<string, TaskResult>;
  /** Lãnh đạo được trình */
  submittedTo?: string;
  /** Lý do trả lại gần nhất */
  returnReason?: string;
  flow?: FlowEntry[];
  qtyChanges?: QtyChange[];
  /** Chỉ số D (mẫu LĐCH) lưu khi gửi phiếu */
  dValue?: number;
};