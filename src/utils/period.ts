import { DeadlineRule, DossierType, KpiPeriod, PeriodKind, RuleStatus } from '../types/work';
import { findMember, findUnit, unitPath } from './org';
import { displayDate } from './profile';

/**
 * Kỳ KPI theo Hướng dẫn K02 — kỳ kiểm đếm 15 → 14:
 *  - Tháng: từ ngày 15 tháng trước đến hết ngày 14 tháng đánh giá
 *  - Quý: từ ngày 15 tháng cuối quý trước đến hết ngày 14 tháng cuối quý
 *  - Năm: nhập tay, "Cần xác nhận nghiệp vụ" cho đến khi có căn cứ
 * Ba loại kỳ độc lập; không tự ghép kỳ quý / năm từ các tháng.
 */

export const ROMAN = ['I', 'II', 'III', 'IV'];
export const periodKinds: PeriodKind[] = ['month', 'quarter', 'year'];
export const periodKindLabels: Record<PeriodKind, string> = { month: 'Tháng', quarter: 'Quý', year: 'Năm' };

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** Tháng trước của (y, m) */
const prevMonth = (y: number, m: number) => m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };

/** Khoảng kiểm đếm tự sinh; kỳ năm trả về null (nhập tay) */
export function countingRange(kind: PeriodKind, year: number, index: number): {start: string;end: string;} | null {
  if (kind === 'year') return null;
  const lastMonth = kind === 'month' ? index : index * 3;
  const span = kind === 'month' ? 1 : 3;
  let from = { y: year, m: lastMonth };
  for (let i = 0; i < span; i++) from = prevMonth(from.y, from.m);
  return { start: iso(from.y, from.m, 15), end: iso(year, lastMonth, 14) };
}

/** "Tháng 07/2026" · "Quý III/2026" · "Năm 2026" */
export function slotLabel(kind: PeriodKind, year: number, index: number) {
  if (kind === 'month') return `Tháng ${pad(index)}/${year}`;
  if (kind === 'quarter') return `Quý ${ROMAN[index - 1]}/${year}`;
  return `Năm ${year}`;
}

export const unitShort = (unitId: string) => {
  const u = findUnit(unitId);
  return u?.shortName ?? u?.name ?? unitId;
};

export const periodName = (kind: PeriodKind, year: number, index: number, unitId: string) => `${slotLabel(kind, year, index)} – ${unitShort(unitId)}`;

export const periodRangeLabel = (p: Pick<KpiPeriod, 'start' | 'end'>) => `${displayDate(p.start)} – ${displayDate(p.end)}`;

export const slotIndexes = (kind: PeriodKind) => kind === 'month' ? Array.from({ length: 12 }, (_, i) => i + 1) : kind === 'quarter' ? [1, 2, 3, 4] : [0];

export const slotShort = (kind: PeriodKind, index: number, year: number) => kind === 'month' ? pad(index) : kind === 'quarter' ? ROMAN[index - 1] : String(year);

/** Kỳ chứa một ngày theo quy tắc 15 → 14 */
export function slotForDate(kind: PeriodKind, isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  let year = y;
  let month = d >= 15 ? m + 1 : m;
  if (month === 13) {
    month = 1;
    year += 1;
  }
  if (kind === 'month') return { kind, year, index: month };
  if (kind === 'quarter') return { kind, year, index: Math.ceil(month / 3) };
  return { kind, year, index: 0 };
}

export type PeriodSlot = {kind: PeriodKind;year: number;index: number;};

/* ---------- Áp dụng cho đơn vị ---------- */

/** Kỳ áp dụng cho đơn vị: kỳ của chính đơn vị, hoặc kỳ cấp trên có "áp dụng cho cả đơn vị trực thuộc" */
export function periodAppliesTo(p: KpiPeriod, unitId: string) {
  if (p.unitId === unitId) return true;
  return p.includeChildren && unitPath(unitId).some((u) => u.id === p.unitId);
}

/** Kỳ của một ô (loại · năm · số), ưu tiên kỳ của đơn vị gần nhất */
export function resolveSlot(periods: KpiPeriod[], slot: PeriodSlot, unitId?: string) {
  const matches = periods.filter((p) => p.kind === slot.kind && p.year === slot.year && p.index === slot.index && (!unitId || periodAppliesTo(p, unitId)));
  if (!unitId) return matches[0];
  const depth = (p: KpiPeriod) => unitPath(p.unitId).length;
  return matches.sort((a, b) => depth(b) - depth(a))[0];
}

/** Kỳ cùng loại của cùng đơn vị chồng ngày — khác loại được phép trùng vì chấm độc lập */
export function overlappingPeriod(periods: KpiPeriod[], c: Pick<KpiPeriod, 'id' | 'kind' | 'unitId' | 'start' | 'end'>) {
  return periods.find((p) => p.id !== c.id && p.kind === c.kind && p.unitId === c.unitId && p.start <= c.end && c.start <= p.end);
}

/* ---------- Hạn gửi tự đánh giá ---------- */

export const dossierLabels: Record<DossierType, string> = {
  individual: 'Cá nhân không giữ chức vụ',
  leader: 'Lãnh đạo, chỉ huy',
  collective: 'Tập thể'
};

export const ruleStatusMeta: Record<RuleStatus, {label: string;tone: 'success' | 'warning';}> = {
  confirmed: { label: 'Đã có căn cứ', tone: 'success' },
  'needs-confirmation': { label: 'Cần xác nhận nghiệp vụ', tone: 'warning' }
};

export const ruleTarget = (r: Pick<DeadlineRule, 'dossier' | 'memberId'>) =>
r.memberId ? `Đối tượng: ${findMember(r.memberId)?.name ?? r.memberId}` : r.dossier ? dossierLabels[r.dossier] : 'Chưa chọn';

/** Mô tả một quy tắc để ghi lịch sử */
export const ruleSummary = (r: DeadlineRule) => `${r.deadline ? displayDate(r.deadline) : 'Chưa cấu hình hạn'} · ${ruleStatusMeta[r.status].label}`;

export type DeadlineState = {text: string;state: 'confirmed' | 'needs-confirmation' | 'unset';};

/** Hạn áp dụng cho một hồ sơ: quy tắc theo đối tượng trước, rồi theo loại hồ sơ. Không suy diễn. */
export function deadlineFor(p: KpiPeriod, dossier: DossierType, memberId?: string): DeadlineState {
  const rules = p.deadlineRules ?? [];
  const rule = memberId && rules.find((r) => r.memberId === memberId) || rules.find((r) => !r.memberId && r.dossier === dossier);
  if (!rule || !rule.deadline) return { text: 'Chưa cấu hình hạn', state: rule?.status === 'needs-confirmation' ? 'needs-confirmation' : 'unset' };
  return { text: displayDate(rule.deadline), state: rule.status };
}

/** Tóm tắt hạn tự đánh giá của kỳ cho danh sách: một dòng mỗi loại hồ sơ đã cấu hình */
export function deadlineOverview(p: KpiPeriod) {
  const rules = (p.deadlineRules ?? []).filter((r) => !r.memberId);
  const extra = (p.deadlineRules ?? []).length - rules.length;
  return { rules, extra };
}

export const nextRuleId = () => `r-${Math.random().toString(36).slice(2, 9)}`;