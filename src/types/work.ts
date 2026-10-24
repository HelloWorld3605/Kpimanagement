/** Nháp → Đã mở → Đang thực hiện → Đánh giá → Phê duyệt → Đã đóng */
export type PeriodPhase = 'draft' | 'open' | 'running' | 'review' | 'approval' | 'closed';

/** Ba loại kỳ độc lập — không có quan hệ kỳ cha / kỳ con, điểm không lấy bình quân giữa các kỳ */
export type PeriodKind = 'month' | 'quarter' | 'year';

/** Loại hồ sơ tự đánh giá */
export type DossierType = 'individual' | 'leader' | 'collective';

/** Đã có căn cứ · Cần xác nhận nghiệp vụ */
export type RuleStatus = 'confirmed' | 'needs-confirmation';

/** Hạn gửi tự đánh giá — cấu hình theo loại hồ sơ hoặc theo một đối tượng cụ thể. Không tự suy diễn. */
export type DeadlineRule = {
  id: string;
  /** Theo loại hồ sơ (bỏ trống khi áp cho một đối tượng) */
  dossier?: DossierType;
  /** Theo đối tượng cụ thể (cán bộ) */
  memberId?: string;
  /** ISO yyyy-mm-dd; null = chưa cấu hình hạn */
  deadline: string | null;
  status: RuleStatus;
  /** Căn cứ: số văn bản, điều khoản hoặc ghi chú */
  basis: string;
};

/** Một lần thay đổi cấu hình hạn */
export type DeadlineChange = {
  id: string;
  /** dd/mm/yyyy hh:mm */
  at: string;
  by: string;
  rule: string;
  action: 'create' | 'update' | 'delete';
  before: string;
  after: string;
  basis: string;
};

/** Nhật ký kỳ: chuyển giai đoạn, khoá / mở khoá kiểm đếm, mở lại kỳ */
export type PeriodEvent = {at: string;by: string;text: string;reason?: string;approvedBy?: string;};

export type KpiPeriod = {
  id: string;
  name: string;
  kind: PeriodKind;
  year: number;
  /** Tháng 1–12 · Quý 1–4 · Năm: 0 */
  index: number;
  /** Đơn vị áp dụng */
  unitId: string;
  /** Áp dụng cho cả đơn vị trực thuộc */
  includeChildren: boolean;
  /** Bắt đầu kiểm đếm, ISO yyyy-mm-dd */
  start: string;
  /** Kết thúc kiểm đếm, ISO yyyy-mm-dd */
  end: string;
  /** Kỳ năm: khoảng kiểm đếm nhập tay, cần xác nhận cho đến khi có căn cứ */
  rangeStatus?: RuleStatus;
  rangeBasis?: string;
  deadlineRules: DeadlineRule[];
  appraisalDeadline: string | null;
  reportDeadline: string | null;
  /** Khoá kiểm đếm — độc lập với giai đoạn phê duyệt */
  countingLocked: boolean;
  phase: PeriodPhase;
  /** Số phiên bản kết quả — tăng mỗi lần mở lại kỳ */
  resultVersion: number;
  deadlineHistory: DeadlineChange[];
  events: PeriodEvent[];
  createdBy: string;
  createdAt: string;
};

/** Giao cho đơn vị (tính vào KPI tập thể) hoặc cho cá nhân */
export type Assignee = {kind: 'unit';unitId: string;} | {kind: 'member';memberId: string;};

export type KpiTaskStatus = 'assigned' | 'in-progress' | 'reported' | 'revoked';

export type TaskHistoryEntry = {at: string;by: string;text: string;};

/** Chờ duyệt → Đã duyệt (tính vào số lượng hoàn thành) hoặc Bị trả lại */
export type ProductStatus = 'pending' | 'approved' | 'returned';

/** Một sản phẩm cán bộ báo cáo cho nhiệm vụ KPI */
export type TaskProduct = {
  id: string;
  name: string;
  /** ISO yyyy-mm-dd */
  doneAt: string;
  note: string;
  status: ProductStatus;
  /** Lý do trả lại */
  reason?: string;
  /** Người nhập; "import" khi nạp từ Excel */
  source?: 'form' | 'import';
};

export type KpiTask = {
  id: string;
  /** TM-01 (theo danh mục) hoặc PS-01 (việc phát sinh) */
  code: string;
  source: 'catalog' | 'adhoc';
  /** Phiên bản danh mục lúc giao — giữ nguyên khi danh mục ra phiên bản mới */
  version?: number;
  name: string;
  /** Đơn vị tính của sản phẩm */
  unit: string;
  /** Điểm một sản phẩm (0 < điểm ≤ 100) */
  point: number;
  qty: number;
  /** Số sản phẩm đã được duyệt */
  approved: number;
  /** ISO yyyy-mm-dd */
  deadline: string;
  periodId: string | null;
  assignee: Assignee;
  /** Cán bộ phối hợp thực hiện */
  collaboratorIds?: string[];
  /** Người theo dõi — chỉ nhận thông báo, không được giao việc */
  watcherIds?: string[];
  assignedById: string;
  /** Căn cứ giao — bắt buộc với việc phát sinh */
  basis?: string;
  /** Giá trị các trường riêng của mục danh mục */
  fields: Record<string, string>;
  status: KpiTaskStatus;
  /** Số lần đã nhắc hạn — dữ liệu chấm điểm tiến độ */
  reminders: number;
  history: TaskHistoryEntry[];
  /** Sản phẩm cán bộ đã báo cáo */
  products?: TaskProduct[];
  /** Nhiệm vụ cha — nhiệm vụ con là phần việc tách ra giao cho từng cán bộ */
  parentId?: string;
  /** Công việc gốc (bước Tạo công việc) mà lần phân công này thuộc về */
  workItemId?: string;
};

/**
 * Công việc KPI — bước 1 "Tạo công việc": xác định việc gì, bao nhiêu, hạn nào, thuộc kỳ nào.
 * Chưa có người thực hiện; bước 2 "Phân công" chia số lượng cho đơn vị / cán bộ thành các KpiTask.
 */
export type WorkItem = {
  id: string;
  code: string;
  source: 'catalog' | 'adhoc';
  version?: number;
  name: string;
  unit: string;
  point: number;
  /** Tổng số lượng cần thực hiện */
  qty: number;
  /** ISO yyyy-mm-dd */
  deadline: string;
  periodId: string | null;
  /** Căn cứ — bắt buộc với việc phát sinh */
  basis?: string;
  /** Mô tả, yêu cầu */
  description: string;
  fields: Record<string, string>;
  /** Đơn vị sở hữu công việc — phạm vi được phân công */
  unitId: string;
  createdById: string;
  createdAt: string;
  status: 'open' | 'cancelled';
  history: TaskHistoryEntry[];
};

export type DailyStatus = 'todo' | 'doing' | 'review' | 'returned' | 'done';

export type DailyTask = {
  id: string;
  name: string;
  description: string;
  assignedById: string;
  leadId: string;
  collaboratorIds: string[];
  /** ISO yyyy-mm-dd */
  deadline: string;
  status: DailyStatus;
};