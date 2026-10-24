import { Account } from '../types/access';
import { UnitMember } from '../types/org';
import { findMember } from './org';

/** Hồ sơ nhân sự gắn với tài khoản (có thể chưa gắn) */
export const memberOfAccount = (account?: Account): UnitMember | undefined => account?.memberId ? findMember(account.memberId) : undefined;

/** Tài khoản đang gắn với một nhân sự (tối đa một) */
export const accountOfMember = (accounts: Account[], memberId: string) => accounts.find((a) => a.memberId === memberId);

/** Họ tên để hiển thị cho tài khoản: theo hồ sơ nhân sự, không có thì họ tên hiển thị, cuối cùng là tên đăng nhập */
export const accountName = (account: Account) => memberOfAccount(account)?.name ?? account.displayName ?? account.username;

/** Cương vị trong đơn vị */
export const memberRoleLabels = { truong: 'Cấp trưởng', pho: 'Cấp phó', 'can-bo': 'Cán bộ' } as const;