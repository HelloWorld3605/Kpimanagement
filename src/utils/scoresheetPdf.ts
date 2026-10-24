import { COL_W, D_TITLE, INTRO, ScoresheetForm, Seg, fmtIdx, fmtNum, headRows, kpiDenominator, kpiNumerator, splitNote } from './scoresheet';

/** Xuất PDF qua hộp thoại in của trình duyệt (Lưu dưới dạng PDF) — bố cục A4 ngang theo Mẫu CĐKPI */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const css = `
@page { size: A4 landscape; margin: 12mm 12mm; @top-center { content: counter(page); font: 13pt 'Times New Roman', serif; } }
@page :first { @top-center { content: none; } }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #000; line-height: 1.3; }
.code { display: flex; justify-content: flex-end; }
.code span { border: 1px solid #000; padding: 1px 28px 1px 40px; font-style: italic; }
.head { width: 100%; border-collapse: collapse; }
.head td { width: 50%; text-align: center; vertical-align: top; padding: 0; }
.b { font-weight: bold; }
.rule { display: inline-block; border-bottom: 1px solid #000; padding: 0 14px 1px; }
.date { font-style: italic; margin-top: 8px; }
h1 { font-size: 13pt; text-align: center; margin: 18px 0 0; }
.sub { text-align: center; font-weight: bold; margin: 0 0 12px; }
.in { margin: 0 46px; }
.line { display: flex; align-items: baseline; margin: 5px 0; }
.line .lb { white-space: nowrap; }
.dots { flex: 1; border-bottom: 1px dotted #000; padding: 0 4px; min-height: 1.2em; }
.dots.w2 { flex: 1.7; margin-right: 4px; }
h2 { font-size: 13pt; margin: 8px 46px 4px; }
.intro { text-indent: 40px; text-align: justify; margin: 0 0 8px; }
table.grid { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10.5pt; line-height: 1.2; }
table.grid th, table.grid td { border: 1px solid #000; padding: 1px 3px; vertical-align: middle; text-align: center; }
table.grid td.l { text-align: left; }
table.grid thead { display: table-header-group; }
table.grid tr { page-break-inside: avoid; }
.num th { font-weight: normal; font-style: italic; font-size: 9.5pt; }
.note { display: block; font-style: italic; font-size: 8pt; }
.frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 8px; font-weight: normal; font-size: 12pt; line-height: 1.15; }
.frac span:first-child { border-bottom: 1px solid #000; padding: 0 22px 1px; }
.p { margin: 4px 46px; }
.sign { display: flex; justify-content: flex-end; margin-top: 12px; page-break-inside: avoid; }
.sign > div { width: 40%; text-align: center; }
.sign .n { margin-top: 72px; font-weight: bold; }
.review { page-break-before: always; min-height: 170mm; display: flex; flex-direction: column; }
.review .line { margin: 2px 0; }
.confirm { text-align: center; font-weight: bold; margin-top: 12px; }
.notes { margin-top: auto; font-size: 9pt; line-height: 1.25; }
.notes .bar { width: 25%; border-top: 1px solid #000; margin-bottom: 3px; }
.notes p { margin: 0; text-indent: 28px; }
sub, sup { font-size: 70%; }
`;

const segs = (s: Seg[]) =>
s.map((x) => `${x.br ? '<br>' : ''}<span style="font-weight:${x.b ? 'bold' : 'normal'};${x.i ? 'font-style:italic;' : ''}${x.u ? 'text-decoration:underline;' : ''}">${esc(x.t)}</span>`).join('');

const judge = (s: string) => splitNote(s).map((p) => p.note ? `<span class="note">${esc(p.t)}</span>` : esc(p.t)).join('');
const quoted = (s: string) => esc(s).replace(/(“[^”]*”)/g, '<i>$1</i>');

