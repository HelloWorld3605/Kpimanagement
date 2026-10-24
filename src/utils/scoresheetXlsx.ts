import type { Alignment, Borders, Cell, CellRichTextValue, Workbook as WorkbookType, Worksheet } from 'exceljs';
import { D_TITLE, INTRO, ScoresheetForm, Seg, headRows, kpiDenominator, kpiNumerator, splitNote } from './scoresheet';

/**
 * Xuất Mẫu CĐKPI ra Excel: cùng bố cục bản in, điểm là số thật; M, A, các dòng tổng,
 * chỉ số A/B/C và điểm KPI dùng công thức để cán bộ tổng hợp kiểm tra được.
 */

const FONT = 'Times New Roman';
const WIDTHS = [5, 32, 11, 8, 7, 9, 8, 10, 14, 14, 8, 13, 10, 8, 13];
const L = (i: number) => String.fromCharCode(65 + i);
const thin = { style: 'thin' as const, color: { argb: 'FF000000' } };
const border: Partial<Borders> = { top: thin, left: thin, bottom: thin, right: thin };
const dotted = { style: 'dotted' as const, color: { argb: 'FF000000' } };

type Style = {bold?: boolean;italic?: boolean;size?: number;h?: Alignment['horizontal'];boxed?: boolean;underline?: boolean;numFmt?: string;dots?: boolean;rule?: boolean;};

function style(c: Cell, s: Style = {}) {
  c.font = { name: FONT, size: s.size ?? 12, bold: s.bold, italic: s.italic, underline: s.underline };
  c.alignment = { horizontal: s.h ?? 'center', vertical: 'middle', wrapText: true };
  if (s.boxed) c.border = border;
  if (s.dots) c.border = { bottom: dotted };
  if (s.rule) c.border = { bottom: thin };
  if (s.numFmt) c.numFmt = s.numFmt;
}

/** Gộp ô (from..to là chỉ số cột 0-based, có thể nhiều dòng) và gán giá trị */
function put(ws: Worksheet, row: number, from: number, to: number, value: Cell['value'], s: Style = {}, rowTo = row) {
  if (to > from || rowTo > row) ws.mergeCells(row, from + 1, rowTo, to + 1);
  const c = ws.getCell(row, from + 1);
  c.value = value;
  for (let r = row; r <= rowTo; r++) for (let i = from; i <= to; i++) style(ws.getCell(r, i + 1), s);
  return c;
}

const rich = (segs: Seg[], size = 10): CellRichTextValue => ({
  richText: segs.map((s) => ({ text: (s.br ? '\n' : '') + s.t, font: { name: FONT, size, bold: s.b, italic: s.i, underline: s.u } }))
});

const judge = (text: string): CellRichTextValue | null =>
text ? { richText: splitNote(text).map((p) => ({ text: p.note ? `\n${p.t}` : p.t, font: { name: FONT, size: p.note ? 8 : 10, italic: p.note } })) } : null;

const subText = (parts: {t: string;sub?: boolean;bold?: boolean;}[], size = 12): CellRichTextValue => ({
  richText: parts.map((p) => ({ text: p.t, font: { name: FONT, size, bold: p.bold, vertAlign: p.sub ? 'subscript' : undefined } }))
});

function fitHeight(ws: Worksheet, row: number, texts: {text: string;width: number;}[], min = 18, line = 14) {
  const lines = Math.max(1, ...texts.map(({ text, width }) => text.split('\n').reduce((s, t) => s + Math.max(1, Math.ceil(t.length * 1.15 / Math.max(width, 1))), 0)));
  ws.getRow(row).height = Math.max(min, lines * line + 4);
}

const span = (from: number, to: number) => WIDTHS.slice(from, to + 1).reduce((a, b) => a + b, 0);
const LAST = 14;

