import ExcelJS from 'exceljs';
import { KpiTask } from '../types/work';
import { TaskCatalog } from '../types/catalog';
import { activeVersion } from './catalog';
import { normalize } from './org';
import { isFuture, parseDate, productCounts } from './myTasks';
import { TODAY_ISO } from './work';

export type ImportStatus = 'done' | 'doing';

export const importStatusLabel: Record<ImportStatus, string> = { done: 'Hoàn thành', doing: 'Đang thực hiện' };

/** Một dòng trong bảng "Nạp dữ liệu" */
export type ImportRow = {
  key: string;
  name: string;
  /** Nhiệm vụ đã có được chọn từ gợi ý; trống = tạo nhiệm vụ mới */
  taskId?: string;
  /** Mã mục danh mục; '' = nhiệm vụ phát sinh */
  productKey: string;
  start: string;
  deadline: string;
  doneAt: string;
  qty: string;
  returned: string;
  status: ImportStatus;
};

export type ProductOption = {key: string;label: string;unit: string;point: number;};

export const IMPORT_TEMPLATES = [{ id: 'basic', label: 'Mẫu cơ bản' }] as const;

const HEAD = ['Tên nhiệm vụ', 'Sản phẩm/công việc (mã)', 'Ngày bắt đầu (dd/mm/yyyy)', 'Hạn hoàn thành (dd/mm/yyyy)', 'Ngày hoàn thành (dd/mm/yyyy)', 'Số lượng', 'SL trả lại', 'Trạng thái'];

let seq = 0;
export const emptyRow = (patch: Partial<ImportRow> = {}): ImportRow => ({
  key: `ir${Date.now().toString(36)}${++seq}`,
  name: '',
  productKey: '',
  start: TODAY_ISO,
  deadline: '',
  doneAt: '',
  qty: '1',
  returned: '0',
  status: 'done',
  ...patch
});

export const isBlank = (r: ImportRow) => !r.name.trim() && !r.taskId && !r.deadline && !r.doneAt;

/** Danh sách "Sản phẩm/công việc": mục danh mục đang hiệu lực + nhiệm vụ phát sinh */
export function productOptions(catalogs: TaskCatalog[]): ProductOption[] {
  const list = catalogs.
  filter((c) => c.status === 'active').
  map((c) => {
    const v = activeVersion(c);
    return v ? { key: c.code, label: `${c.code} · ${v.name}`, unit: v.unit, point: v.score } : null;
  }).
  filter(Boolean) as ProductOption[];
  return [...list, { key: '', label: 'Nhiệm vụ phát sinh', unit: 'Sản phẩm', point: 1 }];
}

/** Gợi ý nhiệm vụ có tên khớp (không bắt buộc chọn) */
export function matchTasks(tasks: KpiTask[], query: string, limit = 8) {
  const q = normalize(query.trim());
  if (!q) return [];
  return tasks.filter((t) => normalize(`${t.name} ${t.code}`).includes(q)).slice(0, limit);
}

export const taskProgress = (t: KpiTask) => {
  const c = productCounts(t);
  return Math.round((c.approved + c.pending) / Math.max(1, t.qty) * 100);
};

/** Lỗi từng ô của một dòng */
export function rowErrors(r: ImportRow, tasks: KpiTask[]) {
  const e: Partial<Record<'name' | 'start' | 'deadline' | 'doneAt' | 'qty' | 'returned', string>> = {};
  const q = Number(r.qty);
  const ret = Number(r.returned);
  const task = tasks.find((t) => t.id === r.taskId);
  if (!r.name.trim()) e.name = 'Nhập tên nhiệm vụ';
  if (!r.start) e.start = 'Chọn ngày';
  if (!r.deadline) e.deadline = 'Chọn hạn';else
  if (r.start && r.deadline < r.start) e.deadline = 'Trước ngày bắt đầu';
  if (r.status === 'done' && !r.doneAt) e.doneAt = 'Chọn ngày';else
  if (r.doneAt && isFuture(r.doneAt)) e.doneAt = 'Sau hôm nay';else
  if (r.doneAt && r.start && r.doneAt < r.start) e.doneAt = 'Trước ngày bắt đầu';
  if (!Number.isInteger(q) || q < 1) e.qty = '≥ 1';else
  if (task && r.status === 'done' && q > productCounts(task).remaining) e.qty = `Còn ${productCounts(task).remaining}`;
  if (!Number.isInteger(ret) || ret < 0) e.returned = '≥ 0';else
  if (Number.isInteger(q) && ret > q) e.returned = '≤ SL';
  return e;
}

/* ---------------- Excel ---------------- */

const iso2vn = (iso: string) => iso ? iso.split('-').reverse().join('/') : '';

export async function downloadImportTemplate(tasks: KpiTask[], options: ProductOption[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Nap du lieu');
  ws.addRow(HEAD).font = { bold: true };
  ws.columns = [{ width: 44 }, { width: 22 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 10 }, { width: 10 }, { width: 16 }];
  const sample = tasks.find((t) => t.status !== 'reported');
  ws.addRow([sample?.name ?? 'Soạn thảo văn bản tham mưu', sample?.code.split('.')[0] ?? '', iso2vn(TODAY_ISO), iso2vn(sample?.deadline ?? TODAY_ISO), iso2vn(TODAY_ISO), 1, 0, 'Hoàn thành']);
  const ref = wb.addWorksheet('Danh muc');
  ref.addRow(['Mã', 'Sản phẩm/công việc', 'Đơn vị tính', 'Điểm']).font = { bold: true };
  ref.columns = [{ width: 12 }, { width: 60 }, { width: 16 }, { width: 8 }];
  options.forEach((o) => ref.addRow([o.key || '(để trống)', o.label, o.unit, o.point]));
  ref.addRow([]);
  ref.addRow(['Trạng thái: Hoàn thành hoặc Đang thực hiện. Tên trùng nhiệm vụ đã có sẽ được ghép vào nhiệm vụ đó.']);
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Mau-nap-du-lieu-nhiem-vu.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

/** Đọc file theo mẫu → các dòng đưa vào bảng để kiểm tra, sửa trước khi lưu */
export async function readImportFile(file: File, tasks: KpiTask[], options: ProductOption[]): Promise<ImportRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('empty');
  const out: ImportRow[] = [];
  ws.eachRow((row, line) => {
    if (line === 1) return;
    const cell = (i: number) => {
      const v = row.getCell(i).value;
      return v && typeof v === 'object' && 'text' in v ? String((v as {text: string;}).text) : v;
    };
    const name = String(cell(1) ?? '').trim();
    if (!name) return;
    const code = String(cell(2) ?? '').trim().toUpperCase();
    const task = tasks.find((t) => normalize(t.name) === normalize(name));
    const status: ImportStatus = normalize(String(cell(8) ?? '')).includes(normalize('Đang')) ? 'doing' : 'done';
    out.push(
      emptyRow({
        name: task?.name ?? name,
        taskId: task?.id,
        productKey: task ? task.code.split('.')[0] : options.some((o) => o.key === code) ? code : '',
        start: parseDate(cell(3)) ?? TODAY_ISO,
        deadline: parseDate(cell(4)) ?? task?.deadline ?? '',
        doneAt: parseDate(cell(5)) ?? '',
        qty: String(Number(cell(6)) || 1),
        returned: String(Number(cell(7)) || 0),
        status
      })
    );
  });
  return out;
}