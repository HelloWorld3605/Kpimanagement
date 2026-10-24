import {
  LayoutGridIcon,
  ClipboardListIcon,
  FileCheckIcon,
  CalendarCheckIcon,
  CalendarDaysIcon,
  TableIcon,
  CircleCheckIcon,
  FileCheck2Icon,
  GavelIcon,
  MegaphoneIcon,
  ArchiveIcon,
  ListChecksIcon,
  TargetIcon,
  CalculatorIcon,
  AwardIcon,
  HistoryIcon,
  NetworkIcon,
  UserCogIcon,
  ContactIcon,
  ShieldCheckIcon,
  ShieldIcon,
  KeyRoundIcon,
  BellIcon,
  PaletteIcon,
  LucideIcon } from
'lucide-react';
import { FeatureId } from '../types/access';

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** Chức năng cần quyền xem để mục hiện trên menu */
  feature: FeatureId;
  badge?: number;
  /** Một dòng mô tả dưới tiêu đề trang */
  description?: string;
};

export type NavGroup = {type: 'group';id: string;label: string;items: NavItem[];};
export type NavEntry = ({type: 'link';} & NavItem) | NavGroup;

/** Số chưa đọc lấy trực tiếp từ danh sách thông báo, không đặt cố định */
export const notificationsItem: NavItem = { id: 'notifications', label: 'Thông báo', path: '/thong-bao', icon: BellIcon, feature: 'notifications' };

export const navEntries: NavEntry[] = [
{ type: 'link', id: 'overview', label: 'Tổng quan', path: '/tong-quan', icon: LayoutGridIcon, feature: 'overview' },
{ type: 'link', ...notificationsItem },
{
  type: 'group',
  id: 'work',
  label: 'Nhiệm vụ',
  items: [
  { id: 'my-tasks', label: 'Nhiệm vụ của tôi', path: '/nhiem-vu-cua-toi', icon: ClipboardListIcon, feature: 'my-tasks' },
  { id: 'task-manage', label: 'Quản lý nhiệm vụ', path: '/quan-ly-nhiem-vu', icon: FileCheckIcon, feature: 'task-assign' },
  { id: 'work-calendar', label: 'Biểu đồ sự kiện', path: '/lich-cong-viec', icon: CalendarCheckIcon, feature: 'work-calendar' }]

},
{
  type: 'group',
  id: 'evaluation',
  label: 'Đánh giá KPI',
  items: [
  { id: 'kpi-period', label: 'Kỳ KPI', path: '/ky-kpi', icon: CalendarDaysIcon, feature: 'kpi-period' },
  { id: 'self-review', label: 'Tự đánh giá, xếp loại', path: '/tu-danh-gia', icon: CircleCheckIcon, feature: 'self-review' },
  { id: 'appraisal', label: 'Thẩm định kết quả đánh giá', path: '/tham-dinh', icon: FileCheck2Icon, feature: 'appraisal' },
  { id: 'decision', label: 'Quyết định xếp loại', path: '/quyet-dinh-xep-loai', icon: GavelIcon, feature: 'decision' },
  { id: 'publish', label: 'Công khai kết quả', path: '/cong-khai-ket-qua', icon: MegaphoneIcon, feature: 'results' },
  { id: 'closed', label: 'Hồ sơ đã chốt', path: '/ho-so-da-chot', icon: ArchiveIcon, feature: 'closed' }]

},
{
  type: 'group',
  id: 'catalog',
  label: 'Danh mục & quy tắc',
  items: [
  { id: 'tasks', label: 'Danh mục nhiệm vụ KPI', path: '/danh-muc-nhiem-vu', icon: ListChecksIcon, feature: 'task-catalog' },
  { id: 'criteria', label: 'Bộ tiêu chí & biểu mẫu', path: '/danh-muc-tieu-chi', icon: TargetIcon, feature: 'criteria-catalog' },
  { id: 'scoring-rules', label: 'Quy tắc tính điểm & quy đổi', path: '/quy-tac-tinh-diem', icon: CalculatorIcon, feature: 'scoring-rules' }]

},
{
  type: 'group',
  id: 'reports',
  label: 'Báo cáo & tra cứu',
  items: [
  { id: 'annual-rank', label: 'Xếp loại năm', path: '/xep-loai-nam', icon: AwardIcon, feature: 'annual-rank' },
  { id: 'audit-log', label: 'Lịch sử & nhật ký kiểm toán', path: '/lich-su-kiem-toan', icon: HistoryIcon, feature: 'audit-log' }]

},
{ type: 'link', id: 'org', label: 'Cơ cấu tổ chức', path: '/co-cau-to-chuc', icon: NetworkIcon, feature: 'org' },
{
  type: 'group',
  id: 'admin',
  label: 'Quản trị hệ thống',
  items: [
  { id: 'users', label: 'Người dùng', path: '/nguoi-dung', icon: UserCogIcon, feature: 'admin' },
  { id: 'staff', label: 'Nhân sự', path: '/nhan-su', icon: ContactIcon, feature: 'admin' },
  { id: 'roles', label: 'Vai trò', path: '/vai-tro', icon: ShieldCheckIcon, feature: 'admin' },
  { id: 'permissions', label: 'Quyền', path: '/quyen', icon: KeyRoundIcon, feature: 'admin' },
  { id: 'data-scope', label: 'Phạm vi dữ liệu', path: '/pham-vi-du-lieu', icon: ShieldIcon, feature: 'admin' }]

}];


