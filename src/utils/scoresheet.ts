import { scoresheetPeriod } from '../data/kpiScoresheets';
import { LevelPart, ScoresheetData, ScoresheetKind } from '../types/scoresheet';
import { UnitMember } from '../types/org';
import { directMembers, findUnit, unitPath } from './org';
import { round, taskScores } from './kpi';

export { taskScores };

/* ---------- Định dạng ---------- */

export const fmtNum = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
export const fmtIdx = (n: number) => n.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Đoạn chữ có định dạng — dùng chung cho màn hình, PDF, Word, Excel để tiêu đề cột giống hệt mẫu */
export type Seg = {t: string;b?: boolean;i?: boolean;u?: boolean;br?: boolean;};

/** Tách phần "(tính 75% điểm)" để in nghiêng, cỡ nhỏ như mẫu */
export function splitNote(s: string): {t: string;note: boolean;}[] {
  return s.
  split(/(\(tính [^)]*\))/).
  filter(Boolean).
  map((t) => ({ t, note: t.startsWith('(tính') }));
}

/**
 * Mức tỷ lệ ở cột "Đảm bảo/Vượt" và cột "Còn thiếu sót / Chậm tiến độ", ghi dạng % như file mẫu 3a/3b/3c (100%, 75%, 110%).
 * Một nhiệm vụ có nhiều mức trong cùng cột (mẫu tách thành nhiều dòng) → ghi kèm số lượng: "100% × 02; 110% × 01".
 */
function partsText(parts: LevelPart[]): [string, string] {
  const used = parts.filter((p) => p.count > 0);
  const merged = (list: LevelPart[]) => {
    const byPct = new Map<number, number>();
    list.forEach((p) => byPct.set(p.pct, (byPct.get(p.pct) ?? 0) + p.count));
    return [...byPct].sort((a, b) => a[0] - b[0]);
  };
  // Cả nhiệm vụ chỉ một mức → "100%"; nhiều mức (kể cả ở hai cột) → ghi số lượng từng mức
  const single = merged(used).length === 1;
  const text = (list: LevelPart[]) =>
  merged(list).
  map(([pct, count]) => single ? `${pct}%` : `${pct}% × ${pad2(count)}`).
  join('; ');
  const good = used.filter((p) => p.pct >= 100);
  const bad = used.filter((p) => p.pct < 100);
  return [good.length ? text(good) : '', bad.length ? text(bad) : ''];
}

/** "100%" → 1 (ô Excel định dạng 0% như mẫu); chữ có nhiều mức → null */
export const singlePct = (text: string) => /^\d+%$/.test(text) ? Number(text.slice(0, -1)) / 100 : null;

/* ---------- Tiêu đề bảng 15 cột ---------- */

export type HeadCell = {segs: Seg[];rs?: number;cs?: number;};

/** Độ rộng tương đối 15 cột, theo tỷ lệ trên mẫu in */
export const COL_W = [3.2, 17, 7.4, 5, 4.6, 5.8, 4.8, 6.6, 7.8, 7.8, 4.8, 7.4, 5, 5.2, 7.6];

