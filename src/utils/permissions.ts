import { Action, FeatureId, RoleFeatures, RoleId } from '../types/access';
import { defaultRoleFeatures, featureGroups, featureLabels, roles } from '../data/roles';
import { actionVerbs, featureDescriptions } from '../data/permissions';

export const ACTIONS: Action[] = ['view', 'write', 'delete'];

export type Permission = {
  code: string;
  feature: FeatureId;
  action: Action;
  name: string;
  description: string;
  group: string;
};

const lowerFirst = (s: string) => /^[A-ZĐ][a-zà-ỹđ]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
const upperFirst = (s: string) => s[0].toUpperCase() + s.slice(1);

/** Thao tác có nghĩa với từng chức năng: luôn có Xem, cộng các thao tác từng được cấp ở cấu hình mặc định */
export const featureActions: Record<FeatureId, Action[]> = (() => {
  const map = {} as Record<FeatureId, Action[]>;
  featureGroups.forEach((g) =>
  g.features.forEach((f) => {
    const held = new Set<Action>(['view']);
    roles.forEach((r) => (defaultRoleFeatures[r.id]?.[f] ?? []).forEach((a) => held.add(a)));
    map[f] = ACTIONS.filter((a) => held.has(a));
  })
  );
  return map;
})();

export const permissionCode = (feature: FeatureId, action: Action) => `${feature}:${action}`;

/** Danh mục quyền của hệ thống = chức năng × thao tác có nghĩa */
export const permissions: Permission[] = featureGroups.flatMap((g) =>
g.features.flatMap((feature) =>
featureActions[feature].map((action) => ({
  code: permissionCode(feature, action),
  feature,
  action,
  group: g.label,
  name: `${actionVerbs[action]} ${lowerFirst(featureLabels[feature])}`,
  description: `${actionVerbs[action]} ${featureDescriptions[feature]}.`
}))
)
);

export const findPermission = (code: string) => permissions.find((p) => p.code === code);

export const roleCode = (id: RoleId) => roles.find((r) => r.id === id)?.code ?? id.replace(/-/g, '_').toUpperCase();

/** Tổng số quyền có thể cấp (chức năng × thao tác có nghĩa) */
export const totalPermissionCount = permissions.length;

/** Cấp / bỏ toàn bộ thao tác của một chức năng */
export function setFeatureAll(map: RoleFeatures[RoleId], feature: FeatureId, on: boolean): RoleFeatures[RoleId] {
  const next = { ...map };
  if (on) next[feature] = [...featureActions[feature]];else
  delete next[feature];
  return next;
}

/** Cấp / bỏ một thao tác trên nhiều chức năng (chỉ chức năng có thao tác đó) */
export function setColumnAll(map: RoleFeatures[RoleId], features: FeatureId[], action: Action, on: boolean): RoleFeatures[RoleId] {
  return features.filter((f) => featureActions[f].includes(action)).reduce((m, f) => setAction(m, f, action, on), map);
}

/** Cấp / bỏ mọi quyền trên các chức năng cho trước */
export function setAllFeatures(map: RoleFeatures[RoleId], features: FeatureId[], on: boolean): RoleFeatures[RoleId] {
  return features.reduce((m, f) => setFeatureAll(m, f, on), map);
}

/** Vai trò đang được cấp một quyền */
export function rolesWith(features: RoleFeatures, p: Pick<Permission, 'feature' | 'action'>): RoleId[] {
  return roles.filter((r) => (features[r.id]?.[p.feature] ?? []).includes(p.action)).map((r) => r.id);
}

export function grantedCount(map: RoleFeatures[RoleId] | undefined) {
  return Object.values(map ?? {}).reduce((n, a) => n + (a?.length ?? 0), 0);
}

/**
 * Bật/tắt một thao tác theo quy tắc chung: Ghi kéo theo Xem, Xoá kéo theo Ghi;
 * tắt Xem thì tắt hết, tắt Ghi thì tắt cả Xoá. Chỉ giữ thao tác có nghĩa với chức năng.
 */
export function setAction(map: RoleFeatures[RoleId], feature: FeatureId, action: Action, on: boolean): RoleFeatures[RoleId] {
  const allowed = featureActions[feature];
  const cur = new Set(map[feature] ?? []);
  if (on) {
    cur.add(action);
    if (action !== 'view') cur.add('view');
    if (action === 'delete') cur.add('write');
  } else if (action === 'view') cur.clear();else
  {
    cur.delete(action);
    if (action === 'write') cur.delete('delete');
  }
  const next = { ...map };
  const actions = ACTIONS.filter((a) => cur.has(a) && allowed.includes(a));
  if (actions.length) next[feature] = actions;else
  delete next[feature];
  return next;
}

export { upperFirst };