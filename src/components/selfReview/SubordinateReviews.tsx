import { DataTable } from '../ui/DataTable';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from 'lucide-react';
import { EmptyMark } from '../ui/EmptyMark';
import { Select } from '../ui/Select';
import { FilterField, TableToolbar, toolbarField } from '../ui/TableToolbar';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { members } from '../../data/orgMembers';
import { usePermissions } from '../../hooks/usePermissions';
import { StatusPill } from '../catalog/StatusPill';
import { TablePager } from '../ui/TablePager';
import { HiddenColumns, TableFrame } from '../ui/TableFrame';
import { MemberAvatar } from '../org/MemberAvatar';
import { MemberDrawer } from '../org/MemberDrawer';
import { ReadOnlyNote } from '../ReadOnlyNote';
import { findMember, findUnit, normalize } from '../../utils/org';
import { SubordinateReview, SubordinateReviewState, subordinateReview, subordinateStateMeta } from '../../utils/subordinateReviews';

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-[13px] font-semibold text-gray-700';

const reviewColumns: TableColumn[] = [
{ id: 'member', label: 'Cán bộ', locked: true },
{ id: 'unit', label: 'Đơn vị' },
{ id: 'position', label: 'Chức vụ' },
{ id: 'state', label: 'Trạng thái phiếu' },
{ id: 'score', label: 'Tự chấm' },
{ id: 'view', label: 'Xem' }];


const reviewExportColumns: ExportColumn<SubordinateReview>[] = [
{ header: 'STT', value: (_, i) => i + 1 },
{ id: 'member', header: 'Họ tên', value: (r) => r.member.name },
{ id: 'member', header: 'Số hiệu', value: (r) => r.member.code },
{ id: 'unit', header: 'Đơn vị', value: (r) => findUnit(r.member.unitId)?.name ?? '' },
{ id: 'position', header: 'Chức vụ', value: (r) => r.member.position },
{ id: 'state', header: 'Trạng thái phiếu', value: (r) => subordinateStateMeta[r.state].label },
{ id: 'score', header: 'Tự chấm', value: (r) => r.selfScore === undefined ? '' : r.selfScore.toFixed(1) }];


/** Phiếu của cán bộ trong phạm vi — chỉ xem, không sửa thay */
export function SubordinateReviews({ period }: {period: string;}) {
  const { canSee, account } = usePermissions();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SubordinateReviewState | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openId, setOpenId] = useState<string>();
  const close = useCallback(() => setOpenId(undefined), []);
  const { hidden, toggle: toggleColumn } = useTableColumns('subordinate-reviews');

  const all = useMemo(
    () =>
    members.
    filter((m) => m.id !== account?.memberId && canSee('review', { unitId: m.unitId, memberId: m.id })).
    map(subordinateReview),
    [canSee, account]
  );
  const rows = all.filter((r) => {
    const q = normalize(query.trim());
    return (!state || r.state === state) && (!q || normalize(r.member.name).includes(q) || r.member.code.includes(q));
  });
  useEffect(() => setPage(1), [query, state, pageSize]);
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const counts = (s: SubordinateReviewState) => all.filter((r) => r.state === s).length;

  return (
    <div>
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 px-4 py-5">
        <div>
          <p className="text-[13px] text-gray-500">Phiếu cấp dưới · kỳ hiện tại</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">{period}</h2>
          <ReadOnlyNote feature="self-review" detail="chỉ người lập phiếu được sửa, khi phiếu còn nháp" className="mt-1.5" />
        </div>
        <dl className="flex gap-8">
          {(['submitted', 'draft', 'deferred'] as SubordinateReviewState[]).map((s) =>
          <div key={s} className="text-right">
              <dt className="text-[13px] text-gray-500">{subordinateStateMeta[s].label.split(' · ')[0]}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-gray-900">{counts(s)}</dd>
            </div>
          )}
        </dl>
      </section>

      <TableToolbar
        className="mb-3 border-b border-gray-200 px-4 py-3"
        query={query}
        onQuery={setQuery}
        placeholder="Tìm họ tên, số hiệu"
        filters={
        <FilterField label="Trạng thái phiếu">
            <Select value={state} onChange={(v) => setState(v as SubordinateReviewState | '')} aria-label="Lọc trạng thái phiếu" className={toolbarField}>
              <option value="">Tất cả trạng thái</option>
              {(Object.keys(subordinateStateMeta) as SubordinateReviewState[]).map((s) =>
            <option key={s} value={s}>
                  {subordinateStateMeta[s].label}
                </option>
            )}
            </Select>
          </FilterField>
        }
        activeFilters={state ? 1 : 0}
        onClearFilters={() => setState('')}
        leading={
        <p className="text-[13px] text-gray-500">
            <span className="font-semibold text-gray-900">{rows.length}</span> phiếu trong phạm vi
          </p>
        }
        columns={reviewColumns}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onExport={(format) => exportTable(`phieu-cap-duoi-${period}`, visibleExportColumns(reviewExportColumns, hidden), rows, format)} />
      

      <div className="mx-4 mb-4">
        <HiddenColumns indexes={hiddenIndexes(reviewColumns, hidden)}>
        <TableFrame label="Phiếu cấp dưới" className="" reserve={80}>
          <DataTable className="data-table w-full min-w-[820px] text-[14px] text-gray-700">
            <thead>
              <tr>
                <th className={th}>Cán bộ</th>
                <th className={th}>Đơn vị</th>
                <th className={th}>Chức vụ</th>
                <th className={th}>Trạng thái phiếu</th>
                <th className={`${th} text-right`}>Tự chấm</th>
                <th className={`${th} w-16 text-center`}>Xem</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ?
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <EmptyMark />
                    <p className="mt-2 text-gray-500">{all.length === 0 ? 'Chưa có cán bộ nào trong phạm vi của bạn.' : 'Không có phiếu phù hợp bộ lọc.'}</p>
                  </td>
                </tr> :

                pageRows.map(({ member: m, state: s, selfScore }) =>
                <tr
                  key={m.id}
                  onClick={() => setOpenId(m.id)}
                  className="cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  style={{ transition: 'background-color 120ms ease-out' }}>
                  
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={m.name} size="sm" strong={m.role === 'truong'} />
                        <span>
                          <span className="block font-medium text-gray-900">{m.name}</span>
                          <span className="block text-[12px] tabular-nums text-gray-500">{m.code}</span>
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">{findUnit(m.unitId)?.name}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{m.position}</td>
                    <td className="px-3 py-2.5">
                      <StatusPill tone={subordinateStateMeta[s].tone}>{subordinateStateMeta[s].label}</StatusPill>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums text-gray-900">{selfScore?.toFixed(1) ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(m.id);
                      }}
                      aria-label={`Xem ${m.name}`}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
                }
            </tbody>
          </DataTable>
        </TableFrame>
        </HiddenColumns>
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
        
      </div>

      <MemberDrawer
        member={openId ? findMember(openId) : undefined}
        onClose={close}
        onOpenMember={setOpenId}
        onGoToUnit={(unitId) => navigate('/co-cau-to-chuc', { state: { unitId } })} />
      
    </div>);

}