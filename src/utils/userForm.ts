import { accountStatus } from './accountStatus';
import { memberOfAccount } from './staff';
import { Account, AccountStatus, RoleId } from '../types/access';

/** Form tài khoản: chỉ đăng nhập + vai trò. Hồ sơ nghiệp vụ nằm ở màn Nhân sự (utils/staffForm). */
export type UserFormValues = {
  username: string;
  displayName: string;
  email: string;
  password: string;
  status: AccountStatus;
  roles: RoleId[];
  deputyUnitId: string;
};
export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

export const emptyUserForm: UserFormValues = {
  username: '',
  displayName: '',
  email: '',
  password: '',
  status: 'active',
  roles: [],
  deputyUnitId: ''
};

export function valuesFromAccount(a: Account): UserFormValues {
  return {
    ...emptyUserForm,
    username: a.username,
    displayName: a.displayName ?? memberOfAccount(a)?.name ?? '',
    email: a.email ?? '',
    status: accountStatus(a),
    roles: a.roles,
    deputyUnitId: a.assignedUnitIds[0] ?? ''
  };
}

type ValidateOptions = {mode: 'create' | 'edit';accounts: Account[];};

export function validateUserForm(f: UserFormValues, { mode, accounts }: ValidateOptions): UserFormErrors {
  const e: UserFormErrors = {};
  const u = f.username.trim();
  if (mode === 'create') {
    if (!u) e.username = 'Nhập tên đăng nhập.';else
    if (!/^[a-z][a-z0-9._]{2,31}$/.test(u)) e.username = '3–32 ký tự: chữ thường không dấu, số, dấu chấm, gạch dưới.';else
    if (accounts.some((a) => a.username === u)) e.username = 'Tên đăng nhập đã được dùng.';
    if (f.password.length < 8) e.password = 'Mật khẩu tối thiểu 8 ký tự.';
  }
  if (!f.displayName.trim()) e.displayName = 'Nhập họ tên hiển thị.';
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Email không hợp lệ.';
  if (!f.roles.length) e.roles = 'Chọn ít nhất một vai trò.';else
  if (f.roles.includes('chi-huy-pho') && !f.deputyUnitId) e.deputyUnitId = 'Chọn đơn vị phụ trách.';
  return e;
}