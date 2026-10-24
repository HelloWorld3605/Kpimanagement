import { CriteriaSection } from '../types/criteria';
import { Mark, Rank, ReviewStatus, ReviewTask, SelfReview, TaskResult } from '../types/selfReview';
import { KPI_WEIGHT, exceptionCount, fullParts, kpiFromTotals, round, taskScores } from './kpi';

export const CRITERIA_MAX = 30;
export const TASKS_MAX = 70;
export const INCOMPLETE_NOTE = 'Không hoàn thành 100% nhiệm vụ được giao';

export const rankOptions: {value: Rank;label: string;short: string;}[] = [
{ value: 'excellent', label: 'Hoàn thành xuất sắc nhiệm vụ', short: 'Xuất sắc' },
{ value: 'good', label: 'Hoàn thành tốt nhiệm vụ', short: 'Tốt' },
{ value: 'done', label: 'Hoàn thành nhiệm vụ', short: 'Hoàn thành' },
{ value: 'fail', label: 'Không hoàn thành nhiệm vụ', short: 'Không hoàn thành' }];


export const rankShort = (r: Rank) => rankOptions.find((o) => o.value === r)!.short;

export function rankFromScore(total: number): Rank {
  if (total >= 90) return 'excellent';
  if (total >= 70) return 'good';
  if (total >= 50) return 'done';
  return 'fail';
}

export const fmt = (n: number) => n.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
export const fmtIdx = (n: number) => n.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/* ---------- Tiêu chí chung (30 điểm) ---------- */

export const sectionMax = (s: CriteriaSection) => s.criteria.reduce((a, c) => a + c.score, 0);

export function sectionAchieved(s: CriteriaSection, marks: Record<string, Mark | undefined>) {
  return s.criteria.reduce((a, c) => a + (marks[c.id] === 'yes' ? c.score : 0), 0);
}

export const criteriaScore = (sections: CriteriaSection[], marks: Record<string, Mark | undefined>) =>
sections.reduce((a, s) => a + sectionAchieved(s, marks), 0);

/* ---------- Nhóm nhiệm vụ (70 điểm) — KPI × 0,7 theo HD 20 ---------- */

export type Results = Record<string, TaskResult>;

export const resultOf = (t: ReviewTask, override?: Results): TaskResult => override?.[t.id] ?? t;

export const hasResult = (res: TaskResult) => res.done !== null && !Number.isNaN(res.done);

/** Số sản phẩm khai ở mức chất lượng / tiến độ vượt quá số hoàn thành */
export const resultInvalid = (res: TaskResult) =>
hasResult(res) && (exceptionCount(res.quality) > (res.done as number) || exceptionCount(res.progress) > (res.done as number));

export function taskKpi(t: ReviewTask, res: TaskResult = t) {
  const done = hasResult(res) ? res.done as number : 0;
  return taskScores({ point: t.point, qty: t.qty, done, quality: fullParts(res.quality, done), progress: fullParts(res.progress, done) });
}

/** Hiệu suất (%) của nhiệm vụ = (A + B + C) / 3M */
export function taskEfficiency(t: ReviewTask, res: TaskResult = t) {
  const s = taskKpi(t, res);
  return s.m ? round((s.a + s.b + s.c) / (3 * s.m) * 100, 2) : 0;
}

/** Điểm tối đa từng nhiệm vụ: 70 điểm chia theo tỷ trọng M; làm tròn 2 chữ số, tổng đúng bằng 70 */
export function taskShares(tasks: ReviewTask[]): Record<string, number> {
  const total = tasks.reduce((s, t) => s + t.point * t.qty, 0);
  if (!total) return Object.fromEntries(tasks.map((t) => [t.id, 0]));
  const raw = tasks.map((t) => t.point * t.qty / total * TASKS_MAX * 100);
  const floors = raw.map(Math.floor);
  let left = TASKS_MAX * 100 - floors.reduce((s, x) => s + x, 0);
  raw.
  map((x, i) => ({ i, r: x - floors[i] })).
  sort((a, b) => b.r - a.r).
  forEach(({ i }) => {
    if (left > 0) {
      floors[i] += 1;
      left -= 1;
    }
  });
  return Object.fromEntries(tasks.map((t, i) => [t.id, floors[i] / 100]));
}

