import { ScoresheetData, ScoresheetKind } from '../types/scoresheet';
import { ReviewTask, SelfReview, TaskResult } from '../types/selfReview';
import { UnitMember } from '../types/org';
import { buildScoresheetForm } from './scoresheet';
import { KPI_WEIGHT, dIndex, fullParts, round } from './kpi';
import { hasResult, taskShares } from './selfReview';
import { latestResult, unitMembers } from './org';

/** Lớp kết quả trên bảng nhiệm vụ: cá nhân tự đánh giá, LĐ phòng thẩm định, LĐ đơn vị đánh giá */
export type ResultLayer = 'self' | 'dept' | 'unit';

export const emptyResult: TaskResult = { done: null, quality: [], progress: [] };

export function resultFor(r: SelfReview, t: ReviewTask, layer: ResultLayer): TaskResult {
  if (layer === 'self') return t;
  if (layer === 'dept') return r.deptResults?.[t.id] ?? emptyResult;
  return r.unitResults?.[t.id] ?? emptyResult;
}

export const layerHasResults = (r: SelfReview, layer: ResultLayer) =>
layer === 'self' ? r.tasks.some(hasResult) : Object.values((layer === 'dept' ? r.deptResults : r.unitResults) ?? {}).some(hasResult);

/** Chỉ số D của lãnh đạo, chỉ huy: tập thể, cá nhân trong phạm vi quản lý đạt "Hoàn thành nhiệm vụ" trở lên */
export function leaderD(member?: UnitMember) {
  if (!member || member.role === 'can-bo') return undefined;
  const subjects = unitMembers(member.unitId, true).
  filter((m) => m.id !== member.id).
  map((m) => ({ id: m.id, name: m.name, kpi: latestResult(m)?.kpi ?? 0, completionRate: 1 }));
  return subjects.length ? dIndex(subjects) : undefined;
}

/**
 * Bảng nhiệm vụ của phiếu theo đúng mẫu CĐKPI của vai trò (CN / LĐCH), dùng chung bộ dựng
 * của Bảng điểm KPI để cột, công thức và file xuất giống hệt mẫu.
 * Phần nhiệm vụ chính thức = KPI × 0,7.
 */
export function reviewTaskForm(r: SelfReview, layer: ResultLayer, kind: ScoresheetKind, subject?: UnitMember) {
  const d = kind === 'ldch' ? leaderD(subject) : undefined;
  const data: ScoresheetData = {
    kind,
    tasks: r.tasks.map((t) => {
      const res = resultFor(r, t, layer);
      const done = hasResult(res) ? res.done as number : 0;
      return { id: t.id, name: t.name, product: t.product, point: t.point, qty: t.qty, done, quality: fullParts(res.quality, done), progress: fullParts(res.progress, done), note: t.note };
    }),
    dTotal: d?.rows.length,
    dDone: d?.rows.filter((x) => x.counted).length
  };
  const form = buildScoresheetForm(data, { unitId: subject?.unitId ?? 'btl', member: subject });
  return { form, d, score: Math.min(70, round(form.kpi * KPI_WEIGHT, 2)) };
}

export type TaskSummaryRow = {
  id: string;
  code: string;
  name: string;
  product: string;
  qty: number;
  done: number | null;
  /** Mục tiêu, nhiệm vụ đề ra */
  target: string;
  /** Kết quả nhiệm vụ thực tế (cán bộ ghi) */
  actual: string;
  note: string;
  /** Hiệu suất (%) theo chất lượng, tiến độ = (A+B+C)/3M × 100 */
  efficiency: number | null;
  /** Điểm tối đa: 70 điểm chia theo tỷ trọng M */
  max: number;
  /** Điểm đạt được = Hiệu suất × Điểm tối đa */
  points: number | null;
};

/** Danh sách nhiệm vụ rút gọn hiển thị khi mở rộng nhóm tiêu chí II — chỉ đọc, lấy từ kết quả nhập trong pop up */
export function taskSummaryRows(r: SelfReview, layer: ResultLayer, kind: ScoresheetKind, subject?: UnitMember): TaskSummaryRow[] {
  const { form } = reviewTaskForm(r, layer, kind, subject);
  const shares = taskShares(r.tasks);
  return r.tasks.map((t, i) => {
    const res = resultFor(r, t, layer);
    const row = form.rows[i];
    const entered = hasResult(res);
    const efficiency = entered && row.m ? round((row.a + row.b + row.c) / (3 * row.m) * 100, 2) : null;
    const max = shares[t.id] ?? 0;
    return {
      id: t.id,
      code: t.code,
      name: t.name,
      product: t.product,
      qty: t.qty,
      done: entered ? res.done as number : null,
      target: t.target,
      actual: t.actual,
      note: t.note,
      efficiency,
      max,
      points: efficiency === null ? null : round(efficiency / 100 * max, 2)
    };
  });
}

/** Tỷ lệ nhiệm vụ có sản phẩm được khai vượt mức / vượt tiến độ — chỉ để xem xét, không tự xếp loại */
export function overShare(r: SelfReview, layer: ResultLayer) {
  if (!r.tasks.length) return { count: 0, pct: 0 };
  const count = r.tasks.filter((t) => {
    const res = resultFor(r, t, layer);
    return [...res.quality, ...res.progress].some((p) => p.pct > 100);
  }).length;
  return { count, pct: round(count / r.tasks.length * 100, 2) };
}