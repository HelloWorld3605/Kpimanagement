import { SelfReview } from '../types/selfReview';
import { UnitMember } from '../types/org';
import { descendantIds, findMember, isLeader } from './org';
import { stepOf } from './reviewFlow';

/** Phiếu trong phạm vi lãnh đạo: chủ phiếu thuộc đơn vị mình hoặc trực thuộc; không gồm phiếu của chính mình */
export function inAppraisalScope(r: SelfReview, viewer?: UnitMember) {
  if (!viewer || !r.memberId || r.memberId === viewer.id) return false;
  const owner = findMember(r.memberId);
  return Boolean(owner && descendantIds(viewer.unitId).includes(owner.unitId));
}

/** Lớp người xem được nhập: LĐ phòng thẩm định phiếu cán bộ; LĐ đơn vị đánh giá phiếu được trình cho mình */
export function actingLayer(r: SelfReview, viewer?: UnitMember): 'dept' | 'unit' | null {
  if (!viewer || !isLeader(viewer) || !inAppraisalScope(r, viewer) || r.status !== 'submitted') return null;
  const step = stepOf(r);
  if (step === 'dept') return findMember(r.memberId as string)?.role === 'can-bo' ? 'dept' : null;
  if (step === 'unit') return !r.submittedTo || r.submittedTo === viewer.id ? 'unit' : null;
  return null;
}