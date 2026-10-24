/** Vai trò nghiệp vụ. Một tài khoản có thể giữ nhiều vai trò — quyền cộng dồn. */
export type BuiltInRoleId = 'can-bo' | 'chi-huy' | 'chi-huy-pho' | 'tham-muu' | 'tccb' | 'lanh-dao' | 'quan-tri' | 'sieu-quan-tri';
/** Vai trò do quản trị tạo thêm có mã nội bộ dạng custom-… */
export type RoleId = BuiltInRoleId | `custom-${string}`;

/** Chức năng = một màn / nhóm thao tác trên menu. Lớp 1: có thấy màn hay không. */
export type FeatureId =
'overview' |
'my-tasks' |
'task-assign' |
'product-review' |
'work-calendar' |
'task-catalog' |
'criteria-catalog' |
'scoring-rules' |
'kpi-period' |
'scoresheet' |
'self-review' |
'appraisal' |
'decision' |
'results' |
'closed' |
'progress' |
'kpi-report' |
'staff-groups' |
'annual-rank' |
'audit-log' |
'org' |
'admin' |
'style-guide' |
'notifications';

export type Action = 'view' | 'write' | 'delete';

/** Loại bản ghi được lọc theo phạm vi. Lớp 2: thấy những dòng nào. */
export type ResourceId =
'review' |
'individual-result' |
'collective-result' |
'member-kpi' |
'member-personal' |
'progress';

/**
 * self: chỉ bản thân · unit: đơn vị mình · direct: đơn vị mình + chỉ huy đơn vị trực thuộc
 * subtree: đơn vị mình và mọi cấp dưới · assigned: các đơn vị được phân công phụ trách
 * department: phòng / trung đoàn của mình và cấp dưới · all: toàn bộ
 */
export type ScopeKind = 'self' | 'unit' | 'direct' | 'subtree' | 'assigned' | 'department' | 'all';

export type Role = {
  id: RoleId;
  label: string;
  description: string;
  /** Mã hiển thị do người tạo nhập (vai trò tùy chỉnh) */
  code?: string;
  /** Vai trò do quản trị tạo thêm, không phải vai trò hệ thống */
  custom?: boolean;
};

/** Đang hoạt động · Ngừng hoạt động (tạm dừng, vd. nghỉ, chuyển công tác) · Bị khoá (do quản trị khoá) */
export type AccountStatus = 'active' | 'inactive' | 'locked';

export type Account = {
  /** Trạng thái chi tiết; `active` luôn = (status === 'active') để phần kiểm quyền dùng chung */
  status?: AccountStatus;
  username: string;
  /** Hồ sơ nhân sự gắn với tài khoản (màn Nhân sự). Chưa gắn: phạm vi theo đơn vị không có hiệu lực */
  memberId?: string;
  /** Họ tên hiển thị khi tài khoản chưa gắn hồ sơ nhân sự */
  displayName?: string;
  roles: RoleId[];
  /** Đơn vị được phân công phụ trách (dùng cho phạm vi "assigned") */
  assignedUnitIds: string[];
  active: boolean;
  lastLogin?: string;
  email?: string;
  /** dd/mm/yyyy hh:mm */
  createdAt?: string;
  updatedAt?: string;
  /** Mật khẩu riêng đặt khi tạo tài khoản; không có thì dùng mật khẩu chung của bản demo */
  password?: string;
};

export type RoleFeatures = Record<RoleId, Partial<Record<FeatureId, Action[]>>>;
export type RoleScopes = Record<RoleId, Partial<Record<ResourceId, ScopeKind>>>;

export type GlobalBlock = {
  id: string;
  label: string;
  description: string;
  resource: ResourceId;
  action: Action;
};

/** Bản ghi đang được hỏi quyền */
export type AccessTarget = {
  unitId: string;
  memberId?: string;
  /** Trạng thái phiếu — dùng cho chặn toàn cục */
  reviewStatus?: string;
};

export type AccessDecision = {
  allowed: boolean;
  /** Câu giải thích ngắn, hiển thị trong công cụ "Vì sao?" */
  reason: string;
  role?: RoleId;
  scope?: ScopeKind | 'self-default';
  blockId?: string;
};