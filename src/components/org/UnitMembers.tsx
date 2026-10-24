import React, { useEffect, useMemo, useState } from 'react';
import { EmptyMark } from '../ui/EmptyMark';
import { Select } from '../ui/Select';
import { MemberAvatar } from './MemberAvatar';
import { TablePager } from '../ui/TablePager';
import { HiddenColumns, TableFrame } from '../ui/TableFrame';
import { FilterField, TableToolbar, toolbarField } from '../ui/TableToolbar';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { rankShort } from '../../utils/selfReview';
import { UnitMember } from '../../types/org';
import { StatusPill } from '../catalog/StatusPill';
import { RankBadge } from '../selfReview/RankBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { childUnits, findUnit, isLeader, latestResult, normalize, statusMeta, unitMembers } from '../../utils/org';

type Group = 'all' | 'leader' | 'staff';

type UnitMembersProps = {
  unitId: string;
  onOpenMember: (id: string) => void;
};

const memberColumns: TableColumn[] = [
{ id: 'stt', label: 'STT', locked: true },
{ id: 'member', label: 'Cán bộ', locked: true },
{ id: 'rank', label: 'Cấp bậc' },
{ id: 'position', label: 'Chức vụ' },
{ id: 'unit', label: 'Đơn vị' },
{ id: 'status', label: 'Trạng thái' },
{ id: 'latest', label: 'Quý gần nhất' }];


type CanSee = ReturnType<typeof usePermissions>['canSee'];

/** Ngoài phạm vi chỉ xuất họ tên, cấp bậc, chức vụ, đơn vị — giống trên bảng */
const memberExportColumns = (showUnit: boolean, canSee: CanSee): ExportColumn<UnitMember>[] => {
  const latest = (m: UnitMember) => canSee('member-kpi', { unitId: m.unitId, memberId: m.id }) ? latestResult(m) : undefined;
  return [
  { header: 'STT', value: (_, i) => i + 1 },
  { id: 'member', header: 'Họ tên', value: (m) => m.name },
  { id: 'member', header: 'Số hiệu', value: (m) => m.code },
  { id: 'rank', header: 'Cấp bậc', value: (m) => m.rank },
  { id: 'position', header: 'Chức vụ', value: (m) => m.position },
  ...(showUnit ? [{ id: 'unit', header: 'Đơn vị', value: (m: UnitMember) => findUnit(m.unitId)?.name ?? '' }] : []),
  { id: 'status', header: 'Trạng thái', value: (m) => canSee('member-kpi', { unitId: m.unitId, memberId: m.id }) ? statusMeta[m.status].label : '' },
  { id: 'latest', header: 'KPI quý gần nhất', value: (m) => latest(m)?.kpi.toFixed(1) ?? '' },
  { id: 'latest', header: 'Xếp loại quý gần nhất', value: (m) => {const l = latest(m);return l ? rankShort(l.rank) : '';} }];

};

