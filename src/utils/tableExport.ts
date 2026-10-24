import type { Workbook as WorkbookType } from 'exceljs';
import { toast } from 'sonner';

export type ExportFormat = 'xlsx' | 'csv';

/** Một cột khi xuất. id trùng id cột trên bảng → cột đang ẩn sẽ không được xuất */
export type ExportColumn<T> = {
  id?: string;
  header: string;
  value: (row: T, index: number) => string | number | null | undefined;
};

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Bỏ các cột đang ẩn trên bảng */
export function visibleExportColumns<T>(columns: ExportColumn<T>[], hidden?: Set<string>) {
  return hidden ? columns.filter((c) => !c.id || !hidden.has(c.id)) : columns;
}

/** Xuất danh sách đang lọc ra Excel (.xlsx) hoặc CSV (UTF-8, mở được bằng Excel) */
export async function exportTable<T>(fileName: string, columns: ExportColumn<T>[], rows: T[], format: ExportFormat) {
  const header = columns.map((c) => c.header);
  const body = rows.map((r, i) => columns.map((c) => c.value(r, i) ?? ''));

  if (format === 'csv') {
    const csv = [header, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    download(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), `${fileName}.csv`);
    toast.success(`Đã xuất ${rows.length} dòng ra CSV`);
    return;
  }

  const mod = await import('exceljs');
  const Workbook = (mod.Workbook ?? (mod as unknown as {default: {Workbook: typeof mod.Workbook;};}).default.Workbook) as new () => WorkbookType;
  const wb = new Workbook();
  wb.creator = 'Quản lý KPI';
  wb.created = new Date();
  const ws = wb.addWorksheet('Dữ liệu', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.addRow(header);
  body.forEach((r) => ws.addRow(r));
  const head = ws.getRow(1);
  head.font = { bold: true };
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1EEE7' } };
  header.forEach((h, i) => {
    const longest = Math.max(h.length, ...body.map((r) => String(r[i]).length));
    ws.getColumn(i + 1).width = Math.min(60, Math.max(8, longest + 2));
  });
  if (header.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: header.length } };
  const buffer = await wb.xlsx.writeBuffer();
  download(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${fileName}.xlsx`);
  toast.success(`Đã xuất ${rows.length} dòng ra Excel`);
}