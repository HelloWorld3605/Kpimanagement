import { SelfReview } from '../types/selfReview';
import { KpiTask } from '../types/work';
import { UnitMember } from '../types/org';
import { finalTotal, selfTotal } from './selfReview';
import { isOwnReview, reviewKind } from './reviewFlow';
import { reviewTaskForm } from './reviewTasks';
import { isOverdue } from './work';
import { pendingCount } from './taskTracking';

/** dd/mm/yyyy → yyyy-mm-dd để sắp xếp */
const sortKey = (d: string) => d.split('/').reverse().join('-');

export function ownReviews(reviews: SelfReview[], member?: UnitMember) {
  return reviews.filter((r) => isOwnReview(r, member?.id)).sort((a, b) => sortKey(a.createdAt).localeCompare(sortKey(b.createdAt)));
}

/** Điểm theo kỳ: tự chấm và kết quả cuối (nếu đã có) */
export const scoreTrend = (reviews: SelfReview[]) =>
reviews.map((r) => ({ period: r.period, self: r.status === 'draft' ? null : Math.round(selfTotal(r) * 100) / 100, final: finalTotal(r) }));

/** Ba chỉ số hiệu suất A · B · C (%) của phiếu gần nhất — lấy theo lớp kết quả cuối cùng hiện có */
export function performance(r: SelfReview | undefined, member?: UnitMember) {
  if (!r) return null;
  const layer = r.unitResults ? 'unit' : r.deptResults ? 'dept' : 'self';
  const { form } = reviewTaskForm(r, layer, reviewKind(r, member), member);
  return { a: form.idx.a * 100, b: form.idx.b * 100, c: form.idx.c * 100, kpi: form.kpi };
}

export function taskStats(tasks: KpiTask[]) {
  const open = tasks.filter((t) => t.status === 'assigned' || t.status === 'in-progress');
  return {
    open: open.length,
    overdue: tasks.filter(isOverdue).length,
    pending: tasks.reduce((s, t) => s + pendingCount(t), 0),
    reported: tasks.filter((t) => t.status === 'reported').length
  };
}