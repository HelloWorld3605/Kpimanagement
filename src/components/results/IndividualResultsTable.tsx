import { DataTable } from '../ui/DataTable';
import React, { useMemo, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { EmptyMark } from '../ui/EmptyMark';
import { MemberAvatar } from '../org/MemberAvatar';
import { RankBadge } from '../selfReview/RankBadge';
import { TablePager } from '../ui/TablePager';
import { TableFrame } from '../ui/TableFrame';
import { DeltaValue } from './DeltaValue';
import { IndividualRow } from '../../utils/results';
import { fmt } from '../../utils/selfReview';

type IndividualResultsTableProps = {
  rows: IndividualRow[];
  onOpenMember: (id: string) => void;
};

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-3 text-[13px] font-semibold text-gray-700';
const td = 'border-b border-gray-200 px-3 py-3 align-middle';

export function IndividualResultsTable({ rows, onOpenMember }: IndividualResultsTableProps) {
  const [dir, setDir] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Có điểm xếp theo KPI; chưa đánh giá luôn ở cuối
  const sorted = useMemo(
    () =>
    [...rows].sort((a, b) => {
      if (!a.result || !b.result) return a.result ? -1 : b.result ? 1 : 0;
      return dir === 'desc' ? b.result.kpi - a.result.kpi : a.result.kpi - b.result.kpi;
    }),
    [rows, dir]
  );
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const SortIcon = dir === 'desc' ? ArrowDownIcon : ArrowUpIcon;

  return (
    <div className="mx-6 mb-6">
      <TableFrame label="Kết quả cá nhân" className="" reserve={88}>
        <DataTable className="data-table w-full min-w-[880px] text-[14px] text-gray-700">
          <thead>
            <tr className="text-left">
              <th scope="col" className={`${th} w-14 text-center`}>STT</th>
              <th scope="col" className={th}>Cán bộ</th>
              <th scope="col" className={th}>Đơn vị</th>
              <th scope="col" className={th}>Chức vụ</th>
              <th scope="col" className={`${th} text-right`} aria-sort={dir === 'desc' ? 'descending' : 'ascending'}>
                <button
                  type="button"
                  onClick={() => {
                    setDir((d) => d === 'desc' ? 'asc' : 'desc');
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1 rounded text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  
                  Điểm KPI
                  <SortIcon className="h-3.5 w-3.5" aria-hidden />
                </button>
              </th>
              <th scope="col" className={`${th} text-right`}>So với quý trước</th>
              <th scope="col" className={th}>Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ?
            <tr>
                <td colSpan={7} className="px-3 py-14 text-center">
                  <EmptyMark />
                  <p className="mt-2 text-gray-500">Không có cán bộ phù hợp bộ lọc.</p>
                </td>
              </tr> :

            pageRows.map(({ member: m, unit, result, delta }, i) =>
            <tr
              key={m.id}
              onClick={() => onOpenMember(m.id)}
              className="cursor-pointer last:[&>td]:border-b-0 hover:bg-gray-50"
              style={{ transition: 'background-color 120ms ease-out' }}>
              
                  <td className={`${td} text-center tabular-nums text-gray-500`}>{(page - 1) * pageSize + i + 1}</td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <MemberAvatar name={m.name} strong={m.role === 'truong'} size="sm" />
                      <div className="min-w-0">
                        <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMember(m.id);
                      }}
                      className="block truncate rounded text-left font-medium text-gray-900 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      
                          {m.name}
                        </button>
                        <span className="block text-[12px] tabular-nums text-gray-500">
                          {m.code} · {m.rank}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} whitespace-nowrap text-gray-600`}>{unit.name}</td>
                  <td className={`${td} whitespace-nowrap`}>{m.position}</td>
                  {result ?
              <>
                      <td className={`${td} text-right text-[15px] font-semibold tabular-nums text-gray-900`}>{fmt(result.kpi)}</td>
                      <td className={`${td} text-right text-[13px]`}>
                        <DeltaValue value={delta} />
                      </td>
                      <td className={td}>
                        <RankBadge rank={result.rank} />
                      </td>
                    </> :

              <td colSpan={3} className={`${td} text-[13px] text-gray-500`}>
                      Chưa đánh giá trong quý · chuyển sang quý sau
                    </td>
              }
                </tr>
            )
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