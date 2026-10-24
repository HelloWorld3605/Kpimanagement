import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { kpiPeriods } from '../data/kpiPeriods';
import { kpiTasks as initialKpiTasks, seedTasks as seedKpiTasks } from '../data/kpiTasks';
import { workItems as initialWorkItems } from '../data/workItems';
import { useEnsureSeeds } from '../hooks/useEnsureSeeds';
import { dailyTasks as initialDailyTasks } from '../data/dailyTasks';
import { DailyTask, DeadlineRule, KpiPeriod, KpiTask, PeriodEvent, WorkItem } from '../types/work';
import { TODAY_ISO, TODAY_LABEL } from '../utils/work';
import { PeriodSlot, ruleSummary, ruleTarget, slotForDate } from '../utils/period';
import { nowStamp } from '../utils/profile';
import { runKpiChecks } from '../utils/kpiChecks';
import { useSyncedCollection } from '../hooks/useSyncedCollection';

runKpiChecks();

const SEED_TASKS = seedKpiTasks();

type WorkContextValue = {
  periods: KpiPeriod[];
  addPeriod: (p: KpiPeriod) => void;
  updatePeriod: (id: string, updater: (p: KpiPeriod) => KpiPeriod) => void;
  deletePeriod: (id: string) => void;
  /** Ghi nhật ký kỳ (chuyển giai đoạn, khoá kiểm đếm, mở lại kỳ) */
  logPeriodEvent: (id: string, event: Omit<PeriodEvent, 'at'>, updater?: (p: KpiPeriod) => KpiPeriod) => void;
  /** Thêm / sửa hạn tự đánh giá — bắt buộc căn cứ, lưu người thực hiện, thời điểm, trước / sau */
  saveDeadlineRule: (periodId: string, rule: DeadlineRule, basis: string, by: string) => void;
  removeDeadlineRule: (periodId: string, ruleId: string, basis: string, by: string) => void;
  /** Ô kỳ đang chọn trên bộ chọn Năm · Loại kỳ · Kỳ — nhớ khi chuyển màn */
  periodSlot: PeriodSlot;
  setPeriodSlot: (s: PeriodSlot) => void;
  kpiTasks: KpiTask[];
  dailyTasks: DailyTask[];
  addKpiTask: (t: KpiTask) => void;
  updateKpiTask: (id: string, updater: (t: KpiTask) => KpiTask) => void;
  /** Gán / chuyển / bỏ kỳ cho nhiều việc; mỗi thao tác ghi vào lịch sử của việc */
  setTasksPeriod: (ids: string[], periodId: string | null, by: string) => void;
  remind: (ids: string[], by: string) => void;
  addDailyTask: (t: DailyTask) => void;
  updateDailyTask: (id: string, updater: (t: DailyTask) => DailyTask) => void;
  /** Công việc đã tạo (bước 1), chờ / đã phân công */
  workItems: WorkItem[];
  addWorkItem: (w: WorkItem) => void;
  updateWorkItem: (id: string, updater: (w: WorkItem) => WorkItem) => void;
  /** Thêm nhiều lần phân công cùng lúc */
  addKpiTasks: (list: KpiTask[]) => void;
};

const WorkContext = createContext<WorkContextValue | null>(null);

/** Bản ghi cũ trên Firestore có thể thiếu trường mới — bổ sung mặc định */
const withDefaults = (p: KpiPeriod): KpiPeriod => ({
  ...p,
  deadlineRules: p.deadlineRules ?? [],
  deadlineHistory: p.deadlineHistory ?? [],
  events: p.events ?? [],
  resultVersion: p.resultVersion ?? 1,
  countingLocked: p.countingLocked ?? false
});

