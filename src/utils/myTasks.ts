import { KpiTask, TaskProduct } from '../types/work';
import { TODAY_ISO, isOverdue } from './work';

export type MyTaskTab = 'all' | 'open' | 'overdue' | 'reported';

export const myTaskTabs: {id: MyTaskTab;label: string;}[] = [
{ id: 'all', label: 'Tất cả' },
{ id: 'open', label: 'Đang thực hiện' },
{ id: 'overdue', label: 'Quá hạn' },
{ id: 'reported', label: 'Đã báo cáo' }];


/** Việc của cán bộ: chủ trì hoặc phối hợp; không gồm việc đã thu hồi */
export const isMyTask = (t: KpiTask, memberId?: string) =>
Boolean(memberId) && t.status !== 'revoked' && (t.assignee.kind === 'member' && t.assignee.memberId === memberId || (t.collaboratorIds ?? []).includes(memberId as string));

export const isLead = (t: KpiTask, memberId?: string) => t.assignee.kind === 'member' && t.assignee.memberId === memberId;

export function matchesTab(t: KpiTask, tab: MyTaskTab) {
  if (tab === 'open') return t.status === 'assigned' || t.status === 'in-progress';
  if (tab === 'overdue') return isOverdue(t);
  if (tab === 'reported') return t.status === 'reported';
  return true;
}

export function productCounts(t: KpiTask) {
  const list = t.products ?? [];
  const pending = list.filter((p) => p.status === 'pending').length;
  const returned = list.filter((p) => p.status === 'returned').length;
  // Số đã duyệt lấy từ việc (có thể đã duyệt trước khi có danh sách sản phẩm)
  const approved = Math.max(t.approved, list.filter((p) => p.status === 'approved').length);
  return { approved, pending, returned, remaining: Math.max(0, t.qty - approved - pending) };
}

/** Gợi ý tên sản phẩm: các tên đã dùng trong các việc của mình, không trùng */
export function productSuggestions(tasks: KpiTask[]) {
  return [...new Set(tasks.flatMap((t) => (t.products ?? []).map((p) => p.name)))].slice(0, 30);
}

export const newProduct = (p: Omit<TaskProduct, 'id' | 'status'>): TaskProduct => ({
  ...p,
  id: `sp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  status: 'pending'
});

/** dd/mm/yyyy hoặc Date (Excel) → ISO; null nếu sai */
export function parseDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  const m = String(v ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  if (dt.getDate() !== d || dt.getMonth() !== mo - 1) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export const isFuture = (iso: string) => iso > TODAY_ISO;