import { DailyTask } from '../types/work';

export const dailyTasks: DailyTask[] = [
{
  id: 'w1', name: 'Chuẩn bị nội dung giao ban tuần 43', description: 'Tổng hợp tình hình các trung đội, dự thảo kết luận giao ban.',
  assignedById: 'm34', leadId: 'm35', collaboratorIds: ['m36'], deadline: '2026-10-23', status: 'doing'
},
{
  id: 'w2', name: 'Kiểm tra trang bị, phương tiện trước đợt cơ động', description: 'Rà soát xe, khí tài, công cụ hỗ trợ của Trung đội 2.',
  assignedById: 'm34', leadId: 'm44', collaboratorIds: ['m45'], deadline: '2026-10-24', status: 'todo'
},
{
  id: 'w3', name: 'Lập lịch trực ban, trực chỉ huy tháng 11', description: 'Lập lịch, gửi các trung đội góp ý trước ngày 28.',
  assignedById: 'm34', leadId: 'm36', collaboratorIds: ['m37', 'm41'], deadline: '2026-10-28', status: 'review'
},
{
  id: 'w4', name: 'Rà soát danh sách quân nhân đủ điều kiện nâng lương', description: 'Đối chiếu với hồ sơ cán bộ, gửi Tiểu đoàn trước ngày 20.',
  assignedById: 'm34', leadId: 'm35', collaboratorIds: [], deadline: '2026-10-20', status: 'returned'
},
{
  id: 'w5', name: 'Tổ chức sinh hoạt chính trị tuần 42', description: 'Nội dung: Chỉ thị về điều lệnh nội vụ.',
  assignedById: 'm34', leadId: 'm37', collaboratorIds: ['m38', 'm39'], deadline: '2026-10-16', status: 'done'
},
{
  id: 'w6', name: 'Báo cáo Tiểu đoàn kết quả huấn luyện tháng 10', description: 'Báo cáo do Đại đội trưởng chủ trì, cần Tiểu đoàn trưởng nghiệm thu.',
  assignedById: 'm34', leadId: 'm34', collaboratorIds: ['m35'], deadline: '2026-10-31', status: 'review'
},
{
  id: 'w7', name: 'Vệ sinh doanh trại, kho tàng cuối tuần', description: '',
  assignedById: 'm34', leadId: 'm41', collaboratorIds: ['m42', 'm43'], deadline: '2026-10-25', status: 'todo'
}];