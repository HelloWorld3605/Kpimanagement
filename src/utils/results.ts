import { members } from '../data/orgMembers';
import { resultPeriods, unitResults } from '../data/unitResults';
import { QuarterResult, Unit, UnitMember } from '../types/org';
import { Rank } from '../types/selfReview';
import { commanderOf, descendantIds, findUnit, memberCount, normalize } from './org';

export const rankOrder: Rank[] = ['excellent', 'good', 'done', 'fail'];

export const findPeriod = (id: string) => resultPeriods.find((p) => p.id === id);
/** Kỳ liền trước (danh sách kỳ xếp mới nhất trước) */
export const previousPeriod = (id: string) => resultPeriods[resultPeriods.findIndex((p) => p.id === id) + 1]?.id;

const memberResult = (m: UnitMember, period?: string) => period ? m.results.find((r) => r.period === period) : undefined;
const unitResult = (unitId: string, period?: string) => period ? unitResults.find((r) => r.unitId === unitId && r.period === period) : undefined;

export type IndividualRow = {
  member: UnitMember;
  unit: Unit;
  result?: QuarterResult;
  delta?: number;
};

export function individualRows(period: string, scopeId: string): IndividualRow[] {
  const ids = new Set(descendantIds(scopeId));
  const prev = previousPeriod(period);
  return members.
  filter((m) => ids.has(m.unitId)).
  map((m) => {
    const result = memberResult(m, period);
    const before = memberResult(m, prev);
    return {
      member: m,
      unit: findUnit(m.unitId) as Unit,
      result,
      delta: result && before ? result.kpi - before.kpi : undefined
    };
  });
}

export type CollectiveFlag = 'low' | 'leader-higher';

export const flagText: Record<CollectiveFlag, string> = {
  low: 'KPI tập thể dưới 70: người đứng đầu xếp Không hoàn thành, cấp phó không được Xuất sắc',
  'leader-higher': 'KPI người đứng đầu cao hơn KPI tập thể, cần điều chỉnh'
};

export type CollectiveRow = {
  unit: Unit;
  kpi: number;
  rank: Rank;
  delta?: number;
  headcount: number;
  commander?: UnitMember;
  commanderKpi?: number;
  flags: CollectiveFlag[];
};

export function collectiveRows(period: string, scopeId: string): CollectiveRow[] {
  const prev = previousPeriod(period);
  return descendantIds(scopeId).flatMap((id) => {
    const res = unitResult(id, period);
    if (!res) return [];
    const before = unitResult(id, prev);
    const commander = commanderOf(id);
    const commanderKpi = commander ? memberResult(commander, period)?.kpi : undefined;
    const flags: CollectiveFlag[] = [];
    if (res.kpi < 70) flags.push('low');
    if (commanderKpi !== undefined && commanderKpi > res.kpi) flags.push('leader-higher');
    return [
    {
      unit: findUnit(id) as Unit,
      kpi: res.kpi,
      rank: res.rank,
      delta: before ? res.kpi - before.kpi : undefined,
      headcount: memberCount(id),
      commander,
      commanderKpi,
      flags
    }];

  });
}

export function rankCounts(ranks: Rank[]) {
  const counts: Record<Rank, number> = { excellent: 0, good: 0, done: 0, fail: 0 };
  ranks.forEach((r) => counts[r] += 1);
  return counts;
}

export const matches = (text: string, query: string) => !query.trim() || normalize(text).includes(normalize(query.trim()));