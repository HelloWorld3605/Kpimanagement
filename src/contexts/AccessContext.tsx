import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useSyncedState } from '../hooks/useSyncedState';
import { useSyncedCollection } from '../hooks/useSyncedCollection';
import { Account, Action, FeatureId, ResourceId, Role, RoleFeatures, RoleId, RoleScopes, ScopeKind } from '../types/access';
import { initialAccounts } from '../data/accounts';
import { members as memberRegistry } from '../data/orgMembers';
import { units as unitRegistry } from '../data/orgUnits';
import { Unit, UnitMember } from '../types/org';
import { applyOrgData, descendantIds } from '../utils/org';
import { defaultRoleFeatures, defaultRoleScopes, roles as roleRegistry } from '../data/roles';
import { withCommandRole } from '../utils/staffAccount';

type AccessContextValue = {
  accounts: Account[];
  /** Mọi vai trò: vai trò hệ thống + vai trò quản trị tạo thêm */
  roles: Role[];
  features: RoleFeatures;
  scopes: RoleScopes;
  /** Cho phép đổi nhanh tài khoản demo trong menu tài khoản */
  demoSwitcher: boolean;
  updateAccount: (username: string, patch: Partial<Account>) => void;
  /** Thêm tài khoản mới (màn Người dùng → Tạo mới); chưa gắn hồ sơ nhân sự */
  addAccount: (account: Account, index?: number) => void;
  /** Xoá tài khoản (hồ sơ nhân sự vẫn giữ) */
  removeAccount: (username: string) => void;
  /** Thêm hồ sơ nhân sự (màn Nhân sự → Tạo mới) */
  addMember: (member: UnitMember, index?: number) => void;
  /** Sửa hồ sơ nhân sự */
  updateMember: (id: string, patch: Partial<UnitMember>) => void;
  /** Xoá hồ sơ nhân sự; tài khoản đang gắn thành "chưa gắn nhân sự" */
  removeMember: (id: string) => void;
  /** Gắn / gỡ hồ sơ nhân sự của tài khoản (mỗi nhân sự tối đa một tài khoản) */
  linkAccount: (username: string, memberId: string | null) => void;
  /** Cơ cấu tổ chức (lưu Firestore, mỗi đơn vị / cán bộ một bản ghi) */
  units: Unit[];
  members: UnitMember[];
  addUnit: (unit: Unit) => void;
  updateUnit: (id: string, patch: Partial<Unit>) => void;
  /** Ghi đè toàn bộ cơ cấu (trình sửa cơ cấu hàng loạt) — người gọi tự kiểm tra cán bộ còn đơn vị */
  replaceUnits: (next: Unit[]) => void;
  /** Xoá đơn vị (chỉ khi không còn đơn vị trực thuộc và cán bộ) — trả về lý do nếu không xoá được */
  removeUnit: (id: string) => string | null;
  toggleFeature: (role: RoleId, feature: FeatureId, action: Action) => void;
  /** Ghi đè toàn bộ quyền chức năng của một vai trò (lưu từ màn chi tiết vai trò) */
  setRoleFeatures: (role: RoleId, map: RoleFeatures[RoleId]) => void;
  setScope: (role: RoleId, resource: ResourceId, kind: ScopeKind | null) => void;
  /** Tạo vai trò mới kèm quyền chức năng; trả về id nội bộ */
  addRole: (input: {code: string;label: string;description: string;}, map: RoleFeatures[RoleId]) => RoleId;
  resetPolicies: () => void;
};

const AccessContext = createContext<AccessContextValue | null>(null);

/** Ghi kéo theo xem; bỏ xem thì bỏ hết */
function nextActions(current: Action[], action: Action): Action[] {
  const has = current.includes(action);
  if (action === 'view') return has ? [] : ['view'];
  if (has) return current.filter((a) => a !== action && !(action === 'write' && a === 'delete'));
  const next = new Set<Action>([...current, 'view', action]);
  if (action === 'delete') next.add('write');
  return (['view', 'write', 'delete'] as Action[]).filter((a) => next.has(a));
}

