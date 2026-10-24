import {
  AlignmentType,
  BorderStyle,
  Document,
  FootnoteReferenceRun,
  Header,
  HeightRule,
  LeaderType,
  Packer,
  PageNumber,
  PageOrientation,
  Paragraph,
  Tab,
  TabStopType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType } from
'docx';
import { COL_W, D_TITLE, INTRO, ScoresheetForm, Seg, fmtIdx, fmtNum, headRows, kpiDenominator, kpiNumerator, splitNote } from './scoresheet';

/** Xuất Mẫu CĐKPI ra Word: A4 ngang, Times New Roman, bảng 15 cột gộp ô như mẫu */

const FONT = 'Times New Roman';
const BODY = 26; // 13pt
const CELL = 20; // 10pt
const MARGIN = 720; // 1,27cm
const WIDTH = 16838 - MARGIN * 2;
const INDENT = 900;

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];
type RunOpt = {bold?: boolean;italics?: boolean;size?: number;underline?: boolean;sub?: boolean;};

const run = (text: string, o: RunOpt = {}) =>
new TextRun({ text, bold: o.bold, italics: o.italics, size: o.size ?? BODY, underline: o.underline ? {} : undefined, subScript: o.sub, font: FONT });

const para = (children: (TextRun | FootnoteReferenceRun)[], o: {align?: Align;before?: number;after?: number;indent?: number;firstLine?: number;pageBreakBefore?: boolean;border?: boolean;} = {}) =>
new Paragraph({
  children,
  alignment: o.align,
  spacing: { before: o.before ?? 0, after: o.after ?? 0 },
  indent: o.indent || o.firstLine ? { left: o.indent, right: o.indent, firstLine: o.firstLine } : undefined,
  pageBreakBefore: o.pageBreakBefore,
  border: o.border ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } } : undefined
});

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };

const colW = (() => {
  const total = COL_W.reduce((a, b) => a + b, 0);
  const w = COL_W.map((c) => Math.floor(c / total * WIDTH));
  w[1] += WIDTH - w.reduce((a, b) => a + b, 0);
  return w;
})();
const spanW = (from: number, count: number) => colW.slice(from, from + count).reduce((a, b) => a + b, 0);

function cell(children: Paragraph[], width: number, o: {span?: number;rowSpan?: number;} = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: o.span,
    rowSpan: o.rowSpan,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 20, bottom: 20, left: 50, right: 50 },
    children
  });
}

const textCell = (text: string, width: number, o: {span?: number;bold?: boolean;align?: Align;size?: number;} = {}) =>
cell([para([run(text, { bold: o.bold, size: o.size ?? CELL })], { align: o.align ?? AlignmentType.CENTER })], width, o);

/** Tiêu đề cột theo đoạn chữ có định dạng, xuống dòng ở đoạn có br */
function segParas(segs: Seg[]) {
  const lines: Seg[][] = [[]];
  segs.forEach((s) => s.br ? lines.push([s]) : lines[lines.length - 1].push(s));
  return lines.map((l) => para(l.map((s) => run(s.t, { bold: s.b, italics: s.i, underline: s.u, size: CELL })), { align: AlignmentType.CENTER }));
}

const judgeParas = (text: string) =>
text ?
[para(splitNote(text).map((p) => p.note ? run(` ${p.t}`, { italics: true, size: 16 }) : run(p.t, { size: CELL })), { align: AlignmentType.CENTER })] :
[para([])];

