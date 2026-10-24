import { KpiTask, ProductStatus, TaskProduct } from '../types/work';

const THINH = 'Hồ Văn Thịnh';
const AN = 'Nguyễn Văn An';
const LOC = 'Vương Đình Lộc';

/** Sản phẩm mẫu: [tên, ngày hoàn thành, trạng thái, ghi chú / lý do trả lại] */
const prods = (prefix: string, list: [string, string, ProductStatus, string?][]): TaskProduct[] =>
list.map(([name, doneAt, status, extra], i) => ({
  id: `${prefix}-p${i + 1}`,
  name,
  doneAt,
  note: status === 'returned' ? '' : extra ?? '',
  status,
  reason: status === 'returned' ? extra : undefined,
  source: 'form'
}));

export const kpiTasks: KpiTask[] = [
/* ---------- Quý 4/2026 ---------- */
{
  id: 'k1', code: 'CS-05', source: 'catalog', version: 1, name: 'Tuần tra, kiểm soát giao thông đường bộ', unit: 'Ca tuần tra', point: 15, qty: 24, approved: 9,
  deadline: '2026-12-14', periodId: 'q4-2026', assignee: { kind: 'unit', unitId: 'b1' }, assignedById: 'm34',
  fields: { tuyen: 'Quốc lộ 1A, đoạn Pháp Vân – Cầu Giẽ', so_vi_pham: '' }, status: 'in-progress', reminders: 0,
  history: [{ at: '15/09/2026', by: THINH, text: 'Tạo, chưa gán kỳ' }, { at: '16/09/2026', by: THINH, text: 'Gán vào Quý 4/2026' }]
},
{
  id: 'k2', code: 'TM-02', source: 'catalog', version: 1, name: 'Tổng hợp báo cáo định kỳ tuần, tháng, quý', unit: 'Báo cáo', point: 25, qty: 13, approved: 6,
  deadline: '2026-12-12', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm35' }, assignedById: 'm34',
  fields: { ky_bao_cao: 'Tuần', ngay_trinh_ky: '', nguoi_ky: 'Hồ Văn Thịnh' }, status: 'in-progress', reminders: 1,
  history: [{ at: '16/09/2026', by: THINH, text: 'Tạo trong Quý 4/2026' }, { at: '02/10/2026', by: THINH, text: 'Nhắc hạn' }]
},
{
  id: 'k3', code: 'TM-01', source: 'catalog', version: 2, name: 'Soạn thảo văn bản tham mưu, chỉ đạo', unit: 'Văn bản', point: 30, qty: 4, approved: 4,
  deadline: '2026-10-20', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm36' }, assignedById: 'm34',
  fields: { loai_van_ban: 'Kế hoạch', trich_yeu: 'Kế hoạch huấn luyện điều lệnh quý IV', cap_ky: 'Trưởng phòng' }, status: 'reported', reminders: 0,
  history: [{ at: '18/09/2026', by: THINH, text: 'Tạo trong Quý 4/2026' }, { at: '19/10/2026', by: 'Lê Quang Huy', text: 'Báo cáo kết quả 4/4 sản phẩm' }]
},
{
  id: 'k4', code: 'CS-04', source: 'catalog', version: 1, name: 'Kiểm tra cơ sở kinh doanh có điều kiện về ANTT', unit: 'Cơ sở', point: 20, qty: 6, approved: 2,
  deadline: '2026-10-15', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm37' }, assignedById: 'm34',
  fields: { ten_co_so: 'Các cơ sở lưu trú phường Hoàng Liệt', nganh_nghe: 'Lưu trú', ket_qua: '' }, status: 'in-progress', reminders: 2,
  history: [
  { at: '20/09/2026', by: THINH, text: 'Tạo trong Quý 4/2026' },
  { at: '08/10/2026', by: THINH, text: 'Nhắc hạn' },
  { at: '16/10/2026', by: THINH, text: 'Nhắc hạn' }]

},
{
  id: 'k5', code: 'PS-01', source: 'adhoc', name: 'Bảo vệ mục tiêu dịp Đại hội Đảng bộ Bộ Tư lệnh', unit: 'Phương án', point: 70, qty: 1, approved: 0,
  deadline: '2026-11-05', periodId: 'q4-2026', assignee: { kind: 'unit', unitId: 'b2' }, assignedById: 'm34',
  basis: 'Chỉ thị 12/CT-BTL ngày 02/10/2026 của Tư lệnh', fields: {}, status: 'assigned', reminders: 0,
  history: [{ at: '03/10/2026', by: THINH, text: 'Tạo trong Quý 4/2026 (việc phát sinh)' }]
},
{
  id: 'k6', code: 'CS-05', source: 'catalog', version: 1, name: 'Tuần tra, kiểm soát giao thông đường bộ', unit: 'Ca tuần tra', point: 15, qty: 10, approved: 3,
  deadline: '2026-12-10', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm44' }, assignedById: 'm34',
  fields: { tuyen: 'Vành đai 3', so_vi_pham: '' }, status: 'in-progress', reminders: 0,
  history: [{ at: '16/09/2026', by: THINH, text: 'Tạo trong Quý 4/2026' }]
},
{
  id: 'k7', code: 'TM-01', source: 'catalog', version: 2, name: 'Soạn thảo văn bản tham mưu, chỉ đạo', unit: 'Văn bản', point: 30, qty: 2, approved: 0,
  deadline: '2026-11-20', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm38' }, assignedById: 'm34',
  fields: {}, status: 'revoked', reminders: 0,
  history: [{ at: '22/09/2026', by: THINH, text: 'Tạo trong Quý 4/2026' }, { at: '05/10/2026', by: THINH, text: 'Thu hồi: chuyển nội dung sang Trung đội 1' }]
},

/* ---------- Chưa gán kỳ ---------- */
{
  id: 'k8', code: 'TM-02', source: 'catalog', version: 1, name: 'Tổng hợp báo cáo định kỳ tuần, tháng, quý', unit: 'Báo cáo', point: 25, qty: 3, approved: 0,
  deadline: '2027-01-20', periodId: null, assignee: { kind: 'member', memberId: 'm35' }, assignedById: 'm34',
  fields: { ky_bao_cao: 'Tháng' }, status: 'assigned', reminders: 0,
  history: [{ at: '12/10/2026', by: THINH, text: 'Tạo, chưa gán kỳ' }]
},
{
  id: 'k9', code: 'PS-02', source: 'adhoc', name: 'Tập huấn sử dụng phần mềm quản lý KPI cho cán bộ trung đội', unit: 'Buổi tập huấn', point: 40, qty: 2, approved: 0,
  deadline: '2026-12-05', periodId: null, assignee: { kind: 'unit', unitId: 'b1' }, assignedById: 'm34',
  basis: 'Kế hoạch 45/KH-BTL triển khai chuyển đổi số năm 2026', fields: {}, status: 'assigned', reminders: 0,
  history: [{ at: '14/10/2026', by: THINH, text: 'Tạo, chưa gán kỳ (việc phát sinh)' }]
},
{
  id: 'k10', code: 'CS-04', source: 'catalog', version: 1, name: 'Kiểm tra cơ sở kinh doanh có điều kiện về ANTT', unit: 'Cơ sở', point: 20, qty: 5, approved: 0,
  deadline: '2027-02-28', periodId: null, assignee: { kind: 'member', memberId: 'm41' }, assignedById: 'm34',
  fields: { nganh_nghe: 'Karaoke' }, status: 'assigned', reminders: 0,
  history: [{ at: '15/10/2026', by: THINH, text: 'Tạo, chưa gán kỳ' }]
},

/* ---------- Quý 3/2026 (đã đóng) ---------- */
{
  id: 'k11', code: 'CS-05', source: 'catalog', version: 1, name: 'Tuần tra, kiểm soát giao thông đường bộ', unit: 'Ca tuần tra', point: 15, qty: 20, approved: 20,
  deadline: '2026-09-14', periodId: 'q3-2026', assignee: { kind: 'unit', unitId: 'b1' }, assignedById: 'm34', fields: {}, status: 'reported', reminders: 0,
  history: [{ at: '16/06/2026', by: THINH, text: 'Tạo trong Quý 3/2026' }]
},
{
  id: 'k12', code: 'TM-02', source: 'catalog', version: 1, name: 'Tổng hợp báo cáo định kỳ tuần, tháng, quý', unit: 'Báo cáo', point: 25, qty: 8, approved: 8,
  deadline: '2026-09-12', periodId: 'q3-2026', assignee: { kind: 'member', memberId: 'm35' }, assignedById: 'm34', fields: {}, status: 'reported', reminders: 0,
  history: [{ at: '16/06/2026', by: THINH, text: 'Tạo trong Quý 3/2026' }]
},
{
  id: 'k13', code: 'CS-05', source: 'catalog', version: 1, name: 'Tuần tra, kiểm soát giao thông đường bộ', unit: 'Ca tuần tra', point: 15, qty: 8, approved: 8,
  deadline: '2026-09-10', periodId: 'q3-2026', assignee: { kind: 'member', memberId: 'm44' }, assignedById: 'm34', fields: {}, status: 'reported', reminders: 0,
  history: [{ at: '18/06/2026', by: THINH, text: 'Tạo trong Quý 3/2026' }]
},

/* ---------- Phòng Hậu cần – Kỹ thuật ---------- */
{
  id: 'k14', code: 'TM-02', source: 'catalog', version: 1, name: 'Tổng hợp báo cáo định kỳ tuần, tháng, quý', unit: 'Báo cáo', point: 25, qty: 6, approved: 2,
  deadline: '2026-12-10', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm24' }, assignedById: 'm22', fields: {}, status: 'in-progress', reminders: 0,
  history: [{ at: '17/09/2026', by: 'Kiều Minh Đức', text: 'Tạo trong Quý 4/2026' }]
},
...seedTasks()];


