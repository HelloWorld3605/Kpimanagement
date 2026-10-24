import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, ChevronDownIcon, EyeIcon } from 'lucide-react';
import { fmtScore } from '../../utils/kpi';
import { TASKS_MAX } from '../../utils/selfReview';
import { fmtNum } from '../../utils/scoresheet';
import { TaskSummaryRow } from '../../utils/reviewTasks';
import { AutoTextarea } from '../criteria/AutoTextarea';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';

type ScoreColumn = {label: string;value: number | null;accent?: boolean;};

type TaskGroupSummaryProps = {
  columns: ScoreColumn[];
  /** Nhiệm vụ của lớp đang xem — hiển thị khi mở rộng, chỉ đọc */
  rows: TaskSummaryRow[];
  /** Số nhiệm vụ còn thiếu kết quả ở lớp đang nhập */
  missing?: number;
  onOpen: () => void;
  openLabel?: string;
  /** Chủ phiếu ghi "Kết quả nhiệm vụ thực tế" ngay trong danh sách */
  onActual?: (taskId: string, actual: string) => void;
};

const th = 'border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-center align-middle text-[13px] font-semibold text-gray-700 last:border-r-0';
const td = 'border-b border-r border-gray-200 px-3 py-2.5 last:border-r-0';

/**
 * Dòng "II. Nhóm tiêu chí về kết quả thực hiện nhiệm vụ được giao" trên phiếu:
 * điểm thang 70 (KPI × 0,7); mũi tên mở danh sách nhiệm vụ rút gọn (chỉ đọc);
 * kết quả nhập và thang 100 nằm trong pop up "Xem nhiệm vụ".
 */
