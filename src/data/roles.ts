import { Action, FeatureId, GlobalBlock, ResourceId, Role, RoleFeatures, RoleScopes, ScopeKind } from '../types/access';

export const roles: Role[] = [
{ id: 'can-bo', label: 'Cán bộ, chiến sĩ', description: 'Tự đánh giá, xem kết quả và hồ sơ của bản thân.' },
{ id: 'chi-huy', label: 'Chỉ huy (cấp trưởng)', description: 'Xem phiếu, kết quả, nhân sự của đơn vị mình và mọi cấp dưới.' },
{ id: 'chi-huy-pho', label: 'Chỉ huy (cấp phó)', description: 'Như cấp trưởng, nhưng chỉ trong các đơn vị được phân công phụ trách.' },
{ id: 'tham-muu', label: 'Cơ quan tham mưu', description: 'Quản lý Danh mục nhiệm vụ; xem kết quả tập thể toàn Bộ Tư lệnh.' },
{ id: 'tccb', label: 'Cơ quan tổ chức cán bộ', description: 'Quản lý Danh mục tiêu chí; xem toàn bộ cá nhân, tập thể và hồ sơ.' },
{ id: 'lanh-dao', label: 'Cấp có thẩm quyền', description: 'Xem toàn bộ để quyết định; không chỉnh sửa danh mục.' },
{ id: 'quan-tri', label: 'Quản trị hệ thống', description: 'Quản lý tài khoản, vai trò, phạm vi; không đọc dữ liệu nghiệp vụ.' },
{ id: 'sieu-quan-tri', label: 'Siêu quản trị', description: 'Toàn quyền: xem, ghi, xoá mọi chức năng; phạm vi dữ liệu toàn bộ.' }];


export const featureLabels: Record<FeatureId, string> = {
  overview: 'Tổng quan',
  'my-tasks': 'Nhiệm vụ của tôi',
  'task-assign': 'Quản lý nhiệm vụ (tạo, phân công, theo dõi)',
  'product-review': 'Duyệt sản phẩm',
  'work-calendar': 'Biểu đồ sự kiện',
  'task-catalog': 'Danh mục nhiệm vụ KPI',
  'criteria-catalog': 'Bộ tiêu chí & biểu mẫu',
  'scoring-rules': 'Quy tắc tính điểm & quy đổi',
  'kpi-period': 'Kỳ đánh giá',
  scoresheet: 'Bảng điểm KPI',
  'self-review': 'Tự đánh giá, xếp loại',
  appraisal: 'Thẩm định & đề xuất',
  decision: 'Quyết định xếp loại',
  results: 'Công khai kết quả',
  closed: 'Hồ sơ đã chốt',
  progress: 'Theo dõi tiến độ',
  'kpi-report': 'Báo cáo KPI',
  'staff-groups': 'Phân nhóm cán bộ',
  'annual-rank': 'Xếp loại năm',
  'audit-log': 'Lịch sử & nhật ký kiểm toán',
  org: 'Cơ cấu tổ chức',
  admin: 'Quản trị người dùng & quyền',
  'style-guide': 'Tài liệu giao diện',
  notifications: 'Thông báo'
};

/** Nhóm hiển thị trong ma trận Vai trò & quyền */
export const featureGroups: {label: string;features: FeatureId[];}[] = [
{ label: 'Chung', features: ['overview', 'notifications', 'org'] },
{ label: 'Nhiệm vụ', features: ['my-tasks', 'task-assign', 'work-calendar'] },
{ label: 'Đánh giá KPI', features: ['kpi-period', 'scoresheet', 'self-review', 'appraisal', 'decision', 'results', 'closed'] },
{ label: 'Danh mục & quy tắc', features: ['task-catalog', 'criteria-catalog', 'scoring-rules'] },
{ label: 'Báo cáo & tra cứu', features: ['annual-rank', 'audit-log'] },
{ label: 'Quản trị', features: ['admin', 'style-guide'] }];


export const actionLabels: Record<Action, string> = { view: 'Xem', write: 'Ghi', delete: 'Xoá' };

/** Đơn vị chịu trách nhiệm ghi — hiện trong dòng "chế độ chỉ xem" */
export const featureOwners: Partial<Record<FeatureId, string>> = {
  'task-catalog': 'Cơ quan tham mưu (P. Tham mưu tác chiến)',
  'criteria-catalog': 'Cơ quan tổ chức cán bộ (P. Tổ chức cán bộ)'
};

const V: Action[] = ['view'];
const VW: Action[] = ['view', 'write'];
const VWD: Action[] = ['view', 'write', 'delete'];

/** Mọi cán bộ: nhận việc, báo kết quả, tự đánh giá */
const business = {
  overview: V,
  notifications: V,
  org: V,
  scoresheet: V,
  'my-tasks': VW,
  'work-calendar': V,
  'self-review': VW,
  results: V
} as const;

/** Chỉ huy: giao việc, duyệt sản phẩm, thẩm định cấp dưới */
const command = {
  ...business,
  'task-assign': VW,
  'product-review': VW,
  appraisal: VW,
  'task-catalog': V,
  'criteria-catalog': V,
  'scoring-rules': V,
  progress: V,
  'kpi-report': V,
  'staff-groups': V,
  'annual-rank': V
} as const;

