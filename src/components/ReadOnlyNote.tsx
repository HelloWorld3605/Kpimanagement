import React from 'react';
import { EyeIcon } from 'lucide-react';
import { FeatureId } from '../types/access';
import { featureOwners } from '../data/roles';

type ReadOnlyNoteProps = {
  feature: FeatureId;
  /** Thay phần giải thích ai được sửa */
  detail?: string;
  className?: string;
};

/** Dòng nhỏ báo đang ở chế độ chỉ xem và ai được sửa */
export function ReadOnlyNote({ feature, detail, className = '' }: ReadOnlyNoteProps) {
  const owner = featureOwners[feature];
  const text = detail ?? (owner ? `${owner} chịu trách nhiệm cập nhật` : '');
  return (
    <p className={`flex items-center gap-1.5 text-[13px] text-gray-500 ${className}`}>
      <EyeIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      Chế độ chỉ xem{text ? ` · ${text}` : ''}
    </p>);

}