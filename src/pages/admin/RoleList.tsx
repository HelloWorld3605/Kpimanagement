import { DataTable } from '../../components/ui/DataTable';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PlusIcon, RotateCcwIcon } from 'lucide-react';
import { useAccess } from '../../contexts/AccessContext';
import { usePermissions } from '../../hooks/usePermissions';
import { grantedCount, roleCode } from '../../utils/permissions';
import { normalize } from '../../utils/org';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { useListScrollMemory, useListState } from '../../hooks/useListState';
import { toast } from 'sonner';
import { TableToolbar, toolbarBtn } from '../../components/ui/TableToolbar';
import { HiddenColumns, TableFrame } from '../../components/ui/TableFrame';
import { TablePager } from '../../components/ui/TablePager';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { Role } from '../../types/access';

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-[13px] font-semibold text-gray-700';

const columns: TableColumn[] = [
{ id: 'stt', label: 'STT', locked: true },
{ id: 'name', label: 'Tên vai trò', locked: true },
{ id: 'code', label: 'Mã vai trò' },
{ id: 'description', label: 'Mô tả' },
{ id: 'permissions', label: 'Số quyền' },
{ id: 'accounts', label: 'Tài khoản' },
{ id: 'view', label: 'Xem' }];


/** Danh sách vai trò — bấm Xem để mở quyền, phạm vi và tài khoản của vai trò */
export function RoleList() {
  const navigate = useNavigate();
  const { roles, features, accounts, resetPolicies } = useAccess();
  const { can } = usePermissions();
  const canWrite = can('admin', 'write');
  const [query, setQuery] = useListState('roles.query', '');
  const [page, setPage] = useListState('roles.page', 1);
  const [pageSize, setPageSize] = useListState('roles.pageSize', 20);
  useListScrollMemory('roles');
  const { hidden, toggle } = useTableColumns('roles');

  const accountCount = (r: Role) => accounts.filter((a) => a.roles.includes(r.id)).length;
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return roles.filter((r) => !q || normalize(`${r.label} ${roleCode(r.id)} ${r.description}`).includes(q));
  }, [query, roles]);
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const open = (r: Role) => navigate(`/vai-tro/${r.id}`);

  const exportColumns: ExportColumn<Role>[] = [
  { header: 'STT', value: (_, i) => i + 1 },
  { id: 'name', header: 'Tên vai trò', value: (r) => r.label },
  { id: 'code', header: 'Mã vai trò', value: (r) => roleCode(r.id) },
  { id: 'description', header: 'Mô tả', value: (r) => r.description },
  { id: 'permissions', header: 'Số quyền', value: (r) => grantedCount(features[r.id]) },
  { id: 'accounts', header: 'Tài khoản', value: accountCount }];


  return (
    <div className="bg-white">
      <TableToolbar
        className="mb-3 border-b border-gray-200 px-4 py-3"
        query={query}
        onQuery={(q) => {
          setQuery(q);
          setPage(1);
        }}
        placeholder="Tìm theo tên, mã vai trò"
        leading={<p className="text-[13px] text-gray-500">{filtered.length} vai trò · tài khoản giữ nhiều vai trò thì quyền cộng dồn</p>}
        columns={columns}
        hidden={hidden}
        onToggleColumn={toggle}
        onExport={(format) => exportTable('vai-tro', visibleExportColumns(exportColumns, hidden), filtered, format)}
        actions={
        <>
          <button
            type="button"
            onClick={() => {
              resetPolicies();
              toast.success('Đã khôi phục quyền và phạm vi mặc định');
            }}
            className={toolbarBtn} style={{ transition: 'background-color 150ms ease-out' }}>
            <RotateCcwIcon className="h-4 w-4" aria-hidden />
            Khôi phục mặc định
          </button>
          {canWrite &&
          <button
            type="button"
            onClick={() => navigate('/vai-tro/tao-moi')}
            className="flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]"
            style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
            
              <PlusIcon className="h-4 w-4" aria-hidden />
              Tạo vai trò
            </button>
          }
          </>
        } />
      

      <HiddenColumns indexes={hiddenIndexes(columns, hidden)}>
        <TableFrame label="Danh sách vai trò">
          <DataTable className="data-table w-full min-w-[900px] text-[14px] text-gray-700">
            <thead>
              <tr>
                <th scope="col" className={`${th} w-14 text-center`}>
                  STT
                </th>
                <th scope="col" className={th}>
                  Tên vai trò
                </th>
                <th scope="col" className={th}>
                  Mã vai trò
                </th>
                <th scope="col" className={th}>
                  Mô tả
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Số quyền
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Tài khoản
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
                    <p className="mt-2 text-gray-500">Không có vai trò phù hợp.</p>
                  </td>
                </tr>
              }
              {rows.map((r, i) =>
              <tr key={r.id} onClick={() => open(r)} className="cursor-pointer border-b border-gray-200 hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
                  <td className="px-3 py-2.5 text-center tabular-nums text-gray-500">{(safePage - 1) * pageSize + i + 1}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-900">
                    {r.label}
                    {r.custom && <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700">Tùy chỉnh</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[13px] text-gray-600">{roleCode(r.id)}</td>
                  <td className="px-3 py-2.5 text-[13px] text-gray-600">{r.description}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{grantedCount(features[r.id])}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{accountCount(r)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      open(r);
                    }}
                    aria-label={`Xem chi tiết vai trò ${r.label}`}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                    
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </DataTable>
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