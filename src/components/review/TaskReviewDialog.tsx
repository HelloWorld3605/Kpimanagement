import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, SaveIcon } from 'lucide-react';
import { Modal, btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';
import { LevelPartsEditor } from '../selfReview/LevelPartsEditor';
import { ScoresheetExport } from '../scoresheet/ScoresheetExport';
import { QtyAdjustDialog } from './QtyAdjustDialog';
import { ScoresheetKind } from '../../types/scoresheet';
import { ReviewTask, SelfReview, TaskResult } from '../../types/selfReview';
import { UnitMember } from '../../types/org';
import { ResultLayer, overShare, resultFor, reviewTaskForm } from '../../utils/reviewTasks';
import { TaskAverage } from '../../utils/reviewFlow';
import { HeadCell, fmtIdx, fmtNum, headRows, kindMeta } from '../../utils/scoresheet';
import { hasResult, resultInvalid } from '../../utils/selfReview';
import { KPI_WEIGHT, fmtScore } from '../../utils/kpi';

type TaskReviewDialogProps = {
  open: boolean;
  onClose: () => void;
  review: SelfReview;
  kind: ScoresheetKind;
  subject?: UnitMember;
  /** Lớp kết quả đang hiển thị / nhập */
  layer: ResultLayer;
  editable: boolean;
  /** Lãnh đạo được giao lại số lượng khi thẩm định */
  canAdjustQty?: boolean;
  averages: Record<string, TaskAverage>;
  showErrors?: boolean;
  onResult?: (taskId: string, res: TaskResult) => void;
  onNote?: (taskId: string, note: string) => void;
  onAdjustQty?: (task: ReviewTask, after: number, reason: string, effectiveFrom: string) => void;
  /** Lưu kết quả đã nhập; mặc định chỉ xác nhận đã lưu (kết quả được ghi ngay khi nhập) */
  onSave?: () => void;
};

const WIDTHS = [48, 280, 112, 84, 104, 100, 96, 108, 140, 220, 88, 136, 220, 88, 160];
const th = 'border border-gray-200 bg-gray-50 px-2 py-2 text-center text-[13px] font-semibold text-gray-700';
const groupTh = 'border border-gray-200 bg-brand-50 px-2 py-2.5 text-center text-[13px] font-semibold text-brand-700';
const td = 'border border-gray-200 px-2 py-2.5 text-center align-top tabular-nums';
const foot = 'border border-gray-200 px-2 py-2.5 text-center tabular-nums';
const fillInput =
'h-9 w-16 rounded-md border bg-white px-1.5 text-center text-[14px] tabular-nums text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

const layerLabel: Record<ResultLayer, string> = { self: 'Tự đánh giá', dept: 'LĐ phòng đánh giá', unit: 'LĐ đơn vị đánh giá' };
const refLayer: Partial<Record<ResultLayer, ResultLayer>> = { dept: 'self', unit: 'dept' };

function HeadLabel({ cell }: {cell: HeadCell;}) {
  return (
    <>
      {cell.segs.map((s, i) =>
      s.br ?
      <span key={i} className="block text-[12px] font-normal text-gray-500">
            {s.t}
          </span> :

      <span key={i} className={/^\([A-Z]\)$/.test(s.t) ? 'font-bold text-gray-900' : ''}>
            {s.t}
          </span>

      )}
    </>);

}

/**
 * Pop up "Xem nhiệm vụ" ở nhóm tiêu chí kết quả thực hiện nhiệm vụ (70 điểm).
 * Bảng đúng cấu trúc Mẫu CĐKPI của vai trò; cột phải điền có viền, cột tự tính chỉ đọc.
 */
export function TaskReviewDialog({
  open,
  onClose,
  review,
  kind,
  subject,
  layer,
  editable,
  canAdjustQty,
  averages,
  showErrors,
  onResult,
  onNote,
  onAdjustQty,
  onSave
}: TaskReviewDialogProps) {
  const { form, d, score } = useMemo(() => reviewTaskForm(review, layer, kind, subject), [review, layer, kind, subject]);
  const over = overShare(review, layer);
  const head = headRows(kind);
  const [adjusting, setAdjusting] = useState<ReviewTask | null>(null);
  const [showD, setShowD] = useState(false);
  const ref = refLayer[layer];
  const missingCount = review.tasks.filter((t) => {
    const res = resultFor(review, t, layer);
    return !hasResult(res) || resultInvalid(res);
  }).length;

  const save = () => {
    onSave?.();
    toast.success(missingCount ? `Đã lưu · còn ${missingCount} nhiệm vụ chưa nhập đủ kết quả` : 'Đã lưu kết quả nhiệm vụ');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title="Tự đánh giá nhiệm vụ KPI"
      description={
      <>
          {subject ? `${subject.rank} ${subject.name} · ` : ''}
          {review.period} · {kindMeta[kind].code} · {layerLabel[layer]}
        </>
      }
      headerActions={<ScoresheetExport form={form} />}
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-gray-700">
            Điểm đánh giá KPI kỳ này:{' '}
            <span className="ml-1 rounded-full bg-brand-600 px-2.5 py-0.5 font-semibold tabular-nums text-white">
              {fmtNum(form.kpi)}
              <span className="text-[12px] font-normal opacity-80">/100</span>
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={btnSecondary} style={btnTransition}>
              Đóng
            </button>
            {editable &&
          <button type="button" onClick={save} className={btnPrimary} style={btnTransition}>
                <SaveIcon className="h-4 w-4" aria-hidden />
                Lưu
              </button>
          }
          </div>
        </div>
      }>
      
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5 text-[13px] text-gray-600">
        <p>
          {editable ?
          <>
              Ô có viền là ô phải điền: <span className="font-medium text-gray-800">số lượng hoàn thành (7)</span>, mức chất lượng (10), mức tiến độ (13)
              {layer === 'self' && ', ghi chú (15)'}. Các cột còn lại hệ thống tự tính.
            </> :

          'Chỉ xem — các cột được tính theo kết quả đã nhập.'
          }
        </p>
        <p>
          Chỉ số KPI <span className="font-semibold tabular-nums text-brand-700">{fmtNum(form.kpi)}</span>/100
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <div className="overflow-hidden rounded-md border border-gray-200">
          <HorizontalSwipe containerProps={{ 'aria-label': 'Bảng nhiệm vụ KPI' }}>
            <table className="w-full min-w-[1984px] border-collapse text-[14px] text-gray-700">
              <colgroup>
                {WIDTHS.map((w, i) =>
                <col key={i} style={{ minWidth: w, width: w }} />
                )}
              </colgroup>
              <thead>
                {head.map((row, ri) =>
                <tr key={ri}>
                    {row.map((h, ci) =>
                  <th key={ci} rowSpan={h.rs} colSpan={h.cs} scope={h.cs ? 'colgroup' : 'col'} className={`${ri === 0 && (h.cs ?? 1) > 1 ? groupTh : th} ${ri === 2 ? 'font-medium' : ''}`}>
                        <HeadLabel cell={h} />
                      </th>
                  )}
                  </tr>
                )}
                <tr>
                  {WIDTHS.map((_, i) =>
                  <th key={i} className="border border-gray-200 bg-white px-2 py-1 text-center text-[12px] font-normal text-gray-400">
                      ({i + 1})
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {review.tasks.length === 0 &&
                <tr>
                    <td colSpan={15} className="py-16 text-center text-gray-500">
                      Chưa có nhiệm vụ nào trong kỳ
                    </td>
                  </tr>
                }
                {review.tasks.map((t, i) => {
                  const row = form.rows[i];
                  const res = resultFor(review, t, layer);
                  const entered = hasResult(res);
                  const doneVal = entered ? res.done as number : null;
                  const refRes = ref ? resultFor(review, t, ref) : undefined;
                  const avg = averages[t.code];
                  const missing = showErrors && editable && (!entered || resultInvalid(res));
                  const setRes = (patch: Partial<TaskResult>) => onResult?.(t.id, { ...res, ...patch });
                  return (
                    <tr key={t.id} className={missing ? 'bg-brand-50/60' : ''}>
                      <td className={td}>{i + 1}</td>
                      <td className={`${td} text-left text-gray-900`}>
                        {t.name}
                        <span className="mt-0.5 block text-[12px] text-gray-500">{t.code}</span>
                      </td>
                      <td className={td}>{t.product}</td>
                      <td className={td}>{fmtNum(t.point)}</td>
                      <td className={td}>
                        <div className="flex items-center justify-center gap-1">
                          <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1.5 font-semibold text-gray-900">{t.qty}</span>
                          {avg && avg.people > 1 && t.qty !== avg.avg &&
                          <span className={t.qty > avg.avg ? 'text-success-600' : 'text-brand-600'}>
                              {t.qty > avg.avg ? <ArrowUpIcon className="h-3.5 w-3.5" aria-label="Trên bình quân" /> : <ArrowDownIcon className="h-3.5 w-3.5" aria-label="Dưới bình quân" />}
                            </span>
                          }
                          {canAdjustQty &&
                          <button
                            type="button"
                            onClick={() => setAdjusting(t)}
                            aria-label={`Giao lại số lượng nhiệm vụ ${i + 1}`}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            style={btnTransition}>
                            
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                          }
                        </div>
                        {avg && avg.people > 0 &&
                        <span className="group relative mt-1 inline-block">
                            <span tabIndex={0} className="cursor-help border-b border-dotted border-gray-400 text-[12px] text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                              {avg.total} / {avg.people} = {avg.avg.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </span>
                            <span
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-52 -translate-x-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-left text-[12px] font-normal leading-snug text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                            style={{ transition: 'opacity 150ms ease-out' }}>
                            
                              Số nhiệm vụ bình quân mỗi người = Tổng số nhiệm vụ của phòng / Số người thực hiện
                            </span>
                          </span>
                        }
                      </td>
                      <td className={`${td} font-semibold text-gray-900`}>{fmtNum(row.m)}</td>
                      <td className={td}>
                        {editable ?
                        <input
                          type="number"
                          min={0}
                          max={t.qty}
                          value={doneVal ?? ''}
                          onChange={(e) => setRes({ done: e.target.value === '' ? null : Math.max(0, Math.min(t.qty, Math.floor(Number(e.target.value)))) })}
                          aria-label={`Số lượng hoàn thành nhiệm vụ ${i + 1}`}
                          className={`${fillInput} ${missing && !entered ? 'border-brand-500' : 'border-brand-200'}`} /> :


                        <span className={entered && doneVal as number < t.qty ? 'font-semibold text-brand-600' : ''}>{entered ? doneVal : '–'}</span>
                        }
                        {refRes && hasResult(refRes) &&
                        <span className="mt-1 block text-[11px] text-gray-500">
                            {layerLabel[ref as ResultLayer].replace(' đánh giá', '')}: {refRes.done}
                          </span>
                        }
                      </td>
                      <td className={`${td} font-semibold text-gray-900`}>{fmtNum(row.a)}</td>
                      <td className={`${td} text-[13px]`}>{entered ? row.q1 : ''}</td>
                      <td className={`${td} text-[13px]`}>
                        {editable ?
                        <LevelPartsEditor kind="q" parts={res.quality} done={doneVal} point={t.point} editable label={`Chất lượng nhiệm vụ ${i + 1}`} onChange={(quality) => setRes({ quality })} /> :

                        <span className="text-brand-700">{row.q2}</span>
                        }
                      </td>
                      <td className={`${td} font-semibold text-gray-900`}>{fmtNum(row.b)}</td>
                      <td className={`${td} text-[13px]`}>{entered ? row.p1 : ''}</td>
                      <td className={`${td} text-[13px]`}>
                        {editable ?
                        <LevelPartsEditor kind="p" parts={res.progress} done={doneVal} point={t.point} editable label={`Tiến độ nhiệm vụ ${i + 1}`} onChange={(progress) => setRes({ progress })} /> :

                        <span className="text-brand-700">{row.p2}</span>
                        }
                      </td>
                      <td className={`${td} font-semibold text-gray-900`}>{fmtNum(row.c)}</td>
                      <td className={`${td} text-left`}>
                        {editable && layer === 'self' ?
                        <input
                          value={t.note}
                          onChange={(e) => onNote?.(t.id, e.target.value)}
                          placeholder={entered && doneVal as number < t.qty ? 'Lý do chưa hoàn thành' : ''}
                          aria-label={`Ghi chú nhiệm vụ ${i + 1}`}
                          className="h-9 w-full rounded-md border border-brand-200 bg-white px-2 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" /> :


                        <span className="text-[13px] text-gray-600">{t.note}</span>
                        }
                      </td>
                    </tr>);

                })}
              </tbody>
              {review.tasks.length > 0 &&
              <tfoot className="bg-gray-100 font-semibold text-gray-900">
                  <tr>
                    <td colSpan={4} className={foot}>
                      Tổng cộng
                    </td>
                    <td colSpan={2} className={foot}>
                      ΣM = {fmtNum(form.totals.m)}
                    </td>
                    <td colSpan={2} className={foot}>
                      ΣA = {fmtNum(form.totals.a)}
                    </td>
                    <td colSpan={3} className={foot}>
                      ΣB = {fmtNum(form.totals.b)}
                    </td>
                    <td colSpan={3} className={foot}>
                      ΣC = {fmtNum(form.totals.c)}
                    </td>
                    <td className={foot} />
                  </tr>
                  <tr>
                    <td colSpan={6} className={foot}>
                      Theo tỷ lệ (số lượng, chất lượng, tiến độ)
                    </td>
                    <td colSpan={2} className={foot}>
                      A = {fmtIdx(form.idx.a)}
                    </td>
                    <td colSpan={3} className={foot}>
                      B = {fmtIdx(form.idx.b)}
                    </td>
                    <td colSpan={3} className={foot}>
                      C = {fmtIdx(form.idx.c)}
                    </td>
                    <td className={foot} />
                  </tr>
                </tfoot>
              }
            </table>
          </HorizontalSwipe>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-2 text-[14px] text-gray-700">
            <p>
              Chỉ số KPI = ({form.idx.d !== undefined ? 'A + B + C + D' : 'A + B + C'}) / {form.idx.d !== undefined ? 4 : 3} × 100 ={' '}
              <span className="font-semibold tabular-nums text-brand-700">{fmtNum(form.kpi)}</span>/100
            </p>
            <p className="text-[13px] text-gray-500">
              Trên phiếu, nhóm tiêu chí II được quy đổi: KPI × {String(KPI_WEIGHT).replace('.', ',')} = {fmtScore(score)}/70.
            </p>
            {d &&
            <div>
                <p>
                  D (kết quả lãnh đạo, chỉ đạo) = {form.d?.done}/{form.d?.total} = <span className="font-semibold tabular-nums text-gray-900">{fmtIdx(d.value)}</span>
                  <button type="button" onClick={() => setShowD((v) => !v)} aria-expanded={showD} className="ml-2 text-[13px] font-medium text-brand-600 hover:text-brand-700">
                    {showD ? 'Ẩn danh sách' : 'Xem đối tượng trong phạm vi'}
                  </button>
                </p>
                {showD &&
              <ul className="mt-2 max-h-48 divide-y divide-gray-100 overflow-auto rounded-md border border-gray-200 text-[13px]">
                    {d.rows.map((x) =>
                <li key={x.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
                        <span className="text-gray-900">{x.name}</span>
                        <span className={x.counted ? 'text-success-700' : 'text-brand-700'}>{x.reason}</span>
                      </li>
                )}
                  </ul>
              }
              </div>
            }
          </div>
          <p className="max-w-md text-[13px] text-gray-500 lg:text-right">
            Nhiệm vụ có sản phẩm vượt mức / vượt tiến độ: <span className="font-medium tabular-nums text-gray-700">{over.count}/{review.tasks.length}</span> ({fmtNum(over.pct)}%). Đây chỉ là căn cứ xem xét —
            hệ thống không tự cộng điểm vượt mức hay tự xếp loại xuất sắc.
          </p>
        </div>
      </div>

      <QtyAdjustDialog
        open={Boolean(adjusting)}
        taskName={adjusting?.name ?? ''}
        before={adjusting?.qty ?? 0}
        average={adjusting ? averages[adjusting.code] : undefined}
        onClose={() => setAdjusting(null)}
        onConfirm={(after, reason, effective) => {
          if (adjusting) onAdjustQty?.(adjusting, after, reason, effective);
          setAdjusting(null);
        }} />
      
    </Modal>);

}