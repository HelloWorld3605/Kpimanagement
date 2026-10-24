import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useWork } from '../../contexts/WorkContext';
import { usePermissions } from '../../hooks/usePermissions';
import { DeadlineRule, KpiPeriod, PeriodPhase } from '../../types/work';
import { leadersOf, findUnit } from '../../utils/org';
import { assigneeUnitId, phaseMeta, scopeUnitIds } from '../../utils/work';

export const phaseOrder: PeriodPhase[] = ['draft', 'open', 'running', 'review', 'approval', 'closed'];
export const nextPhase = (p: PeriodPhase) => phaseOrder[phaseOrder.indexOf(p) + 1] as PeriodPhase | undefined;

export type ReasonKind = 'unlock' | 'close' | 'reopen' | 'delete-rule' | 'delete-period';

/** Trạng thái và thao tác của màn chi tiết kỳ: khoá kiểm đếm, chuyển giai đoạn, mở lại, hạn tự đánh giá */
export function usePeriodDetail(period: KpiPeriod | undefined) {
  const { kpiTasks, updatePeriod, deletePeriod, logPeriodEvent, saveDeadlineRule, removeDeadlineRule, setTasksPeriod } = useWork();
  const { member, can } = usePermissions();
  const by = member?.name ?? 'Quản trị hệ thống';
  const canWrite = can('kpi-period', 'write');
  const canDelete = can('kpi-period', 'delete');

  const [ruleDialog, setRuleDialog] = useState<{open: boolean;editing?: DeadlineRule;}>({ open: false });
  const [removingRule, setRemovingRule] = useState<DeadlineRule | null>(null);
  const [reason, setReason] = useState<ReasonKind | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const tasks = useMemo(() => period ? kpiTasks.filter((t) => t.periodId === period.id) : [], [kpiTasks, period]);
  const candidates = useMemo(() => {
    const scope = member ? scopeUnitIds(member.unitId) : null;
    return kpiTasks.filter((t) => !t.periodId && t.status !== 'revoked' && t.status !== 'reported' && (!scope || scope.includes(assigneeUnitId(t.assignee))));
  }, [kpiTasks, member]);

  /** Lãnh đạo đơn vị của kỳ và đơn vị cấp trên — người duyệt mở lại kỳ */
  const approvers = useMemo(() => {
    if (!period) return [];
    const parent = findUnit(period.unitId)?.parentId;
    return [...leadersOf(period.unitId), ...(parent ? leadersOf(parent) : [])].map((m) => ({ id: m.id, name: `${m.name} · ${findUnit(m.unitId)?.shortName ?? findUnit(m.unitId)?.name ?? ''}` }));
  }, [period]);

  if (!period)
  return { tasks, candidates, approvers, canWrite, canDelete, by, ruleDialog, setRuleDialog, removingRule, setRemovingRule, reason, setReason, editOpen, setEditOpen, addOpen, setAddOpen, actions: null };

  const id = period.id;

  const toggleLock = () => {
    if (period.countingLocked) return setReason('unlock');
    logPeriodEvent(id, { by, text: 'Khoá kiểm đếm' }, (p) => ({ ...p, countingLocked: true }));
    toast.success('Đã khoá kiểm đếm — kỳ không nhận thêm việc');
  };

  const advance = () => {
    const next = nextPhase(period.phase);
    if (!next) return;
    if (next === 'closed') return setReason('close');
    const autoLock = (next === 'review' || next === 'approval') && !period.countingLocked;
    logPeriodEvent(id, { by, text: `Chuyển giai đoạn: ${phaseMeta[period.phase].label} → ${phaseMeta[next].label}${autoLock ? ' (tự khoá kiểm đếm)' : ''}` }, (p) => ({
      ...p,
      phase: next,
      countingLocked: autoLock ? true : p.countingLocked
    }));
    toast.success(`Kỳ chuyển sang ${phaseMeta[next].label}`);
  };

  const confirmReason = (text: string, approverId?: string) => {
    if (reason === 'unlock') {
      logPeriodEvent(id, { by, text: 'Mở khoá kiểm đếm', reason: text }, (p) => ({ ...p, countingLocked: false }));
      toast.success('Đã mở khoá kiểm đếm');
    }
    if (reason === 'close') {
      logPeriodEvent(id, { by, text: `Chuyển giai đoạn: ${phaseMeta[period.phase].label} → Đã đóng`, reason: text || undefined }, (p) => ({ ...p, phase: 'closed', countingLocked: true }));
      toast.success('Đã đóng kỳ — kết quả được khoá');
    }
    if (reason === 'reopen') {
      logPeriodEvent(id, { by, text: `Mở lại kỳ — tạo phiên bản kết quả ${period.resultVersion + 1}`, reason: text, approvedBy: approverId }, (p) => ({
        ...p,
        phase: 'approval',
        resultVersion: p.resultVersion + 1
      }));
      toast.success(`Đã mở lại kỳ. Phiên bản kết quả ${period.resultVersion} vẫn được giữ.`);
    }
    if (reason === 'delete-rule' && removingRule) {
      removeDeadlineRule(id, removingRule.id, text, by);
      setRemovingRule(null);
      toast.success('Đã xoá quy tắc hạn và ghi lịch sử');
    }
    setReason(null);
  };

  const saveRule = (rule: DeadlineRule, basis: string) => {
    saveDeadlineRule(id, rule, basis, by);
    setRuleDialog({ open: false });
    toast.success('Đã lưu hạn tự đánh giá và ghi lịch sử');
  };

  const addTasks = (ids: string[]) => {
    setTasksPeriod(ids, id, by);
    setAddOpen(false);
    toast.success(`Đã thêm ${ids.length} việc vào ${period.name}`);
  };

  const save = (p: KpiPeriod) => {
    updatePeriod(id, () => p);
    setEditOpen(false);
    toast.success('Đã lưu thay đổi kỳ');
  };

  const remove = () => deletePeriod(id);

  return {
    tasks,
    candidates,
    approvers,
    canWrite,
    canDelete,
    by,
    ruleDialog,
    setRuleDialog,
    removingRule,
    setRemovingRule,
    reason,
    setReason,
    editOpen,
    setEditOpen,
    addOpen,
    setAddOpen,
    actions: { toggleLock, advance, confirmReason, saveRule, addTasks, save, remove }
  };
}