export function headRows(kind: ScoresheetKind): HeadCell[][] {
  const tt = kind === 'tt';
  return [
  [
  { segs: [{ t: 'TT', b: true }], rs: 3 },
  { segs: [{ t: 'Nội dung nhiệm vụ', b: true }], rs: 3 },
  { segs: [{ t: 'Giao nhiệm vụ', b: true }], cs: 4 },
  { segs: [{ t: tt ? 'Đánh giá' : 'Đánh giá công việc', b: true }], cs: 8 },
  { segs: [{ t: 'Ghi chú', b: true }], rs: 3 }],

  [
  { segs: [{ t: 'Sản phẩm công việc', b: true, i: true }], rs: 2 },
  { segs: [{ t: 'Điểm của 1 sản phẩm công việc', b: true, i: true }], rs: 2 },
  { segs: [{ t: 'Số lượng', b: true, i: true }], rs: 2 },
  { segs: [{ t: 'Tổng điểm giao nhiệm vụ ', b: true, i: true }, { t: '(M)', b: true }, { t: '=(4)x(5)', i: true, br: true }], rs: 2 },
  { segs: [{ t: tt ? 'Về số lượng công việc' : 'Về số lượng', b: true, i: true, u: true }], cs: 2 },
  { segs: [{ t: tt ? 'Về chất lượng công việc' : 'Về chất lượng', b: true, i: true, u: true }], cs: 3 },
  { segs: [{ t: tt ? 'Về tiến độ công việc' : 'Về tiến độ', b: true, i: true, u: true }], cs: 3 }],

  [
  { segs: [{ t: 'SL công việc hoàn thành', i: true }] },
  { segs: [{ t: tt ? 'Điểm số lượng công việc hoàn thành ' : 'Điểm SL công việc hoàn thành ', i: true }, { t: '(A)', b: true }, { t: '=(5)x(7)', i: true, br: true }] },
  { segs: [{ t: 'Đảm bảo/ Vượt mức', i: true }] },
  { segs: [{ t: 'Còn thiếu sót, phải chỉnh sửa', i: true }] },
  { segs: [{ t: 'Điểm về chất lượng ', i: true }, { t: '(B)', b: true }] },
  { segs: [{ t: 'Đảm bảo/ Vượt tiến độ', i: true }] },
  { segs: [{ t: 'Chậm tiến độ, bị nhắc nhở', i: true }] },
  { segs: [{ t: 'Điểm về tiến độ ', i: true }, { t: '(C)', b: true }] }]];


}

/* ---------- Mô hình bảng điểm dùng chung cho mọi cách hiển thị ---------- */

export type InfoField = {label: string;value: string;};
export type FormRow = {
  tt: string;
  name: string;
  product: string;
  q1: string;
  q2: string;
  p1: string;
  p2: string;
  note: string;
  point: number;
  qty: number;
  done: number;
  m: number;
  a: number;
  b: number;
  c: number;
};

export type ScoresheetForm = {
  kind: ScoresheetKind;
  code: string;
  fileBase: string;
  topLeft: [string, string];
  topLeftBold: boolean;
  dateLine: string;
  subtitle: string;
  info: InfoField[][];
  who: 'đơn vị' | 'cá nhân';
  periodText: string;
  rows: FormRow[];
  totals: {m: number;a: number;b: number;c: number;};
  idx: {a: number;b: number;c: number;d?: number;};
  d?: {total: number;done: number;};
  kpi: number;
  kpiTitle: string;
  signer: {title: string;note: string;name: string;};
  /** Mẫu cá nhân có phần II nhận xét của cấp ủy, chỉ huy */
  review: boolean;
  footnote1: string[];
  footnote2: string[];
};

export const kindMeta: Record<ScoresheetKind, {code: string;tab: string;subject: string;}> = {
  tt: { code: 'Mẫu CĐKPI-TT', tab: 'Tập thể (đơn vị)', subject: 'đơn vị' },
  ldch: { code: 'Mẫu CĐKPI-LĐCH', tab: 'Cá nhân là lãnh đạo, chỉ huy', subject: 'cá nhân là lãnh đạo, chỉ huy' },
  cn: { code: 'Mẫu CĐKPI-CN', tab: 'Cá nhân không giữ chức vụ', subject: 'cán bộ, chiến sĩ không giữ chức vụ' }
};

const FOOTNOTE_1 = [
'Trường hợp đồng ý với điểm KPI cá nhân tự đánh giá, thì ghi “Thống nhất với kết quả tự đánh giá, chấm điểm KPI của cá nhân”;',
'Trường hợp chấm điểm khác với điểm KPI cá nhân tự đánh giá, thì nêu rõ nhiệm vụ có sự khác biệt về điểm, lý do điều chỉnh điểm và ghi “Các nhiệm vụ còn lại, thống nhất với đánh giá, tự chấm điểm của cá nhân”.'];

