import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PencilIcon } from 'lucide-react';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { useUnsavedChanges } from '../../contexts/UnsavedChangesContext';
import { toast } from 'sonner';
import { resourceFeature, resourceLabels, scopeLabels } from '../../data/roles';
import { grantedCount, roleCode } from '../../utils/permissions';
import { accountStatus, accountStatusMeta } from '../../utils/accountStatus';
import { findMember, findUnit } from '../../utils/org';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { AdminDetailHeader } from '../../components/admin/AdminDetailHeader';
import { RolePermissionGrid } from '../../components/admin/RolePermissionGrid';
import { btnGhost, btnPrimary, btnSecondary, btnTransition } from '../../components/ui/Modal';
import { ResourceId, RoleFeatures } from '../../types/access';

type Tab = 'permissions' | 'scope' | 'accounts';

/** Chi tiết vai trò: quyền chức năng (sửa được), phạm vi dữ liệu, tài khoản đang giữ vai trò */
export function RoleDetail() {
  const { id = '' } = useParams();
  const { roles, features, scopes, accounts, setRoleFeatures } = useAccess();
  const role = roles.find((r) => r.id === id);
  const [tab, setTab] = useState<Tab>('permissions');
  const [draft, setDraft] = useState<RoleFeatures[keyof RoleFeatures]>();
  useBreadcrumbLabel(role?.label);
  useUnsavedChanges(!!role && draft !== undefined && JSON.stringify(draft) !== JSON.stringify(features[role.id]));

  if (!role) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-[15px] font-medium text-gray-900">Không tìm thấy vai trò</p>
        <Link to="/vai-tro" className="mt-2 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Về danh sách vai trò
        </Link>
      </div>);

  }

  const current = features[role.id] ?? {};
  const editing = draft !== undefined;
  const holders = accounts.filter((a) => a.roles.includes(role.id));
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(current);
  const roleScopes = scopes[role.id] ?? {};
  const scopeRows = (Object.keys(resourceLabels) as ResourceId[]).filter((r) => (current[resourceFeature[r]]?.length ?? 0) > 0);

  const save = () => {
    const previous = current;
    if (draft) setRoleFeatures(role.id, draft);
    setDraft(undefined);
    toast.success(`Đã lưu quyền cho vai trò ${role.label}`, {
      duration: 6000,
      action: {
        label: 'Hoàn tác',
        onClick: () => {
          setRoleFeatures(role.id, previous);
          toast('Đã hoàn tác quyền của vai trò');
        }
      }
    });
  };

  const tabs: {id: Tab;label: string;count: number;}[] = [
  { id: 'permissions', label: 'Quyền chức năng', count: grantedCount(editing ? draft! : current) },
  { id: 'scope', label: 'Phạm vi dữ liệu', count: scopeRows.length },
  { id: 'accounts', label: 'Tài khoản', count: holders.length }];


  return (
    <div className="bg-white">
      <AdminDetailHeader
        backTo="/vai-tro"
        backLabel="Danh sách vai trò"
        title={role.label}
        code={roleCode(role.id)}
        description={role.description || 'Chưa có mô tả.'}
        facts={[
        { label: 'Số quyền', value: grantedCount(current) },
        { label: 'Chức năng truy cập', value: Object.keys(current).length },
        { label: 'Tài khoản đang giữ', value: holders.length },
        { label: 'Loại', value: role.custom ? 'Vai trò tùy chỉnh' : 'Vai trò hệ thống' }]
        } />
      

      <div role="tablist" aria-label="Nội dung vai trò" className="flex gap-6 border-b border-gray-200 px-4">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-2 border-b-2 py-3 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              active ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`
              }
              style={{ transition: 'color 150ms ease-out, border-color 150ms ease-out' }}>
              
              {t.label}
              <span className={`rounded-full px-1.5 text-[12px] tabular-nums ${active ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
            </button>);

        })}
      </div>

      <div className="px-4 py-5">
        {tab === 'permissions' &&
        <section aria-label="Quyền chức năng">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-gray-500" aria-live="polite">
                {editing ?
              'Thêm, sửa tự bật Xem; tắt Xem thì tắt hết. Bấm Lưu thay đổi để áp dụng.' :

              'Chỉ hiện chức năng vai trò được truy cập.'
              }
              </p>
              {editing ?
            <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setDraft(undefined)} className={btnGhost} style={btnTransition}>
                    Huỷ
                  </button>
                  <button type="button" onClick={save} disabled={!dirty} className={btnPrimary} style={btnTransition}>
                    Lưu thay đổi
                  </button>
                </div> :

            role.id === 'sieu-quan-tri' ?
            <p className="text-[13px] text-gray-500">Siêu quản trị luôn toàn quyền — không chỉnh được.</p> :

            <button type="button" onClick={() => setDraft(current)} className={btnSecondary} style={btnTransition}>
                  <PencilIcon className="h-4 w-4" aria-hidden />
                  Sửa quyền
                </button>
            }
            </div>
            <RolePermissionGrid value={editing ? draft! : current} editing={editing} onChange={setDraft} grantedOnly />
          </section>
        }

        {tab === 'scope' &&
        <section aria-label="Phạm vi dữ liệu">
            <p className="mb-3 text-[13px] text-gray-500">
              Những bản ghi vai trò được thấy trong các chức năng đã cấp. Điều chỉnh tại{' '}
              <Link to="/pham-vi-du-lieu" className="font-medium text-brand-600 hover:text-brand-700">
                Phạm vi dữ liệu
              </Link>
              .
            </p>
            {scopeRows.length ?
          <dl className="divide-y divide-gray-200 rounded-md border border-gray-200">
                {scopeRows.map((r) => {
              const kind = roleScopes[r];
              return (
                <div key={r} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <dt className="text-[14px] text-gray-700">{resourceLabels[r]}</dt>
                      <dd className={`text-[14px] font-medium ${kind ? 'text-gray-900' : 'text-gray-400'}`}>{kind ? scopeLabels[kind] : 'Không xem'}</dd>
                    </div>);

            })}
              </dl> :

          <p className="rounded-md border border-dashed border-gray-300 px-4 py-8 text-center text-[14px] text-gray-500">Vai trò không đọc dữ liệu nghiệp vụ.</p>
          }
          </section>
        }

        {tab === 'accounts' &&
        <section aria-label="Tài khoản">
            {holders.length ?
          <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                {holders.map((a) => {
              const m = findMember(a.memberId);
              return (
                <li key={a.username} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-gray-900">{m?.name ?? a.username}</p>
                        <p className="mt-0.5 text-[13px] text-gray-500">
                          <span className="font-mono">{a.username}</span>
                          {m && ` · ${m.position} · ${findUnit(m.unitId)?.name ?? ''}`}
                        </p>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-[12px] font-medium ${a.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {accountStatusMeta[accountStatus(a)].label}
                      </span>
                    </li>);

            })}
              </ul> :

          <p className="rounded-md border border-dashed border-gray-300 px-4 py-8 text-center text-[14px] text-gray-500">Chưa có tài khoản nào giữ vai trò này.</p>
          }
            <Link to="/nguoi-dung" className="mt-3 inline-block text-[14px] font-medium text-brand-600 hover:text-brand-700">
              Gán vai trò ở màn Người dùng
            </Link>
          </section>
        }
      </div>
    </div>);

}