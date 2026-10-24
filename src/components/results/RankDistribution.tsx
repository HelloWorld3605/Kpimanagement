import React from 'react';
import { Rank } from '../../types/selfReview';
import { rankOptions } from '../../utils/selfReview';
import { rankOrder } from '../../utils/results';

type RankDistributionProps = {
  counts: Record<Rank, number>;
  active: Rank | null;
  onToggle: (rank: Rank) => void;
};

const segment: Record<Rank, string> = {
  excellent: 'bg-success-600',
  good: 'bg-success-200',
  done: 'bg-gray-300',
  fail: 'bg-brand-600'
};

/** Phân bố 4 mức xếp loại — mỗi mức đồng thời là bộ lọc của bảng bên dưới */
export function RankDistribution({ counts, active, onToggle }: RankDistributionProps) {
  const total = rankOrder.reduce((a, r) => a + counts[r], 0);

  return (
    <div className="min-w-0 flex-1">
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100" aria-hidden>
        {total > 0 &&
        rankOrder.map((r) =>
        counts[r] ?
        <span
          key={r}
          className={`h-full ${segment[r]} ${active && active !== r ? 'opacity-30' : ''}`}
          style={{ width: `${counts[r] / total * 100}%`, transition: 'opacity 150ms ease-out' }} /> :

        null
        )}
      </div>
      <div role="group" aria-label="Lọc theo mức xếp loại" className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {rankOrder.map((r) => {
          const opt = rankOptions.find((o) => o.value === r)!;
          const pressed = active === r;
          const pct = total ? Math.round(counts[r] / total * 100) : 0;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={pressed}
              onClick={() => onToggle(r)}
              disabled={counts[r] === 0}
              title={opt.label}
              className={`-mx-2 flex items-center gap-2 rounded-md px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-default ${
              pressed ? 'bg-gray-100' : 'hover:bg-gray-50 disabled:hover:bg-transparent'}`
              }
              style={{ transition: 'background-color 120ms ease-out' }}>
              
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${segment[r]}`} aria-hidden />
              <span className="min-w-0">
                <span className="block truncate text-[13px] text-gray-600">{opt.short}</span>
                <span className="block text-[15px] font-semibold tabular-nums text-gray-900">
                  {counts[r]}
                  <span className="ml-1.5 text-[12px] font-normal text-gray-500">{pct}%</span>
                </span>
              </span>
            </button>);

        })}
      </div>
    </div>);

}