const FOOTNOTE_2: Record<'ldch' | 'cn', string[]> = {
  ldch: [
  'Đối với Chỉ huy Tiểu đoàn và tương đương trở xuống, do Tiểu đoàn trưởng và tương đương xác nhận; riêng đối với Chỉ huy đại đội trở xuống thuộc E11, E12 do Đại đội trưởng xác nhận.',
  '- Đối với Lãnh đạo cấp phòng và tương đương do Trưởng phòng, Trung đoàn trưởng và tương đương xác nhận.',
  '- Trường hợp báo cáo của cá nhân cấp trưởng thì cấp phó ký xác nhận (ưu tiên cấp phó là phó bí thư cấp ủy/chi bộ).'],

  cn: [
  'Chỉ huy đơn vị cấp Đội và tương đương (hoặc Chỉ huy Đại đội đối với cán bộ, chiến sĩ thuộc Đại đội của E11, E12).',
  '- Đối với cán bộ, chiến sĩ các phòng do Lãnh đạo phòng phụ trách xác nhận (trừ Đội xe thuộc Phòng 5 và Bệnh xá Bộ Tư lệnh thuộc Phòng 8 do chỉ huy Đội xác nhận).',
  '- Đối với cán bộ, chiến sĩ tại Cơ quan thường trực do Thủ trưởng CQTT xác nhận.']

};

const salaryByRank: Record<string, string> = {
  'Thiếu úy': '4,20',
  'Trung úy': '4,60',
  'Thượng úy': '5,00',
  'Đại úy': '5,40',
  'Thiếu tá': '6,00',
  'Trung tá': '6,60',
  'Thượng tá': '7,30',
  'Đại tá': '8,00'
};

const vnDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const fileSlug = (s: string) =>
s.
normalize('NFD').
replace(/[\u0300-\u036f]/g, '').
replace(/đ/g, 'd').
replace(/Đ/g, 'D').
replace(/[^a-zA-Z0-9]+/g, '-').
replace(/^-|-$/g, '');

