import { FOOTNOTE_1, FOOTNOTE_2, FORM_CODE, FORM_TITLE, RANK_HINT, SelfReviewForm } from './selfReviewForm';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const css = `
@page { size: A4 landscape; margin: 14mm 15mm; @top-center { content: counter(page); font: 13pt 'Times New Roman', serif; } }
@page :first { @top-center { content: none; } }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #000; line-height: 1.35; }
.code { display: flex; justify-content: flex-end; }
.code span { border: 1px solid #000; padding: 1px 28px 1px 40px; font-style: italic; }
.head { width: 100%; border-collapse: collapse; margin-top: 2px; }
.head td { width: 50%; text-align: center; vertical-align: top; padding: 0; }
.b { font-weight: bold; }
.rule { display: inline-block; border-bottom: 1px solid #000; padding: 0 14px 1px; }
.date { font-style: italic; margin-top: 10px; }
h1 { font-size: 13pt; text-align: center; margin: 22px 0 0; }
.sub { text-align: center; font-weight: bold; margin: 0 0 14px; }
.info { margin: 0 50px; }
.line { display: flex; align-items: baseline; margin: 7px 0; }
.line > .lb { white-space: nowrap; }
.dots { flex: 1; border-bottom: 1px dotted #000; padding: 0 4px; min-height: 1.2em; }
.dots.w2 { flex: 1.7; margin-right: 4px; }
h2 { font-size: 13pt; margin: 10px 50px 6px; }
.intro { margin: 0 50px 12px; }
table.grid { width: 100%; border-collapse: collapse; font-size: 11pt; page-break-inside: auto; }
table.grid th, table.grid td { border: 1px solid #000; padding: 2px 5px; vertical-align: middle; }
table.grid th { font-weight: bold; text-align: center; }
table.grid th i { font-weight: normal; display: block; }
table.grid tr { page-break-inside: avoid; }
.c { text-align: center; }
.j { text-align: justify; }
.group td { text-align: center; font-weight: bold; font-size: 12.5pt; }
.sec td { font-weight: bold; }
.bi { font-weight: bold; font-style: italic; }
.rank { margin: 8px 50px 0; display: flex; align-items: baseline; }
.hint { font-style: italic; text-align: center; margin: 0; }
.sign { display: flex; justify-content: flex-end; margin-top: 8px; }
.sign > div { width: 40%; text-align: center; }
.sign .name { margin-top: 70px; font-weight: bold; }
.p3 { page-break-before: always; margin: 0 50px; }
.p3 h2 { margin: 0 0 4px; }
.p3 .line { margin: 4px 0; }
.confirm { text-align: center; font-weight: bold; margin-top: 12px; }
.confirm-name { text-align: center; font-weight: bold; margin-top: 90px; }
.notes { margin-top: 60px; font-size: 9pt; border-top: 1px solid #000; width: 25%; padding-top: 4px; }
.notes-body { font-size: 9pt; margin-top: 4px; }
.notes-body p { margin: 0 0 2px; text-indent: 24px; }
sup { font-size: 8pt; }
`;

function line(label: string, value: string, label2?: string, value2?: string) {
  if (label2 !== undefined)
  return `<div class="line"><span class="lb">${esc(label)}:</span><span class="dots w2">${esc(value)}</span><span class="lb">${esc(label2)}:</span><span class="dots">${esc(value2 ?? '')}</span></div>`;
  return `<div class="line"><span class="lb">${label}:</span><span class="dots">${esc(value)}</span></div>`;
}

export function renderSelfReviewHtml(f: SelfReviewForm) {
  const criteria = f.criteriaRows.
  map((r) =>
  r.kind === 'section' ?
  `<tr class="sec"><td class="c">${r.code}</td><td>${esc(r.content)}</td><td class="c bi">${r.max}</td><td></td><td></td><td class="c">${r.got}</td><td></td></tr>` :
  `<tr><td class="c">${r.code}</td><td class="j">${esc(r.content)}</td><td class="c">${r.max}</td><td class="c">${r.yes ? 'X' : ''}</td><td class="c">${r.no ? 'X' : ''}</td><td class="c">${r.got}</td><td>${esc(r.note)}</td></tr>`
  ).
  join('');

  const tasks = f.taskRows.
  map(
    (t) =>
    `<tr><td class="c">${t.code}</td><td>${esc(t.name)}</td><td>${esc(t.target)}</td><td>${esc(t.actual)}</td><td class="c">${t.percent}</td><td class="c">${t.max}</td><td class="c">${t.got}</td><td>${esc(t.note)}</td></tr>`
  ).
  join('');

  const a = f.appraisal;

  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(f.fileBase)}</title><style>${css}</style></head><body>
<div class="code"><span>${FORM_CODE}</span></div>
<table class="head"><tr>
  <td><div>${esc(f.parentUnit)}</div><div class="b"><span class="rule">${esc(f.unit)}</span></div></td>
  <td><div class="b">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div><div class="b"><span class="rule">Độc lập - Tự do - Hạnh phúc</span></div><div class="date">${esc(f.dateLine)}</div></td>
