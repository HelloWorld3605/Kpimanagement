import { DataTable } from '../ui/DataTable';
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EyeIcon } from 'lucide-react';
import { EmptyMark } from '../ui/EmptyMark';
import { catalogColumns } from '../../data/taskCatalog';
import { CatalogColumnId, TaskCatalog } from '../../types/catalog';
import { activeVersion, catalogStatusLabel, displayVersion, draftVersion } from '../../utils/catalog';
import { GroupBadge } from './GroupBadge';
import { TableFrame } from '../ui/TableFrame';

export type SortState = {key: CatalogColumnId;dir: 'asc' | 'desc';} | null;

type CatalogTableProps = {
  rows: TaskCatalog[];
  visible: Set<CatalogColumnId>;
  sort: SortState;
  onSort: (key: CatalogColumnId) => void;
  onOpen: (code: string) => void;
  loading: boolean;
  /** Số thứ tự bắt đầu của trang hiện tại (0-based) */
  startIndex?: number;
};

const leftAligned: CatalogColumnId[] = ['name'];
/** Đường kẻ dọc giữa các cột */
const vline = 'border-r border-gray-200';

/** STT + Thao tác */
const FIXED_COLUMNS_WIDTH = 48 + 60;
/** Đủ gọn để hiện đủ cột trên laptop 15,6" (khung ~1050px) mà không có thanh cuộn ngang */
const columnMinWidth: Record<CatalogColumnId, number> = {
  code: 64,
  name: 170,
  force: 80,
  scope: 88,
  output: 104,
  unit: 68,
  score: 64,
  group: 82,
  version: 56,
  status: 118
};

export function CatalogTable({ rows, visible, sort, onSort, onOpen, loading, startIndex = 0 }: CatalogTableProps) {
  const columns = catalogColumns.filter((c) => visible.has(c.id));
  // Độ rộng tối thiểu tính theo các cột đang hiện → ít cột thì bảng vừa khung, không có thanh lướt
  const minWidth = FIXED_COLUMNS_WIDTH + columns.reduce((sum, c) => sum + columnMinWidth[c.id], 0);

  return (
    <TableFrame label="Danh mục nhiệm vụ">
      <DataTable className="data-table w-full text-[13px] text-gray-700 2xl:text-[14px]" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th scope="col" className={`${vline} w-12 px-2 py-3 text-center align-middle text-[13px] font-semibold text-gray-700`}>
              STT
            </th>
            {columns.map((c) => {
              const active = sort?.key === c.id;
              const Icon = !active ? ChevronsUpDownIcon : sort?.dir === 'asc' ? ArrowUpIcon : ArrowDownIcon;
              return (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={active ? sort?.dir === 'asc' ? 'ascending' : 'descending' : 'none'}
                  className={`${vline} px-2 py-3 align-middle text-[13px] font-semibold 2xl:px-2.5 text-gray-700 ${leftAligned.includes(c.id) ? 'text-left' : 'text-center'}`}>
                  
                  <button
                    type="button"
                    onClick={() => onSort(c.id)}
                    className={`inline-flex items-center gap-1 rounded leading-tight hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    active ? 'text-brand-700' : ''}`
                    }>
                    
                    <span>{c.label}</span>
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-brand-600' : 'text-gray-400'}`} />
                  </button>
                </th>);

            })}
            <th scope="col" className="w-[60px] whitespace-nowrap px-1.5 py-3 text-center text-[13px] font-semibold text-gray-700">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {loading &&
          Array.from({ length: 6 }).map((_, r) =>
          <tr key={r} className="border-b border-gray-200 last:border-b-0">
                <td className={`${vline} px-3 py-4`}>
                  <div className="mx-auto h-3.5 w-5 animate-pulse rounded bg-gray-100" />
                </td>
                {columns.map((c) =>
            <td key={c.id} className={`${vline} px-3 py-4`}>
                    <div className={`h-3.5 animate-pulse rounded bg-gray-100 ${c.id === 'name' ? 'w-56' : 'mx-auto w-14'}`} />
                  </td>
            )}
                <td />
              </tr>
          )}

          {!loading && rows.length === 0 &&
          <tr>
              <td colSpan={columns.length + 2} className="py-16 text-center text-gray-500">
                <EmptyMark className="mb-2" />
                Không có danh mục phù hợp với bộ lọc
              </td>
            </tr>
          }

          {!loading &&
          rows.map((t, index) => {
            const v = displayVersion(t);
            const active = activeVersion(t);
            const draft = draftVersion(t);
            const status = catalogStatusLabel(t);
            const cells: Record<CatalogColumnId, React.ReactNode> = {
              code: <span className="whitespace-nowrap font-semibold text-gray-900">{t.code}</span>,
              name: <span className="block min-w-[150px] text-gray-900">{v.name}</span>,
              force: t.force,
              scope: v.scope,
              output: v.output,
              unit: v.unit,
              score: <span className="font-semibold tabular-nums text-gray-900">{v.score}</span>,
              group: <GroupBadge score={v.score} />,
              version:
              <span className="whitespace-nowrap">
                    {active ? `v${active.version}` : <span className="text-gray-300">–</span>}
                    {draft && <span className="text-xs text-warning-700"> · nháp v{draft.version}</span>}
                  </span>,

              status:
              <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${status === 'Đang sử dụng' ? 'text-gray-700' : 'text-gray-400'}`}>
                    <span
                  className={`h-1.5 w-1.5 rounded-full ${
                  status === 'Đang sử dụng' ? 'bg-success-600' : status === 'Chưa áp dụng' ? 'bg-warning-600' : 'bg-gray-300'}`
                  }
                  aria-hidden />
                
                    {status}
                  </span>

            };
            return (
              <tr
                key={t.code}
                className="border-b border-gray-200 hover:bg-gray-50"
                style={{ transition: 'background-color 120ms ease-out' }}>
                
                  <td className={`${vline} px-2 py-3.5 text-center align-middle tabular-nums text-gray-500`}>{startIndex + index + 1}</td>
                  {columns.map((c) =>
                <td key={c.id} className={`${vline} px-2 py-3.5 align-middle 2xl:px-2.5 2xl:py-4 ${leftAligned.includes(c.id) ? 'text-left' : 'text-center'}`}>
                      {cells[c.id]}
                    </td>
                )}
                  <td className="px-1.5 py-3.5 text-center">
                    <button
                    type="button"
                    onClick={() => onOpen(t.code)}
                    aria-label={`Xem chi tiết ${t.code}`}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>);

          })}
        </tbody>
      </DataTable>
    </TableFrame>);

}