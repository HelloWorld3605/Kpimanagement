import { UnitMember } from '../types/org';
import { latestResult } from './org';

export type SubordinateReviewState = 'draft' | 'submitted' | 'deferred';

export type SubordinateReview = {
  member: UnitMember;
  state: SubordinateReviewState;
  /** Tổng tự chấm — chỉ có khi đã gửi */
  selfScore?: number;
};

export const subordinateStateMeta: Record<SubordinateReviewState, {label: string;tone: 'warning' | 'brand' | 'neutral';}> = {
  draft: { label: 'Nháp · chưa nộp', tone: 'warning' },
  submitted: { label: 'Đã gửi · chờ thẩm định', tone: 'brand' },
  deferred: { label: 'Chưa đánh giá · chuyển quý sau', tone: 'neutral' }
};

/** Trạng thái phiếu kỳ hiện tại của cán bộ (dữ liệu mẫu, suy ra ổn định từ số hiệu) */
export function subordinateReview(member: UnitMember): SubordinateReview {
  if (member.status === 'training' || member.status === 'leave') return { member, state: 'deferred' };
  const seed = Number(member.code.replace(/\D/g, '')) % 3;
  if (seed === 0) return { member, state: 'draft' };
  const base = latestResult(member)?.kpi ?? 75;
  return { member, state: 'submitted', selfScore: Math.min(100, Math.round((base + (seed === 1 ? 1.5 : -0.8)) * 10) / 10) };
}