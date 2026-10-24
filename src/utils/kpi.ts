import { LevelPart } from '../types/scoresheet';

/**
 * Bộ tính điểm KPI theo Hướng dẫn 20 / Hướng dẫn triển khai K02.
 * Ba khái niệm tách bạch, không dùng lẫn tên:
 *  - Chỉ số KPI (thang 100): KPI_CN = (A+B+C)/3×100 · KPI_LĐ = (A+B+C+D)/4×100
 *  - Hiệu suất theo nhiệm vụ: (B+C)/(2M) của TỪNG nhiệm vụ (phụ lục gợi ý quy đổi)
 *  - Điểm nhiệm vụ đóng góp: hiệu suất × điểm tối đa phân bổ; tổng điểm tối đa = 70
 * Phần 70 điểm chính thức = KPI × 0,7. Tổng điểm = E (≤ 30) + KPI × 0,7.
 * Tính với độ chính xác đầy đủ, lưu 3 chữ số, hiển thị 2 chữ số.
 */

export const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;
/** Giá trị lưu: 3 chữ số thập phân */
export const store3 = (n: number) => round(n, 3);
/** Hiển thị: 2 chữ số, dấu phẩy thập phân */
export const fmtScore = (n: number, digits = 2) => n.toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Phần nhiệm vụ = KPI × 0,7 (HD 20) */
export const KPI_WEIGHT = 0.7;
/** Điểm tiêu chí chung tối đa */
export const CRITERIA_MAX = 30;
/** Tổng điểm tối đa phân bổ cho các nhiệm vụ */
export const TASK_PART_MAX = 70;
/** Sản phẩm dưới 50 điểm (Nhóm 1) không áp dụng vượt mức / vượt tiến độ */
export const OVER_MIN_POINT = 50;
export const MAX_PRODUCT_POINT = 100;

/* ---------- Mức chất lượng / tiến độ ---------- */

export type LevelOption = {pct: number;times?: number;label: string;short: string;over?: boolean;};

export const qualityLevels: LevelOption[] = [
{ pct: 120, label: 'Vượt yêu cầu · 120%', short: 'Vượt yêu cầu', over: true },
{ pct: 110, label: 'Vượt yêu cầu · 110%', short: 'Vượt yêu cầu', over: true },
{ pct: 75, times: 1, label: 'Chỉnh sửa 1 lần · 75%', short: 'Sửa 1 lần' },
{ pct: 50, times: 2, label: 'Chỉnh sửa 2–4 lần · 50%', short: 'Sửa 2–4 lần' },
{ pct: 25, times: 5, label: 'Chỉnh sửa 5–6 lần · 25%', short: 'Sửa 5–6 lần' },
{ pct: 0, times: 7, label: 'Chỉnh sửa từ 7 lần · 0%', short: 'Sửa từ 7 lần' }];


export const progressLevels: LevelOption[] = [
{ pct: 120, label: 'Vượt tiến độ · 120%', short: 'Vượt tiến độ', over: true },
{ pct: 110, label: 'Vượt tiến độ · 110%', short: 'Vượt tiến độ', over: true },
{ pct: 75, times: 1, label: 'Bị nhắc 1 lần · 75%', short: 'Nhắc 1 lần' },
{ pct: 50, times: 2, label: 'Bị nhắc 2 lần · 50%', short: 'Nhắc 2 lần' },
{ pct: 25, times: 3, label: 'Bị nhắc 3 lần · 25%', short: 'Nhắc 3 lần' },
{ pct: 0, times: 4, label: 'Bị nhắc từ 4 lần · 0%', short: 'Nhắc từ 4 lần' }];


export const levelsFor = (kind: 'q' | 'p', point: number) =>
(kind === 'q' ? qualityLevels : progressLevels).filter((o) => !o.over || point >= OVER_MIN_POINT);

export const findLevel = (kind: 'q' | 'p', pct: number) => (kind === 'q' ? qualityLevels : progressLevels).find((o) => o.pct === pct);