export function UnitMembers({ unitId, onOpenMember }: UnitMembersProps) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<Group>('all');
  const [includeSub, setIncludeSub] = useState(true);
  const { canSee } = usePermissions();
  const hasChildren = childUnits(unitId).length > 0;
  const showUnit = includeSub && hasChildren;
  const { hidden, toggle: toggleColumn } = useTableColumns('unit-members');
  const present = memberColumns.filter((c) => c.id !== 'unit' || showUnit);

  const rows = useMemo(() => {
    const q = normalize(query.trim());
    return unitMembers(unitId, includeSub).filter(
      (m) =>
      (group === 'all' || group === 'leader' === isLeader(m)) && (
      !q || normalize(m.name).includes(q) || m.code.includes(q) || normalize(m.position).includes(q))
    );
  }, [unitId, includeSub, group, query]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => setPage(1), [unitId, includeSub, group, query, pageSize]);
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section aria-labelledby="unit-members">
      <h2 id="unit-members" className="px-6 pt-5 text-[15px] font-semibold text-gray-900">
        Nhân sự
        <span className="ml-2 text-[14px] font-normal tabular-nums text-gray-500">{rows.length} người</span>
      </h2>
      <TableToolbar
        className="px-6 pb-4 pt-3"
        query={query}
        onQuery={setQuery}
        placeholder="Tìm họ tên, số hiệu, chức vụ"
        filters={
        <>
            <FilterField label="Đối tượng">
              <Select value={group} onChange={(v) => setGroup(v as Group)} aria-label="Lọc theo đối tượng" className={toolbarField}>
                <option value="all">Tất cả đối tượng</option>
                <option value="leader">Lãnh đạo, chỉ huy</option>
                <option value="staff">Không giữ chức vụ</option>
              </Select>
            </FilterField>
            {hasChildren &&
          <label className="flex cursor-pointer select-none items-center gap-2 text-[14px] text-gray-700">
                <input
              type="checkbox"
              checked={includeSub}
              onChange={(e) => setIncludeSub(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            
                Gồm đơn vị cấp dưới
              </label>
          }
          </>
        }
        activeFilters={(group !== 'all' ? 1 : 0) + (hasChildren && !includeSub ? 1 : 0)}
        onClearFilters={() => {
          setGroup('all');
          setIncludeSub(true);
        }}
        columns={present}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onExport={(format) =>
        exportTable(
          `nhan-su-${findUnit(unitId)?.name ?? unitId}`,
          visibleExportColumns(memberExportColumns(showUnit, canSee), hidden),
          rows,
          format
        )
        } />
      

      <div className="mx-6 mb-6">
      <HiddenColumns indexes={hiddenIndexes(present, hidden)}>
      <TableFrame label="Danh sách nhân sự" className="" reserve={88}>
        <table className="data-table w-full min-w-[820px] text-[14px] text-gray-700">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th scope="col" className="w-14 px-3 py-3 text-center text-[13px] font-semibold text-gray-700">STT</th>
              <th scope="col" className="px-3 py-3 text-[13px] font-semibold text-gray-700">Cán bộ</th>
              <th scope="col" className="px-3 py-3 text-[13px] font-semibold text-gray-700">Cấp bậc</th>
              <th scope="col" className="px-3 py-3 text-[13px] font-semibold text-gray-700">Chức vụ</th>
              {showUnit && <th scope="col" className="px-3 py-3 text-[13px] font-semibold text-gray-700">Đơn vị</th>}
              <th scope="col" className="px-3 py-3 text-[13px] font-semibold text-gray-700">Trạng thái</th>
              <th scope="col" className="px-3 py-3 text-right text-[13px] font-semibold text-gray-700">Quý gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ?
                <tr>
                <td colSpan={showUnit ? 7 : 6} className="px-3 py-16 text-center">
                  <EmptyMark />
                  <p className="mt-3 text-[15px] font-semibold text-gray-900">Không có cán bộ phù hợp</p>
                  <p className="mt-1 text-[13px] text-gray-500">Thử đổi từ khoá, đối tượng hoặc bật “Gồm đơn vị cấp dưới”.</p>
                </td>
              </tr> :

                pageRows.map((m, index) => {
                  // Ngoài phạm vi: chỉ họ tên, cấp bậc, chức vụ, đơn vị
                  const visible = canSee('member-kpi', { unitId: m.unitId, memberId: m.id });
                  const last = visible ? latestResult(m) : undefined;
                  const status = statusMeta[m.status];
                  return (
                    <tr
                      key={m.id}
                      onClick={() => onOpenMember(m.id)}
                      className="cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                      style={{ transition: 'background-color 120ms ease-out' }}>
                      
                    <td className="px-3 py-2.5 text-center tabular-nums text-gray-500">{(page - 1) * pageSize + index + 1}</td>
                    <td className="px-3 py-2.5">
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
                          <span className="block text-[12px] tabular-nums text-gray-500">{m.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{m.rank}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span className={isLeader(m) ? 'font-medium text-gray-900' : ''}>{m.position}</span>
                    </td>
                    {showUnit && <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">{findUnit(m.unitId)?.name}</td>}
                    <td className="px-3 py-2.5">
                      {visible ? <StatusPill tone={status.tone}>{status.label}</StatusPill> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {last ?
                        <div className="flex items-center justify-end gap-3">
                          <span className="w-10 text-right font-medium tabular-nums text-gray-900">{last.kpi.toFixed(1)}</span>
                          <RankBadge rank={last.rank} />
                        </div> :

                        <span className="block text-right text-gray-300">—</span>
                        }
                    </td>
                  </tr>);

                })
                }
          </tbody>
        </table>
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
    </section>);

}