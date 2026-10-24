import type { Alignment, Borders, Cell, Workbook as WorkbookType, Worksheet } from 'exceljs';
import { FOOTNOTE_1, FOOTNOTE_2, FORM_CODE, FORM_TITLE, RANK_HINT, SelfReviewForm } from './selfReviewForm';

/**
 * Xuất Mẫu KĐLĐCH - 1 ra Excel: cùng bố cục với bản Word, nhưng điểm là SỐ THẬT
 * (cộng/lọc được) và dòng tổng dùng công thức SUM để đơn vị tổng hợp dễ kiểm tra.
 */

const FONT = 'Times New Roman';
const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
const WIDTHS = [7, 46, 24, 20, 14, 11, 16, 26];
const thin = { style: 'thin' as const, color: { argb: 'FF000000' } };
const border: Partial<Borders> = { top: thin, left: thin, bottom: thin, right: thin };
const HEAD_FILL = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF3F4F6' } };

type Style = {bold?: boolean;italic?: boolean;size?: number;h?: Alignment['horizontal'];boxed?: boolean;fill?: boolean;underline?: boolean;};

function style(c: Cell, s: Style = {}) {
  c.font = { name: FONT, size: s.size ?? 12, bold: s.bold, italic: s.italic, underline: s.underline };
  c.alignment = { horizontal: s.h ?? 'center', vertical: 'middle', wrapText: true };
  if (s.boxed) c.border = border;
  if (s.fill) c.fill = HEAD_FILL;
}

/** "82,5" → 82.5; chuỗi rỗng → null; không phải số → giữ nguyên chuỗi */
function num(v: string): number | string | null {
  if (!v.trim()) return null;
  const n = Number(v.replace('%', '').replace(',', '.'));
  return Number.isFinite(n) ? n : v;
}

function put(ws: Worksheet, row: number, from: number, to: number, value: Cell['value'], s: Style = {}) {
  if (to > from) ws.mergeCells(row, from + 1, row, to + 1);
  const c = ws.getCell(row, from + 1);
  c.value = value;
  for (let i = from; i <= to; i++) style(ws.getCell(row, i + 1), s);
  return c;
}

/** Ước lượng chiều cao dòng theo độ dài chữ, vì Excel không tự giãn ô đã gộp */
function fitHeight(ws: Worksheet, row: number, texts: {text: string;width: number;}[], min = 20) {
  const lines = Math.max(1, ...texts.map(({ text, width }) => Math.ceil(text.length * 1.1 / Math.max(width, 1))));
  ws.getRow(row).height = Math.max(min, lines * 16 + 4);
}

const span = (from: number, to: number) => WIDTHS.slice(from, to + 1).reduce((a, b) => a + b, 0);

