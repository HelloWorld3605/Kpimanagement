import React from 'react';
import { LockIcon } from 'lucide-react';
import { CriteriaSection, CriteriaSet, CriteriaVersion, CriterionDiff } from '../../types/criteria';
import { CriteriaTable } from './CriteriaTable';

type CriteriaDocumentProps = {
  set: CriteriaSet;
  version: CriteriaVersion;
  prev?: CriteriaVersion;
  diff: Record<string, CriterionDiff> | null;
  onChange?: (sections: CriteriaSection[]) => void;
  /** Không có quyền ghi → dự thảo chỉ xem */
  readOnly?: boolean;
};

export function CriteriaDocument({ set, version: v, prev, diff, onChange, readOnly = false }: CriteriaDocumentProps) {
  const isDraft = v.status === 'draft';
  const editable = isDraft && !readOnly;
  const hasDiff = diff && Object.keys(diff).length > 0;

  return (
    <article className="relative mx-auto max-w-[880px] bg-white px-6 py-10 font-serif text-gray-900 shadow-sm ring-1 ring-gray-200 sm:px-12 lg:px-16">
      {isDraft &&
      <span className="absolute right-8 top-8 rotate-[-8deg] border-2 border-brand-600 px-3 py-0.5 font-sans text-[13px] font-bold tracking-[0.2em] text-brand-600">
          DỰ THẢO
        </span>
      }
      {v.status === 'replaced' &&
      <span className="absolute right-8 top-8 rotate-[-8deg] border-2 border-gray-400 px-3 py-0.5 font-sans text-[13px] font-bold tracking-[0.15em] text-gray-400">
          HẾT HIỆU LỰC
        </span>
      }

      <header className="text-center">
        <p className="text-[15px] font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p className="inline-block border-b border-gray-900 pb-0.5 text-[15px] font-bold">Độc lập - Tự do - Hạnh phúc</p>
        <h2 className="mt-8 text-[20px] font-bold leading-snug">
          BỘ TIÊU CHÍ CHUNG ĐÁNH GIÁ, XẾP LOẠI
          <br />
          {set.titleLine}
        </h2>
        <p className="mt-2 text-[16px] italic">
          {isDraft ?
          `(Phiên bản v${v.version} — dự thảo, chưa ban hành)` :
          `(Phiên bản v${v.version} — ban hành kèm theo ${v.decision})`}
        </p>
        {v.status === 'active' && <p className="mt-1 text-[16px] italic">Áp dụng từ {v.effectiveFrom}</p>}
        {v.status === 'replaced' &&
        <p className="mt-1 text-[16px] italic">
            Áp dụng {v.effectiveFrom} → {v.effectiveTo}
          </p>
        }
      </header>

      <div className="mt-10">
        <CriteriaTable
          sections={v.sections}
          diff={diff}
          prevLabel={prev ? `v${prev.version}` : undefined}
          requiredTotal={set.requiredTotal}
          editable={editable}
          onChange={onChange} />
        
      </div>

      <p className="mt-5 text-[14px] italic leading-6 text-gray-700">
        Ghi chú: Tiêu chí có biểu tượng <LockIcon className="inline h-3.5 w-3.5 -translate-y-0.5" aria-label="khoá" /> là tiêu chí đảm
        bảo — mặc định đạt điểm tối đa nếu không có vi phạm.
        {hasDiff && prev && ` Dòng tô màu là thay đổi so với v${prev.version}.`}
      </p>
    </article>);

}