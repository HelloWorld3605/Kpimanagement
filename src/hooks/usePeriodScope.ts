import { useMemo } from 'react';
import { useWork } from '../contexts/WorkContext';
import { usePermissions } from './usePermissions';
import { units } from '../data/orgUnits';
import { descendantIds } from '../utils/org';
import { periodAppliesTo } from '../utils/period';

/**
 * Phạm vi kỳ KPI của người đang xem:
 * - unitIds: đơn vị được lập kỳ (đơn vị mình và cấp dưới)
 * - visible: kỳ của các đơn vị đó, cộng kỳ cấp trên áp dụng cho đơn vị mình
 * Tài khoản chưa gắn hồ sơ nhân sự (quản trị) thấy toàn bộ.
 */
export function usePeriodScope() {
  const { periods } = useWork();
  const { member } = usePermissions();
  return useMemo(() => {
    if (!member) return { unitIds: units.map((u) => u.id), visible: periods, homeUnitId: undefined as string | undefined };
    const down = descendantIds(member.unitId);
    const visible = periods.filter((p) => down.includes(p.unitId) || periodAppliesTo(p, member.unitId));
    return { unitIds: down, visible, homeUnitId: member.unitId as string | undefined };
  }, [periods, member]);
}