/** Dòng mô tả dưới tiêu đề từng trang, theo id mục menu */
export const navDescriptions: Record<string, string> = {
  overview: 'Tình hình thực hiện nhiệm vụ và kết quả KPI của đơn vị.',
  'my-tasks': 'Việc KPI và việc hằng ngày được giao cho bạn.',
  'task-manage': 'Tạo, phân công và theo dõi nhiệm vụ của cán bộ thuộc phạm vi quản lý; duyệt kết quả, thêm nhiệm vụ con.',
  'work-calendar': 'Lịch hạn nhiệm vụ và kết quả thực hiện.',
  'kpi-period': 'Vòng đời các kỳ đánh giá, lịch tự đánh giá, thẩm định, phê duyệt.',
  scoresheet: 'Bảng điểm KPI tập thể, lãnh đạo chỉ huy và cán bộ theo kỳ.',
  'self-review': 'Phiếu tự đánh giá, xếp loại của cá nhân và cán bộ cấp dưới.',
  appraisal: 'Thẩm định kết quả tự đánh giá và đề xuất mức xếp loại.',
  decision: 'Quyết định xếp loại của cấp có thẩm quyền.',
  publish: 'Kết quả xếp loại đã công khai theo đơn vị và cá nhân.',
  closed: 'Hồ sơ đánh giá đã chốt, lưu trữ theo kỳ.',
  tasks: 'Danh mục nhiệm vụ, sản phẩm và điểm chuẩn theo phiên bản.',
  criteria: 'Bộ tiêu chí chung và biểu mẫu đánh giá theo đối tượng.',
  'scoring-rules': 'Công thức tính điểm, mức chất lượng, tiến độ và quy đổi.',
  'annual-rank': 'Tổng hợp xếp loại năm từ kết quả các quý.',
  'audit-log': 'Lịch sử thao tác và nhật ký kiểm toán.',
  org: 'Sơ đồ đơn vị và danh sách cán bộ.',
  users: 'Tài khoản đăng nhập và vai trò.',
  staff: 'Hồ sơ nghiệp vụ cán bộ: cấp bậc, chức vụ, đơn vị và tài khoản gắn kèm.',
  roles: 'Vai trò, quyền được cấp và tài khoản đang giữ vai trò.',
  permissions: 'Danh mục quyền: chức năng × thao tác, và vai trò được cấp.',
  'data-scope': 'Phạm vi dữ liệu được xem theo vai trò.',
  notifications: 'Thông báo của hệ thống.',
  'style-guide': 'Màu sắc, chữ, thành phần giao diện dùng chung.'
};

/** Có trang nhưng không nằm trên sidebar: Tài liệu giao diện mở bằng đường dẫn */
export const hiddenNavItems: NavItem[] = [
{ id: 'style-guide', label: 'Tài liệu giao diện', path: '/tai-lieu-ui', icon: PaletteIcon, feature: 'style-guide' }];


/** Màn đã thiết kế xong — các mục còn lại hiện trang chờ */
export const builtPaths = [
'/tai-lieu-ui',
'/danh-muc-nhiem-vu',
'/danh-muc-tieu-chi',
'/tu-danh-gia',
'/quan-ly-nhiem-vu',
'/co-cau-to-chuc',
'/cong-khai-ket-qua',
'/nguoi-dung',
'/nhan-su',
'/vai-tro',
'/quyen',
'/pham-vi-du-lieu',
'/thong-bao',
'/ky-kpi',
'/tham-dinh',
'/nhiem-vu-cua-toi',
'/tong-quan',
'/lich-cong-viec'];