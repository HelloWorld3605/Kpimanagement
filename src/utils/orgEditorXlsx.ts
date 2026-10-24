import ExcelJS from 'exceljs';
import { DraftRow, ParsedRow, levelFromText, levelShort, normalizeDepths, outlineNumbers, unitLevels } from './orgEditor';

const HEAD = ['STT cây (1, 1.1, 1.1.2)', 'Tên đơn vị', 'Tên viết tắt', 'Cấp'];

/** File mẫu kèm sẵn cơ cấu hiện tại → sửa trực tiếp trong Excel rồi nạp lại */
export async function downloadOrgTemplate(rows: DraftRow[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Cơ cấu');
  ws.columns = [{ width: 22, style: { numFmt: '@' } }, { width: 42 }, { width: 18 }, { width: 18 }];
  ws.addRow(HEAD).font = { bold: true };
  const nums = outlineNumbers(rows);
  rows.forEach((r, i) => {
    if (r.depth === 0) return;
    ws.addRow([nums[i], r.name, r.shortName, levelShort(r.level)]);
  });

  const guide = wb.addWorksheet('Hướng dẫn');
  guide.columns = [{ width: 24 }, { width: 70 }];
  [
  ['Cột', 'Cách nhập'],
  ['STT cây', 'Số thứ tự thể hiện cấp: 1 là đơn vị trực thuộc đơn vị gốc, 1.2 là đơn vị thứ 2 thuộc đơn vị 1, 1.2.3 …'],
  ['Tên đơn vị', 'Bắt buộc. Tên trùng đường dẫn với đơn vị đang có sẽ được giữ nguyên mã (cán bộ không bị mất đơn vị).'],
  ['Tên viết tắt', 'Không bắt buộc.'],
  ['Cấp', `Không bắt buộc; bỏ trống thì đoán theo tên. Giá trị hợp lệ: ${unitLevels.map(levelShort).join(', ')}.`]].
  forEach((r, i) => {
    const row = guide.addRow(r);
    if (i === 0) row.font = { bold: true };
  });

  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mau-co-cau-to-chuc.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

/** Đọc file Excel theo mẫu → các dòng đơn vị */
export async function readOrgFile(file: File): Promise<ParsedRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) return [];
  const out: ParsedRow[] = [];
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const cell = (c: number) => String(row.getCell(c).text ?? '').trim();
    const name = cell(2);
    if (!name) return;
    const num = cell(1).replace(/\.$/, '');
    out.push({ depth: /^\d+(\.\d+)*$/.test(num) ? num.split('.').length : 1, name, shortName: cell(3), level: levelFromText(cell(4)) });
  });
  return normalizeDepths(out);
}