import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, LockIcon, PencilIcon, ShieldIcon, Trash2Icon, UnlockIcon, UserPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { MemberAvatar } from '../../components/org/MemberAvatar';
import { StatusPill } from '../../components/catalog/StatusPill';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { btnPrimary, btnSecondary, btnTransition } from '../../components/ui/Modal';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
import { usePermissions } from '../../hooks/usePermissions';
import { findUnit } from '../../utils/org';
import { nowStamp } from '../../utils/profile';
import { scopeSummary } from '../../utils/access';
import { workplaceOf } from '../../utils/staffForm';
import { accountName, memberOfAccount, memberRoleLabels } from '../../utils/staff';
import { accountStatus, accountStatusMeta, statusPatch } from '../../utils/accountStatus';

const cardTitle = 'border-b border-gray-200 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-gray-500';

/** Chi tiết người dùng: thẻ đầu + thông tin tài khoản, hồ sơ, nơi công tác, hoạt động, vai trò */
export function UserDetail() {
  const { username = '' } = useParams();
  const navigate = useNavigate();
  const { accounts, roles, features, scopes, updateAccount } = useAccess();
  const { remove, canDelete } = useDeleteAccount();
  const canWrite = usePermissions().can('admin', 'write');
  const account = accounts.find((a) => a.username === username);
  const member = memberOfAccount(account);
  useBreadcrumbLabel(account ? accountName(account) : 'Người dùng');

  if (!account) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-[15px] font-medium text-gray-900">Không tìm thấy người dùng</p>
        <Link to="/nguoi-dung" className="mt-2 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Về danh sách người dùng
        </Link>
      </div>);

  }

  const { agency, department } = workplaceOf(member?.unitId);
  const status = accountStatus(account);
  const meta = accountStatusMeta[status];
  // Khoá ↔ Mở khoá; tài khoản ngừng hoạt động thì nút là "Khoá"
  const toggleLock = () => {
    const prev = status;
    const next = status === 'locked' ? 'active' : 'locked';
    updateAccount(account.username, { ...statusPatch(next), updatedAt: nowStamp() });
    toast.success(next === 'active' ? `Đã mở khoá ${account.username}` : `Đã khoá ${account.username}`, {
      duration: 6000,
      action: { label: 'Hoàn tác', onClick: () => updateAccount(account.username, statusPatch(prev)) }
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/nguoi-dung"
          className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'color 150ms ease-out' }}>
          
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Danh sách người dùng
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={toggleLock} className={btnSecondary} style={btnTransition}>
            {status !== 'locked' ? <LockIcon className="h-4 w-4" aria-hidden /> : <UnlockIcon className="h-4 w-4" aria-hidden />}
            {status !== 'locked' ? 'Khoá' : 'Mở khoá'}
          </button>
          <button type="button" onClick={() => navigate(`/nguoi-dung/${account.username}/sua`)} className={btnPrimary} style={btnTransition}>
            <PencilIcon className="h-4 w-4" aria-hidden />
            Sửa
          </button>
          <button
            type="button"
            disabled={!canDelete(account.username)}
            title={canDelete(account.username) ? undefined : 'Không xoá được tài khoản đang đăng nhập'}
            onClick={() => remove(account.username) && navigate('/nguoi-dung')}
            className={`${btnSecondary} !border-brand-600/40 !text-brand-700 hover:!bg-brand-50`}
            style={btnTransition}>
            
            <Trash2Icon className="h-4 w-4" aria-hidden />
            Xoá
          </button>
        </div>
      </div>

      <header className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-gray-200 px-5 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <MemberAvatar name={accountName(account)} />
          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-semibold text-gray-900">{accountName(account)}</h1>
            <p className="truncate text-[13px] text-gray-500">
              <span className="font-mono">{account.username}</span>
              {account.email && ` · ${account.email}`}
            </p>
          </div>
        </div>
        <dl className="flex flex-wrap divide-x divide-gray-200">
          {[
          ['Số hiệu', member?.code ?? '—'],
          ['Tạo lúc', account.createdAt ?? '—'],
          ['Đăng nhập gần nhất', account.lastLogin ?? 'Chưa đăng nhập']].
          map(([l, v]) =>
          <div key={l} className="px-5 first:pl-0 last:pr-0">
              <dt className="text-[12px] font-medium uppercase tracking-wider text-gray-500">{l}</dt>
              <dd className="mt-1 whitespace-nowrap text-[14px] text-gray-900">{v}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard title="Thông tin tài khoản">
          <Row label="Tên đăng nhập">
            <span className="font-mono">{account.username}</span>
          </Row>
          <Row label="Họ tên hiển thị">{account.displayName || '—'}</Row>
          <Row label="Email">{account.email || '—'}</Row>
          <Row label="Trạng thái">
            <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
          </Row>
        </InfoCard>
        {member ?
        <InfoCard
          title="Hồ sơ nhân sự"
          action={
          <Link to={`/nhan-su/${member.id}`} className="text-[12px] font-medium normal-case tracking-normal text-brand-600 hover:text-brand-700">
                Xem hồ sơ
              </Link>
          }>
          
            <Row label="Họ tên">{member.name}</Row>
            <Row label="Số hiệu">
              <span className="font-mono">{member.code}</span>
            </Row>
            <Row label="Cấp bậc, chức vụ">{[member.rank, member.position].filter(Boolean).join(' · ') || '—'}</Row>
            <Row label="Đơn vị">
              {agency?.name ?? '—'}
              {department && <span className="block text-[12px] text-gray-500">{department.name}</span>}
            </Row>
            <Row label="Cương vị">{memberRoleLabels[member.role]}</Row>
          </InfoCard> :

        <section className="flex flex-col rounded-md border border-dashed border-gray-300">
            <h2 className={cardTitle}>Hồ sơ nhân sự</h2>
            <div className="flex flex-1 flex-col items-start gap-3 px-4 py-4">
              <p className="text-[14px] text-gray-600">Tài khoản chưa gắn hồ sơ nhân sự. Phạm vi dữ liệu theo đơn vị chưa có hiệu lực.</p>
              {canWrite &&
            <Link to={`/nhan-su/tao-moi?account=${encodeURIComponent(account.username)}`} className={btnSecondary} style={btnTransition}>
                  <UserPlusIcon className="h-4 w-4" aria-hidden />
                  Tạo hồ sơ nhân sự
                </Link>
            }
            </div>
          </section>
        }
        <InfoCard title="Hoạt động">
          <Row label="Tạo lúc">{account.createdAt ?? '—'}</Row>
          <Row label="Cập nhật lúc">{account.updatedAt ?? '—'}</Row>
          <Row label="Đăng nhập gần nhất">{account.lastLogin ?? 'Chưa đăng nhập'}</Row>
        </InfoCard>
      </div>

      <section aria-labelledby="user-roles" className="rounded-md border border-gray-200">
        <div className={`${cardTitle} flex items-center justify-between`}>
          <h2 id="user-roles">Vai trò</h2>
          <span className="font-normal normal-case tracking-normal">{account.roles.length} vai trò</span>
        </div>
        <div className="px-4 py-4">
          {account.roles.length ?
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {account.roles.map((id) => {
              const r = roles.find((x) => x.id === id);
              const unit = id === 'chi-huy-pho' ? findUnit(account.assignedUnitIds[0] ?? '') : undefined;
              return (
                <li key={id}>
                    <Link
                    to={`/vai-tro/${id}`}
                    className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3 hover:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    style={{ transition: 'border-color 120ms ease-out' }}>
                    
                      <ShieldIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-gray-900">{r?.label ?? id}</span>
                        {id === 'chi-huy-pho' && <span className="block truncate text-[12px] text-gray-500">Phụ trách {unit?.name ?? 'chưa phân công'}</span>}
                      </span>
                    </Link>
                  </li>);

            })}
            </ul> :

          <p className="text-[14px] text-warning-700">Chưa có vai trò.</p>
          }
          <p className="mt-3 text-[13px] text-gray-600">
            <span className="text-gray-500">Phạm vi dữ liệu: </span>
            {account.roles.length ? scopeSummary({ features, scopes }, account) : '—'}
          </p>
        </div>
      </section>
    </div>);

}

function InfoCard({ title, action, children }: {title: string;action?: React.ReactNode;children: React.ReactNode;}) {
  return (
    <section className="rounded-md border border-gray-200">
      <div className={`${cardTitle} flex items-center justify-between gap-2`}>
        <h2>{title}</h2>
        {action}
      </div>
      <dl className="divide-y divide-gray-200">{children}</dl>
    </section>);

}

function Row({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 px-4 py-2.5 text-[14px]">
      <dt className="text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-gray-900">{children}</dd>
    </div>);

}