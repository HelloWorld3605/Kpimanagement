import {
  AlignmentType,
  BorderStyle,
  Document,
  FootnoteReferenceRun,
  Header,
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
import { FOOTNOTE_1, FOOTNOTE_2, FORM_CODE, FORM_TITLE, RANK_HINT, SelfReviewForm } from './selfReviewForm';

const FONT = 'Times New Roman';
const BODY = 26; // 13pt
const CELL = 22; // 11pt
const MARGIN = 851; // 1.5cm
const WIDTH = 16838 - MARGIN * 2; // A4 ngang
const INDENT = 1100;

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];
type RunOpt = {bold?: boolean;italics?: boolean;size?: number;underline?: boolean;};
type ParaOpt = {align?: Align;before?: number;after?: number;indent?: number;pageBreakBefore?: boolean;keepNext?: boolean;};

const run = (text: string, o: RunOpt = {}) =>
new TextRun({ text, bold: o.bold, italics: o.italics, size: o.size ?? BODY, underline: o.underline ? {} : undefined, font: FONT });

const para = (children: (TextRun | FootnoteReferenceRun)[], o: ParaOpt = {}) =>
new Paragraph({
  children,
  alignment: o.align,
  spacing: { before: o.before ?? 0, after: o.after ?? 0 },
  indent: o.indent ? { left: o.indent, right: o.indent } : undefined,
  pageBreakBefore: o.pageBreakBefore,
  keepNext: o.keepNext
});

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };

type CellOpt = {bold?: boolean;italics?: boolean;align?: Align;span?: number;size?: number;};

function cell(content: string | Paragraph[], width: number, o: CellOpt = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: o.span,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 30, bottom: 30, left: 80, right: 80 },
    children:
    typeof content === 'string' ?
    [para([run(content, { bold: o.bold, italics: o.italics, size: o.size ?? CELL })], { align: o.align ?? AlignmentType.CENTER })] :
    content
  });
}

const headCell = (title: string, note: string | undefined, width: number) =>
cell(
  [
  para([run(title, { bold: true, size: CELL })], { align: AlignmentType.CENTER }),
  ...(note ? [para([run(note, { italics: true, size: 20 })], { align: AlignmentType.CENTER })] : [])],

  width
);

/** Dòng "Nhãn: giá trị ......" với leader chấm tới mép phải */
function dottedLine(parts: (TextRun | FootnoteReferenceRun)[], label2?: {label: string;value: string;}, before = 120) {
  const end = WIDTH - INDENT;
  const mid = Math.round(WIDTH * 0.6);
  return new Paragraph({
    spacing: { before, after: 0 },
    indent: { left: INDENT },
    tabStops: label2 ?
    [
    { type: TabStopType.LEFT, position: mid, leader: LeaderType.DOT },
    { type: TabStopType.RIGHT, position: end, leader: LeaderType.DOT }] :

    [{ type: TabStopType.RIGHT, position: end, leader: LeaderType.DOT }],
    children: [
    ...parts,
    new TextRun({ children: [new Tab()], font: FONT, size: BODY }),
    ...(label2 ? [run(`${label2.label}: ${label2.value}`), new TextRun({ children: [new Tab()], font: FONT, size: BODY })] : [])]

  });
}

function signature(title: string, footnote: number | null, note: string | null, name: string) {
  const right = [
  para([run(title, { bold: true }), ...(footnote ? [new FootnoteReferenceRun(footnote)] : [])], { align: AlignmentType.CENTER }),
  ...(note ? [para([run(note, { italics: true })], { align: AlignmentType.CENTER })] : []),
  para([run(name, { bold: true })], { align: AlignmentType.CENTER, before: 1500 })];

  const left = Math.round(WIDTH * 0.58);
  return new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: [left, WIDTH - left],
    borders: noBorders,
    rows: [new TableRow({ children: [cell([para([])], left), cell(right, WIDTH - left)] })]
  });
}

