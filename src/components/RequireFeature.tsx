import React from 'react';
import { Navigate } from 'react-router-dom';
import { Action, FeatureId } from '../types/access';
import { usePermissions } from '../hooks/usePermissions';
import { firstAllowedPath } from '../utils/access';
import { NoAccess } from '../pages/NoAccess';

type RequireFeatureProps = {feature: FeatureId;action?: Action;children: React.ReactNode;};

/** Không có quyền chức năng → trang "Không tìm thấy hoặc không có quyền" */
export function RequireFeature({ feature, action = 'view', children }: RequireFeatureProps) {
  const { can } = usePermissions();
  if (!can(feature, action)) return <NoAccess />;
  return <>{children}</>;
}

/** Trang mặc định theo quyền của tài khoản */
export function HomeRedirect() {
  const { account, policy } = usePermissions();
  if (!account) return <Navigate to="/dang-nhap" replace />;
  return <Navigate to={firstAllowedPath(policy, account)} replace />;
}