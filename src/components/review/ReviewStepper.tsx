import React from 'react';
import { CheckIcon, ChevronRightIcon } from 'lucide-react';
import { ReviewStep } from '../../types/selfReview';
import { reviewSteps } from '../../utils/reviewFlow';

type ReviewStepperProps = {
  current: ReviewStep;
  /** Bỏ bước (vd. phiếu lãnh đạo phòng không qua bước LĐ phòng) */
  skip?: ReviewStep[];
  /** Dùng như bộ lọc: bấm vào bước để xem phiếu ở bước đó */
  onSelect?: (step: ReviewStep) => void;
  counts?: Partial<Record<ReviewStep, number>>;
};

/** Tự đánh giá › LĐ phòng đánh giá › LĐ đơn vị đánh giá › Hoàn thành (bước đã qua có dấu ✓) */
export function ReviewStepper({ current, skip = [], onSelect, counts }: ReviewStepperProps) {
  const steps = reviewSteps.filter((s) => !skip.includes(s.id));
  const currentIndex = steps.findIndex((s) => s.id === current);
  return (
    <ol className="flex flex-wrap items-center gap-1.5" aria-label="Các bước đánh giá">
      {steps.map((s, i) => {
        const active = s.id === current;
        const passed = !onSelect && i < currentIndex;
        const body =
        <>
            {passed && <CheckIcon className="h-4 w-4 text-success-600" aria-label="Đã qua" />}
            <span className="whitespace-nowrap">{s.label}</span>
            {counts?.[s.id] !== undefined && <span className={`tabular-nums ${active ? 'text-white/80' : 'text-gray-400'}`}>{counts[s.id]}</span>}
          </>;

        const cls = `flex h-8 items-center gap-2 rounded-md px-2.5 text-[13px] font-medium ${active ? 'bg-brand-600 text-white' : 'text-gray-600'}`;
        return (
          <li key={s.id} className="flex items-center gap-1.5">
            {onSelect ?
            <button
              type="button"
              aria-current={active ? 'step' : undefined}
              onClick={() => onSelect(s.id)}
              className={`${cls} ${active ? '' : 'hover:bg-gray-100'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
              style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
              
                {body}
              </button> :

            <span aria-current={active ? 'step' : undefined} className={cls}>
                {body}
              </span>
            }
            {i < steps.length - 1 && <ChevronRightIcon className="h-4 w-4 text-gray-300" aria-hidden />}
          </li>);

      })}
    </ol>);

}