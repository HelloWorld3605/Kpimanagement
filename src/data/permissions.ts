import { Action, FeatureId } from '../types/access';

/** Nội dung của từng chức năng — ghép với thao tác thành mô tả quyền */
export const featureDescriptions: Record<FeatureId, string> = {
  overview: 'trang tổng quan tình hình thực hiện nhiệm vụ và kết quả KPI của đơn vị',
  notifications: 'thông báo giao việc, nhắc hạn, duyệt sản phẩm và kỳ đánh giá',
  org: 'cơ cấu tổ chức, sơ đồ đơn vị và danh sách nhân sự',
  'my-tasks': 'việc KPI và việc hằng ngày được giao cho bản thân, nộp sản phẩm và báo cáo kết quả',
  'task-assign': 'giao việc KPI, việc hằng ngày, chuyển kỳ, nhắc hạn cho đơn vị và cán bộ trong phạm vi chỉ huy',
  'product-review': 'sản phẩm cán bộ đã nộp: duyệt, trả lại, đánh dấu vượt mức',
  'work-calendar': 'lịch hạn nhiệm vụ và kết quả thực hiện',
  'task-catalog': 'Danh mục nhiệm vụ KPI, các phiên bản và trường thông tin riêng của từng mục',
  'criteria-catalog': 'bộ tiêu chí đánh giá và biểu mẫu phiếu tự đánh giá',
  'scoring-rules': 'quy tắc tính điểm chất lượng, tiến độ và bảng quy đổi xếp loại',
  'kpi-period': 'kỳ đánh giá: vòng đời kỳ, lịch tự đánh giá, thẩm định, phê duyệt',
  scoresheet: 'bảng điểm KPI tập thể, lãnh đạo chỉ huy và cán bộ theo kỳ',
  'self-review': 'phiếu tự đánh giá, xếp loại của cá nhân',
  appraisal: 'kết quả thẩm định và đề xuất mức xếp loại',
  decision: 'quyết định xếp loại của cấp có thẩm quyền',
  results: 'kết quả xếp loại đã công khai của tập thể và cá nhân',
  closed: 'hồ sơ đánh giá đã chốt của các kỳ trước',
  progress: 'báo cáo theo dõi tiến độ xử lý công việc theo đơn vị',
  'kpi-report': 'báo cáo tổng hợp KPI theo kỳ, đơn vị',
  'staff-groups': 'phân nhóm cán bộ phục vụ đánh giá',
  'annual-rank': 'tổng hợp xếp loại năm từ kết quả các quý',
  'audit-log': 'lịch sử thao tác và nhật ký kiểm toán hệ thống',
  admin: 'tài khoản người dùng, vai trò, quyền và phạm vi dữ liệu',
  'style-guide': 'tài liệu giao diện dùng chung'
};

/** Động từ đặt trước tên chức năng */
export const actionVerbs: Record<Action, string> = {
  view: 'Xem',
  write: 'Thêm, sửa',
  delete: 'Xoá'
};

/** Tên ngắn trên chip thao tác */
export const actionChips: Record<Action, string> = {
  view: 'Xem',
  write: 'Thêm, sửa',
  delete: 'Xoá'
};