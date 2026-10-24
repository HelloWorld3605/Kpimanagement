import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, DownloadIcon, HistoryIcon, SendIcon, Undo2Icon } from 'lucide-react';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { Select } from '../../components/ui/Select';
import { StatusPill } from '../../components/catalog/StatusPill';
import { RankBadge } from '../../components/selfReview/RankBadge';
import { LayerCriteriaTable, CriteriaLayer } from '../../components/review/LayerCriteriaTable';
import { TaskGroupSummary } from '../../components/review/TaskGroupSummary';
import { CollapsibleGroup } from '../../components/review/CollapsibleGroup';
import { TaskReviewDialog } from '../../components/review/TaskReviewDialog';
import { FlowDialog } from '../../components/review/FlowDialog';
import { ReasonDialog } from '../../components/period/ReasonDialog';
import { useSelfReview } from '../../contexts/SelfReviewContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useReviewActions } from '../../hooks/useReviewActions';
import { Rank } from '../../types/selfReview';
import { actingLayer, inAppraisalScope } from '../../utils/appraisal';
import { reviewKind, stepOf, taskAverages, unitLeadersAbove } from '../../utils/reviewFlow';
import { ResultLayer, layerHasResults, reviewTaskForm, taskSummaryRows } from '../../utils/reviewTasks';
import { criteriaScore, fmt, hasResult, rankFromScore, rankOptions, resultInvalid, statusMeta } from '../../utils/selfReview';
import { findMember, findUnit } from '../../utils/org';

const btn =
'inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]';
const btnStyle = { transition: 'background-color 150ms ease-out, transform 120ms ease-out' };

