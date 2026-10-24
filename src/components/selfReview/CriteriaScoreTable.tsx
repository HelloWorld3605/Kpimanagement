import React from 'react';
import { CheckIcon } from 'lucide-react';
import { CriteriaSection } from '../../types/criteria';
import { Mark } from '../../types/selfReview';
import { fmt, sectionAchieved, sectionMax } from '../../utils/selfReview';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';

type CriteriaScoreTableProps = {
  sections: CriteriaSection[];
  marks: Record<string, Mark | undefined>;
  notes: Record<string, string>;
  editable: boolean;
  showErrors: boolean;
  appraisalMarks?: Record<string, Mark>;
  onMark: (id: string, mark: Mark) => void;
  onNote: (id: string, note: string) => void;
};

const th = 'border-b border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-center align-middle text-[13px] font-semibold text-gray-700';
const td = 'border-b border-r border-gray-200 px-3 py-3 align-middle';

export function CriteriaScoreTable({
  sections,
  marks,
  notes,
  editable,
  showErrors,
  appraisalMarks,
  onMark,
  onNote
}: CriteriaScoreTableProps) {
  const total = sections.reduce((a, s) => a + sectionMax(s), 0);
  const achieved = sections.reduce((a, s) => a + sectionAchieved(s, marks), 0);
  const appraised = appraisalMarks ? sections.reduce((a, s) => a + sectionAchieved(s, appraisalMarks), 0) : null;

  return (
    <HorizontalSwipe className="overflow-hidden rounded-md border border-gray-200" containerProps={{ 'aria-label': 'Chấm tiêu chí chung' }}>
      <table className="w-full min-w-[960px] border-collapse text-[14px] text-gray-700 [&_tbody>tr:last-child>*]:border-b-0 [&_tr>*:last-child]:border-r-0">
        <thead>
          <tr>
            <th className={`${th} w-14`}>TT</th>
            <th className={th}>Nội dung</th>
            <th className={`${th} w-20`}>Điểm tối đa</th>
            <th className={`${th} w-24`}>Đảm bảo</th>
            <th className={`${th} w-24`}>Không đảm bảo</th>
            <th className={`${th} w-28`}>
              Điểm đạt được
              <span className="block text-[11px] font-normal text-gray-500">tối đa nếu đảm bảo, 0 nếu không</span>
            </th>
            {appraisalMarks && <th className={`${th} w-24 text-brand-700`}>Thẩm định</th>}
            <th className={`${th} w-56`}>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s, si) => {
            const sAch = sectionAchieved(s, marks);
            const sApp = appraisalMarks ? sectionAchieved(s, appraisalMarks) : null;
            return (
              <React.Fragment key={s.id}>
                <tr className="bg-gray-50/70 font-semibold text-gray-900">
                  <td className={`${td} text-center`}>{si + 1}</td>
                  <td className={td}>{s.title}</td>
                  <td className={`${td} text-center tabular-nums`}>{sectionMax(s)}</td>
                  <td className={td} />
                  <td className={td} />
                  <td className={`${td} text-center tabular-nums`}>{sAch}</td>
                  {sApp !== null && <td className={`${td} text-center tabular-nums ${sApp !== sAch ? 'text-brand-600' : ''}`}>{sApp}</td>}
                  <td className={td} />
                </tr>
                {s.criteria.map((c, ci) => {
                  const mark = marks[c.id];
                  const missing = showErrors && !mark;
                  const app = appraisalMarks?.[c.id];
                  const changed = appraisalMarks && app !== mark;
                  return (
                    <tr key={c.id} className={missing ? 'bg-brand-50/60' : changed ? 'bg-warning-50/60' : ''}>
                      <td className={`${td} text-center tabular-nums text-gray-500`}>
                        {si + 1}.{ci + 1}
                      </td>
                      <td className={`${td} leading-6 text-gray-900`}>{c.content}</td>
                      <td className={`${td} text-center tabular-nums`}>{String(c.score).padStart(2, '0')}</td>
                      {(['yes', 'no'] as Mark[]).map((m) =>
                      <td key={m} className={`${td} p-0 text-center`}>
                          {editable ?
                        <label className="flex h-full min-h-[48px] cursor-pointer items-center justify-center hover:bg-gray-50">
                              <input
                            type="radio"
                            name={`mark-${c.id}`}
                            checked={mark === m}
                            onChange={() => onMark(c.id, m)}
                            aria-label={`${si + 1}.${ci + 1} ${m === 'yes' ? 'Đảm bảo' : 'Không đảm bảo'}`}
                            className="h-4 w-4 accent-brand-600" />
                          
                            </label> :
                        mark === m ?
                        <CheckIcon className={`mx-auto h-4 w-4 ${m === 'yes' ? 'text-success-600' : 'text-brand-600'}`} aria-label="Đã chọn" /> :
                        null}
                        </td>
                      )}
                      <td className={`${td} text-center font-medium tabular-nums text-gray-900`}>
                        {mark ? mark === 'yes' ? c.score : 0 : <span className="text-gray-300">–</span>}
                      </td>
                      {appraisalMarks &&
                      <td className={`${td} text-center font-semibold tabular-nums ${changed ? 'text-brand-600' : 'text-gray-900'}`}>
                          {app === 'yes' ? c.score : 0}
                        </td>
                      }
                      <td className={`${td} py-2`}>
                        {editable ?
                        <input
                          value={notes[c.id] ?? ''}
                          onChange={(e) => onNote(c.id, e.target.value)}
                          placeholder={mark === 'no' ? 'Nêu lý do không đảm bảo' : ''}
                          aria-label={`Ghi chú ${si + 1}.${ci + 1}`}
                          className="h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-[13px] text-gray-700 placeholder:text-gray-400 hover:border-gray-200 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" /> :


                        <span className="text-[13px] text-gray-600">{notes[c.id]}</span>
                        }
                      </td>
                    </tr>);

                })}
              </React.Fragment>);

          })}
          <tr className="bg-gray-50 font-semibold text-gray-900">
            <td className={td} />
            <td className={`${td} text-center`}>Tổng điểm</td>
            <td className={`${td} text-center tabular-nums`}>{total}</td>
            <td className={td} />
            <td className={td} />
            <td className={`${td} text-center tabular-nums`}>{fmt(achieved)}</td>
            {appraised !== null && <td className={`${td} text-center tabular-nums text-brand-700`}>{fmt(appraised)}</td>}
            <td className={td} />
          </tr>
        </tbody>
      </table>
    </HorizontalSwipe>);

}