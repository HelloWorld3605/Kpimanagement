import { AppNotification } from '../types/notification';

export const notifications: AppNotification[] = [
{
  id: 'n1',
  category: 'review',
  title: 'Sản phẩm chờ duyệt',
  body: 'Mai Xuân Hòa nộp 2 sản phẩm của TM-02 "Tổng hợp báo cáo định kỳ tuần, tháng, quý".',
  at: '2026-10-22T09:40',
  read: false,
  link: '/quan-ly-nhiem-vu'
},
{
  id: 'n2',
  category: 'task',
  title: 'Việc KPI sắp đến hạn',
  body: 'TM-02 hạn 10/12/2026, mới hoàn thành 2/6 sản phẩm.',
  at: '2026-10-22T08:15',
  read: false,
  link: '/giao-viec'
},
{
  id: 'n3',
  category: 'period',
  title: 'Quý 4/2026 chuyển sang "Đang thực hiện"',
  body: 'Kỳ nhận việc đến 14/12/2026. Lịch tự đánh giá bắt đầu từ 15/12/2026.',
  at: '2026-10-21T16:20',
  read: false,
  link: '/ky-kpi'
},
{
  id: 'n4',
  category: 'review',
  title: 'Phiếu tự đánh giá bị trả lại',
  body: 'Phiếu Quý 3/2026 của Trần Văn Nam cần bổ sung minh chứng mục B2.',
  at: '2026-10-21T10:05',
  read: true,
  link: '/tu-danh-gia'
},
{
  id: 'n5',
  category: 'task',
  title: 'Được giao việc mới',
  body: 'Đại đội trưởng giao việc hằng ngày "Kiểm tra quân số ca trực tuần 43".',
  at: '2026-10-20T14:30',
  read: true,
  link: '/giao-viec'
},
{
  id: 'n6',
  category: 'system',
  title: 'Danh mục nhiệm vụ có phiên bản mới',
  body: 'TM-01 áp dụng v3 từ 01/10/2026. Việc đã giao vẫn giữ phiên bản cũ.',
  at: '2026-10-18T09:00',
  read: true,
  link: '/danh-muc-nhiem-vu'
},
{
  id: 'n7',
  category: 'period',
  title: 'Công khai kết quả Quý 3/2026',
  body: 'Kết quả xếp loại tập thể và cá nhân Quý 3/2026 đã được công khai.',
  at: '2026-10-15T08:00',
  read: true,
  link: '/cong-khai-ket-qua'
},
{
  id: 'n8',
  category: 'system',
  title: 'Đổi vai trò tài khoản',
  body: 'Tài khoản của bạn được thêm vai trò "Chỉ huy (cấp phó)", phụ trách Bệnh xá.',
  at: '2026-10-12T11:45',
  read: true
}];