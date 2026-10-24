import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/** Chưa đăng nhập (hoặc tài khoản bị khoá) → chuyển ra màn đăng nhập, nhớ trang đang mở để quay lại sau */
export function RequireAuth({ children }: {children: React.ReactNode;}) {
  const { account } = usePermissions();
  const location = useLocation();
  if (!account) return <Navigate to="/dang-nhap" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}