import { DataTable } from '../../components/ui/DataTable';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EyeIcon, PencilIcon, PlusIcon, Trash2Icon, UploadIcon, ArrowRightLeftIcon } from 'lucide-react';
import { useAccess } from '../../contexts/AccessContext';
import { MemberAvatar } from '../../components/org/MemberAvatar';
import { HiddenColumns, TableFrame } from '../../components/ui/TableFrame';
import { TablePager } from '../../components/ui/TablePager';
import { btnPrimary, btnSecondary, btnTransition } from '../../components/ui/Modal';
import { ImportStaffDialog } from '../../components/admin/ImportStaffDialog';
import { MoveStaffDialog } from '../../components/admin/MoveStaffDialog';
import { accountStatus } from '../../utils/accountStatus';
import { FilterField, TableToolbar, toolbarField } from '../../components/ui/TableToolbar';
import { Select } from '../../components/ui/Select';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { useListScrollMemory, useListState } from '../../hooks/useListState';
import { usePermissions } from '../../hooks/usePermissions';
import { useDeleteStaff } from '../../hooks/useDeleteStaff';
import { rankOptions } from '../../data/profile';
import { descendantIds, normalize, unitTreeOptions } from '../../utils/org';
import { workplaceOf } from '../../utils/staffForm';
import { accountOfMember, memberRoleLabels } from '../../utils/staff';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { Account } from '../../types/access';
import { MemberRole, UnitMember } from '../../types/org';

type AccountFilter = '' | 'has' | 'none';
type SortKey = 'name' | 'rank' | 'unit';
type Sort = {key: SortKey;dir: 'asc' | 'desc';} | null;

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-[13px] font-semibold text-gray-700';

const staffColumns: TableColumn[] = [
{ id: 'stt', label: 'STT', locked: true },
{ id: 'name', label: 'Họ tên', locked: true },
{ id: 'rank', label: 'Cấp bậc' },
{ id: 'position', label: 'Chức vụ' },
{ id: 'unit', label: 'Đơn vị, phòng ban' },
{ id: 'role', label: 'Cương vị' },
{ id: 'account', label: 'Tài khoản' },
{ id: 'actions', label: 'Thao tác', locked: true }];


const unitText = (m: UnitMember) => {
  const { agency, department } = workplaceOf(m.unitId);
  return { agency: agency?.name ?? '', department: department?.name ?? '' };
};

const exportColumns = (accounts: Account[]): ExportColumn<UnitMember>[] => [
{ header: 'STT', value: (_, i) => i + 1 },
{ id: 'name', header: 'Họ tên', value: (m) => m.name },
{ id: 'name', header: 'Số hiệu', value: (m) => m.code },
{ id: 'rank', header: 'Cấp bậc', value: (m) => m.rank },
{ id: 'position', header: 'Chức vụ', value: (m) => m.position },
{ id: 'unit', header: 'Cơ quan, đơn vị', value: (m) => unitText(m).agency },
{ id: 'unit', header: 'Phòng ban', value: (m) => unitText(m).department },
{ id: 'role', header: 'Cương vị', value: (m) => memberRoleLabels[m.role] },
{ id: 'account', header: 'Tài khoản', value: (m) => accountOfMember(accounts, m.id)?.username ?? '' }];


/** Danh sách hồ sơ nhân sự (nghiệp vụ). Tài khoản đăng nhập quản lý riêng ở Người dùng. */
/** Trạng thái tài khoản hiện dưới tên đăng nhập */
function accountState(a: Account) {
  const status = accountStatus(a);
  if (status === 'locked') return { label: 'Bị khoá', tone: 'text-brand-700' };
  if (status === 'inactive') return { label: 'Ngừng hoạt động', tone: 'text-gray-500' };
  if (a.mustChangePassword) return { label: 'Chưa đổi mật khẩu', tone: 'text-warning-700' };
  if (!a.lastLogin) return { label: 'Chưa đăng nhập', tone: 'text-gray-500' };
  return { label: 'Hoạt động', tone: 'text-success-700' };
}

