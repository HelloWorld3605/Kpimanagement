import React from 'react';
import { Link } from 'react-router-dom';
import { useAccess } from '../contexts/AccessContext';
import { usePermissions } from '../hooks/usePermissions';
import { EmptyMark } from './ui/EmptyMark';

/** Màn cần đơn vị / hồ sơ cán bộ: tài khoản chưa gắn nhân sự thấy thông báo thay vì nội dung */
export function RequireMember({ children }: {children: React.ReactNode;}) {
  const { account, can } = usePermissions();
  const { members } = useAccess();
  const linked = Boolean(account?.memberId && members.some((m) => m.id === account.memberId));
  if (linked) return <>{children}</>;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center">
      <EmptyMark size="lg" />
      <p className="mt-3 text-[15px] font-medium text-gray-900">Tài khoản chưa gắn hồ sơ nhân sự</p>
      <p className="mt-1 max-w-md text-[14px] text-gray-500">
        Màn này cần biết bạn thuộc đơn vị nào. Liên hệ quản trị hệ thống để gắn tài khoản với hồ sơ nhân sự.
      </p>
      {can('admin', 'write') && account &&
      <Link
        to={`/nhan-su/tao-moi?account=${encodeURIComponent(account.username)}`}
        className="mt-4 text-[14px] font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        
          Tạo hồ sơ nhân sự cho tài khoản này
        </Link>
      }
    </div>);

}