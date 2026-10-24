import { Assignee, DailyStatus, KpiPeriod, KpiTask, KpiTaskStatus, PeriodPhase } from '../types/work';
import { descendantIds, findMember, findUnit } from './org';
import { displayDate } from './profile';

export type Tone = 'success' | 'warning' | 'neutral' | 'brand';

export const TODAY_ISO = '2026-10-22';
export const TODAY_LABEL = displayDate(TODAY_ISO);

/** Vượt quá mức này so với trung bình 2 kỳ gần nhất thì cảnh báo giao quá tải */
export const OVERLOAD_RATIO = 1.5;

export const phaseMeta: Record<PeriodPhase, {label: string;tone: Tone;}> = {
  draft: { label: 'Nháp', tone: 'neutral' },
  open: { label: 'Đã mở', tone: 'brand' },
  running: { label: 'Đang thực hiện', tone: 'success' },
  review: { label: 'Đánh giá', tone: 'warning' },
  approval: { label: 'Phê duyệt', tone: 'warning' },
  closed: { label: 'Đã đóng', tone: 'neutral' }
};

export const kpiStatusMeta: Record<KpiTaskStatus, {label: string;tone: Tone;}> = {
  assigned: { label: 'Đã giao', tone: 'neutral' },
  'in-progress': { label: 'Đang thực hiện', tone: 'brand' },
  reported: { label: 'Đã báo cáo', tone: 'success' },
  revoked: { label: 'Đã thu hồi', tone: 'neutral' }
};

export const dailyStatusMeta: Record<DailyStatus, {label: string;tone: Tone;}> = {
  todo: { label: 'Chưa bắt đầu', tone: 'neutral' },
  doing: { label: 'Đang làm', tone: 'brand' },
  review: { label: 'Chờ nghiệm thu', tone: 'warning' },
  returned: { label: 'Bị trả lại', tone: 'brand' },
  done: { label: 'Hoàn thành', tone: 'success' }
};

export const dailyStatusOrder: DailyStatus[] = ['todo', 'doing', 'review', 'returned', 'done'];

/* ---------- Kỳ ---------- */

/** Kỳ còn nhận việc: chưa đóng, chưa khoá kiểm đếm và chưa qua ngày kết thúc kiểm đếm */
export const periodAccepting = (p?: KpiPeriod | null) => Boolean(p && p.phase !== 'closed' && !p.countingLocked && p.end >= TODAY_ISO);

export function periodLockReason(p: KpiPeriod) {
  if (p.phase === 'closed') return 'Kỳ đã đóng — chỉ xem được, không nhận thêm việc.';
  if (p.countingLocked) return 'Kỳ đã khoá kiểm đếm — không nhận thêm việc.';
  if (p.end < TODAY_ISO) return `Kỳ đã kết thúc ngày ${displayDate(p.end)} — chỉ xem được, không nhận thêm việc.`;
  return null;
}

export const periodRange = (p: KpiPeriod) => `${displayDate(p.start)} – ${displayDate(p.end)}`;

export const inPeriod = (iso: string, p: KpiPeriod) => iso >= p.start && iso <= p.end;

/* ---------- Người chủ trì ---------- */

export const assigneeKey = (a: Assignee) => a.kind === 'unit' ? `u:${a.unitId}` : `m:${a.memberId}`;

export function parseAssigneeKey(key: string): Assignee | null {
  const [kind, id] = key.split(':');
  if (!id) return null;
  return kind === 'u' ? { kind: 'unit', unitId: id } : { kind: 'member', memberId: id };
}

export const assigneeUnitId = (a: Assignee) => a.kind === 'unit' ? a.unitId : findMember(a.memberId)?.unitId ?? '';

export function assigneeLabel(a: Assignee) {
  if (a.kind === 'unit') {
    const u = findUnit(a.unitId);
    return { primary: u?.name ?? a.unitId, secondary: 'Đơn vị', isUnit: true };
  }
  const m = findMember(a.memberId);
  const u = m ? findUnit(m.unitId) : undefined;
  return { primary: m?.name ?? a.memberId, secondary: u?.shortName ?? u?.name ?? '', isUnit: false };
}

export const memberName = (id: string) => findMember(id)?.name ?? id;

/** Đơn vị trong phạm vi giao việc của một cán bộ: đơn vị của mình và cấp dưới */
export const scopeUnitIds = (unitId?: string) => unitId ? descendantIds(unitId) : [];

/* ---------- Việc KPI ---------- */

export const taskM = (t: Pick<KpiTask, 'point' | 'qty'>) => t.point * t.qty;

export const isOverdue = (t: KpiTask) => t.deadline < TODAY_ISO && t.status !== 'reported' && t.status !== 'revoked' && t.approved < t.qty;

const isOpenTask = (t: KpiTask) => t.status !== 'reported' && t.status !== 'revoked';

/** Lý do không sửa được nội dung giao; null nếu sửa được */
export function editBlockReason(t: KpiTask, period?: KpiPeriod) {
  if (t.status === 'reported') return 'Việc đã báo cáo kết quả.';
  if (t.status === 'revoked') return 'Việc đã thu hồi.';
  if (t.periodId && !periodAccepting(period)) return 'Kỳ của việc không còn nhận việc.';
  return null;
}

/** Lý do không gán / chuyển / bỏ kỳ được; null nếu được */
export function moveBlockReason(t: KpiTask, period?: KpiPeriod) {
  if (t.status === 'reported') return 'Đã báo cáo kết quả — kết quả gắn với kỳ hiện tại.';
  if (t.status === 'revoked') return 'Việc đã thu hồi.';
  if (t.periodId && !periodAccepting(period)) return 'Kỳ đang ở không còn nhận việc.';
  return null;
}

export const canRemind = (t: KpiTask) => isOpenTask(t) && t.approved < t.qty;

export function nextAdhocCode(tasks: KpiTask[]) {
  const max = tasks.filter((t) => t.source === 'adhoc').reduce((m, t) => Math.max(m, Number(t.code.split('-')[1]) || 0), 0);
  return `PS-${String(max + 1).padStart(2, '0')}`;
}

/**
 * Cảnh báo quá tải: tổng M của người chủ trì trong kỳ (kể cả việc đang giao)
 * so với trung bình 2 kỳ gần nhất trước đó. Không có dữ liệu kỳ trước thì không cảnh báo.
 */
export function overloadInfo(
tasks: KpiTask[],
periods: KpiPeriod[],
assignee: Assignee,
periodId: string,
addM: number,
excludeTaskId?: string)
{
  const key = assigneeKey(assignee);
  const target = periods.find((p) => p.id === periodId);
  if (!target) return null;
  const sumIn = (pid: string) =>
  tasks.
  filter((t) => t.id !== excludeTaskId && t.periodId === pid && t.status !== 'revoked' && assigneeKey(t.assignee) === key).
  reduce((s, t) => s + taskM(t), 0);
  const previous = periods.
  filter((p) => p.end < target.start).
  sort((a, b) => b.start.localeCompare(a.start)).
  slice(0, 2).
  map((p) => sumIn(p.id)).
  filter((m) => m > 0);
  const current = sumIn(periodId) + addM;
  if (previous.length === 0) return { current, average: null, overloaded: false };
  const average = previous.reduce((s, m) => s + m, 0) / previous.length;
  return { current, average, overloaded: current > average * OVERLOAD_RATIO };
}

export const fmtNumber = (n: number) => n.toLocaleString('vi-VN');