export async function downloadSelfReviewDocx(f: SelfReviewForm) {
  const half = Math.round(WIDTH / 2);

  const headerTable = new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: [half, WIDTH - half],
    borders: noBorders,
    rows: [
    new TableRow({
      children: [
      cell(
        [
        para([run(f.parentUnit)], { align: AlignmentType.CENTER }),
        para([run(f.unit, { bold: true, underline: true })], { align: AlignmentType.CENTER })],

        half
      ),
      cell(
        [
        para([run('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { bold: true })], { align: AlignmentType.CENTER }),
        para([run('Độc lập - Tự do - Hạnh phúc', { bold: true, underline: true })], { align: AlignmentType.CENTER }),
        para([run(f.dateLine, { italics: true })], { align: AlignmentType.CENTER, before: 200 })],

        WIDTH - half
      )]

    })]

  });

  const cw = [700, 8236, 1000, 1100, 1100, 2000, 1000];
  const cScale = WIDTH / cw.reduce((a, b) => a + b, 0);
  const cCols = cw.map((w) => Math.round(w * cScale));

  const criteriaTable = new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: cCols,
    layout: TableLayoutType.FIXED,
    rows: [
    new TableRow({
      tableHeader: true,
      children: [
      headCell('TT', undefined, cCols[0]),
      headCell('Nội dung', undefined, cCols[1]),
      headCell('Điểm tối đa', undefined, cCols[2]),
      headCell('Đảm bảo', '(đánh dấu X)', cCols[3]),
      headCell('Không đảm bảo', '(đánh dấu X)', cCols[4]),
      headCell('Điểm đạt được', '(chấm điểm tối đa nếu đảm bảo, chấm 0 điểm nếu không đảm bảo)', cCols[5]),
      headCell('Ghi chú', undefined, cCols[6])]

    }),
    new TableRow({ children: [cell('NHÓM TIÊU CHÍ CHUNG (30 ĐIỂM)', WIDTH, { span: 7, bold: true, size: 24 })] }),
    ...f.criteriaRows.map((r) =>
    r.kind === 'section' ?
    new TableRow({
      children: [
      cell(r.code, cCols[0], { bold: true }),
      cell(r.content, cCols[1], { bold: true, align: AlignmentType.LEFT }),
      cell(r.max, cCols[2], { bold: true, italics: true }),
      cell('', cCols[3]),
      cell('', cCols[4]),
      cell(r.got, cCols[5], { bold: true }),
      cell('', cCols[6])]

    }) :
    new TableRow({
      cantSplit: true,
      children: [
      cell(r.code, cCols[0]),
      cell(r.content, cCols[1], { align: AlignmentType.JUSTIFIED }),
      cell(r.max, cCols[2]),
      cell(r.yes ? 'X' : '', cCols[3]),
      cell(r.no ? 'X' : '', cCols[4]),
      cell(r.got, cCols[5]),
      cell(r.note, cCols[6], { align: AlignmentType.LEFT })]

    })
    ),
    new TableRow({
      children: [
      cell('Tổng điểm', cCols[0] + cCols[1], { span: 2, bold: true }),
      cell(f.criteriaTotal.max, cCols[2], { bold: true }),
      cell('', cCols[3]),
      cell('', cCols[4]),
      cell(f.criteriaTotal.got, cCols[5], { bold: true }),
      cell('', cCols[6])]

    })]

  });

  const tw = [600, 3200, 2600, 2400, 1900, 900, 2236, 1300];
  const tScale = WIDTH / tw.reduce((a, b) => a + b, 0);
  const tCols = tw.map((w) => Math.round(w * tScale));

  const taskTable = new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: tCols,
    layout: TableLayoutType.FIXED,
    rows: [
    new TableRow({ children: [cell('NHÓM TIÊU CHÍ VỀ KẾT QUẢ THỰC HIỆN NHIỆM VỤ (70 ĐIỂM)', WIDTH, { span: 8, bold: true, size: 24 })] }),
    new TableRow({
      children: [
      headCell('TT', undefined, tCols[0]),
      headCell('Nhiệm vụ', '(cụ thể hóa nhiệm vụ được giao theo phạm vi, chức năng của đơn vị)', tCols[1]),
      headCell('Mục tiêu, nhiệm vụ đề ra', undefined, tCols[2]),
      headCell('Kết quả nhiệm vụ thực tế', undefined, tCols[3]),
      headCell('Hiệu suất (%) kết quả nhiệm vụ theo chất lượng, tiến độ (KPI)', undefined, tCols[4]),
      headCell('Điểm tối đa', undefined, tCols[5]),
      headCell('Điểm đạt được', '(Điểm hiệu suất (%) kết quả nhiệm vụ theo chất lượng, tiến độ) x (Điểm tối đa)', tCols[6]),
      headCell('Ghi chú', undefined, tCols[7])]

    }),
    ...f.taskRows.map(
      (t) =>
      new TableRow({
        cantSplit: true,
        children: [
        cell(t.code, tCols[0]),
        cell(t.name, tCols[1], { align: AlignmentType.LEFT }),
        cell(t.target, tCols[2], { align: AlignmentType.LEFT }),
        cell(t.actual, tCols[3], { align: AlignmentType.LEFT }),
        cell(t.percent, tCols[4]),
        cell(t.max, tCols[5]),
        cell(t.got, tCols[6]),
        cell(t.note, tCols[7], { align: AlignmentType.LEFT })]

      })
    ),
    new TableRow({
      children: [
      cell('Tổng điểm', tCols.slice(0, 5).reduce((a, b) => a + b, 0), { span: 5, bold: true }),
      cell(f.taskTotal.max, tCols[5], { bold: true }),
      cell(f.taskTotal.got, tCols[6], { bold: true }),
      cell('', tCols[7])]

    })]

  });

  const a = f.appraisal;

  const doc = new Document({
    creator: 'Quản lý KPI',
    title: f.fileBase,
    styles: { default: { document: { run: { font: FONT, size: BODY } } } },
    footnotes: {
      1: { children: [para([run(FOOTNOTE_1, { size: 18 })])] },
      2: { children: FOOTNOTE_2.map((n) => para([run(n, { size: 18 })], { align: AlignmentType.JUSTIFIED })) }
    },
    sections: [
    {
      properties: {
        titlePage: true,
        page: {
          size: { orientation: PageOrientation.LANDSCAPE, width: 11906, height: 16838 },
          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, header: 400 }
        }
      },
      headers: {
        first: new Header({ children: [para([])] }),
        default: new Header({
          children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: BODY })]
          })]

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
        children: [run(FORM_CODE, { italics: true })]
      }),
      headerTable,
      para([run(FORM_TITLE, { bold: true })], { align: AlignmentType.CENTER, before: 360 }),
      para([run(f.periodLine, { bold: true })], { align: AlignmentType.CENTER, after: 120 }),
      ...f.info.map((i) =>
      dottedLine([run(`${i.label}: ${i.value}`)], i.label2 !== undefined ? { label: i.label2, value: i.value2 ?? '' } : undefined)
      ),
      para([run('I. Tự đánh giá kết quả thực hiện nhiệm vụ', { bold: true })], { indent: INDENT, before: 160, after: 80 }),
      para([run('Trên cơ sở nhiệm vụ được giao, cá nhân tự đánh giá về kết quả thực hiện nhiệm vụ theo quý như sau:')], {
        indent: INDENT,
        after: 160
      }),
      criteriaTable,
      taskTable,
      dottedLine([run('II. Tự đề xuất mức xếp loại chất lượng: ', { bold: true }), run(f.rank)], undefined, 120),
      para([run(RANK_HINT, { italics: true })], { align: AlignmentType.CENTER, after: 80 }),
      signature('CÁ NHÂN TỰ ĐÁNH GIÁ', null, '(Ký, ghi rõ họ tên)', f.signer),
      para([run('III. Nhận xét, đánh giá của cấp ủy, lãnh đạo, chỉ huy đơn vị', { bold: true })], { pageBreakBefore: true, indent: INDENT }),
      dottedLine([run('- Chấm điểm'), new FootnoteReferenceRun(1), run(`: ${a?.score ?? ''}`)], undefined, 80),
      dottedLine([run(`- Đề xuất mức xếp loại: ${a?.rank ?? ''}`)], undefined, 80),
      dottedLine([run(`- Mức độ đáp ứng đối với các mục tiêu, nhiệm vụ then chốt: ${a?.response ?? ''}`)], undefined, 80),
      para([run('XÁC NHẬN CỦA THỦ TRƯỞNG ĐƠN VỊ', { bold: true }), new FootnoteReferenceRun(2)], { align: AlignmentType.CENTER, before: 240 }),
      para([run(a?.signer ?? '', { bold: true })], { align: AlignmentType.CENTER, before: 1600 })]

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