export const taskPoints = (t: ReviewTask, share: number, res: TaskResult = t) => round(taskEfficiency(t, res) / 100 * share, 2);

export function tasksKpi(tasks: ReviewTask[], override?: Results, d?: number) {
  const totals = tasks.reduce(
    (s, t) => {
      const x = taskKpi(t, resultOf(t, override));
      return { m: s.m + x.m, a: s.a + x.a, b: round(s.b + x.b, 2), c: round(s.c + x.c, 2) };
    },
    { m: 0, a: 0, b: 0, c: 0 }
  );
  const { idx, kpi } = kpiFromTotals(totals, d);
  return { totals, idx, kpi, score: Math.min(TASKS_MAX, round(kpi * KPI_WEIGHT, 2)) };
}

export const tasksScore = (tasks: ReviewTask[], override?: Results, d?: number) => tasksKpi(tasks, override, d).score;

/** Nhiệm vụ chưa hoàn thành đủ số lượng giao (CV 214) */
export const incompleteTasks = (tasks: ReviewTask[], override?: Results) =>
tasks.
map((t, i) => ({ t, i, res: resultOf(t, override) })).
filter(({ t, res }) => hasResult(res) && res.done as number < t.qty);

/** Chưa hoàn thành 100% mà không có lý do khách quan → chỉ được xếp "Không hoàn thành nhiệm vụ" */
export const rankLockedToFail = (r: SelfReview) => incompleteTasks(r.tasks).length > 0 && !r.objectiveReason?.trim();

export const selfTotal = (r: SelfReview) => criteriaScore(r.sections, r.marks) + tasksScore(r.tasks, undefined, r.dValue);

export function finalTotal(r: SelfReview): number | null {
  if (r.status === 'accepted') return selfTotal(r);
  if (r.status === 'rescored' && r.appraisal) {
    return criteriaScore(r.sections, r.appraisal.marks ?? r.marks) + tasksScore(r.tasks, r.appraisal.results, r.dValue);
  }
  return null;
}

/** Tổng điểm theo một lớp đánh giá (LĐ phòng / LĐ đơn vị); null khi lớp đó chưa có điểm */
export function layerTotal(r: SelfReview, layer: 'dept' | 'unit'): number | null {
  const marks = layer === 'dept' ? r.deptMarks : r.unitMarks;
  const results = layer === 'dept' ? r.deptResults : r.unitResults;
  if (!marks && !results) return null;
  return criteriaScore(r.sections, marks ?? {}) + tasksScore(r.tasks, results ?? {}, r.dValue);
}

export function missingItems(r: SelfReview) {
  const criteria = r.sections.flatMap((s) => s.criteria).filter((c) => !r.marks[c.id]).length;
  const tasks = r.tasks.filter((t) => !hasResult(t) || resultInvalid(t)).length;
  const rank = !r.proposedRank;
  const rankRule = !rank && rankLockedToFail(r) && r.proposedRank !== 'fail';
  return { criteria, tasks, rank, rankRule };
}

export const criteriaCount = (r: SelfReview) => r.sections.reduce((a, s) => a + s.criteria.length, 0);

export const statusMeta: Record<ReviewStatus, {label: string;tone: 'warning' | 'brand' | 'success' | 'neutral';}> = {
  draft: { label: 'Nháp · chưa nộp', tone: 'warning' },
  returned: { label: 'Bị trả lại · cần sửa', tone: 'brand' },
  submitted: { label: 'Đã gửi · chờ thẩm định', tone: 'brand' },
  accepted: { label: 'Đã khoá · chấp thuận', tone: 'success' },
  rescored: { label: 'Đã khoá · thẩm định chấm lại', tone: 'neutral' }
};

export const isLocked = (r: SelfReview) => r.status === 'accepted' || r.status === 'rescored';