export function TaskGroupSummary({ columns, rows, missing = 0, onOpen, openLabel = 'Xem nhiệm vụ', onActual }: TaskGroupSummaryProps) {
  const [expanded, setExpanded] = useState(true);
  const entered = rows.filter((r) => r.done !== null).length;

  return (
    <div className="overflow-hidden rounded-md border border-gray-200">
      <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex min-w-0 items-start gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="task-group-list"
            aria-label={expanded ? 'Thu gọn danh sách nhiệm vụ' : 'Mở danh sách nhiệm vụ'}
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
            
            <ChevronDownIcon className="h-4 w-4" style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
          </button>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-gray-900">
              II. Nhóm tiêu chí về kết quả thực hiện nhiệm vụ được giao ({TASKS_MAX} điểm)
            </h3>
            <ul className="mt-1.5 space-y-1 text-[13px] leading-5 text-gray-600">
              <li>Căn cứ vào số điểm KPI quy đổi, điểm kết quả thực hiện chức trách, nhiệm vụ được giao tính bằng điểm KPI quy đổi nhân 70%.</li>
              <li>Kết quả thực hiện các nhiệm vụ theo kế hoạch, lịch công tác và các nhiệm vụ phát sinh, đánh giá qua số lượng, chất lượng, tiến độ thực hiện.</li>
            </ul>
            <p className="mt-1.5 text-[13px] text-gray-500">
              {rows.length} nhiệm vụ · đã có kết quả {entered}/{rows.length}
            </p>
            {missing > 0 &&
            <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-brand-600" role="alert">
                <AlertTriangleIcon className="h-4 w-4" aria-hidden />
                Còn {missing} nhiệm vụ chưa nhập hoặc nhập sai kết quả
              </p>
            }
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
          <dl className="flex gap-6">
            <div className="text-center">
              <dt className="text-[12px] text-gray-500">Điểm tối đa</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-gray-900">{TASKS_MAX}</dd>
            </div>
            {columns.map((c) =>
            <div key={c.label} className="text-center">
                <dt className="whitespace-nowrap text-[12px] text-gray-500">{c.label}</dt>
                <dd className={`mt-0.5 text-lg font-semibold tabular-nums ${c.value === null ? 'text-gray-300' : c.accent ? 'text-brand-700' : 'text-gray-900'}`}>
                  {c.value === null ? '—' : fmtScore(c.value)}
                </dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-brand-200 bg-brand-50 px-4 text-[14px] font-medium text-brand-700 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ transition: 'background-color 150ms ease-out' }}>
            
            <EyeIcon className="h-4 w-4" aria-hidden />
            {openLabel}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded &&
        <motion.div
          id="task-group-list"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden border-t border-gray-200">
          
            <HorizontalSwipe containerProps={{ 'aria-label': 'Danh sách nhiệm vụ được giao' }}>
              <table className="w-full min-w-[1080px] border-collapse text-[14px] text-gray-700">
                <thead>
                  <tr>
                    <th scope="col" className={`${th} w-12`}>TT</th>
                    <th scope="col" className={th}>
                      Nhiệm vụ
                      <span className="block text-[11px] font-normal text-gray-500">(cụ thể hóa nhiệm vụ được giao theo phạm vi, chức năng của đơn vị)</span>
                    </th>
                    <th scope="col" className={`${th} w-44`}>Mục tiêu, nhiệm vụ đề ra</th>
                    <th scope="col" className={`${th} w-56`}>Kết quả nhiệm vụ thực tế</th>
                    <th scope="col" className={`${th} w-32`}>Hiệu suất (%) kết quả nhiệm vụ theo chất lượng, tiến độ (KPI)</th>
                    <th scope="col" className={`${th} w-20`}>Điểm tối đa</th>
                    <th scope="col" className={`${th} w-36`}>
                      Điểm đạt được
                      <span className="block text-[11px] font-normal text-gray-500">(Hiệu suất (%) theo chất lượng, tiến độ) × (Điểm tối đa)</span>
                    </th>
                    <th scope="col" className={`${th} w-40`}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 &&
                <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                        Chưa có nhiệm vụ nào trong kỳ
                      </td>
                    </tr>
                }
                  {rows.map((t, i) =>
                <tr key={t.id} className="align-top">
                      <td className={`${td} text-center tabular-nums text-gray-500`}>{i + 1}</td>
                      <td className={`${td} text-gray-900`}>{t.name}</td>
                      <td className={td}>{t.target}</td>
                      <td className={td}>
                        {onActual ?
                    <AutoTextarea
                      value={t.actual}
                      onChange={(e) => onActual(t.id, e.target.value)}
                      placeholder={t.done === null ? 'Kết quả đạt được' : `${t.done} ${t.product.toLowerCase()} hoàn thành…`}
                      aria-label={`Kết quả nhiệm vụ thực tế ${i + 1}`}
                      className="min-h-[36px] w-full resize-none rounded-md border border-brand-200 bg-white px-2 py-1.5 text-[14px] leading-5 text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" /> :


                    t.actual || (t.done !== null ? <span className="text-gray-500">{t.done}/{t.qty} {t.product.toLowerCase()}</span> : null)
                    }
                      </td>
                      <td className={`${td} text-center tabular-nums`}>{t.efficiency === null ? '' : `${fmtNum(t.efficiency)}%`}</td>
                      <td className={`${td} text-center tabular-nums`}>{fmtNum(t.max)}</td>
                      <td className={`${td} text-center font-medium tabular-nums text-gray-900`}>{t.points === null ? '' : fmtNum(t.points)}</td>
                      <td className={`${td} text-[13px] text-gray-600`}>{t.note}</td>
                    </tr>
                )}
                </tbody>
                {rows.length > 0 &&
              <tfoot>
                    <tr className="bg-gray-50 font-semibold text-gray-900">
                      <td className={td} />
                      <td colSpan={4} className={`${td} text-center`}>
                        Tổng điểm
                      </td>
                      <td className={`${td} text-center tabular-nums`}>{TASKS_MAX}</td>
                      <td className={`${td} text-center tabular-nums text-brand-700`}>{fmtNum(rows.reduce((s, r) => s + (r.points ?? 0), 0))}</td>
                      <td className={td} />
                    </tr>
                  </tfoot>
              }
              </table>
            </HorizontalSwipe>
            <p className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-[12px] text-gray-500">
              Hiệu suất và điểm đạt được lấy từ kết quả nhập trong “{openLabel}” (thang 100); điểm đạt được = hiệu suất × điểm tối đa, tổng tối đa 70.
            </p>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}