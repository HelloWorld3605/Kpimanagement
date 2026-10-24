import { Rank } from '../types/selfReview';
import { PeriodKind } from '../types/work';

/**
 * Điều kiện xếp loại (Công văn 881, K02). Điểm KHÔNG tự quyết định xếp loại:
 * hệ thống chỉ tính các mức được phép chọn và cảnh báo; cấp có thẩm quyền chọn mức cuối cùng.
 */

export const rankOrder: Rank[] = ['excellent', 'good', 'done', 'fail'];

export const rankLabels: Record<Rank, string> = {
  excellent: 'Hoàn thành xuất sắc nhiệm vụ',
  good: 'Hoàn thành tốt nhiệm vụ',
  done: 'Hoàn thành nhiệm vụ',
  fail: 'Không hoàn thành nhiệm vụ'
};

export type RatingSubject = 'individual' | 'collective-head' | 'collective-deputy';

export type EligibilityInput = {
  subject: RatingSubject;
  periodKind: PeriodKind;
  /** Tỷ lệ hoàn thành nhiệm vụ / chỉ tiêu được giao (0..1) */
  completionRate: number;
  /** Ngoại lệ (lý do khách quan, bất khả kháng) đã được cấp có thẩm quyền xác nhận */
  exceptionApproved?: boolean;
  /** Kỳ năm: có quý bị "Không hoàn thành nhiệm vụ" */
  failedQuarterInYear?: boolean;
  /** Số người đã được chọn mức xuất sắc trong đơn vị và giới hạn theo văn bản áp dụng */
  excellentCount?: number;
  excellentCap?: number;
};

export function ratingEligibility(x: EligibilityInput) {
  let allowed = [...rankOrder];
  const warnings: string[] = [];
  const pct = Math.round(x.completionRate * 100);

  if (x.periodKind === 'quarter') {
    if (x.subject === 'individual' && x.completionRate < 1) {
      if (x.exceptionApproved) warnings.push(`Hoàn thành ${pct}% nhiệm vụ — có ngoại lệ đã xác nhận nên vẫn được xét các mức khác.`);else
      {
        allowed = ['fail'];
        warnings.push(`Hoàn thành ${pct}% nhiệm vụ được giao (dưới 100%) — chỉ được chọn "Không hoàn thành nhiệm vụ", trừ ngoại lệ đã xác nhận.`);
      }
    }
    if (x.subject !== 'individual' && x.completionRate < 0.7) {
      if (x.subject === 'collective-head' && !x.exceptionApproved) {
        allowed = ['fail'];
        warnings.push(`Tập thể hoàn thành ${pct}% nhiệm vụ, chỉ tiêu (dưới 70%) — người đứng đầu xếp "Không hoàn thành nhiệm vụ", trừ ngoại lệ.`);
      }
      if (x.subject === 'collective-deputy') {
        allowed = allowed.filter((r) => r !== 'excellent');
        warnings.push('Tập thể dưới 70% — cấp phó xem xét theo lĩnh vực phụ trách, mức độ liên đới; không được xếp xuất sắc.');
      }
    }
  }

  if (x.periodKind === 'year' && x.failedQuarterInYear) {
    allowed = allowed.filter((r) => r !== 'excellent');
    warnings.push('Có quý "Không hoàn thành nhiệm vụ" — không được xếp xuất sắc cả năm. Điều kiện này không làm thay đổi điểm.');
  }

  if (x.excellentCap !== undefined && x.excellentCount !== undefined && x.excellentCount >= x.excellentCap) {
    warnings.push(`Đơn vị đã có ${x.excellentCount}/${x.excellentCap} người được chọn mức xuất sắc — vượt tỷ lệ theo văn bản áp dụng.`);
  }

  return { allowed, warnings };
}

/** Gợi ý theo tổng điểm (mốc 90/70/50) — chỉ để tham khảo, không phải kết quả */
export function suggestRank(total: number): Rank {
  if (total >= 90) return 'excellent';
  if (total >= 70) return 'good';
  if (total >= 50) return 'done';
  return 'fail';
}