import React from 'react';
import { useLocation } from 'react-router-dom';
import { findNavContext } from '../utils/navigation';

/**
 * Tên trang lấy từ mục menu đang mở. Không hiển thị (breadcrumb trên thanh trên cùng đã nêu tên trang),
 * chỉ giữ cho trình đọc màn hình làm tiêu đề cấp 1. Trang chi tiết tự đặt tiêu đề riêng.
 */
export function PageHeader() {
  const { pathname } = useLocation();
  const { item, sub } = findNavContext(pathname);
  if (!item || sub) return null;
  return <h1 className="sr-only">{item.label}</h1>;
}