export function WorkProvider({ children }: {children: React.ReactNode;}) {
  const [rawPeriods, setPeriods] = useSyncedCollection<KpiPeriod>('kpiPeriods', (p) => p.id, kpiPeriods);
  const periods = useMemo(() => rawPeriods.map(withDefaults), [rawPeriods]);
  const [kpiTasks, setKpiTasks] = useSyncedCollection<KpiTask>('kpiTasks', (t) => t.id, initialKpiTasks);
  const [dailyTasks, setDailyTasks] = useSyncedCollection<DailyTask>('dailyTasks', (t) => t.id, initialDailyTasks);
  const [workItems, setWorkItems] = useSyncedCollection<WorkItem>('workItems', (w) => w.id, initialWorkItems);
  // Dữ liệu đã đồng bộ trước đó chưa có các bản ghi mẫu mới — bổ sung, không ghi đè
  useEnsureSeeds(workItems, setWorkItems, initialWorkItems, (w) => w.id);
  useEnsureSeeds(kpiTasks, setKpiTasks, SEED_TASKS, (t) => t.id);
  const [periodSlot, setPeriodSlot] = useState<PeriodSlot>(() => slotForDate('month', TODAY_ISO));

  const addWorkItem = useCallback((w: WorkItem) => setWorkItems((prev) => [w, ...prev]), []);
  const updateWorkItem = useCallback(
    (id: string, updater: (w: WorkItem) => WorkItem) => setWorkItems((prev) => prev.map((w) => w.id === id ? updater(w) : w)),
    []
  );
  const addKpiTasks = useCallback((list: KpiTask[]) => setKpiTasks((prev) => [...list, ...prev]), []);

  const addPeriod = useCallback((p: KpiPeriod) => setPeriods((prev) => [p, ...prev]), []);
  const updatePeriod = useCallback(
    (id: string, updater: (p: KpiPeriod) => KpiPeriod) => setPeriods((prev) => prev.map((p) => p.id === id ? updater(withDefaults(p)) : p)),
    []
  );
  const deletePeriod = useCallback((id: string) => setPeriods((prev) => prev.filter((p) => p.id !== id)), []);

  const logPeriodEvent = useCallback(
    (id: string, event: Omit<PeriodEvent, 'at'>, updater?: (p: KpiPeriod) => KpiPeriod) =>
    updatePeriod(id, (p) => {
      const next = updater ? updater(p) : p;
      return { ...next, events: [...next.events, { ...event, at: nowStamp() }] };
    }),
    [updatePeriod]
  );

  const saveDeadlineRule = useCallback(
    (periodId: string, rule: DeadlineRule, basis: string, by: string) =>
    updatePeriod(periodId, (p) => {
      const old = p.deadlineRules.find((r) => r.id === rule.id);
      const rules = old ? p.deadlineRules.map((r) => r.id === rule.id ? rule : r) : [...p.deadlineRules, rule];
      const change = {
        id: `h-${Date.now().toString(36)}`,
        at: nowStamp(),
        by,
        rule: ruleTarget(rule),
        action: old ? 'update' as const : 'create' as const,
        before: old ? ruleSummary(old) : '—',
        after: ruleSummary(rule),
        basis
      };
      return { ...p, deadlineRules: rules, deadlineHistory: [change, ...p.deadlineHistory] };
    }),
    [updatePeriod]
  );

  const removeDeadlineRule = useCallback(
    (periodId: string, ruleId: string, basis: string, by: string) =>
    updatePeriod(periodId, (p) => {
      const old = p.deadlineRules.find((r) => r.id === ruleId);
      if (!old) return p;
      const change = { id: `h-${Date.now().toString(36)}`, at: nowStamp(), by, rule: ruleTarget(old), action: 'delete' as const, before: ruleSummary(old), after: 'Đã xoá quy tắc', basis };
      return { ...p, deadlineRules: p.deadlineRules.filter((r) => r.id !== ruleId), deadlineHistory: [change, ...p.deadlineHistory] };
    }),
    [updatePeriod]
  );

  const addKpiTask = useCallback((t: KpiTask) => setKpiTasks((prev) => [t, ...prev]), []);
  const updateKpiTask = useCallback(
    (id: string, updater: (t: KpiTask) => KpiTask) => setKpiTasks((prev) => prev.map((t) => t.id === id ? updater(t) : t)),
    []
  );

  const setTasksPeriod = useCallback(
    (ids: string[], periodId: string | null, by: string) => {
      const name = (pid: string | null) => periods.find((p) => p.id === pid)?.name ?? '';
      setKpiTasks((prev) =>
      prev.map((t) => {
        if (!ids.includes(t.id) || t.periodId === periodId) return t;
        const text = !t.periodId ? `Gán vào ${name(periodId)}` : !periodId ? `Bỏ khỏi ${name(t.periodId)}` : `Chuyển từ ${name(t.periodId)} sang ${name(periodId)}`;
        return { ...t, periodId, history: [...t.history, { at: TODAY_LABEL, by, text }] };
      })
      );
    },
    [periods]
  );

  const remind = useCallback(
    (ids: string[], by: string) =>
    setKpiTasks((prev) =>
    prev.map((t) => ids.includes(t.id) ? { ...t, reminders: t.reminders + 1, history: [...t.history, { at: TODAY_LABEL, by, text: 'Nhắc hạn' }] } : t)
    ),
    []
  );

  const addDailyTask = useCallback((t: DailyTask) => setDailyTasks((prev) => [t, ...prev]), []);
  const updateDailyTask = useCallback(
    (id: string, updater: (t: DailyTask) => DailyTask) => setDailyTasks((prev) => prev.map((t) => t.id === id ? updater(t) : t)),
    []
  );

  const value = useMemo(
    () => ({
      periods,
      addPeriod,
      updatePeriod,
      deletePeriod,
      logPeriodEvent,
      saveDeadlineRule,
      removeDeadlineRule,
      periodSlot,
      setPeriodSlot,
      kpiTasks,
      dailyTasks,
      addKpiTask,
      updateKpiTask,
      setTasksPeriod,
      remind,
      addDailyTask,
      updateDailyTask,
      workItems,
      addWorkItem,
      updateWorkItem,
      addKpiTasks
    }),
    [periods, addPeriod, updatePeriod, deletePeriod, logPeriodEvent, saveDeadlineRule, removeDeadlineRule, periodSlot, kpiTasks, dailyTasks, addKpiTask, updateKpiTask, setTasksPeriod, remind, addDailyTask, updateDailyTask, workItems, addWorkItem, updateWorkItem, addKpiTasks]
  );
  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
}

export function useWork() {
  const ctx = useContext(WorkContext);
  if (!ctx) throw new Error('useWork must be used inside WorkProvider');
  return ctx;
}