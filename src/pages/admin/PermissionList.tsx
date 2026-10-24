import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from 'lucide-react';
import { useAccess } from '../../contexts/AccessContext';
import { featureGroups } from '../../data/roles';
import { actionChips } from '../../data/permissions';
import { ACTIONS, Permission, permissions, rolesWith } from '../../utils/permissions';
import { normalize } from '../../utils/org';
import { roleLabel } from '../../utils/access';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { useListScrollMemory, useListState } from '../../hooks/useListState';
import { FilterField, TableToolbar, toolbarField } from '../../components/ui/TableToolbar';
import { HiddenColumns, TableFrame } from '../../components/ui/TableFrame';
import { TablePager } from '../../components/ui/TablePager';
import { Select } from '../../components/ui/Select';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { Action, RoleFeatures } from '../../types/access';

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-[13px] font-semibold text-gray-700';

const columns: TableColumn[] = [
{ id: 'stt', label: 'STT', locked: true },
{ id: 'name', label: 'Tên quyền', locked: true },
{ id: 'code', label: 'Mã quyền' },
{ id: 'group', label: 'Nhóm chức năng' },
{ id: 'action', label: 'Thao tác' },
{ id: 'roles', label: 'Vai trò được cấp' },
{ id: 'view', label: 'Xem' }];


const exportColumns = (features: RoleFeatures): ExportColumn<Permission>[] => [
{ header: 'STT', value: (_, i) => i + 1 },
{ id: 'name', header: 'Tên quyền', value: (p) => p.name },
{ id: 'name', header: 'Mô tả', value: (p) => p.description },
{ id: 'code', header: 'Mã quyền', value: (p) => p.code },
{ id: 'group', header: 'Nhóm chức năng', value: (p) => p.group },
{ id: 'action', header: 'Thao tác', value: (p) => actionChips[p.action] },
{ id: 'roles', header: 'Vai trò được cấp', value: (p) => rolesWith(features, p).map(roleLabel).join('; ') }];


