/** Nội dung "Phụ lục — Gợi ý phương pháp quy đổi điểm KPI" (giữ đúng câu chữ văn bản gốc) */

export const appendixTitle = 'PHỤ LỤC';
export const appendixSubtitle = 'GỢI Ý PHƯƠNG PHÁP QUY ĐỔI ĐIỂM KPI';

export const groupHeads = {
  kpi: ['Các điểm KPI theo', 'Hướng dẫn số 20-HD/ĐUCA'],
  result: ['Điểm Nhóm tiêu chí về kết quả thực hiện nhiệm vụ', 'theo Mẫu KĐCN-1']
};

/** Cột (3)…(10); `note` là dòng phụ in thường dưới tiêu đề nghiêng */
export const subHeads: {label: string;note?: string;}[] = [
{ label: 'Tổng điểm giao nhiệm vụ' },
{ label: 'Điểm về số lượng công việc' },
{ label: 'Điểm về chất lượng' },
{ label: 'Điểm về tiến độ' },
{ label: 'Hiệu suất (%) kết quả nhiệm vụ' },
{ label: 'Điểm tối đa' },
{ label: 'Điểm đạt được', note: '= (7)*(8)' },
{ label: 'Ghi chú' }];


/** Hàng mẫu: ký hiệu có chỉ số dưới (M₁, A₁ …) */
export type AppendixRow = {tt: string;task: string;sub?: string;ellipsis?: boolean;};

export const appendixRows: AppendixRow[] = [
{ tt: '1', task: 'Nhiệm vụ 1', sub: '1' },
{ tt: '2', task: 'Nhiệm vụ 2', sub: '2' },
{ tt: '3', task: 'Nhiệm vụ 3', sub: '3' },
{ tt: '..', task: '…', ellipsis: true },
{ tt: 'n', task: 'Nhiệm vụ n', sub: 'n' }];


export const totalCells = [
{ sym: 'M', note: '= tổng cột (3)' },
{ sym: 'A', note: '= tổng cột (4)' },
{ sym: 'B', note: '= tổng cột (5)' },
{ sym: 'C', note: '= tổng cột (6)' }];


/** Lưu ý — mỗi đoạn là chuỗi các mảnh có định dạng */
export type Seg = {t: string;b?: boolean;i?: boolean;};

export const appendixNotes: Seg[][] = [
[
{ t: '1.', b: true },
{ t: ' Nếu trong cùng một nhiệm vụ (hàng ngang) điểm cột (4) nhỏ hơn điểm cột (3) ' },
{ t: '(ví dụ: A₁ < M₁),', i: true },
{ t: ' tương ứng có nhiệm vụ chưa hoàn thành thì tại cột ' },
{ t: 'Ghi chú', b: true },
{ t: ' ghi ' },
{ t: '“Không hoàn thành 100% nhiệm vụ được giao”', b: true, i: true },
{ t: ' (trường hợp có lý do chính đáng thì ghi cụ thể công việc chưa hoàn thành và lý do).' }],

[
{ t: '2.', b: true },
{ t: ' Đối với cột (8) Điểm tối đa: Điểm ở các hàng được làm tròn đến số hàng đơn vị (không có phần thập phân). Các đơn vị cân đối (nâng, hạ) điểm của từng hàng (nhiệm vụ) để đảm bảo ' },
{ t: 'tổng điểm tối đa là đúng 70 điểm', b: true },
{ t: '.' }],

[
{ t: '3.', b: true },
{ t: ' Điểm đạt được tại cột (9) là tích của số tại cột (7) và cột (8), theo từng hàng (nhiệm vụ).' }],

[
{ t: '4.', b: true },
{
  t: ' Phương pháp quy đổi trên chỉ mang tính gợi ý, các cá nhân, đơn vị căn cứ vào quy mô, vai trò, tính chất, mức độ phức tạp, chất lượng sản phẩm, tiến độ của nhiệm vụ để xác định Điểm tối đa và Hiệu suất kết quả nhiệm vụ đảm bảo phù hợp./.'
}]];