/** Mã hiển thị → id nội bộ: KE_TOAN → custom-ke-toan */
export const customRoleId = (code: string): RoleId => `custom-${code.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

export function AccessProvider({ demoSwitcher, children }: {demoSwitcher: boolean;children: React.ReactNode;}) {
  // Lưu Firestore khi đã cấu hình Firebase (utils/firebase.ts); chưa cấu hình thì như useState
  const [accounts, setAccounts] = useSyncedCollection<Account>('accounts', (a) => a.username, () =>
  initialAccounts.map((a) => ({
    email: `${a.username}@kpi.bca.vn`,
    createdAt: '01/09/2026 07:00',
    displayName: memberRegistry.find((m) => m.id === a.memberId)?.name,
    ...a
  }))
  );
  const [customRoles, setCustomRoles] = useSyncedCollection<Role>('roles', (r) => r.id, []);
  const [features, setFeatures] = useSyncedState<RoleFeatures>('roleFeatures', defaultRoleFeatures);
  const [scopes, setScopes] = useSyncedState<RoleScopes>('roleScopes', defaultRoleScopes);
  // Cơ cấu tổ chức: dữ liệu mẫu chỉ là dữ liệu khởi đầu, nạp lên Firestore lần đầu
  const [units, setUnits] = useSyncedCollection<Unit>('units', (u) => u.id, () => unitRegistry.map((u) => ({ ...u })));
  const [members, setMembers] = useSyncedCollection<UnitMember>('members', (m) => m.id, () => memberRegistry.map((m) => ({ ...m })));

  // Đưa vào sổ dùng chung (utils/org: findUnit, findMember, cây đơn vị…) trước khi các màn con render
  useMemo(() => applyOrgData(units, members), [units, members]);

  // Đưa vai trò tạo thêm vào sổ vai trò dùng chung (nhãn, mã, bảng quyền… đọc từ đây)
  const roles = useMemo(() => {
    customRoles.forEach((r) => {
      if (!roleRegistry.some((x) => x.id === r.id)) roleRegistry.push(r);
    });
    return [...roleRegistry];
  }, [customRoles]);

  const updateAccount = useCallback(
    (username: string, patch: Partial<Account>) => setAccounts((prev) => prev.map((a) => a.username === username ? { ...a, ...patch } : a)),
    []
  );

  const addAccount = useCallback((account: Account, index = 0) => {
    setAccounts((prev) => {
      const next = prev.filter((a) => a.username !== account.username);
      next.splice(Math.min(index, next.length), 0, account);
      return next;
    });
  }, []);

  const removeAccount = useCallback((username: string) => {
    setAccounts((prev) => prev.filter((a) => a.username !== username));
  }, []);

  const addMember = useCallback((member: UnitMember, index?: number) => {
    // Có ngay trong sổ dùng chung (màn tiếp theo đọc được), state đồng bộ Firestore theo sau
    if (!memberRegistry.some((m) => m.id === member.id)) memberRegistry.splice(index ?? memberRegistry.length, 0, member);
    setMembers((prev) => {
      const next = prev.filter((m) => m.id !== member.id);
      next.splice(Math.min(index ?? next.length, next.length), 0, member);
      return next;
    });
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<UnitMember>) => {
    const m = memberRegistry.find((x) => x.id === id);
    if (m) Object.assign(m, patch);
    setMembers((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x));
  }, []);

  const removeMember = useCallback((id: string) => {
    const at = memberRegistry.findIndex((m) => m.id === id);
    if (at >= 0) memberRegistry.splice(at, 1);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setAccounts((prev) => prev.map((a) => a.memberId === id ? { ...a, memberId: undefined } : a));
  }, []);

  const linkAccount = useCallback((username: string, memberId: string | null) => {
    setAccounts((prev) =>
    prev.map((a) => {
      if (a.username === username) return { ...a, memberId: memberId ?? undefined };
      // Một nhân sự chỉ gắn một tài khoản
      if (memberId && a.memberId === memberId) return { ...a, memberId: undefined };
      return a;
    })
    );
  }, []);

  const addUnit = useCallback((unit: Unit) => {
    if (!unitRegistry.some((u) => u.id === unit.id)) unitRegistry.push(unit);
    setUnits((prev) => [...prev.filter((u) => u.id !== unit.id), unit]);
  }, []);

  const updateUnit = useCallback((id: string, patch: Partial<Unit>) => {
    setUnits((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u));
  }, []);

  const replaceUnits = useCallback((next: Unit[]) => {
    next.forEach((u) => {
      if (!unitRegistry.some((x) => x.id === u.id)) unitRegistry.push(u);
    });
    setUnits(() => next);
  }, []);

  const removeUnit = useCallback(
    (id: string) => {
      const unit = units.find((u) => u.id === id);
      if (!unit) return 'Không tìm thấy đơn vị.';
      if (unit.parentId === null) return 'Không xoá được đơn vị gốc.';
      if (units.some((u) => u.parentId === id)) return 'Đơn vị còn đơn vị trực thuộc — xoá hoặc chuyển các đơn vị đó trước.';
      const inUnit = members.filter((m) => descendantIds(id).includes(m.unitId)).length;
      if (inUnit) return `Đơn vị còn ${inUnit} cán bộ — chuyển cán bộ sang đơn vị khác trước.`;
      setUnits((prev) => prev.filter((u) => u.id !== id));
      return null;
    },
    [units, members]
  );

  const toggleFeature = useCallback((role: RoleId, feature: FeatureId, action: Action) => {
    setFeatures((stored) => {
      const prev = { ...defaultRoleFeatures, ...stored };
      const actions = nextActions(prev[role]?.[feature] ?? [], action);
      const roleMap = { ...prev[role] };
      if (actions.length) roleMap[feature] = actions;else
      delete roleMap[feature];
      return { ...prev, [role]: roleMap };
    });
  }, []);

  const setRoleFeatures = useCallback((role: RoleId, map: RoleFeatures[RoleId]) => {
    setFeatures((prev) => ({ ...prev, [role]: map }));
  }, []);

  const setScope = useCallback((role: RoleId, resource: ResourceId, kind: ScopeKind | null) => {
    setScopes((stored) => {
      const prev = { ...defaultRoleScopes, ...stored };
      const roleMap = { ...prev[role] };
      if (kind) roleMap[resource] = kind;else
      delete roleMap[resource];
      return { ...prev, [role]: roleMap };
    });
  }, []);

  const addRole = useCallback((input: {code: string;label: string;description: string;}, map: RoleFeatures[RoleId]) => {
    const id = customRoleId(input.code);
    const role: Role = { id, code: input.code.trim().toUpperCase(), label: input.label.trim(), description: input.description.trim(), custom: true };
    // Danh sách vai trò dùng chung (nhãn, mã, bảng quyền…) đọc từ sổ đăng ký này
    if (!roleRegistry.some((r) => r.id === id)) roleRegistry.push(role);
    setCustomRoles((prev) => [...prev.filter((r) => r.id !== id), role]);
    setFeatures((prev) => ({ ...prev, [id]: map }));
    setScopes((prev) => ({ ...prev, [id]: {} }));
    return id;
  }, []);

  const resetPolicies = useCallback(() => {
    // Vai trò tạo thêm vẫn giữ, chỉ trả quyền về rỗng
    const custom = roleRegistry.filter((r) => r.custom);
    setFeatures({ ...defaultRoleFeatures, ...Object.fromEntries(custom.map((r) => [r.id, {}])) });
    setScopes({ ...defaultRoleScopes, ...Object.fromEntries(custom.map((r) => [r.id, {}])) });
  }, []);

  // Vai trò hệ thống thêm sau chưa có trong bản đã lưu Firestore → bù quyền mặc định.
  // Siêu quản trị luôn toàn quyền (kể cả Cơ cấu tổ chức): bản đã lưu hay chỉnh trên ma trận không ghi đè được.
  const effectiveFeatures = useMemo<RoleFeatures>(
    () => ({ ...defaultRoleFeatures, ...features, 'sieu-quan-tri': defaultRoleFeatures['sieu-quan-tri'] }),
    [features]
  );
  const effectiveScopes = useMemo<RoleScopes>(
    () => ({ ...defaultRoleScopes, ...scopes, 'sieu-quan-tri': defaultRoleScopes['sieu-quan-tri'] }),
    [scopes]
  );

  // Tài khoản demo Siêu quản trị: luôn có, kể cả khi danh sách tài khoản trên Firestore đã nạp trước đó
  useEffect(() => {
    const seed = initialAccounts.find((a) => a.roles.includes('sieu-quan-tri'));
    if (!seed || accounts.some((a) => a.username === seed.username)) return;
    setAccounts((prev) =>
    prev.some((a) => a.username === seed.username) ?
    prev :
    [...prev, { email: `${seed.username}@kpi.bca.vn`, createdAt: '23/10/2026 08:00', displayName: memberRegistry.find((m) => m.id === seed.memberId)?.name, ...seed }]
    );
  }, [accounts]);

  // Vai trò chỉ huy suy ra từ cương vị trên hồ sơ nhân sự (một nguồn sự thật); bản lưu chỉ giữ vai trò chức năng
  const effectiveAccounts = useMemo(() => accounts.map((a) => withCommandRole(a, members)), [accounts, members]);

  const value = useMemo(
    () => ({
      accounts: effectiveAccounts, roles, features: effectiveFeatures, scopes: effectiveScopes, demoSwitcher, units, members,
      updateAccount, addAccount, removeAccount, addMember, updateMember, removeMember, linkAccount, addUnit, updateUnit, removeUnit, replaceUnits,
      toggleFeature, setRoleFeatures, setScope, addRole, resetPolicies
    }),
    [effectiveAccounts, roles, effectiveFeatures, effectiveScopes, demoSwitcher, units, members, updateAccount, addAccount, removeAccount, addMember, updateMember, removeMember, linkAccount, addUnit, updateUnit, removeUnit, replaceUnits, toggleFeature, setRoleFeatures, setScope, addRole, resetPolicies]
  );
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error('useAccess must be used inside AccessProvider');
  return ctx;
}