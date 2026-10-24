import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EyeIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useAccess } from '../../contexts/AccessContext';
import { StatusPill } from '../../components/catalog/StatusPill';
import { HiddenColumns, TableFrame } from '../../components/ui/TableFrame';
import { TablePager } from '../../components/ui/TablePager';
import { btnPrimary, btnTransition } from '../../components/ui/Modal';
import { FilterField, TableToolbar, toolbarField } from '../../components/ui/TableToolbar';
import { Select } from '../../components/ui/Select';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { useListScrollMemory, useListState } from '../../hooks/useListState';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
import { usePermissions } from '../../hooks/usePermissions';
import { normalize } from '../../utils/org';
import { roleLabel } from '../../utils/access';
import { workplaceOf } from '../../utils/staffForm';
import { accountName, memberOfAccount } from '../../utils/staff';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { accountStatus, accountStatusMeta, accountStatusOrder } from '../../utils/accountStatus';
import { Account, AccountStatus, RoleId } from '../../types/access';

/** 'must-change': còn dùng mật khẩu ban đầu / vừa đặt lại — cần nhắc đổi */
type StatusFilter = '' | AccountStatus | 'must-change';
type LinkFilter = '' | 'linked' | 'unlinked';
type SortKey = 'username' | 'name' | 'status' | 'lastLogin';
type Sort = {key: SortKey;dir: 'asc' | 'desc';} | null;

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-[13px] font-semibold text-gray-700';

const userColumns: TableColumn[] = [
{ id: 'stt', label: 'STT', locked: true },
{ id: 'username', label: 'Tên đăng nhập', locked: true },
{ id: 'name', label: 'Họ tên' },
{ id: 'unit', label: 'Nhân sự' },
{ id: 'status', label: 'Trạng thái' },
{ id: 'roles', label: 'Vai trò' },
{ id: 'lastLogin', label: 'Đăng nhập gần nhất' },
{ id: 'actions', label: 'Thao tác', locked: true }];


const unitText = (a: Account) => {
  const { agency, department } = workplaceOf(memberOfAccount(a)?.unitId);
  return { agency: agency?.name ?? '', department: department?.name ?? '' };
};

const exportColumns: ExportColumn<Account>[] = [
{ header: 'STT', value: (_, i) => i + 1 },
{ id: 'username', header: 'Tên đăng nhập', value: (a) => a.username },
{ id: 'username', header: 'Email', value: (a) => a.email ?? '' },
{ id: 'name', header: 'Họ tên', value: (a) => accountName(a) },
{ id: 'unit', header: 'Hồ sơ nhân sự', value: (a) => memberOfAccount(a) ? 'Đã gắn' : 'Chưa gắn' },
{ id: 'unit', header: 'Cơ quan, đơn vị', value: (a) => unitText(a).agency },
{ id: 'unit', header: 'Phòng ban', value: (a) => unitText(a).department },
{ id: 'status', header: 'Trạng thái', value: (a) => accountStatusMeta[accountStatus(a)].label },
{ id: 'roles', header: 'Vai trò', value: (a) => a.roles.map(roleLabel).join('; ') },
{ id: 'lastLogin', header: 'Đăng nhập gần nhất', value: (a) => a.lastLogin ?? '' }];


/** "21/10/2026 07:42" → "202610210742" để so sánh */
const stampKey = (s?: string) => s ? s.replace(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/, '$3$2$1$4$5') : '';

