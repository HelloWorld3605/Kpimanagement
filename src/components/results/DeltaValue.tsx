import React from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon } from 'lucide-react';
import { fmt } from '../../utils/selfReview';

/** Chênh lệch KPI so với quý trước */
export function DeltaValue({ value }: {value?: number;}) {
  if (value === undefined) return <span className="text-gray-400">—</span>;
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return <span className="tabular-nums text-gray-500">0</span>;
  const up = rounded > 0;
  const Icon = up ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <span className={`inline-flex items-center gap-0.5 tabular-nums ${up ? 'text-success-700' : 'text-brand-600'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">{up ? 'Tăng' : 'Giảm'}</span>
      {up ? '+' : '−'}
      {fmt(Math.abs(rounded))}
    </span>);

}