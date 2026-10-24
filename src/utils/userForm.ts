import { accountStatus } from './accountStatus';
import { memberOfAccount } from './staff';
import { Account, AccountStatus, RoleId } from '../types/access';
import { UnitMember } from '../types/org';
import { STAFF_DEFAULT_PASSWORD, codeError } from './staffAccount';

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
  password: STAFF_DEFAULT_PASSWORD,
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

type ValidateOptions = {mode: 'create' | 'edit';accounts: Account[];members: UnitMember[];};

export function validateUserForm(f: UserFormValues, { mode, accounts, members }: ValidateOptions): UserFormErrors {
  const e: UserFormErrors = {};
  const u = f.username.trim();
  if (mode === 'create') {
    // Tên đăng nhập là số hiệu: cùng quy tắc và cùng phạm vi duy nhất (cấp Bộ) như số hiệu nhân sự
    const codeErr = codeError(u, members, accounts);
    if (codeErr) e.username = codeErr;
    if (f.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự.';
  }
  if (!f.displayName.trim()) e.displayName = 'Nhập họ tên hiển thị.';
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Email không hợp lệ.';
  if (!f.roles.length) e.roles = 'Chọn ít nhất một vai trò.';else
  if (f.roles.includes('chi-huy-pho') && !f.deputyUnitId) e.deputyUnitId = 'Chọn đơn vị phụ trách.';
  return e;
}