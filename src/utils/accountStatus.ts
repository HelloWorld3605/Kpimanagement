import { Account, AccountStatus } from '../types/access';

export const accountStatusMeta: Record<AccountStatus, {label: string;tone: 'success' | 'warning' | 'neutral';}> = {
  active: { label: 'Đang hoạt động', tone: 'success' },
  inactive: { label: 'Ngừng hoạt động', tone: 'neutral' },
  locked: { label: 'Bị khoá', tone: 'warning' }
};

export const accountStatusOrder: AccountStatus[] = ['active', 'inactive', 'locked'];

/** Tài khoản cũ chỉ có `active` → coi tài khoản không hoạt động là bị khoá */
export const accountStatus = (a: Pick<Account, 'status' | 'active'>): AccountStatus => a.status ?? (a.active ? 'active' : 'locked');

/** Ghi trạng thái kèm cờ `active` tương ứng */
export const statusPatch = (status: AccountStatus) => ({ status, active: status === 'active' });

/** Lý do không đăng nhập được theo trạng thái */
export const loginBlockedMessage: Record<Exclude<AccountStatus, 'active'>, string> = {
  inactive: 'Tài khoản đã ngừng hoạt động. Liên hệ quản trị hệ thống.',
  locked: 'Tài khoản đang bị khoá. Liên hệ quản trị hệ thống.'
};