import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, Link2Icon, PencilIcon, Trash2Icon, Unlink2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { MemberAvatar } from '../../components/org/MemberAvatar';
import { StatusPill } from '../../components/catalog/StatusPill';
import { RankBadge } from '../../components/selfReview/RankBadge';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { Modal, btnPrimary, btnSecondary, btnTransition } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { usePermissions } from '../../hooks/usePermissions';
import { useDeleteStaff } from '../../hooks/useDeleteStaff';
import { statusMeta, unitPath } from '../../utils/org';
import { displayDate } from '../../utils/profile';
import { roleLabel } from '../../utils/access';
import { workplaceOf } from '../../utils/staffForm';
import { accountOfMember, memberRoleLabels } from '../../utils/staff';
import { accountStatus, accountStatusMeta } from '../../utils/accountStatus';

const cardTitle = 'border-b border-gray-200 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-gray-500';

/** Chi tiết nhân sự: hồ sơ, nơi công tác, kết quả các quý và tài khoản gắn kèm */
export function StaffDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { accounts, members, linkAccount } = useAccess();
  const { can } = usePermissions();
  const canWrite = can('admin', 'write');
  const canRemove = can('admin', 'delete');
  const { remove, blockReason } = useDeleteStaff();
  const [linking, setLinking] = useState(false);
  const member = members.find((m) => m.id === id);
  useBreadcrumbLabel(member?.name ?? 'Nhân sự');

  if (!member) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-[15px] font-medium text-gray-900">Không tìm thấy nhân sự</p>
        <Link to="/nhan-su" className="mt-2 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Về danh sách nhân sự
        </Link>
      </div>);

  }

  const account = accountOfMember(accounts, member.id);
  const { agency, department } = workplaceOf(member.unitId);
  const path = unitPath(member.unitId);
  const work = statusMeta[member.status];
  const blocked = blockReason(member);

  const unlink = () => {
    if (!account) return;
    const username = account.username;
    linkAccount(username, null);
    toast.success(`Đã gỡ tài khoản ${username} khỏi hồ sơ ${member.name}`, {
      duration: 6000,
      action: { label: 'Hoàn tác', onClick: () => linkAccount(username, member.id) }
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/nhan-su"
          className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'color 150ms ease-out' }}>
          
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Danh sách nhân sự
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {canWrite &&
          <button type="button" onClick={() => navigate(`/nhan-su/${member.id}/sua`)} className={btnPrimary} style={btnTransition}>
              <PencilIcon className="h-4 w-4" aria-hidden />
              Sửa
            </button>
          }
          {canRemove &&
          <button
            type="button"
            disabled={!!blocked}
            title={blocked ?? undefined}
            onClick={() => remove(member.id) && navigate('/nhan-su')}
            className={`${btnSecondary} !border-brand-600/40 !text-brand-700 hover:!bg-brand-50`}
            style={btnTransition}>
            
              <Trash2Icon className="h-4 w-4" aria-hidden />
              Xoá
            </button>
          }
        </div>
      </div>

      <header className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-gray-200 px-5 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <MemberAvatar name={member.name} strong={member.role === 'truong'} />
          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-semibold text-gray-900">
              {member.rank && <span className="font-normal text-gray-600">{member.rank} </span>}
              {member.name}
            </h1>
            <p className="truncate text-[13px] text-gray-500">
              {member.position} · {path.map((u) => u.shortName ?? u.name).join(' › ')}
            </p>
          </div>
        </div>
        <dl className="flex flex-wrap divide-x divide-gray-200">
          {[
          ['Số hiệu', <span key="c" className="font-mono">{member.code}</span>],
          ['Trạng thái', <StatusPill key="s" tone={work.tone}>{work.label}</StatusPill>],
          ['Tài khoản', account ? <span key="a" className="font-mono">{account.username}</span> : <span key="a" className="text-warning-700">Chưa có</span>]].
          map(([l, v]) =>
          <div key={l as string} className="px-5 first:pl-0 last:pr-0">
              <dt className="text-[12px] font-medium uppercase tracking-wider text-gray-500">{l}</dt>
              <dd className="mt-1 whitespace-nowrap text-[14px] text-gray-900">{v}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <InfoCard title="Hồ sơ cá nhân">
          <Row label="Ngày sinh">{member.birthDate ? displayDate(member.birthDate) : '—'}</Row>
          <Row label="Giới tính">{member.gender}</Row>
          <Row label="Quê quán">{member.hometown || '—'}</Row>
          <Row label="Điện thoại">{member.phone || '—'}</Row>
          <Row label="Trình độ">{member.education || '—'}</Row>
          <Row label="Đảng viên">{member.partyMember ? 'Có' : 'Không'}</Row>
        </InfoCard>
        <InfoCard title="Nơi công tác">
          <Row label="Cơ quan, đơn vị">{agency?.name ?? '—'}</Row>
          <Row label="Phòng ban">{department ? department.name : <span className="text-gray-500">Trực thuộc cơ quan</span>}</Row>
          <Row label="Chức vụ">{member.position || '—'}</Row>
          <Row label="Cương vị">{memberRoleLabels[member.role]}</Row>
          <Row label="Ngày vào ngành">{member.joinedAt ? displayDate(member.joinedAt) : '—'}</Row>
        </InfoCard>

        <section aria-labelledby="staff-account" className={`flex flex-col rounded-md border ${account ? 'border-gray-200' : 'border-dashed border-gray-300'}`}>
          <h2 id="staff-account" className={cardTitle}>
            Tài khoản
          </h2>
          {account ?
          <>
              <dl className="divide-y divide-gray-200">
                <Row label="Tên đăng nhập">
                  <Link to={`/nguoi-dung/${account.username}`} className="font-mono font-medium text-brand-600 hover:text-brand-700">
                    {account.username}
                  </Link>
                </Row>
                <Row label="Trạng thái">
                  <StatusPill tone={accountStatusMeta[accountStatus(account)].tone}>{accountStatusMeta[accountStatus(account)].label}</StatusPill>
                </Row>
                <Row label="Vai trò">{account.roles.length ? account.roles.map(roleLabel).join(', ') : <span className="text-warning-700">Chưa có vai trò</span>}</Row>
              </dl>
              {canWrite &&
            <div className="mt-auto border-t border-gray-200 px-4 py-3">
                  <button type="button" onClick={unlink} className={`${btnSecondary} h-9 px-3 text-[13px]`} style={btnTransition}>
                    <Unlink2Icon className="h-4 w-4" aria-hidden />
                    Gỡ tài khoản
                  </button>
                </div>
            }
            </> :

          <div className="flex flex-1 flex-col items-start gap-3 px-4 py-4">
              <p className="text-[14px] text-gray-600">Nhân sự chưa có tài khoản đăng nhập. Vẫn được giao việc, đánh giá và hiện trong cơ cấu tổ chức.</p>
              {canWrite &&
            <button type="button" onClick={() => setLinking(true)} className={btnSecondary} style={btnTransition}>
                  <Link2Icon className="h-4 w-4" aria-hidden />
                  Gắn tài khoản
                </button>
            }
            </div>
          }
        </section>

        <section aria-labelledby="staff-results" className="rounded-md border border-gray-200">
          <h2 id="staff-results" className={cardTitle}>
            Kết quả các quý
          </h2>
          {member.results.length ?
          <ul className="divide-y divide-gray-200">
              {[...member.results].reverse().map((r) =>
            <li key={r.period} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px]">
                  <span className="text-gray-600">{r.period}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium tabular-nums text-gray-900">{r.kpi.toFixed(1)}</span>
                    <RankBadge rank={r.rank} />
                  </span>
                </li>
            )}
            </ul> :

          <p className="px-4 py-4 text-[14px] text-gray-500">Chưa có kết quả đánh giá.</p>
          }
        </section>
      </div>

      <LinkAccountDialog
        open={linking}
        onClose={() => setLinking(false)}
        onLink={(username) => {
          linkAccount(username, member.id);
          setLinking(false);
          toast.success(`Đã gắn tài khoản ${username} với ${member.name}`);
        }} />
      
    </div>);

}