/**
 * Bộ dữ liệu đầy đủ cho Nhiệm vụ của tôi (cán bộ Trần Minh Đức — tài khoản canbo)
 * và nhiệm vụ lớn / nhỏ: nhiệm vụ cha giao cho đơn vị, tách thành nhiệm vụ con cho từng cán bộ.
 */
export function seedTasks(): KpiTask[] {
  return [
  /* ---- Nhiệm vụ lớn 1: Tuần tra địa bàn — giao Tiểu đội 1, tách 3 nhiệm vụ con ---- */
  {
    id: 'k20', code: 'CS-05', source: 'catalog', version: 1, name: 'Tuần tra, kiểm soát địa bàn phường Hoàng Liệt', unit: 'Ca tuần tra', point: 15, qty: 30, approved: 0,
    deadline: '2026-12-10', periodId: 'q4-2026', assignee: { kind: 'unit', unitId: 'a1' }, assignedById: 'm34', workItemId: 'w1',
    fields: { tuyen: 'Phường Hoàng Liệt – Linh Đàm', so_vi_pham: '' }, status: 'in-progress', reminders: 0, products: [],
    history: [
    { at: '20/09/2026', by: THINH, text: 'Phân công 30 ca tuần tra từ nhiệm vụ CS-05 cho Tiểu đội 1' },
    { at: '22/09/2026', by: AN, text: 'Thêm nhiệm vụ con CS-05.1 (12 ca tuần tra)' },
    { at: '22/09/2026', by: AN, text: 'Thêm nhiệm vụ con CS-05.2 (10 ca tuần tra)' },
    { at: '22/09/2026', by: AN, text: 'Thêm nhiệm vụ con CS-05.3 (8 ca tuần tra)' }]

  },
  {
    id: 'k21', code: 'CS-05.1', source: 'catalog', version: 1, name: 'Tuần tra tuyến Linh Đàm – Nguyễn Hữu Thọ', unit: 'Ca tuần tra', point: 15, qty: 12, approved: 5,
    deadline: '2026-12-10', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm38' }, collaboratorIds: ['m39'], assignedById: 'm37', parentId: 'k20',
    fields: { tuyen: 'Linh Đàm – Nguyễn Hữu Thọ', so_vi_pham: '7' }, status: 'in-progress', reminders: 0,
    products: prods('k21', [
    ['Ca tuần tra sáng 24/09', '2026-09-24', 'approved', 'Lập 2 biên bản vi phạm'],
    ['Ca tuần tra đêm 29/09', '2026-09-29', 'approved'],
    ['Ca tuần tra sáng 03/10', '2026-10-03', 'approved', 'Lập 1 biên bản'],
    ['Ca tuần tra chiều 08/10', '2026-10-08', 'approved'],
    ['Ca tuần tra đêm 12/10', '2026-10-12', 'approved', 'Lập 4 biên bản'],
    ['Ca tuần tra sáng 17/10', '2026-10-17', 'returned', 'Thiếu sổ nhật ký ca, bổ sung chữ ký trưởng ca'],
    ['Ca tuần tra chiều 20/10', '2026-10-20', 'pending'],
    ['Ca tuần tra đêm 22/10', '2026-10-22', 'pending']]
    ),
    history: [
    { at: '22/09/2026', by: AN, text: 'Tách từ CS-05, giao 12 ca tuần tra' },
    { at: '13/10/2026', by: AN, text: 'Duyệt 5 sản phẩm' },
    { at: '18/10/2026', by: AN, text: 'Trả lại sản phẩm “Ca tuần tra sáng 17/10”: Thiếu sổ nhật ký ca, bổ sung chữ ký trưởng ca' }]

  },
  {
    id: 'k22', code: 'CS-05.2', source: 'catalog', version: 1, name: 'Tuần tra tuyến Giải Phóng – Kim Giang', unit: 'Ca tuần tra', point: 15, qty: 10, approved: 6,
    deadline: '2026-12-10', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm39' }, assignedById: 'm37', parentId: 'k20',
    fields: { tuyen: 'Giải Phóng – Kim Giang', so_vi_pham: '3' }, status: 'in-progress', reminders: 0,
    products: prods('k22', [
    ['Ca tuần tra 25/09', '2026-09-25', 'approved'],
    ['Ca tuần tra 30/09', '2026-09-30', 'approved'],
    ['Ca tuần tra 04/10', '2026-10-04', 'approved'],
    ['Ca tuần tra 09/10', '2026-10-09', 'approved'],
    ['Ca tuần tra 13/10', '2026-10-13', 'approved'],
    ['Ca tuần tra 16/10', '2026-10-16', 'approved'],
    ['Ca tuần tra 21/10', '2026-10-21', 'pending']]
    ),
    history: [{ at: '22/09/2026', by: AN, text: 'Tách từ CS-05, giao 10 ca tuần tra' }]
  },
  {
    id: 'k23', code: 'CS-05.3', source: 'catalog', version: 1, name: 'Tuần tra khu đô thị Tây Nam Linh Đàm', unit: 'Ca tuần tra', point: 15, qty: 8, approved: 2,
    deadline: '2026-11-30', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm37' }, assignedById: 'm34', parentId: 'k20',
    fields: { tuyen: 'KĐT Tây Nam Linh Đàm', so_vi_pham: '' }, status: 'in-progress', reminders: 0,
    products: prods('k23', [
    ['Ca tuần tra 02/10', '2026-10-02', 'approved'],
    ['Ca tuần tra 14/10', '2026-10-14', 'approved']]
    ),
    history: [{ at: '22/09/2026', by: AN, text: 'Tách từ CS-05, giao 8 ca tuần tra' }]
  },

  /* ---- Nhiệm vụ lớn 2: Văn bản tham mưu — giao Phó Đại đội trưởng, tách 2 nhiệm vụ con ---- */
  {
    id: 'k30', code: 'TM-01', source: 'catalog', version: 2, name: 'Soạn thảo văn bản tham mưu công tác huấn luyện quý IV', unit: 'Văn bản', point: 30, qty: 9, approved: 2,
    deadline: '2026-12-05', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm35' }, assignedById: 'm34', workItemId: 'w3',
    fields: { loai_van_ban: 'Kế hoạch', trich_yeu: 'Huấn luyện điều lệnh, võ thuật quý IV', cap_ky: 'Đại đội trưởng' }, status: 'in-progress', reminders: 0,
    products: prods('k30', [
    ['Kế hoạch 15/KH-C11 huấn luyện điều lệnh', '2026-10-05', 'approved', 'Số 15/KH-C11'],
    ['Báo cáo 16/BC-C11 kết quả kiểm tra võ thuật', '2026-10-15', 'approved', 'Số 16/BC-C11']]
    ),
    history: [
    { at: '25/09/2026', by: THINH, text: 'Phân công 9 văn bản từ nhiệm vụ TM-01 cho Vương Đình Lộc' },
    { at: '28/09/2026', by: LOC, text: 'Thêm nhiệm vụ con TM-01.1 (4 văn bản)' },
    { at: '28/09/2026', by: LOC, text: 'Thêm nhiệm vụ con TM-01.2 (3 văn bản)' }]

  },
  {
    id: 'k31', code: 'TM-01.1', source: 'catalog', version: 2, name: 'Dự thảo kế hoạch huấn luyện cấp trung đội', unit: 'Văn bản', point: 30, qty: 4, approved: 1,
    deadline: '2026-11-25', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm36' }, assignedById: 'm35', parentId: 'k30',
    fields: { loai_van_ban: 'Kế hoạch' }, status: 'in-progress', reminders: 1,
    products: prods('k31', [
    ['Kế hoạch huấn luyện Trung đội 1 tháng 10', '2026-10-06', 'approved'],
    ['Kế hoạch huấn luyện Trung đội 1 tháng 11', '2026-10-21', 'pending']]
    ),
    history: [{ at: '28/09/2026', by: LOC, text: 'Tách từ TM-01, giao 4 văn bản' }, { at: '15/10/2026', by: LOC, text: 'Nhắc hạn' }]
  },
  {
    id: 'k32', code: 'TM-01.2', source: 'catalog', version: 2, name: 'Dự thảo báo cáo kết quả kiểm tra điều lệnh', unit: 'Văn bản', point: 30, qty: 3, approved: 0,
    deadline: '2026-11-28', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm44' }, assignedById: 'm35', parentId: 'k30',
    fields: { loai_van_ban: 'Báo cáo' }, status: 'assigned', reminders: 0, products: [],
    history: [{ at: '28/09/2026', by: LOC, text: 'Tách từ TM-01, giao 3 văn bản' }]
  },

  /* ---- Nhiệm vụ riêng của cán bộ Trần Minh Đức ---- */
  {
    id: 'k24', code: 'TM-02', source: 'catalog', version: 1, name: 'Tổng hợp báo cáo tuần của Tiểu đội 1', unit: 'Báo cáo', point: 25, qty: 6, approved: 2,
    deadline: '2026-11-15', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm38' }, watcherIds: ['m37'], assignedById: 'm34', workItemId: 'w2',
    fields: { ky_bao_cao: 'Tuần', nguoi_ky: 'Nguyễn Văn An' }, status: 'in-progress', reminders: 0,
    products: prods('k24', [
    ['Báo cáo tuần 39', '2026-09-27', 'approved'],
    ['Báo cáo tuần 40', '2026-10-04', 'approved'],
    ['Báo cáo tuần 41', '2026-10-11', 'returned', 'Số liệu quân số chưa khớp sổ trực ban'],
    ['Báo cáo tuần 42', '2026-10-18', 'pending']]
    ),
    history: [
    { at: '21/09/2026', by: THINH, text: 'Phân công 6 báo cáo từ nhiệm vụ TM-02 cho Trần Minh Đức' },
    { at: '12/10/2026', by: AN, text: 'Trả lại sản phẩm “Báo cáo tuần 41”: Số liệu quân số chưa khớp sổ trực ban' }]

  },
  {
    id: 'k25', code: 'CS-04', source: 'catalog', version: 1, name: 'Kiểm tra cơ sở lưu trú trên địa bàn phường Hoàng Liệt', unit: 'Cơ sở', point: 20, qty: 4, approved: 1,
    deadline: '2026-10-18', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm38' }, assignedById: 'm34',
    fields: { ten_co_so: 'Nhà nghỉ khu Linh Đàm', nganh_nghe: 'Lưu trú', ket_qua: '' }, status: 'in-progress', reminders: 2,
    products: prods('k25', [
    ['Kiểm tra nhà nghỉ Hoàng Long', '2026-10-02', 'approved', 'Biên bản 21/BB'],
    ['Kiểm tra nhà nghỉ Sao Mai', '2026-10-16', 'pending', 'Biên bản 24/BB']]
    ),
    history: [
    { at: '25/09/2026', by: THINH, text: 'Tạo trong Quý 4/2026' },
    { at: '10/10/2026', by: THINH, text: 'Nhắc hạn' },
    { at: '19/10/2026', by: THINH, text: 'Nhắc hạn' }]

  },
  {
    id: 'k26', code: 'PS-03', source: 'adhoc', name: 'Bảo vệ Lễ kỷ niệm Ngày truyền thống lực lượng CSCĐ', unit: 'Phương án', point: 50, qty: 1, approved: 0,
    deadline: '2026-11-05', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm41' }, collaboratorIds: ['m38', 'm42'], assignedById: 'm34',
    basis: 'Kế hoạch 61/KH-BTL ngày 10/10/2026', fields: {}, status: 'assigned', reminders: 0, products: [],
    history: [{ at: '11/10/2026', by: THINH, text: 'Tạo trong Quý 4/2026 (phát sinh)' }]
  },
  {
    id: 'k27', code: 'TM-01', source: 'catalog', version: 2, name: 'Soạn thảo báo cáo sơ kết phong trào thi đua tháng 9', unit: 'Văn bản', point: 30, qty: 2, approved: 2,
    deadline: '2026-10-10', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm38' }, assignedById: 'm34',
    fields: { loai_van_ban: 'Báo cáo' }, status: 'reported', reminders: 0,
    products: prods('k27', [
    ['Báo cáo 09/BC-A1 sơ kết thi đua', '2026-10-03', 'approved', 'Số 09/BC-A1'],
    ['Báo cáo 10/BC-A1 đề xuất khen thưởng', '2026-10-08', 'approved', 'Số 10/BC-A1']]
    ),
    history: [
    { at: '20/09/2026', by: THINH, text: 'Tạo trong Quý 4/2026' },
    { at: '09/10/2026', by: 'Trần Minh Đức', text: 'Báo cáo hoàn thành 2/2 sản phẩm' }]

  },
  {
    id: 'k28', code: 'CS-04', source: 'catalog', version: 1, name: 'Kiểm tra cơ sở karaoke, quán bar khu Kim Giang', unit: 'Cơ sở', point: 20, qty: 5, approved: 0,
    deadline: '2026-12-08', periodId: 'q4-2026', assignee: { kind: 'member', memberId: 'm38' }, assignedById: 'm34', workItemId: 'w4',
    fields: { nganh_nghe: 'Karaoke' }, status: 'assigned', reminders: 0, products: [],
    history: [{ at: '20/10/2026', by: THINH, text: 'Phân công 5 cơ sở từ nhiệm vụ CS-04 cho Trần Minh Đức' }]
  }];

}