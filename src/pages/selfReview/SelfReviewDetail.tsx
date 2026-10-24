import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HistoryIcon } from 'lucide-react';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { useSelfReview } from '../../contexts/SelfReviewContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { StatusPill } from '../../components/catalog/StatusPill';
import { RankBadge } from '../../components/selfReview/RankBadge';
import { StatusNotice } from '../../components/selfReview/StatusNotice';
import { CriteriaScoreTable } from '../../components/selfReview/CriteriaScoreTable';
import { RankProposal } from '../../components/selfReview/RankProposal';
import { SubmitBar } from '../../components/selfReview/SubmitBar';
import { ExportMenu } from '../../components/selfReview/ExportMenu';
import { SubmitDeadline } from '../../components/period/SubmitDeadline';
import { TaskGroupSummary } from '../../components/review/TaskGroupSummary';
import { CollapsibleGroup } from '../../components/review/CollapsibleGroup';
import { TaskReviewDialog } from '../../components/review/TaskReviewDialog';
import { FlowDialog } from '../../components/review/FlowDialog';
import { usePermissions } from '../../hooks/usePermissions';
import { useReviewActions } from '../../hooks/useReviewActions';
import { CRITERIA_MAX, criteriaScore, finalTotal, fmt, incompleteTasks, layerTotal, missingItems, rankFromScore, rankLockedToFail, statusMeta } from '../../utils/selfReview';
import { reviewKind, taskAverages } from '../../utils/reviewFlow';
import { reviewTaskForm, taskSummaryRows } from '../../utils/reviewTasks';
import { SelfReview } from '../../types/selfReview';

/** Chưa hoàn thành 100% mà không có lý do khách quan → tự chuyển đề xuất về "Không hoàn thành nhiệm vụ" */
const applyRankRule = (x: SelfReview): SelfReview =>
rankLockedToFail(x) && x.proposedRank && x.proposedRank !== 'fail' ? { ...x, proposedRank: 'fail' } : x;

