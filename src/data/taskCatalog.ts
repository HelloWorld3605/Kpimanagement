import { CatalogColumnId, CustomField, Force, FieldType, TaskCatalog } from '../types/catalog';

export const forceOptions: Force[] = ['Tham mưu', 'An ninh', 'Cảnh sát'];

export const scopeOptions = ['Tất cả các cấp', 'Cấp Bộ', 'Cấp tỉnh', 'Cấp xã', 'Cấp tỉnh và cấp xã'];

export const fieldTypeOptions: {value: FieldType;label: string;}[] = [
{ value: 'short_text', label: 'Văn bản ngắn' },
{ value: 'long_text', label: 'Văn bản dài' },
{ value: 'number', label: 'Số' },
{ value: 'date', label: 'Ngày' },
{ value: 'select', label: 'Danh sách chọn' }];


export const catalogColumns: {id: CatalogColumnId;label: string;}[] = [
{ id: 'code', label: 'Mã' },
{ id: 'name', label: 'Tên nhiệm vụ' },
{ id: 'force', label: 'Hệ lực lượng' },
{ id: 'scope', label: 'Phạm vi' },
{ id: 'output', label: 'Sản phẩm đầu ra' },
{ id: 'unit', label: 'Đơn vị tính' },
{ id: 'score', label: 'Điểm chuẩn' },
{ id: 'group', label: 'Nhóm điểm' },
{ id: 'version', label: 'Phiên bản' },
{ id: 'status', label: 'Trạng thái' }];


const loaiVanBan: CustomField = {
  id: 'loai_van_ban',
  name: 'Loại văn bản',
  code: 'loai_van_ban',
  type: 'select',
  required: true,
  options: ['Công văn', 'Báo cáo', 'Tờ trình', 'Kế hoạch', 'Quyết định']
};
const trichYeu: CustomField = { id: 'trich_yeu', name: 'Trích yếu', code: 'trich_yeu', type: 'long_text', required: true };
const soKyHieu: CustomField = {
  id: 'so_ky_hieu',
  name: 'Số, ký hiệu văn bản',
  code: 'so_ky_hieu',
  type: 'short_text',
  required: false,
  hint: 'Điền sau khi văn bản được ban hành'
};
const capKy: CustomField = {
  id: 'cap_ky',
  name: 'Cấp ký ban hành',
  code: 'cap_ky',
  type: 'select',
  required: true,
  options: ['Lãnh đạo Bộ', 'Giám đốc CA tỉnh', 'Trưởng phòng']
};
const deAnFields: CustomField[] = [
{ id: 'ten_de_an', name: 'Tên đề án', code: 'ten_de_an', type: 'short_text', required: true },
{ id: 'qd_phe_duyet', name: 'Quyết định phê duyệt', code: 'qd_phe_duyet', type: 'short_text', required: true },
{ id: 'ngay_phe_duyet', name: 'Ngày phê duyệt', code: 'ngay_phe_duyet', type: 'date', required: true }];

const dieuTraFields: CustomField[] = [
{ id: 'so_qd_khoi_to', name: 'Số quyết định khởi tố', code: 'so_qd_khoi_to', type: 'short_text', required: true },
{ id: 'toi_danh', name: 'Tội danh', code: 'toi_danh', type: 'short_text', required: true },
{ id: 'ngay_ket_luan', name: 'Ngày kết luận', code: 'ngay_ket_luan', type: 'date', required: true }];

const soBiCan: CustomField = { id: 'so_bi_can', name: 'Số bị can', code: 'so_bi_can', type: 'number', required: true, unit: 'người' };

const V1 = { effectiveFrom: '01/01/2025', basis: 'QĐ 1250/QĐ-BCA-V01' };
const V1_REPLACED = { ...V1, effectiveTo: '31/12/2025', status: 'replaced' as const };
const V2 = { effectiveFrom: '01/01/2026', basis: 'QĐ 9870/QĐ-BCA-V01' };