/** Danh mục quyền của hệ thống — mỗi quyền = một chức năng × một thao tác */
export function PermissionList() {
  const navigate = useNavigate();
  const { features } = useAccess();
  const [query, setQuery] = useListState('permissions.query', '');
  const [group, setGroup] = useListState('permissions.group', '');
  const [action, setActionFilter] = useListState<Action | ''>('permissions.action', '');
  const [assigned, setAssigned] = useListState<'' | 'yes' | 'no'>('permissions.assigned', '');
  const [page, setPage] = useListState('permissions.page', 1);
  const [pageSize, setPageSize] = useListState('permissions.pageSize', 20);
  useListScrollMemory('permissions');
  const { hidden, toggle } = useTableColumns('permissions');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return permissions.filter((p) => {
      if (q && !normalize(`${p.name} ${p.code} ${p.description}`).includes(q)) return false;
      if (group && p.group !== group) return false;
      if (action && p.action !== action) return false;
      const n = rolesWith(features, p).length;
      if (assigned === 'yes' && !n) return false;
      if (assigned === 'no' && n) return false;
      return true;
    });
  }, [query, group, action, assigned, features]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const open = (p: Permission) => navigate(`/quyen/${encodeURIComponent(p.code)}`);
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  return (
    <div className="bg-white">
      <TableToolbar
        className="mb-3 border-b border-gray-200 px-4 py-3"
        query={query}
        onQuery={resetPage(setQuery)}
        placeholder="Tìm theo tên, mã quyền, mô tả"
        filters={
        <>
            <FilterField label="Nhóm chức năng">
              <Select aria-label="Nhóm chức năng" value={group} onChange={resetPage(setGroup)} className={toolbarField}>
                <option value="">Tất cả nhóm</option>
                {featureGroups.map((g) =>
              <option key={g.label} value={g.label}>
                    {g.label}
                  </option>
              )}
              </Select>
            </FilterField>
            <FilterField label="Thao tác">
              <Select aria-label="Thao tác" value={action} onChange={resetPage((v: string) => setActionFilter(v as Action | ''))} className={toolbarField}>
                <option value="">Tất cả thao tác</option>
                {ACTIONS.map((a) =>
              <option key={a} value={a}>
                    {actionChips[a]}
                  </option>
              )}
              </Select>
            </FilterField>
            <FilterField label="Tình trạng cấp">
              <Select aria-label="Tình trạng cấp" value={assigned} onChange={resetPage((v: string) => setAssigned(v as '' | 'yes' | 'no'))} className={toolbarField}>
                <option value="">Tất cả</option>
                <option value="yes">Đã cấp cho vai trò</option>
                <option value="no">Chưa cấp cho vai trò nào</option>
              </Select>
            </FilterField>
          </>
        }
        activeFilters={[group, action, assigned].filter(Boolean).length}
        onClearFilters={() => {
          setGroup('');
          setActionFilter('');
          setAssigned('');
          setPage(1);
        }}
        leading={
        <p className="text-[13px] text-gray-500">
            {filtered.length === permissions.length ? `${permissions.length} quyền` : `${filtered.length} / ${permissions.length} quyền phù hợp`}
          </p>
        }
        columns={columns}
        hidden={hidden}
        onToggleColumn={toggle}
        onExport={(format) => exportTable('danh-muc-quyen', visibleExportColumns(exportColumns(features), hidden), filtered, format)} />
      

      <HiddenColumns indexes={hiddenIndexes(columns, hidden)}>
        <TableFrame label="Danh mục quyền">
          <table className="data-table w-full min-w-[980px] text-[14px] text-gray-700">
            <thead>
              <tr>
                <th scope="col" className={`${th} w-14 text-center`}>
                  STT
                </th>
                <th scope="col" className={th}>
                  Tên quyền
                </th>
                <th scope="col" className={th}>
                  Mã quyền
                </th>
                <th scope="col" className={th}>
                  Nhóm chức năng
                </th>
                <th scope="col" className={th}>
                  Thao tác
                </th>
                <th scope="col" className={th}>
                  Vai trò được cấp
                </th>
                <th scope="col" className={`${th} w-16 text-center`}>
                  Xem
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 &&
              <tr>
                  <td colSpan={columns.length} className="py-14 text-center">
                    <EmptyMark />
                    <p className="mt-2 text-gray-500">Không có quyền phù hợp bộ lọc.</p>
                  </td>
                </tr>
              }
              {rows.map((p, i) => {
                const held = rolesWith(features, p);
                return (
                  <tr key={p.code} onClick={() => open(p)} className="cursor-pointer border-b border-gray-200 hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
                    <td className="px-3 py-2.5 text-center tabular-nums text-gray-500">{(safePage - 1) * pageSize + i + 1}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-gray-500">{p.description}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[13px] text-gray-600">{p.code}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{p.group}</td>
                    <td className="px-3 py-2.5">
                      <ActionChip action={p.action} />
                    </td>
                    <td className="px-3 py-2.5">
                      {held.length ?
                      <span title={held.map(roleLabel).join(', ')}>
                          <span className="font-medium tabular-nums text-gray-900">{held.length}</span> vai trò
                          <span className="ml-1 text-[13px] text-gray-500">· {roleLabel(held[0])}{held.length > 1 ? ` +${held.length - 1}` : ''}</span>
                        </span> :

                      <span className="text-[13px] text-amber-700">Chưa cấp</span>
                      }
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          open(p);
                        }}
                        aria-label={`Xem chi tiết quyền ${p.name}`}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                        
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </TableFrame>
      </HiddenColumns>
      <TablePager
        total={filtered.length}
        page={safePage}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }} />
      
    </div>);

}

const chipTone: Record<Action, string> = {
  view: 'border-gray-300 bg-white text-gray-700',
  write: 'border-brand-200 bg-brand-50 text-brand-700',
  delete: 'border-red-200 bg-red-50 text-red-700'
};

export function ActionChip({ action }: {action: Action;}) {
  return <span className={`inline-flex whitespace-nowrap rounded border px-2 py-0.5 text-[12px] font-medium ${chipTone[action]}`}>{actionChips[action]}</span>;
}