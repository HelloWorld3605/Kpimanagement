import React from 'react';
import { initials } from '../../utils/profile';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-[13px]',
  lg: 'h-12 w-12 text-[15px]',
  xl: 'h-14 w-14 text-lg'
};

/** Chỉ huy dùng nền đỏ đặc, cán bộ dùng nền nhạt — phân biệt vai trò ngay trên ảnh đại diện. */
export function MemberAvatar({ name, strong, size = 'md' }: {name: string;strong?: boolean;size?: Size;}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes[size]} ${
      strong ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`
      }>
      
      {initials(name)}
    </span>);

}