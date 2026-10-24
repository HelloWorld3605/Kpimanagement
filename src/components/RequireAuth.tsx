import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { ForcePasswordChange } from './ForcePasswordChange';

/** Chưa đăng nhập (hoặc tài khoản bị khoá) → chuyển ra màn đăng nhập, nhớ trang đang mở để quay lại sau */
export function RequireAuth({ children }: {children: React.ReactNode;}) {
  const { account } = usePermissions();
  const location = useLocation();
  if (!account) return <Navigate to="/dang-nhap" replace state={{ from: location.pathname }} />;
  // Mật khẩu ban đầu / vừa đặt lại về mặc định: bắt đổi trước khi dùng hệ thống
  if (account.mustChangePassword) return <ForcePasswordChange account={account} />;
  return <>{children}</>;
}