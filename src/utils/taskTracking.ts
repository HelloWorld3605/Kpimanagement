import { KpiTask } from '../types/work';
import { UnitMember } from '../types/org';
import { assigneeUnitId } from './work';
import { descendantIds } from './org';

/** Nhiệm vụ trong phạm vi theo dõi: chủ trì thuộc đơn vị lãnh đạo hoặc cấp dưới */
export function trackedTasks(tasks: KpiTask[], viewer?: UnitMember) {
  if (!viewer) return [];
  const scope = new Set(descendantIds(viewer.unitId));
  return tasks.filter((t) => t.status !== 'revoked' && scope.has(assigneeUnitId(t.assignee)));
}

export type TaskRow = {task: KpiTask;depth: number;childCount: number;};

/**
 * Trải cây nhiệm vụ nhiều cấp thành danh sách dòng theo thứ tự cha → con.
 * Nhiệm vụ có cha ngoài danh sách hiển thị như gốc. Nhánh đang thu gọn thì bỏ con cháu.
 */
export function flattenTree(tasks: KpiTask[], collapsed: Set<string>): TaskRow[] {
  const ids = new Set(tasks.map((t) => t.id));
  const kids = new Map<string, KpiTask[]>();
  tasks.forEach((t) => {
    if (t.parentId && ids.has(t.parentId)) kids.set(t.parentId, [...(kids.get(t.parentId) ?? []), t]);
  });
  const out: TaskRow[] = [];
  const walk = (t: KpiTask, depth: number) => {
    const children = kids.get(t.id) ?? [];
    out.push({ task: t, depth, childCount: children.length });
    if (!collapsed.has(t.id)) children.forEach((c) => walk(c, depth + 1));
  };
  tasks.filter((t) => !t.parentId || !ids.has(t.parentId)).forEach((t) => walk(t, 0));
  return out;
}

/** Chuỗi cha của một nhiệm vụ (gần → xa) */
export function ancestorIds(task: KpiTask, tasks: KpiTask[]) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const out: string[] = [];
  let cur = task.parentId ? byId.get(task.parentId) : undefined;
  while (cur && !out.includes(cur.id)) {
    out.push(cur.id);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return out;
}

/** Gốc của cây chứa nhiệm vụ */
export function rootOf(task: KpiTask, tasks: KpiTask[]) {
  const chain = ancestorIds(task, tasks);
  return chain.length ? tasks.find((t) => t.id === chain[chain.length - 1]) ?? task : task;
}

/** Ngày bắt đầu: ngày ghi nhận đầu tiên trong nhật ký (dd/mm/yyyy) → ISO; không có thì lấy hạn */
export function taskStart(t: KpiTask) {
  const m = t.history[0]?.at.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : t.deadline;
}

/** Nhãn trạng thái hiển thị trên danh sách quản lý */
export function taskStateLabel(t: KpiTask): {label: string;tone: 'success' | 'warning' | 'brand' | 'neutral';} {
  if (t.status === 'reported') return { label: 'Hoàn thành', tone: 'success' };
  if ((t.products ?? []).some((p) => p.status === 'pending')) return { label: 'Chờ duyệt', tone: 'warning' };
  if ((t.products ?? []).some((p) => p.status === 'returned')) return { label: 'Yêu cầu làm lại', tone: 'brand' };
  if (t.status === 'in-progress') return { label: 'Đang thực hiện', tone: 'brand' };
  return { label: 'Mới giao', tone: 'neutral' };
}

export const pendingCount = (t: KpiTask) => (t.products ?? []).filter((p) => p.status === 'pending').length;

/** Số lượng đã chia cho nhiệm vụ con trực tiếp */
export const splitQty = (parent: KpiTask, tasks: KpiTask[]) =>
tasks.filter((c) => c.parentId === parent.id && c.status !== 'revoked').reduce((s, c) => s + c.qty, 0);

/** Mã nhiệm vụ con: nối thêm số thứ tự vào mã cha (CS-05 → CS-05.1 → CS-05.1.1) */
export function nextChildCode(parent: KpiTask, tasks: KpiTask[]) {
  const n = tasks.filter((c) => c.parentId === parent.id).length + 1;
  return `${parent.code}.${n}`;
}