/** Mức chất lượng theo số lần chỉnh sửa (không tính vượt mức — vượt mức do người thẩm định chọn) */
export function qualityPctFromRevisions(revisions: number) {
  if (revisions <= 0) return 100;
  if (revisions === 1) return 75;
  if (revisions <= 4) return 50;
  if (revisions <= 6) return 25;
  return 0;
}

/** Mức tiến độ theo số lần bị nhắc (không tính vượt tiến độ) */
export function schedulePctFromReminders(reminders: number) {
  if (reminders <= 0) return 100;
  if (reminders === 1) return 75;
  if (reminders === 2) return 50;
  if (reminders === 3) return 25;
  return 0;
}

/** Được xem xét vượt chất lượng: không thuộc Nhóm 1 */
export const overQualityEligible = (baseScore: number) => baseScore >= OVER_MIN_POINT;

/**
 * Được xem xét vượt tiến độ (K02): không thuộc Nhóm 1, thời hạn ≥ 15 ngày,
 * hoàn thành trong ≤ 2/3 thời gian, có sản phẩm, chất lượng được đánh giá đảm bảo.
 * Chỉ đánh dấu "Đủ điều kiện xem xét" — không tự cộng 120%.
 */
export function overScheduleEligibility(t: {baseScore: number;durationDays: number;usedDays: number;hasProduct: boolean;qualityOk: boolean;}) {
  const reasons: string[] = [];
  if (t.baseScore < OVER_MIN_POINT) reasons.push('Thuộc Nhóm 1 (điểm cơ sở dưới 50)');
  if (t.durationDays < 15) reasons.push('Thời hạn thực hiện dưới 15 ngày');
  if (t.usedDays > t.durationDays * 2 / 3) reasons.push('Hoàn thành sau 2/3 thời gian');
  if (!t.hasProduct) reasons.push('Chưa có sản phẩm');
  if (!t.qualityOk) reasons.push('Chất lượng chưa được đánh giá đảm bảo');
  return { eligible: reasons.length === 0, reasons };
}

/* ---------- A, B, C theo điểm công việc ---------- */

export type ScoredTask = {
  /** Điểm cơ sở trong danh mục (1 sản phẩm) */
  baseScore: number;
  /** Số lượng giao theo phiên bản chỉ tiêu */
  assignedQty: number;
  /** Số lượng hoàn thành ĐÃ được xác nhận */
  doneQty: number;
  /** Mức chất lượng sau đánh giá (%) */
  qualityPct: number;
  /** Mức tiến độ sau đánh giá (%) */
  schedulePct: number;
};

/** A, B, C tổng thể: tính theo điểm (điểm cơ sở × số lượng), không theo số đầu việc */
export function abcFromTasks(tasks: ScoredTask[]) {
  const m = tasks.reduce((s, t) => s + t.baseScore * t.assignedQty, 0);
  const done = tasks.reduce((s, t) => s + t.baseScore * Math.min(t.doneQty, t.assignedQty), 0);
  const q = tasks.reduce((s, t) => s + t.baseScore * t.doneQty * t.qualityPct / 100, 0);
  const c = tasks.reduce((s, t) => s + t.baseScore * t.doneQty * t.schedulePct / 100, 0);
  if (!m) return { m: 0, a: 0, b: 0, c: 0 };
  return { m, a: store3(done / m), b: store3(q / m), c: store3(c / m) };
}

/** Chỉ số KPI (thang 100). Có D → mẫu lãnh đạo, chỉ huy (chia 4) */
export function kpiIndex(x: {a: number;b: number;c: number;d?: number;}) {
  const parts = [x.a, x.b, x.c, ...(x.d !== undefined ? [x.d] : [])];
  return store3(parts.reduce((s, v) => s + v, 0) / parts.length * 100);
}

/** Phần nhiệm vụ chính thức (thang 70) = KPI × 0,7 */
export const taskPart = (kpi: number) => round(kpi * KPI_WEIGHT, 4);

/** Tổng điểm thang 100 = E + KPI × 0,7 (G cá nhân, H lãnh đạo, F tập thể) */
export const totalScore = (e: number, kpi: number) => round(Math.min(e, CRITERIA_MAX) + kpi * KPI_WEIGHT, 4);

