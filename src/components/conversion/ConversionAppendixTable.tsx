import React from 'react';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';
import { appendixRows, groupHeads, subHeads, totalCells } from '../../data/conversionAppendix';

// Cùng kiểu bảng với pop-up "Tự đánh giá nhiệm vụ KPI", cỡ chữ lớn hơn để đọc công thức
const th = 'border border-gray-200 bg-gray-50 px-3 py-2.5 text-center text-[15px] font-semibold text-gray-700';
const td = 'border border-gray-200 px-3 py-3 text-center tabular-nums';

const S = ({ s, i }: {s: string;i: string;}) =>
<>
    {s}
    <sub className="text-[11px]">{i}</sub>
  </>;


/** Phân số: tử / mẫu, có dấu "=" phía trước */
function Fraction({ top, bottom }: {top: React.ReactNode;bottom: React.ReactNode;}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden>=</span>
      <span className="inline-flex flex-col items-center leading-tight">
        <span className="border-b border-gray-700 px-1 pb-0.5">{top}</span>
        <span className="px-1 pt-0.5">{bottom}</span>
      </span>
    </span>);

}

/** Bảng quy đổi điểm KPI → Nhóm tiêu chí kết quả thực hiện nhiệm vụ */
export function ConversionAppendixTable() {
  return (
    <HorizontalSwipe containerProps={{ 'aria-label': 'Bảng quy đổi điểm KPI' }}>
      <table className="w-full min-w-[1080px] border-collapse text-[16px] text-gray-800">
        <thead>
          <tr>
            <th rowSpan={2} scope="col" className={`${th} w-14`}>TT</th>
            <th rowSpan={2} scope="col" className={`${th} w-36`}>Nhiệm vụ</th>
            <th colSpan={4} scope="colgroup" className={th}>
              {groupHeads.kpi[0]} <span className="whitespace-nowrap">{groupHeads.kpi[1]}</span>
            </th>
            <th colSpan={4} scope="colgroup" className={th}>
              {groupHeads.result[0]} {groupHeads.result[1]}
            </th>
          </tr>
          <tr>
            {subHeads.map((h) =>
            <th key={h.label} scope="col" className={th}>
                {h.label}
                {h.note && <span className="block text-[13px] font-normal text-gray-500">{h.note}</span>}
              </th>
            )}
          </tr>
          <tr>
            {Array.from({ length: 10 }, (_, i) =>
            <td key={i} className="border border-gray-200 bg-gray-50 px-2 py-1.5 text-center text-[14px] text-gray-500">
                ({i + 1})
              </td>
            )}
          </tr>
        </thead>
        <tbody>
          {appendixRows.map((r) =>
          <tr key={r.tt}>
              <td className={`${td} text-gray-500`}>{r.tt}</td>
              <td className={`${td} text-left text-gray-900`}>{r.task}</td>
              {['M', 'A', 'B', 'C'].map((s) =>
            <td key={s} className={td}>
                  {r.sub ? <S s={s} i={r.sub} /> : <span className="text-gray-400">…</span>}
                </td>
            )}
              <td className={td}>
                {r.sub ?
              <Fraction
                top={
                <>
                        <S s="B" i={r.sub} /> + <S s="C" i={r.sub} />
                      </>
                }
                bottom={
                <>
                        <S s="M" i={r.sub} /> * 2
                      </>
                } /> :

              null}
              </td>
              <td className={td}>
                {r.sub ?
              <Fraction
                top={
                <>
                        <S s="M" i={r.sub} /> * 70
                      </>
                }
                bottom="M" /> :


              <span className="text-gray-400">…</span>
              }
              </td>
              <td className={td} />
              <td className={td} />
            </tr>
          )}
          <tr className="bg-gray-50 font-semibold text-gray-900">
            <td className={td} />
            <th scope="row" className={`${td} text-left`}>Tổng điểm</th>
            {totalCells.map((c) =>
            <td key={c.sym} className={td}>
                {c.sym}
                <span className="block whitespace-nowrap text-[13px] font-normal text-gray-500">{c.note}</span>
              </td>
            )}
            <td className={td} />
            <td className={`${td} text-brand-700`}>70</td>
            <td className={td} />
            <td className={td} />
          </tr>
        </tbody>
      </table>
    </HorizontalSwipe>);

}