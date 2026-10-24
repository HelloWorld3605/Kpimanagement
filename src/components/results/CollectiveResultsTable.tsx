import { DataTable } from '../ui/DataTable';
import React, { useState } from 'react';
import { ChevronRightIcon, TriangleAlertIcon } from 'lucide-react';
import { EmptyMark } from '../ui/EmptyMark';
import { RankBadge } from '../selfReview/RankBadge';
import { TablePager } from '../ui/TablePager';
import { TableFrame } from '../ui/TableFrame';
import { DeltaValue } from './DeltaValue';
import { CollectiveRow, flagText } from '../../utils/results';
import { levelLabels, unitPath } from '../../utils/org';
import { fmt } from '../../utils/selfReview';

type CollectiveResultsTableProps = {
  rows: CollectiveRow[];
  onOpenUnit: (unitId: string) => void;
};

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-3 text-[13px] font-semibold text-gray-700';
const td = 'border-b border-gray-200 px-3 py-3 align-middle';

export function CollectiveResultsTable({ rows, onOpenUnit }: CollectiveResultsTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="mx-6 mb-6">
      <TableFrame label="Kết quả tập thể" className="" reserve={88}>
        <DataTable className="data-table w-full min-w-[940px] text-[14px] text-gray-700">
          <thead>
            <tr className="text-left">
              <th scope="col" className={`${th} w-14 text-center`}>STT</th>
              <th scope="col" className={th}>Tập thể</th>
              <th scope="col" className={th}>Người đứng đầu</th>
              <th scope="col" className={`${th} text-right`}>Quân số</th>
              <th scope="col" className={`${th} text-right`}>KPI tập thể</th>
              <th scope="col" className={`${th} text-right`}>So với quý trước</th>
              <th scope="col" className={th}>Xếp loại</th>
              <th scope="col" className={`${th} w-12`}>
                <span className="sr-only">Xem cá nhân</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ?
            <tr>
                <td colSpan={8} className="px-3 py-14 text-center">
                  <EmptyMark />
                  <p className="mt-2 text-gray-500">Không có tập thể phù hợp bộ lọc.</p>
                </td>
              </tr> :

            pageRows.map((r, i) => {
              const parent = unitPath(r.unit.id).slice(-2, -1)[0];
              const leaderHigher = r.flags.includes('leader-higher');
              return (
                <tr
                  key={r.unit.id}
                  onClick={() => onOpenUnit(r.unit.id)}
                  className="group cursor-pointer last:[&>td]:border-b-0 hover:bg-gray-50"
                  style={{ transition: 'background-color 120ms ease-out' }}>
                  
                    <td className={`${td} text-center tabular-nums text-gray-500`}>{(page - 1) * pageSize + i + 1}</td>
                    <td className={td}>
                      <p className="font-medium text-gray-900">{r.unit.name}</p>
                      <p className="text-[12px] text-gray-500">
                        {levelLabels[r.unit.level].split(' · ')[0]}
                        {parent && ` · ${parent.shortName ?? parent.name}`}
                      </p>
                      {r.flags.length > 0 &&
                    <ul className="mt-1.5 space-y-1">
                          {r.flags.map((f) =>
                      <li key={f} className="flex items-start gap-1.5 text-[12px] text-warning-700">
                              <TriangleAlertIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                              {flagText[f]}
                            </li>
                      )}
                        </ul>
                    }
                    </td>
                    <td className={td}>
                      {r.commander ?
                    <>
                          <p className="whitespace-nowrap text-gray-900">{r.commander.name}</p>
                          <p className={`whitespace-nowrap text-[12px] ${leaderHigher ? 'font-medium text-warning-700' : 'text-gray-500'}`}>
                            {r.commander.position}
                            {r.commanderKpi !== undefined && ` · KPI ${fmt(r.commanderKpi)}`}
                          </p>
                        </> :

                    <span className="text-gray-400">—</span>
                    }
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{r.headcount}</td>
                    <td className={`${td} text-right text-[15px] font-semibold tabular-nums ${r.kpi < 70 ? 'text-brand-700' : 'text-gray-900'}`}>
                      {fmt(r.kpi)}
                    </td>
                    <td className={`${td} text-right text-[13px]`}>
                      <DeltaValue value={r.delta} />
                    </td>
                    <td className={td}>
                      <RankBadge rank={r.rank} />
                    </td>
                    <td className={`${td} text-right`}>
                      <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenUnit(r.unit.id);
                      }}
                      aria-label={`Xem kết quả cá nhân của ${r.unit.name}`}
                      title="Xem kết quả cá nhân"
                      className="rounded p-1 text-gray-400 group-hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>);

            })
            }
          </tbody>
        </DataTable>
      </TableFrame>
      <TablePager
        className="mt-3"
        total={rows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }} />
      
    </div>);

}