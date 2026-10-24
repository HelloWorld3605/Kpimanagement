import { ReviewStep, SelfReview } from '../types/selfReview';
import { ScoresheetKind } from '../types/scoresheet';
import { UnitMember } from '../types/org';
import { descendantIds, findMember, findUnit, leadersOf } from './org';

/**
 * Luồng phiếu đánh giá:
 *  - Cán bộ không giữ chức vụ: ① Tự đánh giá → ② LĐ phòng đánh giá → ③ LĐ đơn vị đánh giá → ④ Hoàn thành
 *  - Lãnh đạo phòng: ① Tự đánh giá → ③ LĐ đơn vị đánh giá → ④ Hoàn thành
 */
export const reviewSteps: {id: ReviewStep;label: string;}[] = [
{ id: 'self', label: 'Tự đánh giá' },
{ id: 'dept', label: 'LĐ phòng đánh giá' },
{ id: 'unit', label: 'LĐ đơn vị đánh giá' },
{ id: 'done', label: 'Hoàn thành' }];


export function stepOf(r: SelfReview): ReviewStep {
  if (r.step) return r.step;
  if (r.status === 'draft' || r.status === 'returned') return 'self';
  if (r.status === 'submitted') return 'dept';
  return 'done';
}

/** Mẫu bảng nhiệm vụ theo vai trò: lãnh đạo, chỉ huy → CĐKPI-LĐCH; còn lại → CĐKPI-CN */
export const kindForMember = (m?: UnitMember): ScoresheetKind => m && m.role !== 'can-bo' ? 'ldch' : 'cn';
export const reviewKind = (r: SelfReview, viewer?: UnitMember): ScoresheetKind => r.kind ?? kindForMember(r.memberId ? findMember(r.memberId) : viewer);

/** Chủ phiếu (phiếu mẫu không gắn chủ thuộc về tài khoản đang đăng nhập) */
export const ownerOf = (r: SelfReview, viewer?: UnitMember) => r.memberId ? findMember(r.memberId) : viewer;

/** Phiếu của chính mình: gắn đúng mình, hoặc phiếu mẫu chưa gắn chủ */
export const isOwnReview = (r: SelfReview, memberId?: string) => !r.memberId || r.memberId === memberId;

/** Lãnh đạo đơn vị cấp trên của một đơn vị — người nhận khi lãnh đạo phòng trình */
export function unitLeadersAbove(unitId: string) {
  const parent = findUnit(unitId)?.parentId;
  return parent ? leadersOf(parent) : [];
}

/** Người xử lý tiếp theo khi chủ phiếu gửi: cán bộ → lãnh đạo đơn vị mình; lãnh đạo → lãnh đạo cấp trên */
export function firstHandler(owner?: UnitMember) {
  if (!owner) return undefined;
  if (owner.role === 'can-bo') return leadersOf(owner.unitId)[0] ?? unitLeadersAbove(owner.unitId)[0];
  return unitLeadersAbove(owner.unitId)[0];
}

export const memberLabel = (m?: UnitMember) => m ? `${m.position} – ${m.name}` : '—';
export const unitLabel = (m?: UnitMember) => m ? findUnit(m.unitId)?.name ?? '' : '';

/** dd/mm/yyyy hh:mm:ss */
export function stamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* ---------- Số công việc bình quân mỗi người ---------- */

export type TaskAverage = {total: number;people: number;avg: number;};

/**
 * Số công việc bình quân mỗi người = Tổng số công việc của phòng / Số người thực hiện,
 * tính theo từng mã nhiệm vụ trong cùng kỳ, trong phạm vi đơn vị trực tiếp quản lý chủ phiếu.
 * Chỉ là gợi ý về khối lượng để đảm bảo công bằng — không tham gia tính điểm.
 */
export function taskAverages(reviews: SelfReview[], review: SelfReview, viewer?: UnitMember): Record<string, TaskAverage> {
  const owner = ownerOf(review, viewer);
  if (!owner) return {};
  const scopeRoot = findUnit(owner.unitId)?.parentId ?? owner.unitId;
  const scope = new Set(descendantIds(scopeRoot));
  const peers = reviews.filter((r) => {
    if (r.period !== review.period) return false;
    const m = ownerOf(r, viewer);
    return Boolean(m && scope.has(m.unitId));
  });
  const out: Record<string, TaskAverage> = {};
  peers.forEach((r) =>
  r.tasks.forEach((t) => {
    const cur = out[t.code] ?? { total: 0, people: 0, avg: 0 };
    cur.total += t.qty;
    cur.people += 1;
    out[t.code] = cur;
  })
  );
  Object.values(out).forEach((v) => v.avg = v.people ? v.total / v.people : 0);
  return out;
}