/* ---------- Hiệu suất theo nhiệm vụ (phân tích, phụ lục gợi ý) ---------- */

/** Hiệu suất nhiệm vụ = (B + C) / (2M), M/B/C là điểm của riêng nhiệm vụ đó */
export const taskEfficiency = (m: number, b: number, c: number) => m ? store3((b + c) / (2 * m)) : 0;

/** Tổng điểm tối đa phân bổ phải đúng 70 — sai thì chặn lưu */
export function validateAllocation(maxPoints: number[]) {
  const sum = round(maxPoints.reduce((s, x) => s + x, 0), 3);
  return { ok: sum === TASK_PART_MAX, sum, error: sum === TASK_PART_MAX ? null : `Tổng điểm tối đa đang là ${fmtScore(sum)}, phải bằng đúng 70.` };
}

/** Điểm đóng góp = hiệu suất × điểm tối đa phân bổ */
export const taskContribution = (efficiency: number, maxPoint: number) => round(efficiency * maxPoint, 3);

/* ---------- D: kết quả lãnh đạo, chỉ đạo ---------- */

export type DSubject = {id: string;name: string;kpi: number;completionRate: number;exceptionApproved?: boolean;};

/**
 * D = số đối tượng trong phạm vi được đánh giá "Hoàn thành nhiệm vụ" trở lên / tổng số đối tượng.
 * Hoàn thành khi KPI ≥ 50 VÀ hoàn thành 100% nhiệm vụ, trừ ngoại lệ đã được cấp có thẩm quyền xác nhận.
 */
export function dIndex(subjects: DSubject[]) {
  const rows = subjects.map((s) => {
    if (s.kpi < 50) return { ...s, counted: false, reason: `KPI ${fmtScore(s.kpi)} dưới 50` };
    if (s.completionRate < 1 && !s.exceptionApproved) return { ...s, counted: false, reason: `Hoàn thành ${Math.round(s.completionRate * 100)}% nhiệm vụ, chưa có ngoại lệ` };
    if (s.completionRate < 1) return { ...s, counted: true, reason: 'Chưa đủ 100% nhưng có ngoại lệ đã xác nhận' };
    return { ...s, counted: true, reason: 'KPI ≥ 50 và hoàn thành 100% nhiệm vụ' };
  });
  const value = rows.length ? store3(rows.filter((r) => r.counted).length / rows.length) : 0;
  return { value, rows };
}

/* ---------- Tương thích với phiếu tự đánh giá hiện tại ---------- */

const partPoints = (parts: LevelPart[], point: number) => parts.reduce((s, p) => s + point * p.count * p.pct / 100, 0);

/** M, A, B, C (điểm) của một nhiệm vụ; parts là đầy đủ các phần (kể cả phần đạt 100%) */
export function taskScores(t: {point: number;qty: number;done: number;quality: LevelPart[];progress: LevelPart[];}) {
  return {
    m: t.point * t.qty,
    a: t.point * t.done,
    b: round(partPoints(t.quality, t.point), 2),
    c: round(partPoints(t.progress, t.point), 2)
  };
}

/** Ghép phần "Đảm bảo" (100%) với các phần ngoại lệ người dùng khai */
export function fullParts(exceptions: LevelPart[], done: number): LevelPart[] {
  const used = exceptions.reduce((s, p) => s + p.count, 0);
  const ok = Math.max(0, done - used);
  return [...(ok ? [{ count: ok, pct: 100 }] : []), ...exceptions.filter((p) => p.count > 0)];
}

export const exceptionCount = (parts: LevelPart[]) => parts.reduce((s, p) => s + p.count, 0);

/** Chỉ số A, B, C (3 chữ số) và Chỉ số KPI (thang 100) từ tổng điểm M, A, B, C */
export function kpiFromTotals(t: {m: number;a: number;b: number;c: number;}, d?: number) {
  const ratio = (x: number) => t.m ? store3(x / t.m) : 0;
  const idx = { a: ratio(t.a), b: ratio(t.b), c: ratio(t.c) };
  return { idx, kpi: round(kpiIndex({ ...idx, d }), 2) };
}