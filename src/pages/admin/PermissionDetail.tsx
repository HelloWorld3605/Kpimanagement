import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRightIcon, InfoIcon } from 'lucide-react';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { featureLabels, roles } from '../../data/roles';
import { actionChips } from '../../data/permissions';
import { findPermission, permissions, roleCode, rolesWith } from '../../utils/permissions';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { AdminDetailHeader } from '../../components/admin/AdminDetailHeader';
import { ActionChip } from './PermissionList';

const dependency = {
  view: 'Quyền gốc của chức năng. Thu hồi Xem thì vai trò mất luôn mọi thao tác khác trên chức năng này.',
  write: 'Cấp Thêm, sửa sẽ tự cấp Xem. Thu hồi Thêm, sửa thì Xoá cũng bị thu hồi.',
  delete: 'Cấp Xoá sẽ tự cấp Xem và Thêm, sửa.'
} as const;

/** Chi tiết một quyền: mô tả, chức năng, thao tác, các vai trò đang được cấp */
export function PermissionDetail() {
  const { code = '' } = useParams();
  const { features, accounts } = useAccess();
  const permission = findPermission(decodeURIComponent(code));
  useBreadcrumbLabel(permission?.name);

  if (!permission) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-[15px] font-medium text-gray-900">Không tìm thấy quyền</p>
        <Link to="/quyen" className="mt-2 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Về danh mục quyền
        </Link>
      </div>);

  }

  const held = new Set(rolesWith(features, permission));
  const accountCount = accounts.filter((a) => a.roles.some((r) => held.has(r))).length;
  const siblings = permissions.filter((p) => p.feature === permission.feature);

  return (
    <div className="bg-white">
      <AdminDetailHeader
        backTo="/quyen"
        backLabel="Danh mục quyền"
        title={permission.name}
        code={permission.code}
        description={permission.description}
        facts={[
        { label: 'Nhóm chức năng', value: permission.group },
        { label: 'Chức năng', value: featureLabels[permission.feature] },
        { label: 'Thao tác', value: <ActionChip action={permission.action} /> },
        { label: 'Đang áp dụng', value: `${held.size} vai trò · ${accountCount} tài khoản` }]
        } />
      

      <div className="grid gap-8 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="perm-roles">
          <h2 id="perm-roles" className="text-[15px] font-semibold text-gray-900">
            Vai trò được cấp
          </h2>
          <p className="mt-1 text-[13px] text-gray-500">Cấp hoặc thu hồi quyền trong màn chi tiết của từng vai trò.</p>
          <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200">
            {roles.map((r) => {
              const on = held.has(r.id);
              return (
                <li key={r.id}>
                  <Link
                    to={`/vai-tro/${r.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                    style={{ transition: 'background-color 120ms ease-out' }}>
                    
                    <div className="min-w-0 flex-1">
                      <p className={`text-[14px] font-medium ${on ? 'text-gray-900' : 'text-gray-500'}`}>{r.label}</p>
                      <p className="mt-0.5 truncate text-[13px] text-gray-500">
                        <span className="font-mono">{roleCode(r.id)}</span> · {r.description}
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded px-2 py-0.5 text-[12px] font-medium ${on ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                      
                      {on ? 'Được cấp' : 'Không cấp'}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  </Link>
                </li>);

            })}
          </ul>
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="perm-rule">
            <h2 id="perm-rule" className="text-[15px] font-semibold text-gray-900">
              Quy tắc phụ thuộc
            </h2>
            <p className="mt-2 flex gap-2 text-[13px] leading-relaxed text-gray-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              {dependency[permission.action]}
            </p>
          </section>
          <section aria-labelledby="perm-siblings">
            <h2 id="perm-siblings" className="text-[15px] font-semibold text-gray-900">
              Cùng chức năng
            </h2>
            <ul className="mt-2 space-y-1">
              {siblings.map((p) => {
                const current = p.code === permission.code;
                return (
                  <li key={p.code}>
                    <Link
                      to={`/quyen/${encodeURIComponent(p.code)}`}
                      aria-current={current ? 'page' : undefined}
                      className={`flex items-center justify-between rounded px-2.5 py-2 text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      current ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`
                      }
                      style={{ transition: 'background-color 120ms ease-out' }}>
                      
                      {p.name}
                      <span className="text-[12px] text-gray-500">{actionChips[p.action]}</span>
                    </Link>
                  </li>);

              })}
            </ul>
          </section>
        </aside>
      </div>
    </div>);

}