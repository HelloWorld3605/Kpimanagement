import { WorkItem } from '../types/work';

const THINH = 'Hồ Văn Thịnh';

/** Nhiệm vụ mẫu đã tạo ở Đại đội 11 — đủ các trạng thái: đã phân công đủ, một phần, chưa phân công, đã huỷ */
export const workItems: WorkItem[] = [
{
  id: 'w1', code: 'CS-05', source: 'catalog', version: 1, name: 'Tuần tra, kiểm soát địa bàn phường Hoàng Liệt', unit: 'Ca tuần tra', point: 15, qty: 30,
  deadline: '2026-12-10', periodId: 'q4-2026', description: 'Bảo đảm ANTT địa bàn Hoàng Liệt – Linh Đàm', fields: { tuyen: 'Phường Hoàng Liệt – Linh Đàm' },
  unitId: 'c11', createdById: 'm34', createdAt: '18/09/2026', status: 'open',
  history: [{ at: '18/09/2026', by: THINH, text: 'Tạo nhiệm vụ trong Quý 4/2026' }, { at: '20/09/2026', by: THINH, text: 'Phân công 30 → Tiểu đội 1' }]
},
{
  id: 'w2', code: 'TM-02', source: 'catalog', version: 1, name: 'Tổng hợp báo cáo định kỳ tuần, tháng, quý', unit: 'Báo cáo', point: 25, qty: 18,
  deadline: '2026-12-12', periodId: 'q4-2026', description: 'Báo cáo tuần của các tiểu đội gửi Đại đội', fields: { ky_bao_cao: 'Tuần' },
  unitId: 'c11', createdById: 'm34', createdAt: '19/09/2026', status: 'open',
  history: [{ at: '19/09/2026', by: THINH, text: 'Tạo nhiệm vụ trong Quý 4/2026' }, { at: '21/09/2026', by: THINH, text: 'Phân công 6 → Trần Minh Đức' }]
},
{
  id: 'w3', code: 'TM-01', source: 'catalog', version: 2, name: 'Soạn thảo văn bản tham mưu công tác huấn luyện quý IV', unit: 'Văn bản', point: 30, qty: 9,
  deadline: '2026-12-05', periodId: 'q4-2026', description: '', fields: { loai_van_ban: 'Kế hoạch' },
  unitId: 'c11', createdById: 'm34', createdAt: '24/09/2026', status: 'open',
  history: [{ at: '24/09/2026', by: THINH, text: 'Tạo nhiệm vụ trong Quý 4/2026' }, { at: '25/09/2026', by: THINH, text: 'Phân công 9 → Vương Đình Lộc' }]
},
{
  id: 'w4', code: 'CS-04', source: 'catalog', version: 1, name: 'Kiểm tra cơ sở kinh doanh có điều kiện về ANTT', unit: 'Cơ sở', point: 20, qty: 12,
  deadline: '2026-12-08', periodId: 'q4-2026', description: 'Karaoke, quán bar khu Kim Giang – Định Công', fields: { nganh_nghe: 'Karaoke' },
  unitId: 'c11', createdById: 'm34', createdAt: '19/10/2026', status: 'open',
  history: [{ at: '19/10/2026', by: THINH, text: 'Tạo nhiệm vụ trong Quý 4/2026' }, { at: '20/10/2026', by: THINH, text: 'Phân công 5 → Trần Minh Đức' }]
},
{
  id: 'w5', code: 'PS-04', source: 'adhoc', name: 'Huấn luyện nghiệp vụ xử lý gây rối trật tự công cộng', unit: 'Buổi huấn luyện', point: 35, qty: 4,
  deadline: '2026-11-30', periodId: 'q4-2026', basis: 'Chỉ thị 15/CT-BTL ngày 18/10/2026 của Tư lệnh', description: 'Mỗi trung đội 2 buổi', fields: {},
  unitId: 'c11', createdById: 'm34', createdAt: '21/10/2026', status: 'open',
  history: [{ at: '21/10/2026', by: THINH, text: 'Tạo nhiệm vụ trong Quý 4/2026 (phát sinh)' }]
},
{
  id: 'w6', code: 'CS-05', source: 'catalog', version: 1, name: 'Tuần tra, kiểm soát giao thông tuyến Vành đai 3 trên cao', unit: 'Ca tuần tra', point: 15, qty: 16,
  deadline: '2026-12-12', periodId: 'q4-2026', description: 'Phối hợp CSGT dịp cuối năm', fields: { tuyen: 'Vành đai 3 trên cao' },
  unitId: 'c11', createdById: 'm35', createdAt: '22/10/2026', status: 'open',
  history: [{ at: '22/10/2026', by: 'Vương Đình Lộc', text: 'Tạo nhiệm vụ trong Quý 4/2026' }]
},
{
  id: 'w7', code: 'PS-05', source: 'adhoc', name: 'Hỗ trợ diễn tập phòng cháy chữa cháy khu dân cư', unit: 'Buổi', point: 30, qty: 1,
  deadline: '2026-11-10', periodId: 'q4-2026', basis: 'Công văn 88/CV-PC07 ngày 05/10/2026', description: '', fields: {},
  unitId: 'c11', createdById: 'm34', createdAt: '06/10/2026', status: 'cancelled',
  history: [{ at: '06/10/2026', by: THINH, text: 'Tạo nhiệm vụ trong Quý 4/2026 (phát sinh)' }, { at: '15/10/2026', by: THINH, text: 'Huỷ: đơn vị chủ trì đổi sang Đại đội 12' }]
}];