/** Chữ + phân số + phần sau, dựng bằng bảng không viền để phân số nằm đúng giữa dòng */
function fractionLine(before: TextRun[], top: TextRun[], bottom: TextRun[], after: TextRun[], beforeWidth: number) {
  const fracW = 2600;
  const afterW = WIDTH - INDENT - beforeWidth - fracW;
  return new Table({
    width: { size: WIDTH - INDENT, type: WidthType.DXA },
    columnWidths: [beforeWidth, fracW, afterW],
    borders: noBorders,
    indent: { size: INDENT, type: WidthType.DXA },
    rows: [
    new TableRow({
      children: [
      new TableCell({ width: { size: beforeWidth, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [para(before)] }),
      new TableCell({
        width: { size: fracW, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [para(top, { align: AlignmentType.CENTER, border: true }), para(bottom, { align: AlignmentType.CENTER })]
      }),
      new TableCell({ width: { size: afterW, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [para(after)] })]

    })]

  });
}

function dottedLine(fields: {label: string;value: string;}[], bold = false) {
  const end = WIDTH - INDENT;
  const mid = Math.round(WIDTH * 0.6);
  const tab = () => new TextRun({ children: [new Tab()], font: FONT, size: BODY });
  return new Paragraph({
    spacing: { before: 80, after: 0 },
    indent: { left: INDENT },
    tabStops:
    fields.length > 1 ?
    [
    { type: TabStopType.LEFT, position: mid, leader: LeaderType.DOT },
    { type: TabStopType.RIGHT, position: end, leader: LeaderType.DOT }] :

    [{ type: TabStopType.RIGHT, position: end, leader: LeaderType.DOT }],
    children: fields.flatMap((f) => [run(`${f.label}: `, { bold }), run(f.value), tab()])
  });
}

export async function downloadScoresheetDocx(f: ScoresheetForm) {
  const half = Math.round(WIDTH / 2);
  const n = fmtNum;

  const headerTable = new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: [half, WIDTH - half],
    borders: noBorders,
    rows: [
    new TableRow({
      children: [
      new TableCell({
        width: { size: half, type: WidthType.DXA },
        children: [
        para([run(f.topLeft[0])], { align: AlignmentType.CENTER }),
        para([run(f.topLeft[1], { bold: f.topLeftBold, underline: true })], { align: AlignmentType.CENTER })]

      }),
      new TableCell({
        width: { size: WIDTH - half, type: WidthType.DXA },
        children: [
        para([run('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { bold: true })], { align: AlignmentType.CENTER }),
        para([run('Độc lập - Tự do - Hạnh phúc', { bold: true, underline: true })], { align: AlignmentType.CENTER }),
        para([run(f.dateLine, { italics: true })], { align: AlignmentType.CENTER, before: 160 })]

      })]

    })]

  });

  const head = headRows(f.kind);
  // Theo dõi vị trí cột để tính độ rộng ô gộp
  const occupied: boolean[][] = head.map(() => Array(15).fill(false));
  const headTableRows = head.map((row, ri) => {
    let col = 0;
    return new TableRow({
      tableHeader: true,
      children: row.map((h) => {
        while (occupied[ri][col]) col++;
        const span = h.cs ?? 1;
        for (let r = ri; r < ri + (h.rs ?? 1); r++) for (let c = col; c < col + span; c++) if (occupied[r]) occupied[r][c] = true;
        const c = cell(segParas(h.segs), spanW(col, span), { span: h.cs, rowSpan: h.rs });
        col += span;
        return c;
      })
    });
  });
  const numRow = new TableRow({
    tableHeader: true,
    children: colW.map((w, i) => cell([para([run(`(${i + 1})`, { italics: true, size: 18 })], { align: AlignmentType.CENTER })], w))
  });
  const bodyRows = f.rows.map(
    (r) =>
    new TableRow({
      cantSplit: true,
      children: [
      textCell(r.tt, colW[0]),
      textCell(r.name, colW[1], { align: AlignmentType.LEFT }),
      textCell(r.product, colW[2]),
      textCell(n(r.point), colW[3]),
      textCell(n(r.qty), colW[4]),
      textCell(n(r.m), colW[5]),
      textCell(n(r.done), colW[6]),
      textCell(n(r.a), colW[7]),
      cell(judgeParas(r.q1), colW[8]),
      cell(judgeParas(r.q2), colW[9]),
      textCell(n(r.b), colW[10]),
      cell(judgeParas(r.p1), colW[11]),
      cell(judgeParas(r.p2), colW[12]),
      textCell(n(r.c), colW[13]),
      textCell(r.note, colW[14], { size: 18 })]

    })
  );
  const sigma = (letter: string, v: number) => [para([run(`Σ${letter}`, { size: CELL }), run('n', { size: CELL, sub: true }), run(` = ${n(v)}`, { size: CELL })], { align: AlignmentType.CENTER })];
  const totalRows = [
  new TableRow({
    cantSplit: true,
    children: [
    textCell('Tổng', spanW(0, 4), { span: 4, bold: true }),
    cell(sigma('M', f.totals.m), spanW(4, 2), { span: 2 }),
    cell(sigma('A', f.totals.a), spanW(6, 2), { span: 2 }),
    cell(sigma('B', f.totals.b), spanW(8, 3), { span: 3 }),
    cell(sigma('C', f.totals.c), spanW(11, 3), { span: 3 }),
    textCell('', colW[14])]

  }),
  new TableRow({
    cantSplit: true,
    height: { value: 520, rule: HeightRule.ATLEAST },
    children: [
    textCell('Điểm về số lượng, chất lượng, tiến độ', spanW(0, 6), { span: 6, bold: true, size: 22 }),
    textCell(`A = ${fmtIdx(f.idx.a)}`, spanW(6, 2), { span: 2, bold: true, size: 22 }),
    textCell(`B = ${fmtIdx(f.idx.b)}`, spanW(8, 3), { span: 3, bold: true, size: 22 }),
    textCell(`C = ${fmtIdx(f.idx.c)}`, spanW(11, 3), { span: 3, bold: true, size: 22 }),
    textCell('', colW[14])]

  })];

  const grid = new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: colW,
    layout: TableLayoutType.FIXED,
    rows: [...headTableRows, numRow, ...bodyRows, ...totalRows]
  });

  const dBlock =
  f.d && f.idx.d !== undefined ?
  [
  para([run(`${D_TITLE} = `, { bold: true })], { indent: INDENT, before: 160 }),
  fractionLine(
    [run('D = ', { bold: true })],
    [run('D'), run('HTNV', { sub: true })],
    [run('D'), run('TONG', { sub: true })],
    [run(`= ${fmtIdx(f.idx.d)} điểm`, { bold: true, italics: true }), run('; trong đó:')],
    800
  ),
  para([run('- Số tập thể, cá nhân thuộc thẩm quyền quản lý được đánh giá (D'), run('TONG', { sub: true }), run(`): ${f.d.total};`)], { indent: INDENT, before: 60 }),
  para([run('- Số tập thể, cá nhân được đánh giá hoàn thành nhiệm vụ trở lên (D'), run('HTNV', { sub: true }), run(`): ${f.d.done};`)], { indent: INDENT, before: 60 })] :

  [];

  const signLeft = Math.round(WIDTH * 0.6);
  const signature = new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: [signLeft, WIDTH - signLeft],
    borders: noBorders,
    rows: [
    new TableRow({
      cantSplit: true,
      children: [
      new TableCell({ width: { size: signLeft, type: WidthType.DXA }, children: [para([])] }),
      new TableCell({
        width: { size: WIDTH - signLeft, type: WidthType.DXA },
        children: [
        para([run(f.signer.title, { bold: true })], { align: AlignmentType.CENTER, before: 200 }),
        para([run(f.signer.note, { italics: true, size: 22 })], { align: AlignmentType.CENTER }),
        para([run(f.signer.name, { bold: true })], { align: AlignmentType.CENTER, before: 1400 })]

      })]

    })]

  });

  const review = f.review ?
  [
  para([run('II. NHẬN XÉT, ĐÁNH GIÁ CỦA CẤP ỦY, LÃNH ĐẠO, CHỈ HUY ĐƠN VỊ QUẢN LÝ CÁN BỘ', { bold: true })], { indent: INDENT, pageBreakBefore: true }),
  new Paragraph({
    spacing: { before: 120 },
    indent: { left: INDENT },
    tabStops: [{ type: TabStopType.RIGHT, position: WIDTH - INDENT, leader: LeaderType.DOT }],
    children: [run('1. Nhận xét, đánh giá', { bold: true }), new FootnoteReferenceRun(1), run(':', { bold: true }), new TextRun({ children: [new Tab()], font: FONT })]
  }),
  ...[0, 1, 2].map(
    () =>
    new Paragraph({
      spacing: { before: 120 },
      tabStops: [{ type: TabStopType.RIGHT, position: WIDTH, leader: LeaderType.DOT }],
      children: [new TextRun({ children: [new Tab()], font: FONT })]
    })
  ),
  new Paragraph({
    spacing: { before: 120 },
    indent: { left: INDENT },
    tabStops: [{ type: TabStopType.RIGHT, position: WIDTH - INDENT, leader: LeaderType.DOT }],
    children: [run('2. Chấm điểm:', { bold: true }), new TextRun({ children: [new Tab()], font: FONT })]
  }),
  para([run('XÁC NHẬN CỦA THỦ TRƯỞNG ĐƠN VỊ', { bold: true }), new FootnoteReferenceRun(2)], { align: AlignmentType.CENTER, before: 200 })] :

  [];

  const fnRuns = (t: string) => t.split(/(“[^”]*”)/).filter(Boolean).map((p) => run(p, { size: 18, italics: p.startsWith('“') }));

  const doc = new Document({
    creator: 'Quản lý KPI',
    title: f.fileBase,
    styles: { default: { document: { run: { font: FONT, size: BODY } } } },
    footnotes: f.review ?
    {
      1: { children: f.footnote1.map((t) => para(fnRuns(t), { align: AlignmentType.JUSTIFIED })) },
      2: { children: f.footnote2.map((t) => para([run(t, { size: 18 })], { align: AlignmentType.JUSTIFIED })) }
    } :
    undefined,
    sections: [
    {
      properties: {
        titlePage: true,
        page: {
          size: { orientation: PageOrientation.LANDSCAPE, width: 11906, height: 16838 },
          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, header: 360 }
        }
      },
      headers: {
        first: new Header({ children: [para([])] }),
        default: new Header({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: BODY })] })]
        })
      },
      children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        indent: { left: Math.round(WIDTH * 0.8) },
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 },
          left: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 4 },
          right: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 4 }
        },
        children: [run(f.code, { italics: true })]
      }),
      headerTable,
      para([run('BẢN ĐÁNH GIÁ KẾT QUẢ HOÀN THÀNH NHIỆM VỤ THEO CHỈ SỐ ĐO LƯỜNG (KPI)', { bold: true })], { align: AlignmentType.CENTER, before: 320 }),
      para([run(f.subtitle, { bold: true })], { align: AlignmentType.CENTER, after: 160 }),
      ...f.info.map((line) => dottedLine(line)),
      ...(f.review ? [para([run('I. TỰ ĐÁNH GIÁ KẾT QUẢ HOÀN THÀNH NHIỆM VỤ THEO CHỈ SỐ ĐO LƯỜNG (KPI)', { bold: true })], { indent: INDENT, before: 120 })] : []),
      para([run('1. Điểm về số lượng, chất lượng, tiến độ', { bold: true })], { indent: INDENT, before: 100 }),
      para([run(INTRO(f))], { align: AlignmentType.JUSTIFIED, firstLine: INDENT, before: 60, after: 120 }),
      grid,
      ...dBlock,
      para([], { before: 120 }),
      fractionLine(
        [run(`${f.kpiTitle} = `, { bold: true })],
        [run(kpiNumerator(f))],
        [run(kpiDenominator(f))],
        [run('x 100 = '), run(`${fmtNum(f.kpi)} điểm`, { bold: true }), run('.')],
        f.kind === 'tt' ? 4400 : 4200
      ),
      signature,
      ...review]

    }]

  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${f.fileBase}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}