</tr></table>
<h1>${FORM_TITLE}</h1>
<p class="sub">${esc(f.periodLine)}</p>
<div class="info">${f.info.map((i) => line(i.label, i.value, i.label2, i.value2)).join('')}</div>
<h2>I. Tự đánh giá kết quả thực hiện nhiệm vụ</h2>
<p class="intro">Trên cơ sở nhiệm vụ được giao, cá nhân tự đánh giá về kết quả thực hiện nhiệm vụ theo quý như sau:</p>
<table class="grid">
  <colgroup><col style="width:4.5%"><col style="width:54%"><col style="width:6.5%"><col style="width:7.5%"><col style="width:7.5%"><col style="width:13%"><col style="width:7%"></colgroup>
  <thead><tr><th>TT</th><th>Nội dung</th><th>Điểm tối đa</th><th>Đảm bảo<i>(đánh dấu X)</i></th><th>Không đảm bảo<i>(đánh dấu X)</i></th><th>Điểm đạt được<i>(chấm điểm tối đa nếu đảm bảo, chấm 0 điểm nếu không đảm bảo)</i></th><th>Ghi chú</th></tr></thead>
  <tbody>
    <tr class="group"><td colspan="7">NHÓM TIÊU CHÍ CHUNG (30 ĐIỂM)</td></tr>
    ${criteria}
    <tr class="sec"><td colspan="2" class="c">Tổng điểm</td><td class="c">${f.criteriaTotal.max}</td><td></td><td></td><td class="c">${f.criteriaTotal.got}</td><td></td></tr>
  </tbody>
</table>
<table class="grid" style="margin-top:-1px">
  <colgroup><col style="width:4%"><col style="width:21%"><col style="width:17%"><col style="width:16%"><col style="width:12.5%"><col style="width:6%"><col style="width:15%"><col style="width:8.5%"></colgroup>
  <tbody>
    <tr class="group"><td colspan="8">NHÓM TIÊU CHÍ VỀ KẾT QUẢ THỰC HIỆN NHIỆM VỤ (70 ĐIỂM)</td></tr>
    <tr><th>TT</th><th>Nhiệm vụ<i>(cụ thể hóa nhiệm vụ được giao theo phạm vi, chức năng của đơn vị)</i></th><th>Mục tiêu, nhiệm vụ đề ra</th><th>Kết quả nhiệm vụ thực tế</th><th>Hiệu suất (%) kết quả nhiệm vụ theo chất lượng, tiến độ (KPI)</th><th>Điểm tối đa</th><th>Điểm đạt được<i>(Điểm hiệu suất (%) kết quả nhiệm vụ theo chất lượng, tiến độ) x (Điểm tối đa)</i></th><th>Ghi chú</th></tr>
    ${tasks}
    <tr class="sec"><td colspan="5" class="c">Tổng điểm</td><td class="c">${f.taskTotal.max}</td><td class="c">${f.taskTotal.got}</td><td></td></tr>
  </tbody>
</table>
<div class="rank"><span class="b" style="white-space:nowrap">II. Tự đề xuất mức xếp loại chất lượng:</span><span class="dots">${esc(f.rank)}</span></div>
<p class="hint">${RANK_HINT}</p>
<div class="sign"><div><div class="b">CÁ NHÂN TỰ ĐÁNH GIÁ</div><div><i>(Ký, ghi rõ họ tên)</i></div><div class="name">${esc(f.signer)}</div></div></div>
<div class="p3">
  <h2>III. Nhận xét, đánh giá của cấp ủy, lãnh đạo, chỉ huy đơn vị</h2>
  <div class="line"><span class="lb">- Chấm điểm<sup>1</sup>:</span><span class="dots">${esc(a?.score ?? '')}</span></div>
  <div class="line"><span class="lb">- Đề xuất mức xếp loại:</span><span class="dots">${esc(a?.rank ?? '')}</span></div>
  <div class="line"><span class="lb">- Mức độ đáp ứng đối với các mục tiêu, nhiệm vụ then chốt:</span><span class="dots">${esc(a?.response ?? '')}</span></div>
  <div class="confirm">XÁC NHẬN CỦA THỦ TRƯỞNG ĐƠN VỊ<sup>2</sup></div>
  <div class="confirm-name">${esc(a?.signer ?? '')}</div>
  <div class="notes"></div>
  <div class="notes-body"><p><sup>1</sup> ${esc(FOOTNOTE_1)}</p><p><sup>2</sup> ${esc(FOOTNOTE_2[0])}</p>${FOOTNOTE_2.slice(1).
  map((n) => `<p>${esc(n)}</p>`).
  join('')}</div>
</div>
</body></html>`;
}

/** In qua iframe ẩn — người dùng chọn "Lưu dưới dạng PDF" trong hộp thoại in. */
export function printSelfReviewPdf(f: SelfReviewForm) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.title = f.fileBase;
  Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    throw new Error('Không mở được bản in');
  }
  doc.open();
  doc.write(renderSelfReviewHtml(f));
  doc.close();

  const prevTitle = document.title;
  const cleanup = () => {
    document.title = prevTitle;
    setTimeout(() => iframe.remove(), 300);
  };
  win.addEventListener('afterprint', cleanup, { once: true });
  setTimeout(() => {
    document.title = f.fileBase;
    win.focus();
    win.print();
  }, 250);
  setTimeout(() => iframe.isConnected && cleanup(), 120000);
}