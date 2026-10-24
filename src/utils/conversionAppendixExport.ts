import { appendixNotes, appendixRows, appendixSubtitle, appendixTitle, groupHeads, subHeads, totalCells } from '../data/conversionAppendix';

/** Xuất Phụ lục quy đổi: in/PDF và Word dùng chung một bản HTML theo khổ A4 ngang; Excel dựng bằng exceljs */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const css = `
@page { size: A4 landscape; margin: 14mm 14mm; }
body { margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #000; line-height: 1.3; }
h1 { font-size: 13pt; text-align: center; margin: 0; line-height: 1.25; }
h2 { font-size: 13pt; margin: 14px 0 6px 40px; }
table { width: 100%; border-collapse: collapse; font-size: 12pt; }
th, td { border: 1px solid #000; padding: 2px 4px; text-align: center; vertical-align: middle; }
th.i { font-style: italic; }
.num td { font-style: italic; }
.n { display: block; font-weight: normal; font-style: italic; }
.t td { font-weight: bold; }
.t .s { display: block; font-weight: normal; }
table.frac { width: auto; margin: 0 auto; border: 0; }
table.frac td { border: 0; padding: 0 3px; white-space: nowrap; }
table.frac td.tp { border-bottom: 1px solid #000; }
table.frac td.eq { padding-right: 4px; }
p { text-indent: 40px; text-align: justify; margin: 0 0 8px; }
`;

/** Phân số dạng bảng nhỏ — in và Word đều giữ được */
const frac = (top: string, bottom: string) =>
`<table class="frac"><tr><td rowspan="2" class="eq">=</td><td class="tp">${top}</td></tr><tr><td>${bottom}</td></tr></table>`;

function bodyHtml() {
  const symbols = (sub?: string) => sub ? ['M', 'A', 'B', 'C'].map((s) => `<td>${s}<sub>${esc(sub)}</sub></td>`).join('') : '<td>…</td>'.repeat(4);
  const rows = appendixRows.
  map(
    (r) =>
    `<tr><td>${esc(r.tt)}</td><td>${esc(r.task)}</td>${symbols(r.sub)}<td>${
    r.sub ? frac(`B<sub>${r.sub}</sub> + C<sub>${r.sub}</sub>`, `M<sub>${r.sub}</sub> * 2`) : ''}</td><td>${
    r.sub ? frac(`M<sub>${r.sub}</sub> * 70`, 'M') : '…'}</td><td></td><td></td></tr>`
  ).
  join('');
  const notes = appendixNotes.
  map((p) => `<p>${p.map((s) => {let h = esc(s.t);if (s.i) h = `<i>${h}</i>`;if (s.b) h = `<b>${h}</b>`;return h;}).join('')}</p>`).
  join('');
  return `
<h1>${appendixTitle}<br/>${appendixSubtitle}</h1>
<h2>I. BẢNG QUY ĐỔI</h2>
<table>
<colgroup><col style="width:4%"/><col style="width:11%"/><col style="width:9.5%"/><col style="width:9.5%"/><col style="width:10%"/><col style="width:10%"/><col style="width:12%"/><col style="width:10.5%"/><col style="width:11%"/><col style="width:12.5%"/></colgroup>
<thead>
<tr><th rowspan="2">TT</th><th rowspan="2">Nhiệm vụ</th><th colspan="4">${groupHeads.kpi.join('<br/>')}</th><th colspan="4">${groupHeads.result.join('<br/>')}</th></tr>
<tr>${subHeads.map((h, i) => `<th class="${i === 7 ? '' : 'i'}">${esc(h.label)}${h.note ? `<span class="n">${esc(h.note)}</span>` : ''}</th>`).join('')}</tr>
<tr class="num">${Array.from({ length: 10 }, (_, i) => `<td>(${i + 1})</td>`).join('')}</tr>
</thead>
<tbody>${rows}
<tr class="t"><td></td><td>Tổng điểm</td>${totalCells.map((c) => `<td>${c.sym}<span class="s">${esc(c.note)}</span></td>`).join('')}<td></td><td>70</td><td></td><td></td></tr>
</tbody></table>
<h2>II. LƯU Ý</h2>
${notes}`;
}

const docHtml = (extraHead = '') =>
`<!doctype html><html lang="vi"><head><meta charset="utf-8"/><title>Phụ lục phương pháp quy đổi điểm KPI</title>${extraHead}<style>${css}</style></head><body>${bodyHtml()}</body></html>`;