export const taskCatalogs: TaskCatalog[] = [
{
  code: 'TM-01',
  force: 'Tham mưu',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  { version: 2, status: 'active', ...V2, name: 'Soạn thảo văn bản tham mưu, chỉ đạo', scope: 'Tất cả các cấp', output: 'Văn bản được ban hành', unit: 'Văn bản', score: 30, fields: [loaiVanBan, trichYeu, soKyHieu, capKy] },
  { version: 1, ...V1_REPLACED, name: 'Soạn thảo văn bản tham mưu, chỉ đạo', scope: 'Tất cả các cấp', output: 'Văn bản được ban hành', unit: 'Văn bản', score: 25, fields: [loaiVanBan, trichYeu, capKy] }]

},
{
  code: 'TM-02',
  force: 'Tham mưu',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Tổng hợp báo cáo định kỳ tuần, tháng, quý', scope: 'Tất cả các cấp', output: 'Báo cáo đã trình ký', unit: 'Báo cáo', score: 25,
    fields: [
    { id: 'ky_bao_cao', name: 'Kỳ báo cáo', code: 'ky_bao_cao', type: 'select', required: true, options: ['Tuần', 'Tháng', 'Quý'] },
    { id: 'ngay_trinh_ky', name: 'Ngày trình ký', code: 'ngay_trinh_ky', type: 'date', required: true },
    { id: 'nguoi_ky', name: 'Người ký', code: 'nguoi_ky', type: 'short_text', required: true }]

  }]

},
{
  code: 'TM-03',
  force: 'Tham mưu',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  { version: 3, status: 'draft', baseVersion: 2, createdBy: 'Trần Minh Đức', createdAt: '20/10/2026', name: 'Xây dựng đề án, kế hoạch chuyên đề cấp tỉnh', scope: 'Cấp tỉnh', output: 'Đề án được phê duyệt', unit: 'Đề án', score: 85, fields: deAnFields },
  { version: 2, status: 'active', ...V2, name: 'Xây dựng đề án, kế hoạch chuyên đề cấp tỉnh', scope: 'Cấp tỉnh', output: 'Đề án được phê duyệt', unit: 'Đề án', score: 85, fields: deAnFields },
  { version: 1, ...V1_REPLACED, name: 'Xây dựng đề án, kế hoạch chuyên đề cấp tỉnh', scope: 'Cấp tỉnh', output: 'Đề án được phê duyệt', unit: 'Đề án', score: 80, fields: deAnFields.slice(0, 2) }]

},
{
  code: 'TM-04',
  force: 'Tham mưu',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Thẩm định văn bản, quy chế nội bộ', scope: 'Cấp Bộ', output: 'Báo cáo thẩm định', unit: 'Báo cáo', score: 55,
    fields: [
    { id: 'vb_tham_dinh', name: 'Văn bản được thẩm định', code: 'vb_tham_dinh', type: 'short_text', required: true },
    { id: 'ket_luan', name: 'Kết luận thẩm định', code: 'ket_luan', type: 'select', required: true, options: ['Đạt', 'Cần chỉnh sửa', 'Không đạt'] }]

  }]

},
{
  code: 'AN-01',
  force: 'An ninh',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Xác minh, xử lý nguồn tin về an ninh quốc gia', scope: 'Cấp tỉnh và cấp xã', output: 'Báo cáo kết quả xác minh', unit: 'Nguồn tin', score: 60,
    fields: [
    { id: 'so_nguon_tin', name: 'Số nguồn tin', code: 'so_nguon_tin', type: 'short_text', required: true },
    { id: 'ket_qua_xm', name: 'Kết quả xác minh', code: 'ket_qua_xm', type: 'select', required: true, options: ['Có dấu hiệu', 'Không có dấu hiệu'] },
    { id: 'ghi_chu', name: 'Ghi chú', code: 'ghi_chu', type: 'long_text', required: false }]

  }]

},
{
  code: 'AN-02',
  force: 'An ninh',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Đấu tranh chuyên án an ninh', scope: 'Cấp Bộ', output: 'Kết luận chuyên án', unit: 'Chuyên án', score: 95,
    fields: [
    { id: 'ma_chuyen_an', name: 'Mã chuyên án', code: 'ma_chuyen_an', type: 'short_text', required: true },
    { id: 'ngay_xac_lap', name: 'Ngày xác lập', code: 'ngay_xac_lap', type: 'date', required: true },
    { id: 'so_doi_tuong', name: 'Số đối tượng', code: 'so_doi_tuong', type: 'number', required: true, unit: 'người' }]

  }]

},
{
  code: 'CS-01',
  force: 'Cảnh sát',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  { version: 1, status: 'active', ...V1, name: 'Điều tra, xử lý vụ án hình sự ít nghiêm trọng', scope: 'Cấp tỉnh và cấp xã', output: 'Kết luận điều tra', unit: 'Vụ án', score: 50, fields: dieuTraFields }]

},
{
  code: 'CS-02',
  force: 'Cảnh sát',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  { version: 2, status: 'active', ...V2, name: 'Điều tra vụ án nghiêm trọng, đặc biệt nghiêm trọng', scope: 'Cấp tỉnh', output: 'Kết luận điều tra', unit: 'Vụ án', score: 90, fields: [...dieuTraFields, soBiCan] },
  { version: 1, ...V1_REPLACED, name: 'Điều tra vụ án nghiêm trọng, đặc biệt nghiêm trọng', scope: 'Cấp tỉnh', output: 'Kết luận điều tra', unit: 'Vụ án', score: 85, fields: dieuTraFields }]

},
{
  code: 'CS-03',
  force: 'Cảnh sát',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  { version: 1, status: 'active', ...V1, name: 'Giải quyết hồ sơ cấp căn cước', scope: 'Cấp xã', output: 'Hồ sơ được cấp', unit: 'Hồ sơ', score: 5, fields: [{ id: 'so_ho_so', name: 'Số hồ sơ', code: 'so_ho_so', type: 'short_text', required: true }] }]

},
{
  code: 'CS-04',
  force: 'Cảnh sát',
  createdAt: '15/12/2024',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Kiểm tra cơ sở kinh doanh có điều kiện về ANTT', scope: 'Cấp tỉnh và cấp xã', output: 'Biên bản kiểm tra', unit: 'Cơ sở', score: 20,
    fields: [
    { id: 'ten_co_so', name: 'Tên cơ sở', code: 'ten_co_so', type: 'short_text', required: true },
    { id: 'nganh_nghe', name: 'Ngành nghề', code: 'nganh_nghe', type: 'select', required: true, options: ['Cầm đồ', 'Karaoke', 'Lưu trú', 'Kinh doanh khí'] },
    { id: 'ket_qua', name: 'Kết quả kiểm tra', code: 'ket_qua', type: 'select', required: true, options: ['Đạt', 'Vi phạm'] },
    { id: 'ghi_chu', name: 'Ghi chú', code: 'ghi_chu', type: 'long_text', required: false }]

  }]

},
{
  code: 'AN-03',
  force: 'An ninh',
  createdAt: '10/03/2025',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Bảo vệ an ninh nội bộ cơ quan', scope: 'Cấp Bộ', output: 'Báo cáo đánh giá', unit: 'Báo cáo', score: 40,
    fields: [
    { id: 'ky_danh_gia', name: 'Kỳ đánh giá', code: 'ky_danh_gia', type: 'select', required: true, options: ['Quý', '6 tháng', 'Năm'] },
    { id: 'ghi_chu', name: 'Ghi chú', code: 'ghi_chu', type: 'long_text', required: false }]

  }]

},
{
  code: 'AN-04',
  force: 'An ninh',
  createdAt: '10/03/2025',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Quản lý xuất nhập cảnh, người nước ngoài', scope: 'Cấp tỉnh', output: 'Hồ sơ được giải quyết', unit: 'Hồ sơ', score: 10,
    fields: [
    { id: 'so_ho_so', name: 'Số hồ sơ', code: 'so_ho_so', type: 'short_text', required: true },
    { id: 'quoc_tich', name: 'Quốc tịch', code: 'quoc_tich', type: 'short_text', required: true }]

  }]

},
{
  code: 'CS-05',
  force: 'Cảnh sát',
  createdAt: '10/03/2025',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Tuần tra, kiểm soát giao thông đường bộ', scope: 'Cấp tỉnh và cấp xã', output: 'Biên bản vi phạm', unit: 'Ca tuần tra', score: 15,
    fields: [
    { id: 'tuyen', name: 'Tuyến tuần tra', code: 'tuyen', type: 'short_text', required: true },
    { id: 'so_vi_pham', name: 'Số vi phạm', code: 'so_vi_pham', type: 'number', required: true, unit: 'trường hợp' }]

  }]

},
{
  code: 'CS-06',
  force: 'Cảnh sát',
  createdAt: '10/03/2025',
  status: 'active',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Phòng cháy, chữa cháy và cứu nạn, cứu hộ', scope: 'Cấp tỉnh', output: 'Báo cáo vụ việc', unit: 'Vụ việc', score: 70,
    fields: [
    { id: 'dia_diem', name: 'Địa điểm', code: 'dia_diem', type: 'short_text', required: true },
    { id: 'thiet_hai', name: 'Thiệt hại ước tính', code: 'thiet_hai', type: 'number', required: true, unit: 'triệu đồng' },
    { id: 'ghi_chu', name: 'Ghi chú', code: 'ghi_chu', type: 'long_text', required: false }]

  }]

},
{
  code: 'CS-07',
  force: 'Cảnh sát',
  createdAt: '10/03/2025',
  status: 'inactive',
  versions: [
  {
    version: 1, status: 'active', ...V1, name: 'Quản lý vũ khí, vật liệu nổ, công cụ hỗ trợ', scope: 'Cấp tỉnh', output: 'Giấy phép được cấp', unit: 'Giấy phép', score: 35,
    fields: [
    { id: 'so_giay_phep', name: 'Số giấy phép', code: 'so_giay_phep', type: 'short_text', required: true },
    { id: 'loai', name: 'Loại', code: 'loai', type: 'select', required: true, options: ['Vũ khí', 'Vật liệu nổ', 'Công cụ hỗ trợ'] }]

  }]

}];