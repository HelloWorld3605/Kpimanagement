import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { findNavContext } from '../utils/navigation';
import { EmptyMark } from '../components/ui/EmptyMark';

export function ModulePlaceholder() {
  const { pathname } = useLocation();
  const { item } = findNavContext(pathname);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <EmptyMark size="lg" />
      <h1 className="mt-4 text-lg font-semibold text-gray-900">{item?.label ?? 'Không tìm thấy trang'}</h1>
      <p className="mt-1 max-w-md text-[14px] text-gray-500">Màn hình này đang được thiết kế.</p>
      <Link
        to="/"
        className="mt-5 rounded-md bg-brand-600 px-4 py-2 text-[14px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        style={{ transition: 'background-color 150ms ease-out' }}>
        
        Về trang chính
      </Link>
    </div>);

}