export function SelfReviewDetail() {
  const { id } = useParams();
  const { reviews, updateReview } = useSelfReview();
  const [showErrors, setShowErrors] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const review = reviews.find((r) => r.id === id);
  const { decide, member } = usePermissions();
  const actions = useReviewActions();
  useBreadcrumbLabel(review ? `Phiếu tự đánh giá ${review.period}` : undefined);
  const averages = useMemo(() => review ? taskAverages(reviews, review, member) : {}, [reviews, review, member]);

  if (!review) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-lg font-semibold text-gray-900">Không tìm thấy phiếu tự đánh giá</p>
        <Link to="/tu-danh-gia" className="mt-4 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Quay lại danh sách
        </Link>
      </div>);

  }

  const r = review;
  const kind = reviewKind(r, member);
  // Phiếu bị trả lại được sửa như bản nháp; chặn toàn cục khoá phiếu đã gửi / đã quyết định
  const editable = member ?
  decide('review', 'write', { unitId: member.unitId, memberId: member.id, reviewStatus: r.status === 'returned' ? 'draft' : r.status }).allowed :
  false;
  const rescored = r.status === 'rescored' ? r.appraisal : undefined;
  const meta = statusMeta[r.status];
  const cScore = criteriaScore(r.sections, r.marks);
  const tScore = reviewTaskForm(r, 'self', kind, member).score;
  const total = cScore + tScore;
  const final = finalTotal(r);
  const deptTotal = layerTotal(r, 'dept');
  const missing = missingItems(r);
  const update = (patch: Partial<typeof r>) => updateReview(r.id, (x) => applyRankRule({ ...x, ...patch }));
  const locked = rankLockedToFail(r);
  const incomplete = incompleteTasks(r.tasks).map(({ t, i }) => ({ index: i, name: t.name, done: t.done as number, qty: t.qty }));
  const finalTaskScore = r.appraisal?.results ? reviewTaskForm({ ...r, unitResults: r.appraisal.results }, 'unit', kind, member).score : null;

  const stats = [
  { label: 'Tiêu chí chung', value: fmt(cScore), max: CRITERIA_MAX },
  { label: 'Kết quả nhiệm vụ', value: fmt(tScore), max: 70 },
  { label: 'Tổng tự chấm', value: fmt(total), max: 100, strong: final === null }];


  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3 border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-gray-600">
          <SubmitDeadline periodLabel={r.period} />
          <button
            type="button"
            onClick={() => setFlowOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ transition: 'background-color 150ms ease-out' }}>
            
            <HistoryIcon className="h-4 w-4" aria-hidden />
            Tiến độ xử lý
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-200 px-4 py-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-gray-600">
          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
          <span>{r.template}</span>
          <span>· {r.criteriaLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <dl className="flex flex-wrap gap-x-8 gap-y-3">
            {stats.map((s) =>
            <div key={s.label}>
                <dt className="text-xs text-gray-500">{s.label}</dt>
                <dd className="mt-0.5 tabular-nums">
                  <span className={`text-lg font-semibold ${s.strong ? 'text-brand-700' : 'text-gray-900'}`}>{s.value}</span>
                  <span className="text-[13px] text-gray-400">/{s.max}</span>
                </dd>
              </div>
            )}
            {final !== null &&
            <div>
                <dt className="text-xs text-gray-500">Kết quả cuối</dt>
                <dd className="mt-0.5 flex items-center gap-2 tabular-nums">
                  <span className="text-lg font-semibold text-brand-700">{fmt(final)}</span>
                  {r.appraisal && <RankBadge rank={r.appraisal.rank} />}
                </dd>
              </div>
            }
          </dl>
          <ExportMenu review={r} />
        </div>
      </div>

      <div className="space-y-8 px-4 py-5">
        <StatusNotice review={r} />

        <section aria-labelledby="part-1" className="space-y-6">
          <h2 id="part-1" className="text-[16px] font-bold text-gray-900">
            I. Tự chấm điểm theo tiêu chí
          </h2>

          <CollapsibleGroup
            title="I. Nhóm tiêu chí chung"
            max={CRITERIA_MAX}
            description={<>Theo {r.criteriaLabel.toLowerCase()} — Danh mục tiêu chí.</>}
            columns={[
            { label: 'Tự đánh giá', value: Object.keys(r.marks).length ? cScore : null, accent: final === null },
            ...(r.deptMarks ? [{ label: 'LĐ phòng đánh giá', value: criteriaScore(r.sections, r.deptMarks) }] : []),
            ...(r.appraisal ? [{ label: 'Kết quả cuối', value: criteriaScore(r.sections, r.appraisal.marks ?? r.marks), accent: true }] : [])]
            }
            alert={editable && showErrors && missing.criteria ? `Còn ${missing.criteria} tiêu chí chưa chấm` : undefined}
            forceOpen={editable && showErrors && missing.criteria > 0}
            action={
            editable ?
            <button
              type="button"
              onClick={() => update({ marks: Object.fromEntries(r.sections.flatMap((s) => s.criteria).map((c) => [c.id, r.marks[c.id] ?? 'yes'])) })}
              className="inline-flex h-10 items-center whitespace-nowrap rounded-md border border-brand-200 bg-brand-50 px-4 text-[14px] font-medium text-brand-700 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{ transition: 'background-color 150ms ease-out' }}>
              
                  Đảm bảo các tiêu chí còn trống
                </button> :
            undefined
            }>
            
            <CriteriaScoreTable
              sections={r.sections}
              marks={r.marks}
              notes={r.notes}
              editable={editable}
              showErrors={showErrors}
              appraisalMarks={rescored?.marks}
              onMark={(cid, mark) => update({ marks: { ...r.marks, [cid]: mark } })}
              onNote={(cid, note) => update({ notes: { ...r.notes, [cid]: note } })} />
            
          </CollapsibleGroup>

          <TaskGroupSummary
            columns={[
            { label: 'Tự đánh giá', value: r.tasks.some((t) => t.done !== null) ? tScore : null, accent: final === null },
            ...(deptTotal !== null ? [{ label: 'LĐ phòng đánh giá', value: reviewTaskForm(r, 'dept', kind, member).score }] : []),
            ...(finalTaskScore !== null ? [{ label: 'Kết quả cuối', value: finalTaskScore, accent: true }] : [])]
            }
            rows={taskSummaryRows(r, 'self', kind, member)}
            onActual={editable ? (tid, actual) => update({ tasks: r.tasks.map((t) => t.id === tid ? { ...t, actual } : t) }) : undefined}
            missing={editable && showErrors ? missing.tasks : 0}
            onOpen={() => setTasksOpen(true)} />
          
        </section>

        <section aria-labelledby="part-2" className="space-y-3">
          <h2 id="part-2" className="text-[16px] font-bold text-gray-900">
            II. Tự đề xuất mức xếp loại chất lượng
          </h2>
          <RankProposal
            value={r.proposedRank}
            suggested={locked ? 'fail' : rankFromScore(total)}
            editable={editable}
            showErrors={showErrors}
            appraisedRank={r.appraisal?.rank}
            incomplete={incomplete}
            lockedToFail={locked}
            reason={r.objectiveReason ?? ''}
            onReason={(objectiveReason) => update({ objectiveReason })}
            onChange={(rank) => update({ proposedRank: rank })} />
          
        </section>
      </div>

      {editable &&
      <SubmitBar
        period={r.period}
        missing={missing}
        showErrors={showErrors}
        onAttempt={() => {
          setShowErrors(true);
          return !missing.criteria && !missing.tasks && !missing.rank && !missing.rankRule;
        }}
        onSubmit={() => {
          actions.submit(r);
          setShowErrors(false);
        }} />

      }

      <TaskReviewDialog
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        review={r}
        kind={kind}
        subject={member}
        layer="self"
        editable={editable}
        averages={averages}
        showErrors={showErrors}
        onResult={(tid, res) => update({ tasks: r.tasks.map((t) => t.id === tid ? { ...t, ...res } : t) })}
        onNote={(tid, note) => update({ tasks: r.tasks.map((t) => t.id === tid ? { ...t, note } : t) })} />
      
      <FlowDialog open={flowOpen} onClose={() => setFlowOpen(false)} review={r} owner={member} />
    </div>);

}