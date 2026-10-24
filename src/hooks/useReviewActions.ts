import { toast } from 'sonner';
import { useSelfReview } from '../contexts/SelfReviewContext';
import { useNotifications } from '../contexts/NotificationContext';
import { usePermissions } from './usePermissions';
import { Mark, Rank, ReviewTask, SelfReview, TaskResult } from '../types/selfReview';
import { UnitMember } from '../types/org';
import { findMember, findUnit } from '../utils/org';
import { firstHandler, kindForMember, ownerOf, stamp } from '../utils/reviewFlow';
import { leaderD } from '../utils/reviewTasks';
import { TODAY } from '../utils/catalog';

const unitName = (m?: UnitMember) => m ? findUnit(m.unitId)?.name ?? '' : '';
const who = (m?: UnitMember) => m ? `${m.position} – ${m.name}` : 'Quản trị hệ thống';
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});

/** Thao tác nghiệp vụ trên phiếu: gửi, lấy điểm, trả lại, trình lãnh đạo đơn vị, duyệt, giao lại số lượng */
export function useReviewActions() {
  const { updateReview } = useSelfReview();
  const { member } = usePermissions();
  const { push } = useNotifications();
  const me = member;

  /** Cán bộ gửi phiếu: cán bộ → LĐ phòng; lãnh đạo → LĐ đơn vị */
  const submit = (r: SelfReview) => {
    const owner = ownerOf(r, me);
    const next = firstHandler(owner);
    const toUnit = owner?.role !== 'can-bo';
    updateReview(r.id, (x) => ({
      ...x,
      memberId: x.memberId ?? me?.id,
      kind: x.kind ?? kindForMember(owner),
      status: 'submitted',
      step: toUnit ? 'unit' : 'dept',
      submittedAt: TODAY,
      submittedTo: toUnit ? next?.id : undefined,
      returnReason: undefined,
      dValue: toUnit ? leaderD(owner)?.value : undefined,
      flow: [...(x.flow ?? []), { at: stamp(), by: who(owner), byUnit: unitName(owner), next: who(next), nextUnit: unitName(next), action: x.status === 'returned' ? 'Gửi lại kết quả tự đánh giá' : 'Gửi kết quả tự đánh giá' }]
    }));
    push({ category: 'review', title: `Phiếu tự đánh giá ${r.period} chờ đánh giá`, body: `${owner?.name ?? 'Cán bộ'} đã gửi phiếu tự đánh giá.`, link: '/tham-dinh' });
    toast.success(`Đã gửi phiếu ${r.period} cho ${next?.name ?? 'lãnh đạo'}`);
  };

  /** "Lấy điểm": điền điểm của lớp trước vào cột của mình làm dữ liệu ban đầu */
  const pullScores = (r: SelfReview, layer: 'dept' | 'unit') => {
    const marks = layer === 'dept' ? r.marks : r.deptMarks ?? r.marks;
    const results: Record<string, TaskResult> =
    layer === 'dept' || !r.deptResults ?
    Object.fromEntries(r.tasks.map((t) => [t.id, { done: t.done, quality: t.quality, progress: t.progress }])) :
    r.deptResults;
    updateReview(r.id, (x) => layer === 'dept' ? { ...x, deptMarks: { ...marks }, deptResults: results } : { ...x, unitMarks: { ...marks }, unitResults: results });
    toast.success(layer === 'dept' ? 'Đã lấy điểm tự đánh giá — rà soát và điều chỉnh khi có căn cứ' : 'Đã lấy điểm của lãnh đạo phòng');
  };

  const setMark = (r: SelfReview, layer: 'dept' | 'unit', id: string, mark: Mark) =>
  updateReview(r.id, (x) => layer === 'dept' ? { ...x, deptMarks: { ...x.deptMarks, [id]: mark } } : { ...x, unitMarks: { ...x.unitMarks, [id]: mark } });

  const setResult = (r: SelfReview, layer: 'dept' | 'unit', taskId: string, res: TaskResult) =>
  updateReview(r.id, (x) => layer === 'dept' ? { ...x, deptResults: { ...x.deptResults, [taskId]: res } } : { ...x, unitResults: { ...x.unitResults, [taskId]: res } });

  /** Trả lại cho cán bộ bổ sung — bắt buộc lý do, lưu lịch sử, thông báo cho chủ phiếu */
  const returnReview = (r: SelfReview, reason: string) => {
    const owner = ownerOf(r, me);
    updateReview(r.id, (x) => ({
      ...x,
      status: 'returned',
      step: 'self',
      returnReason: reason,
      submittedTo: undefined,
      flow: [...(x.flow ?? []), { at: stamp(), by: who(me), byUnit: unitName(me), next: who(owner), nextUnit: unitName(owner), action: 'Trả lại phiếu tự đánh giá', content: reason }]
    }));
    push({ category: 'review', title: `Phiếu ${r.period} bị trả lại`, body: reason, link: `/tu-danh-gia/${r.id}` });
    toast.success(`Đã trả lại phiếu cho ${owner?.name ?? 'cán bộ'}`);
  };

  /** LĐ phòng trình kết quả thẩm định lên lãnh đạo đơn vị được chọn */
  const forward = (r: SelfReview, leaderId: string, content: string) => {
    const leader = findMember(leaderId);
    updateReview(r.id, (x) => ({
      ...x,
      step: 'unit',
      submittedTo: leaderId,
      deptBy: me?.name,
      flow: [...(x.flow ?? []), { at: stamp(), by: who(me), byUnit: unitName(me), next: who(leader), nextUnit: unitName(leader), action: 'Gửi kết quả thẩm định', content: content || undefined }]
    }));
    push({ category: 'review', title: `Phiếu ${r.period} chờ lãnh đạo đơn vị đánh giá`, body: `${me?.name ?? ''} trình kết quả thẩm định.`, link: `/tham-dinh/${r.id}` });
    toast.success(`Đã trình ${leader?.name ?? 'lãnh đạo đơn vị'}`);
  };

  /** LĐ đơn vị duyệt: chốt kết quả cuối, khoá phiếu */
  const approve = (r: SelfReview, rank: Rank, comment: string) => {
    const marks = (r.unitMarks ?? r.deptMarks ?? r.marks) as Record<string, Mark>;
    const results = r.unitResults ?? r.deptResults;
    const unchanged = same(marks, r.marks) && (!results || r.tasks.every((t) => same(results[t.id], { done: t.done, quality: t.quality, progress: t.progress })));
    updateReview(r.id, (x) => ({
      ...x,
      step: 'done',
      status: unchanged ? 'accepted' : 'rescored',
      appraisal: { decision: unchanged ? 'accepted' : 'rescored', by: who(me), at: TODAY, comment: comment || undefined, marks, results, rank },
      flow: [...(x.flow ?? []), { at: stamp(), by: who(me), byUnit: unitName(me), action: 'Phê duyệt kết quả đánh giá', content: comment || undefined }]
    }));
    push({ category: 'review', title: `Phiếu ${r.period} đã được phê duyệt`, body: `Kết quả cuối do ${me?.name ?? 'lãnh đạo đơn vị'} phê duyệt.`, link: `/tu-danh-gia/${r.id}` });
    toast.success('Đã phê duyệt — phiếu được khoá');
  };

  /** Giao lại số lượng: lưu trước / sau, người, thời điểm, lý do; điểm tính lại theo số mới */
  const adjustQty = (r: SelfReview, task: ReviewTask, after: number, reason: string, effectiveFrom: string) => {
    const clamp = (res?: TaskResult) => res && res.done !== null && res.done > after ? { ...res, done: after } : res;
    updateReview(r.id, (x) => ({
      ...x,
      tasks: x.tasks.map((t) => t.id === task.id ? { ...t, qty: after, ...(t.done !== null && t.done > after ? { done: after } : {}) } : t),
      deptResults: x.deptResults && x.deptResults[task.id] ? { ...x.deptResults, [task.id]: clamp(x.deptResults[task.id])! } : x.deptResults,
      unitResults: x.unitResults && x.unitResults[task.id] ? { ...x.unitResults, [task.id]: clamp(x.unitResults[task.id])! } : x.unitResults,
      qtyChanges: [...(x.qtyChanges ?? []), { taskId: task.id, taskName: task.name, before: task.qty, after, by: who(me), at: stamp(), reason, effectiveFrom }],
      flow: [...(x.flow ?? []), { at: stamp(), by: who(me), byUnit: unitName(me), action: 'Giao lại số lượng nhiệm vụ', content: `${task.name}: ${task.qty} → ${after}. ${reason}` }]
    }));
    toast.success(`Đã đổi số lượng giao từ ${task.qty} thành ${after}`);
  };

  return { submit, pullScores, setMark, setResult, returnReview, forward, approve, adjustQty };
}