import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { Rank } from '../../types/selfReview';
import { rankOptions, rankShort } from '../../utils/selfReview';
import { AutoTextarea } from '../criteria/AutoTextarea';

type IncompleteItem = {index: number;name: string;done: number;qty: number;};

type RankProposalProps = {
  value?: Rank;
  suggested: Rank;
  editable: boolean;
  showErrors: boolean;
  appraisedRank?: Rank;
  /** Nhiệm vụ chưa hoàn thành đủ số lượng giao */
  incomplete: IncompleteItem[];
  /** Chưa hoàn thành 100% và chưa nêu lý do khách quan */
  lockedToFail: boolean;
  reason: string;
  onReason: (v: string) => void;
  onChange: (r: Rank) => void;
};

export function RankProposal({
  value,
  suggested,
  editable,
  showErrors,
  appraisedRank,
  incomplete,
  lockedToFail,
  reason,
  onReason,
  onChange
}: RankProposalProps) {
  const ruleError = showErrors && lockedToFail && value !== undefined && value !== 'fail';

  return (
    <div className="space-y-4">
      {incomplete.length > 0 &&
      <div className="rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-[14px] text-warning-700" role="status">
          <p className="flex items-start gap-2 font-semibold">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Chưa hoàn thành 100% nhiệm vụ được giao
          </p>
          <ul className="mt-1 space-y-0.5 pl-6">
            {incomplete.map((x) =>
          <li key={x.index}>
                Nhiệm vụ {x.index + 1} — {x.name}: {x.done}/{x.qty}
              </li>
          )}
          </ul>
          <p className="mt-2 pl-6 text-gray-700">
            Theo CV 214, trường hợp này xếp loại <strong className="font-semibold">Không hoàn thành nhiệm vụ</strong>, trừ khi có lý do khách quan.
            Nếu có, nêu rõ lý do để người thẩm định xem xét.
          </p>
          {editable ?
        <AutoTextarea
          value={reason}
          onChange={(e) => onReason(e.target.value)}
          placeholder="Lý do khách quan (nếu có) và minh chứng kèm theo"
          aria-label="Lý do khách quan"
          className="ml-6 mt-2 w-[calc(100%-1.5rem)] rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] leading-5 text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" /> :


        reason && <p className="ml-6 mt-2 italic text-gray-700">Lý do khách quan: “{reason}”</p>
        }
        </div>
      }

      <div role="radiogroup" aria-label="Tự đề xuất mức xếp loại" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rankOptions.map((o, i) => {
          const checked = value === o.value;
          const isAppraised = appraisedRank === o.value;
          const blocked = lockedToFail && o.value !== 'fail';
          const canPick = editable && !blocked;
          return (
            <label
              key={o.value}
              className={`relative flex items-start gap-3 rounded-md border px-4 py-3 ${
              checked ? 'border-brand-600 bg-brand-50' : showErrors && !value ? 'border-brand-200' : 'border-gray-200'} ${
              canPick ? 'cursor-pointer hover:border-brand-500' : ''} ${editable && blocked ? 'opacity-50' : ''}`}
              style={{ transition: 'border-color 150ms ease-out, background-color 150ms ease-out' }}>
              
              <input
                type="radio"
                name="proposed-rank"
                checked={checked}
                disabled={!canPick}
                onChange={() => onChange(o.value)}
                className="mt-0.5 h-4 w-4 accent-brand-600 disabled:opacity-60" />
              
              <span className="min-w-0">
                <span className={`block text-[14px] ${checked ? 'font-semibold text-brand-700' : 'text-gray-900'}`}>
                  {i + 1}. {o.label}
                </span>
                <span className="mt-1 flex flex-wrap gap-x-2 text-xs">
                  {editable && suggested === o.value &&
                  <span className="text-gray-500">{lockedToFail ? 'Theo quy định' : 'Gợi ý theo tổng điểm'}</span>
                  }
                  {isAppraised && <span className="font-medium text-brand-600">Thẩm định xếp loại</span>}
                </span>
              </span>
            </label>);

        })}
      </div>
      {editable &&
      <p className="text-xs text-gray-500">
          {lockedToFail ?
        'Các mức 1–3 mở lại khi nêu lý do khách quan.' :

        <>
              Theo 04 mức. Tổng điểm hiện tại tương ứng mức <span className="font-medium text-gray-700">{rankShort(suggested)}</span> (≥90 xuất sắc,
              ≥70 tốt, ≥50 hoàn thành).
            </>
        }
        </p>
      }
      {showErrors && !value && <p className="text-xs text-brand-600">Chọn mức xếp loại đề xuất</p>}
      {ruleError && <p className="text-xs text-brand-600">Chưa hoàn thành 100% nhiệm vụ: chỉ được đề xuất “Không hoàn thành nhiệm vụ” hoặc nêu lý do khách quan.</p>}
    </div>);

}