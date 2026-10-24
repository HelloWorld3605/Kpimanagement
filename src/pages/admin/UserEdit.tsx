import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { KeyRoundIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { useGuardedNavigate } from '../../contexts/UnsavedChangesContext';
import { UserForm } from '../../components/admin/UserForm';
import { PasswordInput } from '../../components/admin/FormParts';
import { StatusPill } from '../../components/catalog/StatusPill';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { btnPrimary, btnSecondary, btnTransition } from '../../components/ui/Modal';
import { accountName, memberOfAccount } from '../../utils/staff';
import { nowStamp } from '../../utils/profile';
import { accountStatus, accountStatusMeta, statusPatch } from '../../utils/accountStatus';
import { valuesFromAccount } from '../../utils/userForm';
import { isFirebaseConfigured } from '../../utils/firebase';
import { changeAuthPassword } from '../../utils/firebaseAccounts';
import { DEMO_PASSWORD } from '../../data/accounts';
import { STAFF_DEFAULT_PASSWORD } from '../../utils/staffAccount';

const cardTitle = 'border-b border-gray-200 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-gray-500';

/** Sửa người dùng: cùng form với Tạo mới + cột phụ (thông tin tài khoản, đặt lại mật khẩu) */
export function UserEdit() {
  const { username = '' } = useParams();
  const navigate = useNavigate();
  const goBack = useGuardedNavigate();
  const { accounts, updateAccount } = useAccess();
  const account = accounts.find((a) => a.username === username);
  const member = memberOfAccount(account);
  // Giá trị ban đầu chụp một lần khi mở màn → so sánh "có thay đổi" ổn định
  const [initial] = useState(() => account ? valuesFromAccount(account) : undefined);
  useBreadcrumbLabel(account ? `Sửa · ${accountName(account)}` : 'Sửa người dùng');

  if (!account || !initial) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-[15px] font-medium text-gray-900">Không tìm thấy người dùng</p>
        <Link to="/nguoi-dung" className="mt-2 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Về danh sách người dùng
        </Link>
      </div>);

  }

  return (
    <UserForm
      mode="edit"
      initial={initial}
      onCancel={() => goBack(`/nguoi-dung/${account.username}`)}
      onSubmit={(f) => {
        updateAccount(account.username, {
          displayName: f.displayName.trim(),
          email: f.email.trim() || undefined,
          roles: f.roles,
          assignedUnitIds: f.roles.includes('chi-huy-pho') ? [f.deputyUnitId] : [],
          ...statusPatch(f.status),
          updatedAt: nowStamp()
        });
        toast.success(`Đã lưu tài khoản ${account.username}`);
        navigate(`/nguoi-dung/${account.username}`);
      }}
      aside={
      <>
          <section aria-label="Tài khoản" className="rounded-md border border-gray-200">
            <h2 className={cardTitle}>Tài khoản</h2>
            <dl className="flex flex-col gap-3.5 px-4 py-4 text-[14px]">
              <AsideFact label="Trạng thái hiện tại">
                <StatusPill tone={accountStatusMeta[accountStatus(account)].tone}>{accountStatusMeta[accountStatus(account)].label}</StatusPill>
              </AsideFact>
              <AsideFact label="Hồ sơ nhân sự">
                {member ?
              <Link to={`/nhan-su/${member.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {member.name} · {member.code}
                  </Link> :

              <span className="text-gray-500">Chưa gắn nhân sự</span>
              }
              </AsideFact>
              <AsideFact label="Tạo lúc">{account.createdAt ?? '—'}</AsideFact>
              <AsideFact label="Cập nhật lúc">{account.updatedAt ?? '—'}</AsideFact>
              <AsideFact label="Đăng nhập gần nhất">{account.lastLogin ?? 'Chưa đăng nhập'}</AsideFact>
            </dl>
          </section>
          <ResetPassword
          username={account.username}
          onReset={async (password) => {
            // Có Firebase: đổi cả mật khẩu đăng nhập trên Firebase Auth trước, thành công mới lưu
            if (isFirebaseConfigured) await changeAuthPassword(account.username, account.password ?? DEMO_PASSWORD, password);
            // Mật khẩu do quản trị đặt là mật khẩu tạm: người dùng phải tự đổi ở lần đăng nhập tới
            updateAccount(account.username, { password, mustChangePassword: true, updatedAt: nowStamp() });
          }} />
        
        </>
      } />);


}

function ResetPassword({ username, onReset }: {username: string;onReset: (password: string) => Promise<void>;}) {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    if (value.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }
    await apply(value);
  };
  const apply = async (password: string) => {
    setBusy(true);
    try {
      await onReset(password);
      setValue('');
      setError('');
      toast.success(`Đã đặt lại mật khẩu cho ${username}`, { description: 'Người dùng phải đổi mật khẩu ở lần đăng nhập tới.' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đặt lại được mật khẩu.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section aria-labelledby="reset-pw" className="rounded-md border border-gray-200">
      <h2 id="reset-pw" className={`${cardTitle} flex items-center justify-between`}>
        Đặt lại mật khẩu
        <KeyRoundIcon className="h-4 w-4 text-gray-400" aria-hidden />
      </h2>
      <div className="px-4 py-4">
        <label htmlFor="reset-password" className="mb-1.5 block text-[14px] font-medium text-gray-800">
          Mật khẩu mới
        </label>
        <PasswordInput
          id="reset-password"
          value={value}
          visible={visible}
          onToggle={() => setVisible((v) => !v)}
          onChange={(v) => {
            setValue(v);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          aria-invalid={!!error}
          className={`h-9 w-full rounded-md border bg-white px-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${error ? 'border-brand-600' : 'border-gray-300'}`} />
        
        {error && <p className="mt-1 text-[12px] text-brand-700">{error}</p>}
        <button type="button" onClick={submit} disabled={!value || busy} className={`${btnPrimary} mt-3 w-full justify-center`} style={btnTransition}>
          {busy ? 'Đang đặt…' : 'Đặt mật khẩu'}
        </button>
        <button type="button" onClick={() => apply(STAFF_DEFAULT_PASSWORD)} disabled={busy} className={`${btnSecondary} mt-2 w-full justify-center`} style={btnTransition}>
          Đặt lại về mặc định ({STAFF_DEFAULT_PASSWORD})
        </button>
        <p className="mt-2 text-[12px] text-gray-500">Sau khi đặt lại, người dùng phải đổi mật khẩu ở lần đăng nhập tới.</p>
      </div>
    </section>);

}

function AsideFact({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-[12px] font-medium uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-1 text-gray-900">{children}</dd>
    </div>);

}