/** Màn LĐ phòng / LĐ đơn vị đánh giá một phiếu: lấy điểm, điều chỉnh, trả lại, gửi đánh giá / phê duyệt */
export function AppraisalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reviews } = useSelfReview();
  const { member } = usePermissions();
  const actions = useReviewActions();
  const review = reviews.find((r) => r.id === id);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [returning, setReturning] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [rank, setRank] = useState<Rank | ''>('');
  const [comment, setComment] = useState('');
  const [tried, setTried] = useState(false);
  const owner = review?.memberId ? findMember(review.memberId) : undefined;
  useBreadcrumbLabel(owner && review ? `${owner.name} · ${review.period}` : undefined);
  const averages = useMemo(() => review ? taskAverages(reviews, review, member) : {}, [reviews, review, member]);

  if (!review || !inAppraisalScope(review, member)) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-lg font-semibold text-gray-900">Không tìm thấy phiếu hoặc phiếu ngoài phạm vi của bạn</p>
        <Link to="/tham-dinh" className="mt-4 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Quay lại danh sách
        </Link>
      </div>);

  }

  const r = review;
  const kind = reviewKind(r);
  const acting = actingLayer(r, member);
  const step = stepOf(r);
  const meta = statusMeta[r.status];
  const isLeaderReview = kind === 'ldch';
  const viewLayer: ResultLayer = acting ?? (r.unitResults ? 'unit' : r.deptResults ? 'dept' : 'self');
  const actingMarks = acting === 'dept' ? r.deptMarks : acting === 'unit' ? r.unitMarks : undefined;
  const pulled = acting ? Boolean(actingMarks) || layerHasResults(r, acting) : false;

  const taskScore = (layer: ResultLayer) => layer === 'self' || layerHasResults(r, layer) ? reviewTaskForm(r, layer, kind, owner).score : null;
  const layerTotalOf = (layer: ResultLayer) => {
    const marks = layer === 'self' ? r.marks : layer === 'dept' ? r.deptMarks : r.unitMarks;
    const t = taskScore(layer);
    if (!marks && t === null) return null;
    return criteriaScore(r.sections, marks ?? {}) + (t ?? 0);
  };

  const criteriaLayers: CriteriaLayer[] = [
  { key: 'self', label: 'Tự đánh giá', marks: r.marks },
  ...(!isLeaderReview ? [{ key: 'dept', label: 'LĐ phòng đánh giá', marks: r.deptMarks, editable: acting === 'dept' }] : []),
  ...(step === 'unit' || step === 'done' || r.unitMarks ? [{ key: 'unit', label: 'LĐ đơn vị đánh giá', marks: r.unitMarks, editable: acting === 'unit' }] : [])];

  const taskColumns = [
  { label: 'Tự đánh giá', value: taskScore('self') },
  ...(!isLeaderReview ? [{ label: 'LĐ phòng', value: taskScore('dept'), accent: acting === 'dept' }] : []),
  ...(criteriaLayers.some((l) => l.key === 'unit') ? [{ label: 'LĐ đơn vị', value: taskScore('unit'), accent: acting === 'unit' }] : [])];


  const missingCriteria = acting ? r.sections.flatMap((s) => s.criteria).filter((c) => !actingMarks?.[c.id]).length : 0;
  const actingResults = acting === 'dept' ? r.deptResults : r.unitResults;
  const missingTasks = acting ? r.tasks.filter((t) => !actingResults?.[t.id] || !hasResult(actingResults[t.id]) || resultInvalid(actingResults[t.id])).length : 0;
  const ready = missingCriteria === 0 && missingTasks === 0;
  const currentTotal = acting ? layerTotalOf(acting) : null;
  const leaders = member ? unitLeadersAbove(member.unitId) : [];

  const proceed = () => {
    setTried(true);
    if (!ready) return;
    if (acting === 'dept') setForwarding(true);else
    if (acting === 'unit') {
      if (!rank) return;
      actions.approve(r, rank, comment.trim());
      navigate('/tham-dinh');
    }
  };

  return (
    <div className="pb-4">
      <div className="flex flex-wrap items-center justify-end gap-3 border-b border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={() => setFlowOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'background-color 150ms ease-out' }}>
          
          <HistoryIcon className="h-4 w-4" aria-hidden />
          Tiến độ xử lý
        </button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-200 px-4 py-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {owner?.rank} {owner?.name}
          </h1>
          <p className="mt-0.5 text-[14px] text-gray-600">
            {owner?.position} · {owner ? findUnit(owner.unitId)?.name : ''} · {r.period}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-gray-600">
            <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
            <span>{r.template}</span>
            {r.deptBy && <span>· LĐ phòng: {r.deptBy}</span>}
          </div>
        </div>
        <dl className="flex flex-wrap gap-x-8 gap-y-3">
          {[
          { label: 'Tự đánh giá', v: layerTotalOf('self') },
          ...(!isLeaderReview ? [{ label: 'LĐ phòng', v: layerTotalOf('dept') }] : []),
          { label: 'LĐ đơn vị', v: layerTotalOf('unit') }].
          map((s) =>
          <div key={s.label}>
              <dt className="text-xs text-gray-500">{s.label}</dt>
              <dd className="mt-0.5 tabular-nums">
                <span className={`text-lg font-semibold ${s.v === null ? 'text-gray-300' : 'text-gray-900'}`}>{s.v === null ? '—' : fmt(s.v)}</span>
                <span className="text-[13px] text-gray-400">/100</span>
              </dd>
            </div>
          )}
          {r.appraisal &&
          <div>
              <dt className="text-xs text-gray-500">Xếp loại</dt>
              <dd className="mt-1">
                <RankBadge rank={r.appraisal.rank} />
              </dd>
            </div>
          }
        </dl>
      </div>

      {acting && !pulled &&
      <div role="status" className="mx-4 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-[14px] text-brand-700">
          <p>
            Bấm <strong className="font-semibold">Lấy điểm</strong> để điền {acting === 'dept' ? 'điểm tự đánh giá' : 'điểm của lãnh đạo phòng'} làm dữ liệu ban đầu, rồi điều chỉnh khi có căn cứ.
          </p>
          <button type="button" onClick={() => actions.pullScores(r, acting)} className={`${btn} bg-brand-600 text-white hover:bg-brand-700`} style={btnStyle}>
            <DownloadIcon className="h-4 w-4" aria-hidden />
            Lấy điểm
          </button>
        </div>
      }

      <div className="space-y-8 px-4 py-5">
        <CollapsibleGroup
          title="I. Nhóm tiêu chí chung"
          max={30}
          columns={criteriaLayers.map((l) => ({ label: l.label, value: l.marks ? criteriaScore(r.sections, l.marks) : null, accent: l.editable }))}
          alert={tried && missingCriteria > 0 ? `Còn ${missingCriteria} tiêu chí chưa đánh giá` : undefined}
          forceOpen={tried && missingCriteria > 0}>
          
          <LayerCriteriaTable sections={r.sections} layers={criteriaLayers} notes={r.notes} onMark={acting ? (cid, m) => actions.setMark(r, acting, cid, m) : undefined} />
        </CollapsibleGroup>

        <TaskGroupSummary
          columns={taskColumns}
          rows={taskSummaryRows(r, viewLayer, kind, owner)}
          missing={tried ? missingTasks : 0}
          onOpen={() => setTasksOpen(true)} />
        

        {(r.qtyChanges?.length ?? 0) > 0 &&
        <section aria-labelledby="ap-qty" className="space-y-2">
            <h2 id="ap-qty" className="text-[15px] font-semibold text-gray-900">
              Lịch sử giao lại số lượng
            </h2>
            <ul className="divide-y divide-gray-100 rounded-md border border-gray-200 text-[14px]">
              {r.qtyChanges!.map((c, i) =>
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
                  <span className="text-gray-900">
                    {c.taskName}: <span className="tabular-nums">{c.before}</span> → <span className="font-semibold tabular-nums">{c.after}</span>
                    <span className="ml-2 text-[13px] text-gray-500">{c.reason}</span>
                  </span>
                  <span className="text-[12px] text-gray-500">
                    {c.by} · {c.at}
                  </span>
                </li>
            )}
            </ul>
          </section>
        }

        <section aria-labelledby="ap-rank" className="space-y-2">
          <h2 id="ap-rank" className="text-[15px] font-semibold text-gray-900">
            Đề xuất xếp loại
          </h2>
          <p className="text-[14px] text-gray-700">
            Cán bộ tự đề xuất: {r.proposedRank ? <RankBadge rank={r.proposedRank} /> : <span className="text-gray-400">chưa đề xuất</span>}
            {r.objectiveReason && <span className="ml-2 text-[13px] text-gray-500">Lý do khách quan: {r.objectiveReason}</span>}
          </p>
          {acting === 'unit' &&
          <div className="grid max-w-3xl gap-3 pt-2 sm:grid-cols-[240px_1fr]">
              <div>
                <label htmlFor="ap-rank-select" className="text-[13px] font-medium text-gray-700">
                  Mức xếp loại phê duyệt <span className="text-brand-600">*</span>
                </label>
                <Select id="ap-rank-select" value={rank} onChange={(v) => setRank(v as Rank)} wrapperClassName="mt-1">
                  <option value="">Chọn mức</option>
                  {rankOptions.map((o) =>
                <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                )}
                </Select>
                {currentTotal !== null && <p className="mt-1 text-[12px] text-gray-500">Gợi ý theo điểm {fmt(currentTotal)}: {rankOptions.find((o) => o.value === rankFromScore(currentTotal))?.label}</p>}
                {tried && !rank && <p className="mt-1 text-[13px] font-medium text-brand-600">Chọn mức xếp loại</p>}
              </div>
              <div>
                <label htmlFor="ap-comment" className="text-[13px] font-medium text-gray-700">
                  Nhận xét
                </label>
                <textarea
                id="ap-comment"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              
              </div>
            </div>
          }
        </section>
      </div>

      {acting &&
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3">
          <p className="text-[13px] text-gray-500">
            {tried && !ready ?
          <span className="font-medium text-brand-600" role="alert">
                Còn {[missingCriteria && `${missingCriteria} tiêu chí`, missingTasks && `${missingTasks} nhiệm vụ`].filter(Boolean).join(', ')} chưa đánh giá.
              </span> :
          acting === 'dept' ?
          'Điều chỉnh điểm khi có căn cứ; gửi lãnh đạo đơn vị để phê duyệt.' :

          'Kết quả phê duyệt là kết quả cuối cùng, phiếu sẽ được khoá.'
          }
          </p>
          <div className="flex items-center gap-2">
            {pulled &&
          <button type="button" onClick={() => actions.pullScores(r, acting)} className={`${btn} text-gray-700 hover:bg-gray-100`} style={btnStyle}>
                <DownloadIcon className="h-4 w-4" aria-hidden />
                Lấy lại điểm
              </button>
          }
            <button type="button" onClick={() => setReturning(true)} className={`${btn} border border-gray-300 text-gray-800 hover:bg-gray-50`} style={btnStyle}>
              <Undo2Icon className="h-4 w-4" aria-hidden />
              Trả lại
            </button>
            <button type="button" onClick={proceed} className={`${btn} bg-brand-600 text-white hover:bg-brand-700`} style={btnStyle}>
              {acting === 'dept' ? <SendIcon className="h-4 w-4" aria-hidden /> : <CheckIcon className="h-4 w-4" aria-hidden />}
              {acting === 'dept' ? 'Gửi đánh giá' : 'Phê duyệt'}
            </button>
          </div>
        </div>
      }

      <TaskReviewDialog
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        review={r}
        kind={kind}
        subject={owner}
        layer={viewLayer}
        editable={Boolean(acting)}
        canAdjustQty={Boolean(acting)}
        averages={averages}
        showErrors={tried}
        onResult={acting ? (tid, res) => actions.setResult(r, acting, tid, res) : undefined}
        onAdjustQty={(task, after, reason, eff) => actions.adjustQty(r, task, after, reason, eff)} />
      
      <FlowDialog open={flowOpen} onClose={() => setFlowOpen(false)} review={r} owner={owner} />
      <ReasonDialog
        open={returning}
        title="Trả lại phiếu tự đánh giá"
        description={`Phiếu được trả về cho ${owner?.name ?? 'cán bộ'} để bổ sung. Lý do được gửi kèm thông báo và lưu vào tiến độ xử lý.`}
        reasonLabel="Lý do trả lại"
        confirmLabel="Trả lại"
        onClose={() => setReturning(false)}
        onConfirm={(reason) => {
          actions.returnReview(r, reason);
          setReturning(false);
          navigate('/tham-dinh');
        }} />
      
      <ReasonDialog
        open={forwarding}
        title="Gửi lãnh đạo đơn vị đánh giá"
        description="Chọn lãnh đạo đơn vị nhận kết quả thẩm định."
        reasonLabel="Nội dung"
        reasonRequired={false}
        approvers={leaders.map((l) => ({ id: l.id, name: `${l.position} – ${l.name}` }))}
        confirmLabel="Gửi"
        onClose={() => setForwarding(false)}
        onConfirm={(content, leaderId) => {
          if (leaderId) actions.forward(r, leaderId, content);
          setForwarding(false);
          navigate('/tham-dinh');
        }} />
      
    </div>);

}