export function renderScoresheetHtml(f: ScoresheetForm) {
  const n = fmtNum;
  const head = headRows(f.kind).
  map((row) => `<tr>${row.map((h) => `<th${h.rs ? ` rowspan="${h.rs}"` : ''}${h.cs ? ` colspan="${h.cs}"` : ''}>${segs(h.segs)}</th>`).join('')}</tr>`).
  join('');
  const nums = `<tr class="num">${COL_W.map((_, i) => `<th>(${i + 1})</th>`).join('')}</tr>`;
  const body = f.rows.
  map(
    (r) =>
    `<tr><td>${r.tt}</td><td class="l">${esc(r.name)}</td><td>${esc(r.product)}</td><td>${n(r.point)}</td><td>${n(r.qty)}</td><td>${n(r.m)}</td><td>${n(r.done)}</td><td>${n(r.a)}</td><td>${judge(r.q1)}</td><td>${judge(r.q2)}</td><td>${n(r.b)}</td><td>${judge(r.p1)}</td><td>${judge(r.p2)}</td><td>${n(r.c)}</td><td>${esc(r.note)}</td></tr>`
  ).
  join('');
  const foot = `
    <tr><td colspan="4" class="b">Tổng</td><td colspan="2">ΣM<sub>n</sub> = ${n(f.totals.m)}</td><td colspan="2">ΣA<sub>n</sub> = ${n(f.totals.a)}</td><td colspan="3">ΣB<sub>n</sub> = ${n(f.totals.b)}</td><td colspan="3">ΣC<sub>n</sub> = ${n(f.totals.c)}</td><td></td></tr>
    <tr style="height:30px"><td colspan="6" class="b">Điểm về số lượng, chất lượng, tiến độ</td><td colspan="2" class="b">A = ${fmtIdx(f.idx.a)}</td><td colspan="3" class="b">B = ${fmtIdx(f.idx.b)}</td><td colspan="3" class="b">C = ${fmtIdx(f.idx.c)}</td><td></td></tr>`;

  const info = f.info.
  map((line) =>
  line.length > 1 ?
  `<div class="line"><span class="lb">${esc(line[0].label)}:</span><span class="dots w2">${esc(line[0].value)}</span><span class="lb">${esc(line[1].label)}:</span><span class="dots">${esc(line[1].value)}</span></div>` :
  `<div class="line"><span class="lb">${esc(line[0].label)}:</span><span class="dots">${esc(line[0].value)}</span></div>`
  ).
  join('');

  const dBlock =
  f.d && f.idx.d !== undefined ?
  `<p class="p"><b>${esc(D_TITLE)} =</b><span class="frac"><span>D<sub>HTNV</sub></span><span>D<sub>TONG</sub></span></span>= <b>${fmtIdx(f.idx.d)} điểm</b>; trong đó:</p>
         <p class="p">- Số tập thể, cá nhân thuộc thẩm quyền quản lý được đánh giá (D<sub>TONG</sub>): ${f.d.total};</p>
         <p class="p">- Số tập thể, cá nhân được đánh giá hoàn thành nhiệm vụ trở lên (D<sub>HTNV</sub>): ${f.d.done};</p>` :
  '';

  const review = f.review ?
  `<section class="review in">
        <h2 style="margin:0 0 4px">II. NHẬN XÉT, ĐÁNH GIÁ CỦA CẤP ỦY, LÃNH ĐẠO, CHỈ HUY ĐƠN VỊ QUẢN LÝ CÁN BỘ</h2>
        <div class="line"><span class="lb b">1. Nhận xét, đánh giá<sup style="font-weight:normal">1</sup>:</span><span class="dots"></span></div>
        <div class="line"><span class="dots"></span></div><div class="line"><span class="dots"></span></div><div class="line"><span class="dots"></span></div>
        <div class="line"><span class="lb b">2. Chấm điểm:</span><span class="dots"></span></div>
        <div class="confirm">XÁC NHẬN CỦA THỦ TRƯỞNG ĐƠN VỊ<sup>2</sup></div>
        <div class="notes"><div class="bar"></div>
          ${f.footnote1.map((t, i) => `<p>${i === 0 ? '<sup>1</sup> ' : ''}${quoted(t)}</p>`).join('')}
          ${f.footnote2.map((t, i) => `<p>${i === 0 ? '<sup>2</sup> ' : ''}${esc(t)}</p>`).join('')}
        </div>
      </section>` :
  '';

  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(f.fileBase)}</title><style>${css}</style></head><body>
    <div class="code"><span>${esc(f.code)}</span></div>
    <table class="head"><tr>
      <td><div>${esc(f.topLeft[0])}</div><div class="rule${f.topLeftBold ? ' b' : ''}">${esc(f.topLeft[1])}</div></td>
      <td><div class="b">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div><div class="rule b" style="padding:0 0 1px">Độc lập - Tự do - Hạnh phúc</div><div class="date">${esc(f.dateLine)}</div></td>
    </tr></table>
    <h1>BẢN ĐÁNH GIÁ KẾT QUẢ HOÀN THÀNH NHIỆM VỤ THEO CHỈ SỐ ĐO LƯỜNG (KPI)</h1>
    <div class="sub">${esc(f.subtitle)}</div>
    ${info ? `<div class="in">${info}</div>` : ''}
    ${f.review ? '<h2>I. TỰ ĐÁNH GIÁ KẾT QUẢ HOÀN THÀNH NHIỆM VỤ THEO CHỈ SỐ ĐO LƯỜNG (KPI)</h2>' : ''}
    <h2>1. Điểm về số lượng, chất lượng, tiến độ</h2>
    <p class="intro">${esc(INTRO(f))}</p>
    <table class="grid"><colgroup>${COL_W.map((w) => `<col style="width:${w}%">`).join('')}</colgroup>
      <thead>${head}${nums}</thead><tbody>${body}${foot}</tbody></table>
    ${dBlock}
    <p class="p" style="margin-top:12px"><b>${esc(f.kpiTitle)} =</b><span class="frac"><span>${kpiNumerator(f)}</span><span>${kpiDenominator(f)}</span></span>x 100 = <b>${fmtNum(f.kpi)} điểm</b>.</p>
    <div class="sign"><div><div class="b">${esc(f.signer.title)}</div><div style="font-style:italic;font-size:11pt">${esc(f.signer.note)}</div><div class="n">${esc(f.signer.name)}</div></div></div>
    ${review}
  </body></html>`;
}

export function printScoresheetPdf(f: ScoresheetForm) {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  if (!win) {
    frame.remove();
    throw new Error('Trình duyệt chặn cửa sổ in.');
  }
  win.document.open();
  win.document.write(renderScoresheetHtml(f));
  win.document.close();
  const cleanup = () => setTimeout(() => frame.remove(), 1000);
  win.onafterprint = cleanup;
  setTimeout(() => {
    win.focus();
    win.print();
    setTimeout(cleanup, 60000);
  }, 300);
}