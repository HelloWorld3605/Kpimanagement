import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyMark } from '../components/ui/EmptyMark';
import { usePermissions } from '../hooks/usePermissions';
import { firstAllowedPath } from '../utils/access';

/** Dùng chung cho đường dẫn không tồn tại và bản ghi ngoài phạm vi — không phân biệt hai trường hợp để không lộ thông tin. */
export function NoAccess() {
  const { account, policy } = usePermissions();
  const home = account ? firstAllowedPath(policy, account) : '/dang-nhap';
  return (
    <div className="flex flex-col items-center px-6 py-24 text-center">
      <EmptyMark size="lg" />
      <h1 className="mt-3 text-lg font-semibold text-gray-900">Không tìm thấy hoặc bạn không có quyền xem</h1>
      <p className="mt-1 max-w-md text-[14px] text-gray-500">
        Trang hoặc bản ghi này không tồn tại, hoặc nằm ngoài phạm vi dữ liệu của tài khoản đang đăng nhập.
      </p>
      <Link
        to={home}
        className="mt-5 rounded-md bg-brand-600 px-4 py-2 text-[14px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        style={{ transition: 'background-color 150ms ease-out' }}>
        
        Về trang làm việc
      </Link>
    </div>);

}