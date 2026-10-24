import React from 'react';
import { ConversionAppendixTable } from '../../components/conversion/ConversionAppendixTable';
import { AppendixExport } from '../../components/conversion/AppendixExport';
import { appendixNotes } from '../../data/conversionAppendix';

/** Phụ lục — Gợi ý phương pháp quy đổi điểm KPI. Trang hiển thị dạng màn hình; In / Xuất mới ra bản văn bản */
export function ConversionAppendix() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-4 py-4">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-tight text-gray-900">Phụ lục — Gợi ý phương pháp quy đổi điểm KPI</h1>
          <p className="mt-1 text-[15px] text-gray-500">Kèm Hướng dẫn số 20-HD/ĐUCA · áp dụng cho Nhóm tiêu chí kết quả thực hiện nhiệm vụ (Mẫu KĐCN-1)</p>
        </div>
        <AppendixExport />
      </header>

      <section aria-labelledby="appendix-table" className="px-4 pt-5">
        <h2 id="appendix-table" className="mb-3 text-[19px] font-semibold text-gray-900">
          I. Bảng quy đổi
        </h2>
        <ConversionAppendixTable />
      </section>

      <section aria-labelledby="appendix-notes" className="px-4 pb-8 pt-6">
        <h2 id="appendix-notes" className="mb-3 text-[19px] font-semibold text-gray-900">
          II. Lưu ý
        </h2>
        <ol className="max-w-5xl space-y-3 text-[17px] leading-7 text-gray-700">
          {appendixNotes.map((p, i) =>
          <li key={i}>
              {p.map((s, k) => {
              const cls = `${s.b ? 'font-semibold text-gray-900' : ''} ${s.i ? 'italic' : ''}`.trim();
              return cls ?
              <span key={k} className={cls}>
                    {s.t}
                  </span> :

              <React.Fragment key={k}>{s.t}</React.Fragment>;

            })}
            </li>
          )}
        </ol>
      </section>
    </div>);

}