export async function downloadSelfReviewXlsx(f: SelfReviewForm) {
  const mod = await import('exceljs');
  const Workbook = (mod.Workbook ?? (mod as unknown as {default: {Workbook: typeof mod.Workbook;};}).default.Workbook) as new () => WorkbookType;
  const wb = new Workbook();
  wb.creator = 'Quản lý KPI';
  wb.created = new Date();

  const ws = wb.addWorksheet('Phiếu tự đánh giá', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.6, right: 0.6, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } },
    views: [{ showGridLines: false }]
  });
  ws.columns = WIDTHS.map((width, i) => ({ key: COLS[i], width }));

  let r = 1;
  // Mã mẫu
  put(ws, r, 6, 7, FORM_CODE, { italic: true, boxed: true });
  r += 1;
  // Quốc hiệu
  put(ws, r, 0, 2, f.parentUnit);
  put(ws, r, 4, 7, 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { bold: true });
  r += 1;
  put(ws, r, 0, 2, f.unit, { bold: true, underline: true });
  put(ws, r, 4, 7, 'Độc lập - Tự do - Hạnh phúc', { bold: true, underline: true });
  r += 1;
  put(ws, r, 4, 7, f.dateLine, { italic: true });
  r += 2;
  put(ws, r, 0, 7, FORM_TITLE, { bold: true, size: 14 });
  r += 1;
  put(ws, r, 0, 7, f.periodLine, { bold: true });
  r += 2;

  // Thông tin cá nhân
  f.info.forEach((i) => {
    put(ws, r, 0, i.label2 ? 2 : 7, `${i.label}: ${i.value}`, { h: 'left' });
    if (i.label2) put(ws, r, 3, 7, `${i.label2}: ${i.value2 ?? ''}`, { h: 'left' });
    r += 1;
  });
  r += 1;

  put(ws, r, 0, 7, 'I. Tự đánh giá kết quả thực hiện nhiệm vụ', { bold: true, h: 'left' });
  r += 1;
  put(ws, r, 0, 7, 'Trên cơ sở nhiệm vụ được giao, cá nhân tự đánh giá về kết quả thực hiện nhiệm vụ theo quý như sau:', { h: 'left' });
  r += 2;

  // ---- Bảng 1: Tiêu chí chung (A | B:C | D | E | F | G | H) ----
  const head = { bold: true, boxed: true, fill: true, size: 11 };
  put(ws, r, 0, 0, 'TT', head);
  put(ws, r, 1, 2, 'Nội dung', head);
  put(ws, r, 3, 3, 'Điểm tối đa', head);
  put(ws, r, 4, 4, 'Đảm bảo\n(đánh dấu X)', head);
  put(ws, r, 5, 5, 'Không đảm bảo\n(đánh dấu X)', head);
  put(ws, r, 6, 6, 'Điểm đạt được', head);
  put(ws, r, 7, 7, 'Ghi chú', head);
  ws.getRow(r).height = 36;
  r += 1;
  put(ws, r, 0, 7, 'NHÓM TIÊU CHÍ CHUNG (30 ĐIỂM)', { bold: true, boxed: true });
  r += 1;

  const sectionRows: number[] = [];
  f.criteriaRows.forEach((c) => {
    const isSection = c.kind === 'section';
    const s = { boxed: true, bold: isSection, size: 11 };
    put(ws, r, 0, 0, c.code, s);
    put(ws, r, 1, 2, c.content, { ...s, h: isSection ? 'left' : 'justify' });
    put(ws, r, 3, 3, num(c.max), { ...s, italic: isSection });
    put(ws, r, 4, 4, c.yes ? 'X' : '', s);
    put(ws, r, 5, 5, c.no ? 'X' : '', s);
    put(ws, r, 6, 6, num(c.got), s);
    put(ws, r, 7, 7, c.note, { ...s, h: 'left' });
    if (isSection) sectionRows.push(r);
    fitHeight(ws, r, [
    { text: c.content, width: span(1, 2) },
    { text: c.note, width: WIDTHS[7] }]
    );
    r += 1;
  });
  const sumOf = (col: string) => sectionRows.length ? sectionRows.map((n) => `${col}${n}`).join('+') : '0';
  put(ws, r, 0, 2, 'Tổng điểm', { bold: true, boxed: true });
  put(ws, r, 3, 3, { formula: sumOf('D'), result: num(f.criteriaTotal.max) as number }, { bold: true, boxed: true });
  put(ws, r, 4, 4, '', { boxed: true });
  put(ws, r, 5, 5, '', { boxed: true });
  put(ws, r, 6, 6, f.criteriaTotal.got ? { formula: sumOf('G'), result: num(f.criteriaTotal.got) as number } : '', { bold: true, boxed: true });
  put(ws, r, 7, 7, '', { boxed: true });
  r += 2;

  // ---- Bảng 2: Kết quả thực hiện nhiệm vụ (A..H) ----
  put(ws, r, 0, 7, 'NHÓM TIÊU CHÍ VỀ KẾT QUẢ THỰC HIỆN NHIỆM VỤ (70 ĐIỂM)', { bold: true, boxed: true });
  r += 1;
  [
  'TT',
  'Nhiệm vụ\n(cụ thể hóa nhiệm vụ được giao theo phạm vi, chức năng của đơn vị)',
  'Mục tiêu, nhiệm vụ đề ra',
  'Kết quả nhiệm vụ thực tế',
  'Hiệu suất (%) theo chất lượng, tiến độ (KPI)',
  'Điểm tối đa',
  'Điểm đạt được\n(Hiệu suất × Điểm tối đa)',
  'Ghi chú'].
  forEach((label, i) => put(ws, r, i, i, label, head));
  ws.getRow(r).height = 52;
  r += 1;

  const firstTask = r;
  f.taskRows.forEach((t) => {
    const s = { boxed: true, size: 11 };
    put(ws, r, 0, 0, num(t.code), s);
    put(ws, r, 1, 1, t.name, { ...s, h: 'left' });
    put(ws, r, 2, 2, t.target, { ...s, h: 'left' });
    put(ws, r, 3, 3, t.actual, { ...s, h: 'left' });
    const pct = num(t.percent);
    const pctCell = put(ws, r, 4, 4, typeof pct === 'number' ? pct / 100 : pct, s);
    pctCell.numFmt = '0.00%';
    put(ws, r, 5, 5, num(t.max), s);
    const gotCell = put(ws, r, 6, 6, num(t.got), s);
    gotCell.numFmt = '0.##';
    put(ws, r, 7, 7, t.note, { ...s, h: 'left' });
    fitHeight(ws, r, [
    { text: t.name, width: WIDTHS[1] },
    { text: t.target, width: WIDTHS[2] },
    { text: t.actual, width: WIDTHS[3] },
    { text: t.note, width: WIDTHS[7] }]
    );
    r += 1;
  });
  const lastTask = r - 1;
  const hasTasks = lastTask >= firstTask;
  put(ws, r, 0, 4, 'Tổng điểm', { bold: true, boxed: true });
  put(ws, r, 5, 5, hasTasks ? { formula: `SUM(F${firstTask}:F${lastTask})`, result: num(f.taskTotal.max) as number } : 0, { bold: true, boxed: true });
  const totalGot = put(ws, r, 6, 6, f.taskTotal.got && hasTasks ? { formula: `SUM(G${firstTask}:G${lastTask})`, result: num(f.taskTotal.got) as number } : '', { bold: true, boxed: true });
  totalGot.numFmt = '0.##';
  put(ws, r, 7, 7, '', { boxed: true });
  r += 2;

  // ---- Xếp loại & ký ----
  put(ws, r, 0, 7, `II. Tự đề xuất mức xếp loại chất lượng: ${f.rank}`, { bold: true, h: 'left' });
  r += 1;
  put(ws, r, 0, 7, RANK_HINT, { italic: true, size: 11 });
  r += 2;
  put(ws, r, 4, 7, 'CÁ NHÂN TỰ ĐÁNH GIÁ', { bold: true });
  r += 1;
  put(ws, r, 4, 7, '(Ký, ghi rõ họ tên)', { italic: true });
  r += 4;
  put(ws, r, 4, 7, f.signer, { bold: true });
  r += 2;

  const a = f.appraisal;
  put(ws, r, 0, 7, 'III. Nhận xét, đánh giá của cấp ủy, lãnh đạo, chỉ huy đơn vị', { bold: true, h: 'left' });
  r += 1;
  put(ws, r, 0, 7, `- Chấm điểm (1): ${a?.score ?? ''}`, { h: 'left' });
  fitHeight(ws, r, [{ text: a?.score ?? '', width: span(0, 7) }]);
  r += 1;
  put(ws, r, 0, 7, `- Đề xuất mức xếp loại: ${a?.rank ?? ''}`, { h: 'left' });
  r += 1;
  put(ws, r, 0, 7, `- Mức độ đáp ứng đối với các mục tiêu, nhiệm vụ then chốt: ${a?.response ?? ''}`, { h: 'left' });
  fitHeight(ws, r, [{ text: a?.response ?? '', width: span(0, 7) }]);
  r += 2;
  put(ws, r, 4, 7, 'XÁC NHẬN CỦA THỦ TRƯỞNG ĐƠN VỊ (2)', { bold: true });
  r += 5;
  put(ws, r, 4, 7, a?.signer ?? '', { bold: true });
  r += 2

  // Chú thích
;[`(1) ${FOOTNOTE_1}`, `(2) ${FOOTNOTE_2[0]}`, ...FOOTNOTE_2.slice(1)].forEach((n) => {
    put(ws, r, 0, 7, n, { italic: true, size: 10, h: 'left' });
    fitHeight(ws, r, [{ text: n, width: span(0, 7) }], 16);
    r += 1;
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${f.fileBase}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}