export async function downloadScoresheetXlsx(f: ScoresheetForm) {
  const mod = await import('exceljs');
  const Workbook = (mod.Workbook ?? (mod as unknown as {default: {Workbook: typeof mod.Workbook;};}).default.Workbook) as new () => WorkbookType;
  const wb = new Workbook();
  wb.creator = 'Quản lý KPI';
  wb.created = new Date();

  const ws = wb.addWorksheet(f.code.replace('Mẫu ', ''), {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } },
    views: [{ showGridLines: false }]
  });
  ws.columns = WIDTHS.map((width) => ({ width }));

  let r = 1;
  put(ws, r, 12, LAST, f.code, { italic: true, boxed: true });
  r += 1;
  put(ws, r, 0, 5, f.topLeft[0]);
  put(ws, r, 7, LAST, 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { bold: true });
  r += 1;
  put(ws, r, 0, 5, f.topLeft[1], { bold: f.topLeftBold, underline: true });
  put(ws, r, 7, LAST, 'Độc lập - Tự do - Hạnh phúc', { bold: true, underline: true });
  r += 2;
  put(ws, r, 7, LAST, f.dateLine, { italic: true });
  r += 2;
  put(ws, r, 0, LAST, 'BẢN ĐÁNH GIÁ KẾT QUẢ HOÀN THÀNH NHIỆM VỤ THEO CHỈ SỐ ĐO LƯỜNG (KPI)', { bold: true });
  r += 1;
  put(ws, r, 0, LAST, f.subtitle, { bold: true });
  r += 2;

  for (const line of f.info) {
    if (line.length > 1) {
      put(ws, r, 1, 7, `${line[0].label}: ${line[0].value}`, { h: 'left', dots: true });
      put(ws, r, 8, LAST - 1, `${line[1].label}: ${line[1].value}`, { h: 'left', dots: true });
    } else put(ws, r, 1, LAST - 1, `${line[0].label}: ${line[0].value}`, { h: 'left', dots: true });
    ws.getRow(r).height = 20;
    r += 1;
  }
  if (f.review) {
    put(ws, r, 1, LAST, 'I. TỰ ĐÁNH GIÁ KẾT QUẢ HOÀN THÀNH NHIỆM VỤ THEO CHỈ SỐ ĐO LƯỜNG (KPI)', { bold: true, h: 'left' });
    r += 1;
  }
  put(ws, r, 1, LAST, '1. Điểm về số lượng, chất lượng, tiến độ', { bold: true, h: 'left' });
  r += 1;
  put(ws, r, 0, LAST, `        ${INTRO(f)}`, { h: 'justify' });
  fitHeight(ws, r, [{ text: INTRO(f), width: span(0, LAST) }], 18, 15);
  r += 1;

  // Tiêu đề bảng: gộp ô theo đúng mẫu
  const head = headRows(f.kind);
  const top = r;
  const occupied: boolean[][] = head.map(() => Array(15).fill(false));
  head.forEach((row, ri) => {
    let col = 0;
    row.forEach((h) => {
      while (occupied[ri][col]) col++;
      const cs = h.cs ?? 1;
      const rs = h.rs ?? 1;
      for (let y = ri; y < ri + rs; y++) for (let x = col; x < col + cs; x++) if (occupied[y]) occupied[y][x] = true;
      put(ws, top + ri, col, col + cs - 1, rich(h.segs), { boxed: true, size: 10 }, top + ri + rs - 1);
      col += cs;
    });
  });
  ws.getRow(top).height = 20;
  ws.getRow(top + 1).height = 20;
  ws.getRow(top + 2).height = 96;
  r = top + 3;
  for (let i = 0; i <= LAST; i++) put(ws, r, i, i, `(${i + 1})`, { boxed: true, italic: true, size: 9 });
  r += 1;

  const first = r;
  for (const row of f.rows) {
    const set = (col: number, value: Cell['value'], s: Style = {}) => put(ws, r, col, col, value, { boxed: true, size: 10, ...s });
    set(0, Number(row.tt));
    set(1, row.name, { h: 'left' });
    set(2, row.product);
    set(3, row.point);
    set(4, row.qty);
    set(5, { formula: `D${r}*E${r}`, result: row.m });
    set(6, row.done);
    set(7, { formula: `D${r}*G${r}`, result: row.a });
    set(8, judge(row.q1));
    set(9, judge(row.q2));
    set(10, row.b, { numFmt: '0.##' });
    set(11, judge(row.p1));
    set(12, judge(row.p2));
    set(13, row.c, { numFmt: '0.##' });
    set(14, row.note, { size: 9 });
    fitHeight(ws, r, [
    { text: row.name, width: WIDTHS[1] },
    { text: row.q1.replace('(tính', '\n(tính'), width: WIDTHS[8] },
    { text: row.q2.replace('(tính', '\n(tính'), width: WIDTHS[9] },
    { text: row.p1.replace('(tính', '\n(tính'), width: WIDTHS[11] },
    { text: row.p2.replace('(tính', '\n(tính'), width: WIDTHS[12] }],
    20, 13);
    r += 1;
  }
  const last = r - 1;
  const sum = (col: string) => `SUM(${col}${first}:${col}${last})`;

  const totalRow = r;
  put(ws, r, 0, 3, 'Tổng', { boxed: true, bold: true });
  put(ws, r, 4, 5, { formula: sum('F'), result: f.totals.m }, { boxed: true, numFmt: '"ΣMₙ = "General' });
  put(ws, r, 6, 7, { formula: sum('H'), result: f.totals.a }, { boxed: true, numFmt: '"ΣAₙ = "General' });
  put(ws, r, 8, 10, { formula: sum('K'), result: f.totals.b }, { boxed: true, numFmt: '"ΣBₙ = "General' });
  put(ws, r, 11, 13, { formula: sum('N'), result: f.totals.c }, { boxed: true, numFmt: '"ΣCₙ = "General' });
  put(ws, r, 14, 14, null, { boxed: true });
  ws.getRow(r).height = 20;
  r += 1;
  const idxRow = r;
  const ratio = (col: number) => `ROUND(${L(col)}${totalRow}/E${totalRow},3)`;
  put(ws, r, 0, 5, 'Điểm về số lượng, chất lượng, tiến độ', { boxed: true, bold: true });
  put(ws, r, 6, 7, { formula: ratio(6), result: f.idx.a }, { boxed: true, bold: true, numFmt: '"A = "0.000' });
  put(ws, r, 8, 10, { formula: ratio(8), result: f.idx.b }, { boxed: true, bold: true, numFmt: '"B = "0.000' });
  put(ws, r, 11, 13, { formula: ratio(11), result: f.idx.c }, { boxed: true, bold: true, numFmt: '"C = "0.000' });
  put(ws, r, 14, 14, null, { boxed: true });
  ws.getRow(r).height = 28;
  r += 2;

  let dCell = '';
  if (f.d && f.idx.d !== undefined) {
    put(ws, r, 1, 7, `${D_TITLE} =`, { bold: true, h: 'left' }, r + 1);
    put(ws, r, 8, 9, subText([{ t: 'D' }, { t: 'HTNV', sub: true }]), { rule: true });
    put(ws, r + 1, 8, 9, subText([{ t: 'D' }, { t: 'TONG', sub: true }]));
    const dRow1 = r + 3;
    const dRow2 = r + 2;
    put(ws, r, 10, LAST, { formula: `ROUND(O${dRow1}/O${dRow2},3)`, result: f.idx.d }, { bold: true, h: 'left', numFmt: '"= "0.000" điểm; trong đó:"' }, r + 1);
    dCell = `K${r}`;
    r += 2;
    put(ws, r, 1, 13, subText([{ t: '- Số tập thể, cá nhân thuộc thẩm quyền quản lý được đánh giá (D' }, { t: 'TONG', sub: true }, { t: '):' }]), { h: 'left' });
    put(ws, r, 14, 14, f.d.total, { h: 'left' });
    r += 1;
    put(ws, r, 1, 13, subText([{ t: '- Số tập thể, cá nhân được đánh giá hoàn thành nhiệm vụ trở lên (D' }, { t: 'HTNV', sub: true }, { t: '):' }]), { h: 'left' });
    put(ws, r, 14, 14, f.d.done, { h: 'left' });
    r += 2;
  }

  const parts = [`G${idxRow}`, `I${idxRow}`, `L${idxRow}`, ...(dCell ? [dCell] : [])];
  put(ws, r, 1, 5, `${f.kpiTitle} =`, { bold: true, h: 'left' }, r + 1);
  put(ws, r, 6, 8, kpiNumerator(f), { rule: true });
  put(ws, r + 1, 6, 8, kpiDenominator(f));
  put(ws, r, 9, 12, { formula: `ROUND((${parts.join('+')})/${parts.length}*100,2)`, result: f.kpi }, { bold: true, h: 'left', numFmt: '"x 100 = "0.##" điểm."' }, r + 1);
  r += 3;

  put(ws, r, 10, LAST, f.signer.title, { bold: true });
  r += 1;
  put(ws, r, 10, LAST, f.signer.note, { italic: true, size: 11 });
  r += 5;
  put(ws, r, 10, LAST, f.signer.name, { bold: true });
  r += 1;

  if (f.review) {
    ws.getRow(r).addPageBreak();
    r += 1;
    put(ws, r, 1, LAST, 'II. NHẬN XÉT, ĐÁNH GIÁ CỦA CẤP ỦY, LÃNH ĐẠO, CHỈ HUY ĐƠN VỊ QUẢN LÝ CÁN BỘ', { bold: true, h: 'left' });
    r += 1;
    put(ws, r, 1, 2, { richText: [{ text: '1. Nhận xét, đánh giá', font: { name: FONT, size: 12, bold: true } }, { text: '1', font: { name: FONT, size: 12, vertAlign: 'superscript' } }, { text: ':', font: { name: FONT, size: 12, bold: true } }] }, { h: 'left' });
    put(ws, r, 3, LAST, null, { dots: true });
    ws.getRow(r).height = 22;
    for (let i = 0; i < 3; i++) {
      r += 1;
      put(ws, r, 0, LAST, null, { dots: true });
      ws.getRow(r).height = 22;
    }
    r += 1;
    put(ws, r, 1, 2, '2. Chấm điểm:', { bold: true, h: 'left' });
    put(ws, r, 3, LAST, null, { dots: true });
    ws.getRow(r).height = 22;
    r += 2;
    put(ws, r, 0, LAST, { richText: [{ text: 'XÁC NHẬN CỦA THỦ TRƯỞNG ĐƠN VỊ', font: { name: FONT, size: 12, bold: true } }, { text: '2', font: { name: FONT, size: 12, bold: true, vertAlign: 'superscript' } }] });
    r += 10;
    put(ws, r, 0, 3, null, { rule: true });
    r += 1;
    const notes = [...f.footnote1.map((t, i) => i === 0 ? `¹ ${t}` : t), ...f.footnote2.map((t, i) => i === 0 ? `² ${t}` : t)];
    for (const t of notes) {
      put(ws, r, 0, LAST, `      ${t}`, { h: 'left', size: 9 });
      fitHeight(ws, r, [{ text: t, width: span(0, LAST) * 1.3 }], 13, 12);
      r += 1;
    }
  }

  ws.pageSetup.printTitlesRow = `${top}:${top + 3}`;

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${f.fileBase}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}