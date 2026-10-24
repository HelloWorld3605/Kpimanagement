import React from 'react';

type EmptyMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const EMPTY_MARK_SRC = "/chim-lac.webp";

const sizes = {
  sm: 'h-28 w-28',
  md: 'h-40 w-40',
  lg: 'h-56 w-56'
};

/** Biểu tượng chim Lạc dùng chung cho mọi trạng thái trống, không tìm thấy, chưa có quyền hoặc màn đang thiết kế */
export function EmptyMark({ size = 'sm', className = '' }: EmptyMarkProps) {
  return <img src={EMPTY_MARK_SRC} alt="" aria-hidden draggable={false} className={`empty-mark mx-auto block select-none object-contain opacity-20 ${sizes[size]} ${className}`} />;
}