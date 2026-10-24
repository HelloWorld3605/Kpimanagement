import { members } from '../data/orgMembers';
import { builtPaths, navEntries, NavItem } from '../data/navigation';
import {
  actionLabels,
  featureLabels,
  globalBlocks,
  resourceFeature,
  roles,
  scopeLabels,
  scopeRank,
  selfResources } from
'../data/roles';
import {
  Account,
  AccessDecision,
  AccessTarget,
  Action,
  FeatureId,
  ResourceId,
  RoleFeatures,
  RoleId,
  RoleScopes,
  ScopeKind } from
'../types/access';
import { descendantIds, findMember, findUnit, unitPath } from './org';

export type AccessPolicy = {features: RoleFeatures;scopes: RoleScopes;};

export const roleLabel = (id: RoleId) => roles.find((r) => r.id === id)?.label ?? id;

export const DENY: AccessDecision = { allowed: false, reason: 'Chưa đăng nhập' };

/** Lớp 1 — quyền chức năng, cộng dồn qua mọi vai trò */
export function can(policy: AccessPolicy, account: Account, feature: FeatureId, action: Action = 'view') {
  if (!account.active) return false;
  // Mọi tài khoản đang hoạt động đều nhận thông báo, kể cả vai trò không có chức năng nghiệp vụ (Quản trị)
  if (feature === 'notifications' && action === 'view') return true;
  return account.roles.some((r) => policy.features[r]?.[feature]?.includes(action));
}

/** Phòng / trung đoàn chứa đơn vị (cấp ngay dưới Bộ Tư lệnh) */
export function departmentOf(unitId: string) {
  const path = unitPath(unitId);
  return (path[1] ?? path[0])?.id ?? unitId;
}

export function inScope(kind: ScopeKind, account: Account, target: AccessTarget): boolean {
  // Không phụ thuộc đơn vị của người dùng → vẫn hiệu lực khi tài khoản chưa gắn nhân sự
  if (kind === 'all') return true;
  if (kind === 'assigned') return account.assignedUnitIds.some((id) => descendantIds(id).includes(target.unitId));
  const me = account.memberId ? findMember(account.memberId) : undefined;
  if (!me) return false;
  switch (kind) {
    case 'self':
      return target.memberId === me.id;
    case 'unit':
      return target.unitId === me.unitId;
    case 'direct':{
        if (target.unitId === me.unitId) return true;
        const t = target.memberId ? findMember(target.memberId) : undefined;
        if (t) return t.role === 'truong' && findUnit(t.unitId)?.parentId === me.unitId;
        return findUnit(target.unitId)?.parentId === me.unitId;
      }
    case 'subtree':
      return descendantIds(me.unitId).includes(target.unitId);
    case 'department':
      return descendantIds(departmentOf(me.unitId)).includes(target.unitId);
  }
}

const blockLabel = (id: string) => globalBlocks.find((b) => b.id === id)?.label ?? id;

/** Lớp 2 — được làm thao tác X trên bản ghi Y không, và vì sao */
export function decide(policy: AccessPolicy, account: Account, resource: ResourceId, action: Action, target: AccessTarget): AccessDecision {
  if (!account.active) return { allowed: false, reason: account.status === 'inactive' ? 'Tài khoản đã ngừng hoạt động' : 'Tài khoản đang bị khoá' };
  const feature = resourceFeature[resource];
  const featureRoles = account.roles.filter((r) => policy.features[r]?.[feature]?.includes(action));
  if (featureRoles.length === 0) {
    return { allowed: false, reason: `Không vai trò nào có quyền ${actionLabels[action].toLowerCase()} chức năng "${featureLabels[feature]}"` };
  }
  const isSelf = Boolean(target.memberId && account.memberId) && target.memberId === account.memberId;

  if (action !== 'view') {
    if (resource === 'review') {
      if (!isSelf) return { allowed: false, reason: `Chặn: ${blockLabel('review-owner')}`, blockId: 'review-owner' };
      if (target.reviewStatus && target.reviewStatus !== 'draft') {
        return { allowed: false, reason: `Chặn: ${blockLabel('review-locked')}`, blockId: 'review-locked' };
      }
      return { allowed: true, reason: 'Phiếu của chính mình, đang ở trạng thái nháp', role: featureRoles[0], scope: 'self-default' };
    }
    if (resource === 'individual-result' || resource === 'collective-result') {
      return { allowed: false, reason: `Chặn: ${blockLabel('results-readonly')}`, blockId: 'results-readonly' };
    }
  }

  if (isSelf && selfResources.includes(resource)) {
    return { allowed: true, reason: 'Bản ghi của chính mình — mặc định luôn thấy', role: featureRoles[0], scope: 'self-default' };
  }
  for (const role of featureRoles) {
    const kind = policy.scopes[role]?.[resource];
    if (kind && inScope(kind, account, target)) {
      return { allowed: true, reason: `Phạm vi "${scopeLabels[kind]}" của vai trò ${roleLabel(role)}`, role, scope: kind };
    }
  }
  return { allowed: false, reason: 'Ngoài phạm vi của mọi vai trò đang giữ' };
}