function LinkAccountDialog({ open, onClose, onLink }: {open: boolean;onClose: () => void;onLink: (username: string) => void;}) {
  const { accounts } = useAccess();
  const free = accounts.filter((a) => !a.memberId);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gắn tài khoản"
      description="Chỉ hiện tài khoản chưa gắn hồ sơ nhân sự."
      onSubmit={(e) => {
        e.preventDefault();
        if (!value) {
          setError('Chọn tài khoản.');
          return;
        }
        onLink(value);
        setValue('');
      }}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Huỷ
          </button>
          <button type="submit" disabled={!free.length} className={btnPrimary} style={btnTransition}>
            Gắn tài khoản
          </button>
        </div>
      }>
      
      <div className="px-4 py-4">
        {free.length ?
        <>
            <label htmlFor="link-account" className="mb-1.5 block text-[14px] font-medium text-gray-800">
              Tài khoản đăng nhập
            </label>
            <Select
            id="link-account"
            value={value}
            invalid={!!error}
            placeholder="Chọn tài khoản"
            searchThreshold={6}
            onChange={(v) => {
              setValue(v);
              setError('');
            }}>
            
              {free.map((a) =>
            <option key={a.username} value={a.username}>
                  {a.username}
                  {a.displayName ? ` · ${a.displayName}` : ''}
                </option>
            )}
            </Select>
            {error && <p className="mt-1 text-[12px] text-brand-700">{error}</p>}
          </> :

        <p className="text-[14px] text-gray-600">
            Mọi tài khoản đều đã gắn nhân sự.{' '}
            <Link to="/nguoi-dung/tao-moi" className="font-medium text-brand-600 hover:text-brand-700">
              Tạo tài khoản
            </Link>
          </p>
        }
      </div>
    </Modal>);

}

function InfoCard({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section className="rounded-md border border-gray-200">
      <h2 className={cardTitle}>{title}</h2>
      <dl className="divide-y divide-gray-200">{children}</dl>
    </section>);

}

function Row({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-4 py-2.5 text-[14px]">
      <dt className="text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-gray-900">{children}</dd>
    </div>);

}