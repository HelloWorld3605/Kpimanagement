import React, { useState } from 'react';
import { toast } from 'sonner';
import { KeyRoundIcon, LogOutIcon } from 'lucide-react';
import { useAccess } from '../contexts/AccessContext';
import { useAuth } from '../contexts/AuthContext';
import { Field, PasswordInput, formField } from './admin/FormParts';
import { btnGhost, btnPrimary, btnTransition } from './ui/Modal';
import { Account } from '../types/access';
import { DEMO_PASSWORD } from '../data/accounts';
import { STAFF_DEFAULT_PASSWORD } from '../utils/staffAccount';
import { isFirebaseConfigured } from '../utils/firebase';
import { changeAuthPassword } from '../utils/firebaseAccounts';
import { nowStamp } from '../utils/profile';

/** Quy tắc mật khẩu tự đặt: ≥ 8 ký tự, có chữ và số, khác mật khẩu mặc định */
export function newPasswordError(value: string) {
  if (value.length < 8) return 'Tối thiểu 8 ký tự.';
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return 'Cần có cả chữ và số.';
  if (value === STAFF_DEFAULT_PASSWORD || value === DEMO_PASSWORD) return 'Không dùng lại mật khẩu mặc định.';
  return '';
}

/**
 * Chặn mọi màn cho tới khi người dùng đổi mật khẩu ban đầu (tài khoản tạo theo số hiệu với mật khẩu mặc định,
 * hoặc vừa được quản trị đặt lại về mặc định).
 */
export function ForcePasswordChange({ account }: {account: Account;}) {
  const { updateAccount } = useAccess();
  const { logout } = useAuth();
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const rule = newPasswordError(next);
    if (rule) return setError(rule);
    if (next !== confirm) return setError('Hai lần nhập không khớp.');
    setBusy(true);
    try {
      // Firebase: đổi mật khẩu đăng nhập trước, thành công mới lưu
      if (isFirebaseConfigured) await changeAuthPassword(account.username, account.password ?? DEMO_PASSWORD, next);
      updateAccount(account.username, { password: next, mustChangePassword: false, updatedAt: nowStamp() });
      toast.success('Đã đổi mật khẩu');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đổi được mật khẩu, thử lại.');
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-10">
      <form onSubmit={submit} noValidate className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <KeyRoundIcon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-[18px] font-semibold text-gray-900">Đổi mật khẩu lần đầu</h1>
            <p className="text-[13px] text-gray-500">
              Tài khoản <span className="font-mono">{account.username}</span> đang dùng mật khẩu ban đầu.
            </p>
          </div>
        </div>
        <p className="mt-4 text-[14px] text-gray-700">Đặt mật khẩu riêng để tiếp tục. Tối thiểu 8 ký tự, có cả chữ và số.</p>

        <div className="mt-4 space-y-4">
          <Field label="Mật khẩu mới" htmlFor="fpc-next" required>
            <PasswordInput
              id="fpc-next"
              value={next}
              visible={visible}
              onToggle={() => setVisible((v) => !v)}
              onChange={(v) => {
                setNext(v);
                setError('');
              }}
              aria-invalid={!!error}
              className={`${formField} ${error ? 'border-brand-600' : 'border-gray-300'}`} />
          </Field>
          <Field label="Nhập lại mật khẩu mới" htmlFor="fpc-confirm" required>
            <input
              id="fpc-confirm"
              type={visible ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError('');
              }}
              className={`${formField} ${error ? 'border-brand-600' : 'border-gray-300'}`} />
          </Field>
          {error &&
          <p role="alert" className="text-[13px] text-brand-700">
              {error}
            </p>
          }
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" onClick={logout} className={btnGhost} style={btnTransition}>
            <LogOutIcon className="h-4 w-4" aria-hidden />
            Đăng xuất
          </button>
          <button type="submit" disabled={busy} className={`${btnPrimary} disabled:opacity-60`} style={btnTransition}>
            {busy ? 'Đang lưu…' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </main>);

}
