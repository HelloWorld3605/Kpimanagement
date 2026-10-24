import { Account } from '../types/access';

/** Mật khẩu chung cho mọi tài khoản demo */
export const DEMO_PASSWORD = '123456';

export const initialAccounts: Account[] = [
{ username: 'canbo', memberId: 'm38', roles: ['can-bo'], assignedUnitIds: [], active: true, lastLogin: '21/10/2026 07:42' },
{ username: 'daidoitruong', memberId: 'm34', roles: ['chi-huy'], assignedUnitIds: [], active: true, lastLogin: '21/10/2026 08:05' },
{ username: 'phophong', memberId: 'm22', roles: ['chi-huy-pho'], assignedUnitIds: ['e-thudo'], active: true, lastLogin: '20/10/2026 16:30' },
{ username: 'thammuu', memberId: 'm09', roles: ['tham-muu'], assignedUnitIds: [], active: true, lastLogin: '21/10/2026 09:12' },
{ username: 'tccb', memberId: 'm17', roles: ['tccb'], assignedUnitIds: [], active: true, lastLogin: '21/10/2026 07:58' },
{ username: 'lanhdao', memberId: 'm02', roles: ['lanh-dao'], assignedUnitIds: [], active: true, lastLogin: '19/10/2026 14:20' },
{ username: 'admin', memberId: 'm24', roles: ['quan-tri'], assignedUnitIds: [], active: true, lastLogin: '21/10/2026 10:01' },
{ username: 'sieuquantri', memberId: 'm01', roles: ['sieu-quan-tri'], assignedUnitIds: [], active: true, lastLogin: '23/10/2026 08:00' },
{ username: 'trungdoitruong', memberId: 'm36', roles: ['chi-huy'], assignedUnitIds: [], active: false, status: 'locked', lastLogin: '02/09/2026 08:10' }];