export function UserAccounts() {
  const navigate = useNavigate();
  const { accounts, roles } = useAccess();
  const { can } = usePermissions();
  const canWrite = can('admin', 'write');
  const canRemove = can('admin', 'delete');
  const { remove, canDelete } = useDeleteAccount();
  const [page, setPage] = useListState('users.page', 1);
  const [pageSize, setPageSize] = useListState('users.pageSize', 20);
  const [query, setQuery] = useListState('users.query', '');
  const [roleFilter, setRoleFilter] = useListState<RoleId | ''>('users.role', '');
  const [statusFilter, setStatusFilter] = useListState<StatusFilter>('users.status', '');
  const [linkFilter, setLinkFilter] = useListState<LinkFilter>('users.link', '');
  const [sort, setSort] = useListState<Sort>('users.sort', null);
  useListScrollMemory('users');
  const { hidden, toggle: toggleColumn } = useTableColumns('user-accounts-v2');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const list = accounts.filter((a) => {
      const linked = Boolean(memberOfAccount(a));
      const u = unitText(a);
      if (q && !normalize(`${accountName(a)} ${a.username} ${a.email ?? ''} ${u.agency} ${u.department}`).includes(q)) return false;
      if (roleFilter && !a.roles.includes(roleFilter)) return false;
      if (statusFilter === 'must-change' ? !a.mustChangePassword : statusFilter && accountStatus(a) !== statusFilter) return false;
      if (linkFilter && linked !== (linkFilter === 'linked')) return false;
      return true;
    });
    if (!sort) return list;
    const val = (a: Account) =>
    sort.key === 'username' ? a.username : sort.key === 'name' ? accountName(a) : sort.key === 'status' ? String(accountStatusOrder.indexOf(accountStatus(a))) : stampKey(a.lastLogin);
    return [...list].sort((a, b) => val(a).localeCompare(val(b), 'vi') * (sort.dir === 'asc' ? 1 : -1));
  }, [accounts, query, roleFilter, statusFilter, linkFilter, sort]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleCount = userColumns.filter((c) => !hidden.has(c.id)).length;

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

  const open = (a: Account) => navigate(`/nguoi-dung/${a.username}`);
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
        placeholder="Tìm tên đăng nhập, họ tên, email, đơn vị"
        filters={
        <>
            <FilterField label="Vai trò">
              <Select aria-label="Vai trò" value={roleFilter} onChange={(v) => {setRoleFilter(v as RoleId | '');setPage(1);}} className={toolbarField}>
                <option value="">Tất cả vai trò</option>
                {roles.map((r) =>
              <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
              )}
              </Select>
            </FilterField>
            <FilterField label="Trạng thái">
              <Select aria-label="Trạng thái" value={statusFilter} onChange={(v) => {setStatusFilter(v as StatusFilter);setPage(1);}} className={toolbarField}>
                <option value="">Tất cả trạng thái</option>
                {accountStatusOrder.map((s) =>
              <option key={s} value={s}>
                    {accountStatusMeta[s].label}
                  </option>
              )}
                <option value="must-change">Chưa đổi mật khẩu ban đầu</option>
              </Select>
            </FilterField>
            <FilterField label="Gắn nhân sự">
              <Select aria-label="Gắn nhân sự" value={linkFilter} onChange={(v) => {setLinkFilter(v as LinkFilter);setPage(1);}} className={toolbarField}>
                <option value="">Tất cả</option>
                <option value="linked">Đã gắn</option>
                <option value="unlinked">Chưa gắn</option>
              </Select>
            </FilterField>
          </>
        }
        activeFilters={[roleFilter, statusFilter, linkFilter].filter(Boolean).length}
        onClearFilters={() => {
          setRoleFilter('');
          setStatusFilter('');
          setLinkFilter('');
        }}
        columns={userColumns}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onExport={(format) => exportTable('nguoi-dung', visibleExportColumns(exportColumns, hidden), filtered, format)}
        actions={
        canWrite &&
        <button type="button" onClick={() => navigate('/nguoi-dung/tao-moi')} className={btnPrimary} style={btnTransition}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Tạo mới
            </button>

        } />
      

      <HiddenColumns indexes={hiddenIndexes(userColumns, hidden)}>
        <TableFrame label="Danh sách người dùng">
          <table className="data-table w-full min-w-[1100px] text-[14px] text-gray-700">
            <thead>
              <tr>
                <th scope="col" className={`${th} w-14 !text-center`}>
                  STT
                </th>
                {sortHead('username', 'Tên đăng nhập')}
                {sortHead('name', 'Họ tên')}
                <th scope="col" className={th}>
                  Nhân sự
                </th>
                {sortHead('status', 'Trạng thái')}
                <th scope="col" className={th}>
                  Vai trò
                </th>
                {sortHead('lastLogin', 'Đăng nhập gần nhất')}
                <th scope="col" className={`${th} w-[120px] !text-center`}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 &&
              <tr>
                  <td colSpan={visibleCount} className="py-14 text-center">
                    <EmptyMark />
                    <p className="mt-2 text-gray-500">Không có người dùng phù hợp.</p>
                  </td>
                </tr>
              }
              {rows.map((a, i) => {
                const m = memberOfAccount(a);
                const u = unitText(a);
                return (
                  <tr key={a.username} onClick={() => open(a)} className="cursor-pointer border-b border-gray-200 hover:bg-gray-50" style={{ transition: 'background-color 120ms ease-out' }}>
                    <td className="px-3 py-2.5 text-center tabular-nums text-gray-500">{(safePage - 1) * pageSize + i + 1}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-mono text-[13px] font-medium text-gray-900">{a.username}</p>
                      {a.email && <p className="truncate text-[12px] text-gray-500">{a.email}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-gray-900">{accountName(a)}</p>
                      {m?.position && <p className="text-[12px] text-gray-500">{m.position}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      {m ?
                      <>
                          <p className="text-gray-900">{u.agency || '—'}</p>
                          <p className="text-[12px] text-gray-500">{u.department || 'Chưa thuộc phòng ban'}</p>
                        </> :

                      <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-[12px] text-gray-500">Chưa gắn nhân sự</span>
                      }
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <StatusPill tone={accountStatusMeta[accountStatus(a)].tone}>{accountStatusMeta[accountStatus(a)].label}</StatusPill>
                    </td>
                    <td className="px-3 py-2.5">
                      {a.roles.length ?
                      <ul className="flex flex-wrap gap-1.5">
                          {a.roles.map((r) =>
                        <li key={r} className="whitespace-nowrap rounded-full border border-gray-300 px-2 py-0.5 text-[12px] text-gray-700">
                              {roleLabel(r)}
                            </li>
                        )}
                        </ul> :

                      <span className="text-[13px] text-warning-700">Chưa có vai trò</span>
                      }
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-gray-600">{a.lastLogin ?? '—'}</td>
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-0.5">
                        {canWrite &&
                        <button
                          type="button"
                          onClick={() => navigate(`/nguoi-dung/${a.username}/sua`)}
                          aria-label={`Sửa ${a.username}`}
                          title="Sửa"
                          className={`${iconBtn} hover:text-brand-600`}
                          style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                          
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        }
                        <button
                          type="button"
                          onClick={() => open(a)}
                          aria-label={`Xem ${a.username}`}
                          title="Xem"
                          className={`${iconBtn} hover:text-brand-600`}
                          style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                          
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {canRemove &&
                        <button
                          type="button"
                          onClick={() => remove(a.username)}
                          disabled={!canDelete(a.username)}
                          aria-label={`Xoá ${a.username}`}
                          title={canDelete(a.username) ? 'Xoá' : 'Không xoá được tài khoản đang đăng nhập'}
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