/** Phạm vi rộng nhất của tài khoản trên một loại bản ghi */
export function widestScope(policy: AccessPolicy, account: Account, resource: ResourceId): ScopeKind | undefined {
  const feature = resourceFeature[resource];
  const held = account.roles.filter((r) => policy.features[r]?.[feature]?.includes('view'));
  if (held.length === 0) return undefined;
  const kinds = held.map((r) => policy.scopes[r]?.[resource]).filter(Boolean) as ScopeKind[];
  const widest = scopeRank.find((k) => kinds.includes(k));
  return widest ?? (selfResources.includes(resource) ? 'self' : undefined);
}

const short = (id: string) => {
  const u = findUnit(id);
  return u?.shortName ?? u?.name ?? id;
};

export function describeScope(kind: ScopeKind, account: Account) {
  const me = account.memberId ? findMember(account.memberId) : undefined;
  const unitId = me?.unitId ?? '';
  if (!me && kind !== 'all' && kind !== 'assigned') return 'Chưa gắn hồ sơ nhân sự';
  switch (kind) {
    case 'all':
      return 'Toàn Bộ Tư lệnh';
    case 'self':
      return 'Bản thân';
    case 'unit':
      return short(unitId);
    case 'direct':
      return `${short(unitId)} · trực tiếp`;
    case 'subtree':
      return `${short(unitId)} và cấp dưới`;
    case 'department':
      return `${short(departmentOf(unitId))} và cấp dưới`;
    case 'assigned':
      return account.assignedUnitIds.length ? `Phụ trách ${account.assignedUnitIds.map(short).join(', ')}` : 'Chưa được phân công';
  }
}

/** Số cán bộ có kết quả mà tài khoản thấy được */
export function visibleMemberCount(policy: AccessPolicy, account: Account, resource: ResourceId = 'individual-result') {
  return members.filter((m) => decide(policy, account, resource, 'view', { unitId: m.unitId, memberId: m.id }).allowed).length;
}

export function scopeSummary(policy: AccessPolicy, account: Account) {
  const kind = widestScope(policy, account, 'individual-result') ?? widestScope(policy, account, 'member-kpi');
  if (!kind) return 'Không xem dữ liệu nghiệp vụ';
  const count = visibleMemberCount(policy, account);
  return `${describeScope(kind, account)} · ${count} người`;
}

/** Phạm vi của riêng một vai trò trên tài khoản (bỏ qua trạng thái khoá để thấy vai trò này với tới đâu) */
export function roleScopeSummary(policy: AccessPolicy, account: Account, role: RoleId) {
  return scopeSummary(policy, { ...account, active: true, roles: [role] });
}

export function allowedNavItems(policy: AccessPolicy, account: Account): NavItem[] {
  return navEntries.
  flatMap((e) => e.type === 'link' ? [e as NavItem] : e.items).
  filter((i) => can(policy, account, i.feature));
}

/** Trang mặc định: màn đã có đầu tiên mà tài khoản được xem */
export function firstAllowedPath(policy: AccessPolicy, account: Account) {
  const items = allowedNavItems(policy, account);
  return items.find((i) => builtPaths.includes(i.path))?.path ?? items[0]?.path ?? '/ho-so-ca-nhan';
}