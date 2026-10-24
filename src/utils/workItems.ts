import { KpiTask, WorkItem } from '../types/work';
import { Tone } from './work';

/** Tổng số lượng đã phân công (không tính lần phân công đã thu hồi) */
export const assignedQty = (w: WorkItem, tasks: KpiTask[]) =>
tasks.filter((t) => t.workItemId === w.id && t.status !== 'revoked').reduce((s, t) => s + t.qty, 0);

export const remainingQty = (w: WorkItem, tasks: KpiTask[]) => Math.max(0, w.qty - assignedQty(w, tasks));

export const assignmentsOf = (w: WorkItem, tasks: KpiTask[]) => tasks.filter((t) => t.workItemId === w.id && t.status !== 'revoked');

export type WorkState = 'cancelled' | 'unassigned' | 'partial' | 'assigned';

export function workState(w: WorkItem, tasks: KpiTask[]): WorkState {
  if (w.status === 'cancelled') return 'cancelled';
  const a = assignedQty(w, tasks);
  if (a === 0) return 'unassigned';
  return a < w.qty ? 'partial' : 'assigned';
}

export const workStateMeta: Record<WorkState, {label: string;tone: Tone;}> = {
  unassigned: { label: 'Chưa phân công', tone: 'warning' },
  partial: { label: 'Phân công một phần', tone: 'brand' },
  assigned: { label: 'Đã phân công đủ', tone: 'success' },
  cancelled: { label: 'Đã huỷ', tone: 'neutral' }
};

/** Mã việc phát sinh tiếp theo — xét cả công việc đã tạo lẫn việc đã giao */
export function nextAdhocWorkCode(items: WorkItem[], tasks: KpiTask[]) {
  const codes = [...items, ...tasks].filter((x) => x.source === 'adhoc').map((x) => Number(x.code.split('-')[1]) || 0);
  return `PS-${String(Math.max(0, ...codes) + 1).padStart(2, '0')}`;
}