import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccess } from '../contexts/AccessContext';
import { AccessTarget, Action, FeatureId, ResourceId } from '../types/access';
import { AccessPolicy, DENY, can, decide } from '../utils/access';
import { findMember } from '../utils/org';

/** Phiên hiện tại + bộ tính quyền. Mọi màn hỏi quyền qua đây, không tự viết điều kiện. */
export function usePermissions() {
  const { username } = useAuth();
  const { accounts, features, scopes } = useAccess();

  return useMemo(() => {
    const account = accounts.find((a) => a.username === username && a.active);
    // Tài khoản có thể chưa gắn hồ sơ nhân sự → member undefined
    const member = account?.memberId ? findMember(account.memberId) : undefined;
    const policy: AccessPolicy = { features, scopes };
    return {
      account,
      member,
      policy,
      can: (feature: FeatureId, action: Action = 'view') => account ? can(policy, account, feature, action) : false,
      decide: (resource: ResourceId, action: Action, target: AccessTarget) => account ? decide(policy, account, resource, action, target) : DENY,
      canSee: (resource: ResourceId, target: AccessTarget) => account ? decide(policy, account, resource, 'view', target).allowed : false
    };
  }, [accounts, features, scopes, username]);
}