import React from 'react';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';
import { FormRow, HeadCell, ScoresheetForm, fmtIdx, fmtNum, headRows, splitNote } from '../../utils/scoresheet';

/** Độ rộng cột (px) trên màn hình — bảng cuộn ngang khi hẹp hơn */
const WIDTHS = [48, 280, 112, 84, 76, 100, 88, 108, 140, 140, 88, 136, 112, 88, 136];

const th = 'border border-gray-200 bg-gray-50 px-2 py-2 text-center text-[13px] font-semibold text-gray-700';
const groupTh = 'border border-gray-200 bg-brand-50 px-2 py-2.5 text-center text-[13px] font-semibold text-brand-700';
const td = 'border border-gray-200 px-2 py-2.5 text-center tabular-nums';
const foot = 'border border-gray-200 px-2 py-2.5 text-center tabular-nums';

/** Tiêu đề cột: chữ thường, ký hiệu (M)(A)(B)(C) đậm, công thức xuống dòng màu nhạt */
function HeadLabel({ cell }: {cell: HeadCell;}) {
  return (
    <>
      {cell.segs.map((s, i) =>
      s.br ?
      <span key={i} className="block text-[12px] font-normal text-gray-500">
            {s.t}
          </span> :

      <span key={i} className={/^\([A-Z]\)$/.test(s.t) ? 'font-bold text-gray-900' : ''}>
            {s.t}
          </span>

      )}
    </>);

}

/** Chữ đánh giá; phần "(tính …% điểm)" hiện nhỏ, nhạt ở dòng dưới */
function Judgement({ text }: {text: string;}) {
  if (!text) return null;
  return (
    <>
      {splitNote(text).map((p, i) =>
      p.note ?
      <span key={i} className="block text-[12px] text-gray-500">
            {p.t}
          </span> :

      <span key={i}>{p.t}</span>

      )}
    </>);

}

/** Bảng 15 cột của Mẫu CĐKPI, trình bày theo kiểu bảng nghiệp vụ trong hệ thống */
export function ScoresheetTable({ form }: {form: ScoresheetForm;}) {
  const head = headRows(form.kind);
  const n = fmtNum;

  return (
    <HorizontalSwipe containerProps={{ 'aria-label': 'Bảng điểm KPI' }}>
      <table className="w-full min-w-[1736px] border-collapse text-[14px] text-gray-700">
        <colgroup>
          {WIDTHS.map((w, i) =>
          <col key={i} style={{ minWidth: w, width: w }} />
          )}
        </colgroup>
        <thead>
          {head.map((row, ri) =>
          <tr key={ri}>
              {row.map((h, ci) => {
              const isGroup = ri === 0 && (h.cs ?? 1) > 1;
              return (
                <th
                  key={ci}
                  rowSpan={h.rs}
                  colSpan={h.cs}
                  scope={h.cs ? 'colgroup' : 'col'}
                  className={`${isGroup ? groupTh : th} ${ri === 2 ? 'font-medium' : ''}`}>
                  
                    <HeadLabel cell={h} />
                  </th>);

            })}
            </tr>
          )}
          <tr>
            {WIDTHS.map((_, i) =>
            <th key={i} className="border border-gray-200 bg-white px-2 py-1 text-center text-[12px] font-normal text-gray-400">
                ({i + 1})
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {form.rows.length === 0 &&
          <tr>
              <td colSpan={15} className="py-16 text-center text-gray-500">
                Chưa có nhiệm vụ nào trong kỳ
              </td>
            </tr>
          }
          {form.rows.map((r: FormRow) =>
          <tr key={r.tt} className="hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
              <td className={td}>{r.tt}</td>
              <td className={`${td} text-left text-gray-900`}>{r.name}</td>
              <td className={td}>{r.product}</td>
              <td className={td}>{n(r.point)}</td>
              <td className={td}>{n(r.qty)}</td>
              <td className={`${td} font-semibold text-gray-900`}>{n(r.m)}</td>
              <td className={`${td} ${r.done < r.qty ? 'font-semibold text-brand-600' : ''}`}>{n(r.done)}</td>
              <td className={`${td} font-semibold text-gray-900`}>{n(r.a)}</td>
              <td className={td}>
                <Judgement text={r.q1} />
              </td>
              <td className={`${td} ${r.q2 ? 'text-brand-700' : ''}`}>
                <Judgement text={r.q2} />
              </td>
              <td className={`${td} font-semibold text-gray-900`}>{n(r.b)}</td>
              <td className={td}>
                <Judgement text={r.p1} />
              </td>
              <td className={`${td} ${r.p2 ? 'text-brand-700' : ''}`}>
                <Judgement text={r.p2} />
              </td>
              <td className={`${td} font-semibold text-gray-900`}>{n(r.c)}</td>
              <td className={`${td} text-[13px] text-gray-600`}>{r.note}</td>
            </tr>
          )}
        </tbody>
        {form.rows.length > 0 &&
        <tfoot className="bg-gray-100 font-semibold text-gray-900">
            <tr>
              <td colSpan={4} className={foot}>
                Tổng
              </td>
              <td colSpan={2} className={foot}>
                ΣM<sub>n</sub> = {n(form.totals.m)}
              </td>
              <td colSpan={2} className={foot}>
                ΣA<sub>n</sub> = {n(form.totals.a)}
              </td>
              <td colSpan={3} className={foot}>
                ΣB<sub>n</sub> = {n(form.totals.b)}
              </td>
              <td colSpan={3} className={foot}>
                ΣC<sub>n</sub> = {n(form.totals.c)}
              </td>
              <td className={foot} />
            </tr>
            <tr>
              <td colSpan={6} className={foot}>
                Điểm về số lượng, chất lượng, tiến độ
              </td>
              <td colSpan={2} className={foot}>
                A = {fmtIdx(form.idx.a)}
              </td>
              <td colSpan={3} className={foot}>
                B = {fmtIdx(form.idx.b)}
              </td>
              <td colSpan={3} className={foot}>
                C = {fmtIdx(form.idx.c)}
              </td>
              <td className={foot} />
            </tr>
          </tfoot>
        }
      </table>
    </HorizontalSwipe>);

}