export function buildScoresheetForm(data: ScoresheetData, subject: {unitId: string;member?: UnitMember;}): ScoresheetForm {
  const { kind } = data;
  const p = scoresheetPeriod;
  const path = unitPath(subject.unitId);
  const unit = path[path.length - 1];
  const parent = path.length > 1 ? path[path.length - 2] : unit;
  const department = path[1] ?? unit;
  const m = subject.member;

  const rows: FormRow[] = data.tasks.map((t, i) => {
    const s = taskScores(t);
    const [q1, q2] = partsText(t.quality);
    const [p1, p2] = partsText(t.progress);
    return { tt: String(i + 1), name: t.name, product: t.product, q1, q2, p1, p2, note: t.note ?? '', point: t.point, qty: t.qty, done: t.done, ...s };
  });
  const totals = rows.reduce((s, r) => ({ m: s.m + r.m, a: s.a + r.a, b: round(s.b + r.b, 2), c: round(s.c + r.c, 2) }), { m: 0, a: 0, b: 0, c: 0 });
  const ratio = (x: number) => totals.m ? round(x / totals.m, 3) : 0;
  const idx: ScoresheetForm['idx'] = { a: ratio(totals.a), b: ratio(totals.b), c: ratio(totals.c) };
  let d: ScoresheetForm['d'];
  if (kind === 'ldch' && data.dTotal) {
    d = { total: data.dTotal, done: data.dDone ?? 0 };
    idx.d = round(d.done / d.total, 3);
  }
  const parts = [idx.a, idx.b, idx.c, ...(idx.d !== undefined ? [idx.d] : [])];
  const kpi = round(parts.reduce((s, x) => s + x, 0) / parts.length * 100, 2);

  const info: InfoField[][] = [];
  if (m && kind !== 'tt') {
    info.push([{ label: 'Họ và tên', value: m.name }, { label: 'Ngày sinh', value: vnDate(m.birthDate) }]);
    info.push([{ label: 'Quê quán', value: m.hometown }]);
    info.push([{ label: 'Cấp bậc', value: m.rank }, { label: 'Hệ số lương', value: salaryByRank[m.rank] ?? '' }]);
    if (kind === 'ldch') {
      const party = !m.partyMember ? '' : m.role === 'truong' ? 'Bí thư Chi bộ' : m.role === 'pho' ? 'Phó Bí thư Chi bộ' : 'Đảng viên';
      info.push([{ label: 'Chức vụ đảng', value: party }]);
      info.push([{ label: 'Chức vụ chính quyền', value: `${m.position} ${unit?.name ?? ''}`.trim() }]);
      info.push([{ label: 'Đơn vị công tác', value: path.slice(1).reverse().map((u) => u.name).join(' – ') }]);
      info.push([{ label: 'Chức danh chuyên môn, nghiệp vụ', value: m.position }]);
    } else {
      info.push([{ label: 'Đơn vị công tác', value: path.slice(1).reverse().map((u) => u.name).join(' – ') }]);
      info.push([{ label: 'Công tác chính đang làm', value: `${m.position}, ${unit?.name ?? ''}` }]);
      info.push([{ label: 'Chức danh chuyên môn, nghiệp vụ', value: m.position }]);
    }
  }

  const head = kind === 'tt' ? directMembers(subject.unitId).find((x) => x.role === 'truong') : undefined;
  const who = kind === 'tt' ? 'đơn vị' : 'cá nhân';
  const name = kind === 'tt' ? findUnit(subject.unitId)?.name ?? '' : m?.name ?? '';

  return {
    kind,
    code: kindMeta[kind].code,
    fileBase: `Bang-diem-KPI_${kindMeta[kind].code.replace('Mẫu ', '')}_${fileSlug(name)}_Quy-${p.quarter}-${p.year}`,
    topLeft:
    kind === 'tt' ?
    [(parent?.name ?? '').toUpperCase(), (unit?.name ?? '').toUpperCase()] :
    ['BỘ TƯ LỆNH CẢNH SÁT CƠ ĐỘNG', (department?.name ?? '').toUpperCase()],
    topLeftBold: kind === 'tt',
    dateLine: `Hà Nội, ngày ${pad2(p.closedOn.d)} tháng ${pad2(p.closedOn.m)} năm ${p.closedOn.y}`,
    subtitle: `Của ${kind === 'tt' ? `đơn vị ${unit?.name ?? ''}` : kindMeta[kind].subject}; Quý ${p.quarter}, năm ${p.year}`,
    info,
    who,
    periodText: `quý ${p.quarter} năm ${p.year}`,
    rows,
    totals,
    idx,
    d,
    kpi,
    kpiTitle: `${kind === 'ldch' ? 3 : 2}. Điểm KPI ${who} tự đánh giá`,
    signer:
    kind === 'tt' ?
    { title: 'THỦ TRƯỞNG ĐƠN VỊ', note: '(Ký, ghi rõ họ tên, đóng dấu-nếu có)', name: head ? `${head.rank} ${head.name}` : '' } :
    { title: 'CÁ NHÂN TỰ ĐÁNH GIÁ', note: '(Ký, ghi rõ họ tên)', name: m ? `${m.rank} ${m.name}` : '' },
    review: kind !== 'tt',
    footnote1: FOOTNOTE_1,
    footnote2: kind === 'tt' ? [] : FOOTNOTE_2[kind]
  };
}

export const INTRO = (f: ScoresheetForm) =>
`Căn cứ Danh mục nhiệm vụ công tác và kế hoạch, nhiệm vụ công tác được cấp có thẩm quyền phê duyệt; trên cơ sở kết quả thực hiện các nhiệm vụ công tác, ${f.who} tự đánh giá và chấm điểm KPI trong ${f.periodText}, như sau:`;

export const kpiNumerator = (f: ScoresheetForm) => f.idx.d !== undefined ? 'A + B + C + D' : 'A + B + C';
export const kpiDenominator = (f: ScoresheetForm) => f.idx.d !== undefined ? '4' : '3';
export const D_TITLE = '2. Điểm về kết quả lãnh đạo, chỉ đạo tập thể, cá nhân thuộc thẩm quyền quản lý (D)';