export function StaffList() {
  const navigate = useNavigate();
  const { accounts, members, units } = useAccess();
  const { can } = usePermissions();
  const canWrite = can('admin', 'write');
  const [importing, setImporting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moving, setMoving] = useState(false);
  const canRemove = can('admin', 'delete');
  const { remove, blockReason } = useDeleteStaff();
  const [page, setPage] = useListState('staff.page', 1);
  const [pageSize, setPageSize] = useListState('staff.pageSize', 20);
  const [query, setQuery] = useListState('staff.query', '');
  const [unitFilter, setUnitFilter] = useListState('staff.unit', '');
  const [roleFilter, setRoleFilter] = useListState<MemberRole | ''>('staff.role', '');
  const [rankFilter, setRankFilter] = useListState('staff.rank', '');
  const [accountFilter, setAccountFilter] = useListState<AccountFilter>('staff.account', '');
  const [sort, setSort] = useListState<Sort>('staff.sort', null);
  useListScrollMemory('staff');
  const { hidden, toggle: toggleColumn } = useTableColumns('staff-list');

  const unitOptions = useMemo(() => unitTreeOptions(), [units]);
  const accountOf = useMemo(() => new Map(accounts.filter((a) => a.memberId).map((a) => [a.memberId as string, a])), [accounts]);
  const usernameOf = useMemo(() => new Map([...accountOf].map(([id, a]) => [id, a.username])), [accountOf]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const inUnit = unitFilter ? new Set(descendantIds(unitFilter)) : null;
    const list = members.filter((m) => {
      const u = unitText(m);
      const username = usernameOf.get(m.id);
      if (q && !normalize(`${m.name} ${m.code} ${m.position} ${u.agency} ${u.department} ${username ?? ''}`).includes(q)) return false;
      if (inUnit && !inUnit.has(m.unitId)) return false;
      if (roleFilter && m.role !== roleFilter) return false;
      if (rankFilter && m.rank !== rankFilter) return false;
      if (accountFilter && Boolean(username) !== (accountFilter === 'has')) return false;
      return true;
    });
    if (!sort) return list;
    const val = (m: UnitMember) => sort.key === 'name' ? m.name : sort.key === 'rank' ? String(rankOptions.indexOf(m.rank)).padStart(3, '0') : `${unitText(m).agency} ${unitText(m).department}`;
    return [...list].sort((a, b) => val(a).localeCompare(val(b), 'vi') * (sort.dir === 'asc' ? 1 : -1));
  }, [members, usernameOf, query, unitFilter, roleFilter, rankFilter, accountFilter, sort]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleCount = staffColumns.filter((c) => !hidden.has(c.id)).length;
  const withFilter = <T,>(setter: (v: T) => void) => (v: string) => {
    setter(v as unknown as T);
    setPage(1);
  };

  const onSort = (key: SortKey) => {
    setSort(!sort || sort.key !== key ? { key, dir: 'asc' } : sort.dir === 'asc' ? { key, dir: 'desc' } : null);
    setPage(1);
  };
  const sortHead = (key: SortKey, label: string) => {
    const active = sort?.key === key;
    const Icon = !active ? ChevronsUpDownIcon : sort.dir === 'asc' ? ArrowUpIcon : ArrowDownIcon;
    return (
      <th scope="col" className={th} aria-sort={active ? sort.dir === 'asc' ? 'ascending' : 'descending' : 'none'}>
        <button
          type="button"
          onClick={() => onSort(key)}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${active ? 'text-brand-700' : ''}`}>
          
          {label}
          <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-brand-600' : 'text-gray-400'}`} aria-hidden />
        </button>
      </th>);

  };

  const open = (m: UnitMember) => navigate(`/nhan-su/${m.id}`);
  const toggleMany = (ids: string[], on: boolean) =>
  setSelected((prev) => {
    const next = new Set(prev);
    ids.forEach((id) => on ? next.add(id) : next.delete(id));
    return next;
  });
  const iconBtn =
  'rounded p-1.5 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <div className="bg-white">
      <TableToolbar
        query={query}
        onQuery={(q) => {
          setQuery(q);
          setPage(1);
        }}
        placeholder="Tìm họ tên, số hiệu, chức vụ, đơn vị, tài khoản"
        filters={
        <>
            <FilterField label="Đơn vị">
              <Select aria-label="Đơn vị" value={unitFilter} onChange={withFilter(setUnitFilter)} className={toolbarField}>
                <option value="">Tất cả đơn vị</option>
                {unitOptions.map((u) =>
              <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
              )}
              </Select>
            </FilterField>
            <FilterField label="Cương vị">
              <Select aria-label="Cương vị" value={roleFilter} onChange={withFilter(setRoleFilter)} className={toolbarField}>
                <option value="">Tất cả cương vị</option>
                {(Object.keys(memberRoleLabels) as MemberRole[]).map((r) =>
              <option key={r} value={r}>
                    {memberRoleLabels[r]}
                  </option>
              )}
              </Select>
            </FilterField>
            <FilterField label="Cấp bậc">
              <Select aria-label="Cấp bậc" value={rankFilter} onChange={withFilter(setRankFilter)} className={toolbarField}>
                <option value="">Tất cả cấp bậc</option>
                {rankOptions.map((r) =>
              <option key={r} value={r}>
                    {r}
                  </option>
              )}
              </Select>
            </FilterField>
            <FilterField label="Tài khoản">
              <Select aria-label="Tài khoản" value={accountFilter} onChange={withFilter(setAccountFilter)} className={toolbarField}>
                <option value="">Tất cả</option>
                <option value="has">Có tài khoản</option>
                <option value="none">Chưa có tài khoản</option>
              </Select>
            </FilterField>
          </>
        }
        activeFilters={[unitFilter, roleFilter, rankFilter, accountFilter].filter(Boolean).length}
        onClearFilters={() => {
          setUnitFilter('');
          setRoleFilter('');
          setRankFilter('');
          setAccountFilter('');
        }}
        columns={staffColumns}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onExport={(format) => exportTable('nhan-su', visibleExportColumns(exportColumns(accounts), hidden), filtered, format)}
        actions={
        canWrite &&
        <>
            <button type="button" onClick={() => setImporting(true)} className={btnSecondary} style={btnTransition}>
              <UploadIcon className="h-4 w-4" aria-hidden />
              Nhập Excel
            </button>
            <button type="button" onClick={() => navigate('/nhan-su/tao-moi')} className={btnPrimary} style={btnTransition}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Tạo mới
            </button>
          </>

        } />
      

      {selected.size > 0 &&
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-brand-50/60 px-4 py-2 text-[14px]">
          <span className="font-medium text-gray-900">Đã chọn {selected.size} nhân sự</span>
          <button type="button" onClick={() => setMoving(true)} className={btnSecondary} style={btnTransition}>
            <ArrowRightLeftIcon className="h-4 w-4" aria-hidden />
            Chuyển đơn vị
          </button>
          <button type="button" onClick={() => setSelected(new Set())} className="text-[13px] font-medium text-gray-600 hover:text-gray-900">
            Bỏ chọn
          </button>
        </div>
      }
      <HiddenColumns indexes={hiddenIndexes(staffColumns, hidden, canWrite ? 1 : 0)}>
        <TableFrame label="Danh sách nhân sự">
          <DataTable className="data-table w-full min-w-[1100px] text-[14px] text-gray-700">
            <thead>
              <tr>
                {canWrite &&
                <th scope="col" className={`${th} w-10 !text-center`}>
                    <input
                    type="checkbox"
                    className="theme-check"
                    aria-label="Chọn tất cả trên trang"
                    checked={rows.length > 0 && rows.every((m) => selected.has(m.id))}
                    onChange={(e) => toggleMany(rows.map((m) => m.id), e.target.checked)} />
                  </th>
                }
                <th scope="col" className={`${th} w-14 !text-center`}>
                  STT
                </th>
                {sortHead('name', 'Họ tên')}
                {sortHead('rank', 'Cấp bậc')}
                <th scope="col" className={th}>
                  Chức vụ
                </th>
                {sortHead('unit', 'Đơn vị, phòng ban')}
                <th scope="col" className={th}>
                  Cương vị
                </th>
                <th scope="col" className={th}>
                  Tài khoản
                </th>
                <th scope="col" className={`${th} w-[120px] !text-center`}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 &&
              <tr>
                  <td colSpan={visibleCount + (canWrite ? 1 : 0)} className="py-14 text-center">
                    <EmptyMark />
                    <p className="mt-2 text-gray-500">Không có nhân sự phù hợp.</p>
                  </td>
                </tr>
              }
              {rows.map((m, i) => {
                const u = unitText(m);
                const username = usernameOf.get(m.id);
                const account = accountOf.get(m.id);
                const blocked = blockReason(m);
                return (
                  <tr key={m.id} onClick={() => open(m)} className="cursor-pointer border-b border-gray-200 hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
                    {canWrite &&
                    <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="theme-check" aria-label={`Chọn ${m.name}`} checked={selected.has(m.id)} onChange={(e) => toggleMany([m.id], e.target.checked)} />
                      </td>
                    }
                    <td className="px-3 py-2.5 text-center tabular-nums text-gray-500">{(safePage - 1) * pageSize + i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={m.name} strong={m.role === 'truong'} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{m.name}</p>
                          <p className="font-mono text-[12px] text-gray-500">{m.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{m.rank || '—'}</td>
                    <td className="px-3 py-2.5">{m.position || '—'}</td>
                    <td className="px-3 py-2.5">
                      <p className="text-gray-900">{u.agency || '—'}</p>
                      {u.department && <p className="text-[12px] text-gray-500">{u.department}</p>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{memberRoleLabels[m.role]}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {account ?
                      <>
                          <span className="font-mono text-[13px] text-gray-900">{username}</span>
                          <span className={`block text-[12px] ${accountState(account).tone}`}>{accountState(account).label}</span>
                        </> :

                      <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[12px] text-warning-700">Chưa có tài khoản</span>
                      }
                    </td>
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-0.5">
                        {canWrite &&
                        <button
                          type="button"
                          onClick={() => navigate(`/nhan-su/${m.id}/sua`)}
                          aria-label={`Sửa ${m.name}`}
                          title="Sửa"
                          className={`${iconBtn} hover:text-brand-600`}
                          style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                          
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        }
                        <button
                          type="button"
                          onClick={() => open(m)}
                          aria-label={`Xem ${m.name}`}
                          title="Xem"
                          className={`${iconBtn} hover:text-brand-600`}
                          style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                          
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canRemove &&
                        <button
                          type="button"
                          onClick={() => remove(m.id)}
                          disabled={!!blocked}
                          aria-label={`Xoá ${m.name}`}
                          title={blocked ?? 'Xoá'}
                          className={`${iconBtn} hover:text-brand-700`}
                          style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                          
                            <Trash2Icon className="h-4 w-4" />
                          </button>
                        }
                      </div>
                    </td>
                  </tr>);

              })}
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
      
      <ImportStaffDialog open={importing} onClose={() => setImporting(false)} />
      <MoveStaffDialog
        open={moving}
        staff={members.filter((m) => selected.has(m.id))}
        onClose={() => setMoving(false)}
        onDone={() => {
          setMoving(false);
          setSelected(new Set());
        }} />
    </div>);

}