/** Xem báo cáo toàn đơn vị */
const reports = { progress: V, 'kpi-report': V, 'staff-groups': V, 'annual-rank': V } as const;

export const defaultRoleFeatures: RoleFeatures = {
  'can-bo': { ...business },
  'chi-huy': { ...command },
  'chi-huy-pho': { ...command },
  'tham-muu': { ...business, ...reports, 'task-catalog': VWD, 'criteria-catalog': V, 'scoring-rules': V, 'kpi-period': VW },
  tccb: { ...business, ...reports, 'task-catalog': V, 'criteria-catalog': VWD, 'scoring-rules': V, 'kpi-period': V, appraisal: V, decision: V, closed: V },
  'lanh-dao': { ...business, ...reports, 'task-catalog': V, 'criteria-catalog': V, 'scoring-rules': V, 'kpi-period': V, appraisal: VW, decision: VW, closed: V },
  'quan-tri': { notifications: V, admin: VWD, 'audit-log': V, 'style-guide': V },
  // Toàn quyền: mọi chức năng × Xem / Ghi / Xoá
  'sieu-quan-tri': Object.fromEntries(Object.keys(featureLabels).map((f) => [f, VWD]))
};

export const resourceLabels: Record<ResourceId, string> = {
  review: 'Phiếu tự đánh giá',
  'individual-result': 'Kết quả cá nhân',
  'collective-result': 'Kết quả tập thể',
  'member-kpi': 'Điểm KPI trên hồ sơ nhân sự',
  'member-personal': 'Thông tin cá nhân (ngày sinh, quê, điện thoại)',
  progress: 'Tiến độ xử lý'
};

/** Bản ghi thuộc chức năng nào — không có quyền chức năng thì phạm vi không có nghĩa */
export const resourceFeature: Record<ResourceId, FeatureId> = {
  review: 'self-review',
  'individual-result': 'results',
  'collective-result': 'results',
  'member-kpi': 'org',
  'member-personal': 'org',
  progress: 'progress'
};

/** Bản ghi gắn với một cán bộ — ai cũng mặc định thấy bản ghi của chính mình */
export const selfResources: ResourceId[] = ['review', 'individual-result', 'member-kpi', 'member-personal'];

export const scopeLabels: Record<ScopeKind, string> = {
  self: 'Bản thân',
  unit: 'Đơn vị mình',
  direct: 'Đơn vị mình + chỉ huy trực thuộc',
  subtree: 'Đơn vị và cấp dưới',
  assigned: 'Được phân công',
  department: 'Phòng / trung đoàn của mình',
  all: 'Toàn bộ'
};

export const scopeShort: Record<ScopeKind, string> = {
  self: 'Bản thân',
  unit: 'Đơn vị',
  direct: 'Trực tiếp',
  subtree: 'ĐV + dưới',
  assigned: 'Phân công',
  department: 'Phòng mình',
  all: 'Toàn bộ'
};

/** Rộng → hẹp, dùng để tóm tắt phạm vi của một tài khoản */
export const scopeRank: ScopeKind[] = ['all', 'department', 'subtree', 'assigned', 'direct', 'unit', 'self'];

export const defaultRoleScopes: RoleScopes = {
  'can-bo': { review: 'self', 'individual-result': 'self', 'collective-result': 'unit', 'member-personal': 'self' },
  'chi-huy': {
    review: 'subtree',
    'individual-result': 'subtree',
    'collective-result': 'subtree',
    'member-kpi': 'subtree',
    'member-personal': 'direct',
    progress: 'subtree'
  },
  'chi-huy-pho': {
    review: 'assigned',
    'individual-result': 'assigned',
    'collective-result': 'assigned',
    'member-kpi': 'assigned',
    'member-personal': 'assigned',
    progress: 'assigned'
  },
  'tham-muu': {
    review: 'self',
    'individual-result': 'department',
    'collective-result': 'all',
    'member-kpi': 'department',
    'member-personal': 'self',
    progress: 'all'
  },
  tccb: {
    review: 'all',
    'individual-result': 'all',
    'collective-result': 'all',
    'member-kpi': 'all',
    'member-personal': 'all',
    progress: 'all'
  },
  'lanh-dao': {
    review: 'all',
    'individual-result': 'all',
    'collective-result': 'all',
    'member-kpi': 'all',
    'member-personal': 'self',
    progress: 'all'
  },
  'quan-tri': {},
  'sieu-quan-tri': Object.fromEntries(Object.keys(resourceLabels).map((r) => [r, 'all']))
};

export const globalBlocks: GlobalBlock[] = [
{
  id: 'review-locked',
  label: 'Phiếu đã gửi hoặc đã quyết định không ai được sửa',
  description: 'Áp cho mọi vai trò, kể cả người lập phiếu và cơ quan tổ chức cán bộ.',
  resource: 'review',
  action: 'write'
},
{
  id: 'review-owner',
  label: 'Chỉ người lập phiếu được sửa phiếu của mình',
  description: 'Chỉ huy và cơ quan chức năng chỉ xem phiếu trong phạm vi, không sửa thay.',
  resource: 'review',
  action: 'write'
},
{
  id: 'results-readonly',
  label: 'Kết quả đã công khai chỉ được xem',
  description: 'Mọi điều chỉnh kết quả đi qua Thẩm định & đề xuất → Quyết định xếp loại, không sửa trực tiếp.',
  resource: 'individual-result',
  action: 'write'
}];