/** Mở hộp thoại in (chọn "Lưu dưới dạng PDF" để có file PDF) */
export function printAppendix() {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) throw new Error('print');
  doc.open();
  doc.write(docHtml());
  doc.close();
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  }, 150);
}

const save = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

/** Word mở trực tiếp được, giữ khổ ngang và bảng */
export function downloadAppendixWord() {
  const head = `<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>@page Section1{size:841.9pt 595.3pt;mso-page-orientation:landscape;margin:40pt}div.Section1{page:Section1}</style>`;
  const html = docHtml(head).replace('<body>', '<body><div class="Section1">').replace('</body>', '</div></body>');
  save(new Blob(['\ufeff', html], { type: 'application/msword' }), 'phu-luc-phuong-phap-quy-doi-kpi.doc');
}

export async function downloadAppendixXlsx() {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Phụ lục quy đổi', { pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
  ws.columns = [6, 16, 14, 14, 14, 14, 16, 12, 14, 22].map((width) => ({ width }));
  const font = { name: 'Times New Roman', size: 12 };
  const border = { top: { style: 'thin' as const }, left: { style: 'thin' as const }, bottom: { style: 'thin' as const }, right: { style: 'thin' as const } };
  const center = { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true };

  ws.mergeCells('A1:J1');
  ws.mergeCells('A2:J2');
  ws.getCell('A1').value = appendixTitle;
  ws.getCell('A2').value = appendixSubtitle;
  ['A1', 'A2'].forEach((c) => Object.assign(ws.getCell(c), { font: { ...font, size: 13, bold: true }, alignment: center }));
  ws.getCell('A4').value = 'I. BẢNG QUY ĐỔI';
  ws.getCell('A4').font = { ...font, size: 13, bold: true };

  ws.mergeCells('A5:A6');
  ws.mergeCells('B5:B6');
  ws.mergeCells('C5:F5');
  ws.mergeCells('G5:J5');
  ws.getCell('A5').value = 'TT';
  ws.getCell('B5').value = 'Nhiệm vụ';
  ws.getCell('C5').value = groupHeads.kpi.join('\n');
  ws.getCell('G5').value = groupHeads.result.join('\n');
  subHeads.forEach((h, i) => ws.getRow(6).getCell(i + 3).value = h.note ? `${h.label}\n${h.note}` : h.label);
  for (let c = 1; c <= 10; c++) ws.getRow(7).getCell(c).value = `(${c})`;

  let r = 8;
  appendixRows.forEach((row) => {
    const sym = (s: string) => row.sub ? `${s}${row.sub}` : '…';
    const n = row.sub;
    ws.getRow(r).values = [
    row.tt,
    row.task,
    sym('M'),
    sym('A'),
    sym('B'),
    sym('C'),
    n ? `= (B${n} + C${n}) / (M${n} * 2)` : '',
    n ? `= M${n} * 70 / M` : '…',
    '',
    ''];

    r++;
  });
  ws.getRow(r).values = ['', 'Tổng điểm', ...totalCells.map((c) => `${c.sym}\n${c.note}`), '', 70, '', ''];
  const totalRow = r;

  for (let i = 5; i <= totalRow; i++) {
    const row = ws.getRow(i);
    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c);
      cell.border = border;
      cell.alignment = center;
      cell.font = { ...font, bold: i === 5 || i === 6 || i === totalRow && c <= 8 ? true : undefined, italic: i === 6 && c >= 3 && c <= 9 || i === 7 ? true : undefined };
    }
  }
  ws.getRow(5).getCell(1).font = { ...font, bold: true };
  ws.getRow(6).height = 48;
  ws.getRow(5).height = 32;
  ws.getRow(totalRow).height = 32;

  let n = totalRow + 2;
  ws.getCell(`A${n}`).value = 'II. LƯU Ý';
  ws.getCell(`A${n}`).font = { ...font, size: 13, bold: true };
  appendixNotes.forEach((p) => {
    n++;
    ws.mergeCells(`A${n}:J${n}`);
    const cell = ws.getCell(`A${n}`);
    cell.value = { richText: p.map((s) => ({ text: s.t, font: { ...font, bold: s.b, italic: s.i } })) };
    cell.alignment = { wrapText: true, vertical: 'top' };
    ws.getRow(n).height = 36;
  });

  const buf = await wb.xlsx.writeBuffer();
  save(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'phu-luc-phuong-phap-quy-doi-kpi.xlsx');
}