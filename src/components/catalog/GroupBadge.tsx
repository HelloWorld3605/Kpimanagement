import React from 'react';
import { scoreGroup } from '../../utils/catalog';

const styles: Record<number, string> = {
  1: 'bg-gray-100 text-gray-600 ring-gray-200',
  2: 'bg-brand-50 text-brand-700 ring-brand-100',
  3: 'bg-brand-100 text-brand-800 ring-brand-200 font-semibold'
};

export function GroupBadge({ score }: {score: number;}) {
  const g = scoreGroup(score);
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[g]}`}>
      Nhóm {g}
    </span>);

}