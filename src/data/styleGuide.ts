// Phiên bản tài liệu: đặt tên theo ngày giờ tạo bản đầu tiên.
export const styleGuideVersion = {
  label: 'UI-first',
  createdAt: '2026-10-21T09:00:00'
};

export const docSections = [
{ id: 'colors', label: 'Màu sắc', tab: 'foundation' },
{ id: 'typography', label: 'Kiểu chữ', tab: 'foundation' },
{ id: 'layout', label: 'Bố cục', tab: 'foundation' },
{ id: 'motion', label: 'Chuyển động', tab: 'foundation' },
{ id: 'buttons', label: 'Nút', tab: 'components' },
{ id: 'inputs', label: 'Ô nhập & bộ lọc', tab: 'components' },
{ id: 'navigation', label: 'Điều hướng & tab', tab: 'components' },
{ id: 'badges', label: 'Badge & trạng thái', tab: 'components' },
{ id: 'tables', label: 'Bảng dữ liệu', tab: 'components' }];


export const colorGroups = [
{
  name: 'Brand – Đỏ',
  description: 'Màu chủ đạo, lấy từ nền trống đồng của sidebar. Dùng cho hành động chính và trạng thái được chọn.',
  tokens: [
  { token: 'brand-50', hex: '#FDF3F3', usage: 'Nền dòng chọn, nền tiêu đề nhóm bảng' },
  { token: 'brand-100', hex: '#FBE4E4', usage: 'Viền focus ô nhập' },
  { token: 'brand-500', hex: '#C2161C', usage: 'Badge số đếm' },
  { token: 'brand-600', hex: '#A81318', usage: 'Nút chính, tab active, liên kết nhấn mạnh' },
  { token: 'brand-700', hex: '#8C0F13', usage: 'Hover nút chính, chữ tiêu đề nhóm' },
  { token: 'brand-900', hex: '#4A0608', usage: 'Lớp phủ sidebar, mục menu active' }]

},
{
  name: 'Gold – Vàng kim',
  description: 'Màu nhấn trên nền đỏ. Chỉ dùng trên sidebar hoặc nền tối, không dùng làm chữ trên nền trắng.',
  tokens: [
  { token: 'gold-300', hex: '#FCD983', usage: 'Tên ứng dụng, chữ mục menu active' },
  { token: 'gold-400', hex: '#F5C542', usage: 'Vạch active, badge trên sidebar' },
  { token: 'gold-500', hex: '#E0A82E', usage: 'Biểu tượng yêu thích đã chọn' }]

},
{
  name: 'Trung tính',
  description: 'Nền, viền và chữ của vùng nội dung.',
  tokens: [
  { token: 'gray-100', hex: '#F3F4F6', usage: 'Nền ứng dụng' },
  { token: 'gray-200', hex: '#E5E7EB', usage: 'Viền bảng, đường phân cách' },
  { token: 'gray-500', hex: '#6B7280', usage: 'Chữ phụ, placeholder' },
  { token: 'gray-700', hex: '#374151', usage: 'Chữ nội dung' },
  { token: 'gray-900', hex: '#111827', usage: 'Tiêu đề, số liệu nhấn mạnh' }]

}];


export const typeScale = [
{ name: 'Tiêu đề trang', className: 'text-2xl font-bold text-gray-900', spec: '24 / 32 · Bold', sample: 'Theo dõi tiến độ' },
{ name: 'Tiêu đề khối', className: 'text-lg font-semibold text-gray-900', spec: '18 / 28 · Semibold', sample: 'Văn bản đến' },
{ name: 'Menu & tab', className: 'text-[15px] font-medium text-gray-800', spec: '15 / 22 · Medium', sample: 'Danh mục nhiệm vụ' },
{ name: 'Nội dung', className: 'text-[14px] text-gray-700', spec: '14 / 20 · Regular', sample: 'Bộ Tư lệnh Cảnh sát cơ động' },
{ name: 'Tiêu đề cột', className: 'text-[13px] font-semibold text-gray-700', spec: '13 / 18 · Semibold', sample: 'Chưa hoàn thành' },
{ name: 'Chú thích', className: 'text-xs text-gray-500', spec: '12 / 16 · Regular', sample: 'Phiên bản: 3.0.0.2610020853' }];


export const layoutRules = [
{ rule: 'Sidebar', value: '260px (thu gọn 72px)', note: 'Nền ảnh trống đồng + lớp phủ brand-900/45' },
{ rule: 'Header', value: '64px, nền trắng, viền dưới gray-200', note: 'Dính trên cùng khi cuộn' },
{ rule: 'Vùng nội dung', value: 'Nền trắng, sát mép main', note: 'Không bọc khung bo góc / đổ bóng quanh trang' },
{ rule: 'Tiêu đề trang', value: 'Chỉ trên breadcrumb header', note: 'Không lặp tiêu đề / nút quay lại trong nội dung; nội dung chỉ giữ dòng mô tả phụ' },
{ rule: 'Tab trong màn', value: 'Ngay dưới header (tuỳ màn)', note: 'Chia nội dung của một màn thành nhiều phần, không lặp lại menu sidebar' },
{
  rule: 'Màn danh sách — thứ tự',
  value: '① Thanh lọc → ② Dòng tóm tắt → ③ Bảng → ④ Phân trang',
  note: 'Áp dụng cho mọi màn danh sách / báo cáo mới (mẫu: Theo dõi tiến độ, Danh mục nhiệm vụ)'
},
{
  rule: '① Thanh lọc',
  value: '<form> một hàng, px-16 py-16, kẻ dưới gray-200',
  note: 'Dùng chung TableToolbar: ô tìm kiếm (kính lúp bên trái) → Lọc nâng cao (bảng nổi) → đẩy phải: Làm mới · Cột · Xuất (Excel / CSV) → nút chính đỏ'
},
{
  rule: '② Dòng tóm tắt',
  value: 'px-16 py-12, chữ 14px',
  note: 'Trái: tên đối tượng in đậm | số lượng / kỳ. Phải: một link hành động phụ (Xoá bộ lọc, Mở rộng tất cả…)'
},
{
  rule: '③ Bảng dữ liệu',
  value: 'Cách 2 bên 16px (mx-4), viền + bo 6px',
  note: 'Cột STT đầu bảng (đánh tiếp theo trang), kẻ dọc giữa các cột, tiêu đề nền gray-50; chỉ mở chi tiết qua cột Thao tác, không click cả dòng'
},
{ rule: '④ Phân trang', value: 'px-16 py-12, không kẻ trên', note: 'Trái: “Hiển thị a–b trên n”. Phải: số dòng/trang, Trang x/y, nút điều hướng' },
{ rule: 'Ô nhập / nút', value: 'Cao 40px, bo 6px', note: 'Thanh lọc luôn xếp một hàng ngang trên desktop' },
{ rule: 'Ô bảng', value: 'Đệm 8–12px', note: 'Cột đầu tiên dính trái khi cuộn ngang' }];


export const motionTokens = [
{ name: 'Phản hồi nhấn', duration: '120ms', easing: 'ease-out', usage: 'Nút scale 0.98' },
{ name: 'Hover / màu', duration: '150ms', easing: 'ease-out', usage: 'Nền menu, nút, dòng bảng' },
{ name: 'Mở nhóm menu', duration: '200ms', easing: 'cubic-bezier(0.23, 1, 0.32, 1)', usage: 'Chiều cao + độ mờ' },
{ name: 'Thu gọn sidebar', duration: '220ms', easing: 'cubic-bezier(0.23, 1, 0.32, 1)', usage: 'Chiều rộng' }];