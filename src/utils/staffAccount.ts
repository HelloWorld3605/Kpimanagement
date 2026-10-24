import ExcelJS from 'exceljs';
import { Account, RoleId } from '../types/access';
import { MemberRole, Unit, UnitMember } from '../types/org';
import { rankOptions } from '../data/profile';
import { parseDate } from './myTasks';
import { normalize } from './org';
import { nowStamp } from './profile';
import { statusPatch } from './accountStatus';

/**
 * Tài khoản theo số hiệu: mỗi nhân sự có một tài khoản, tên đăng nhập = số hiệu (duy nhất toàn Bộ),
 * mật khẩu ban đầu cố định. Dùng chung cho Tạo nhân sự và Nhập Excel.
 */
export const STAFF_DEFAULT_PASSWORD = '123456';

/** Tên đăng nhập từ số hiệu — chữ thường như khi đăng nhập (AuthContext hạ chữ thường) */
export const usernameOfCode = (code: string) => code.trim().toLowerCase();

/** Số hiệu hợp lệ làm tên đăng nhập: chữ, số, dấu gạch, chấm; 3–32 ký tự */
export const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/;

/**
 * Lỗi số hiệu, hoặc undefined. Duy nhất ở cấp Bộ: không trùng số hiệu nhân sự khác và không trùng tên đăng nhập nào.
 * `memberId`: nhân sự đang sửa; `ownUsername`: tài khoản của chính người này (không tính là trùng).
 */
export function codeError(code: string, members: UnitMember[], accounts: Account[], own: {memberId?: string;ownUsername?: string;} = {}) {
  const c = code.trim();
  if (!c) return 'Nhập số hiệu.';
  if (!CODE_PATTERN.test(c)) return 'Số hiệu 3–32 ký tự: chữ, số, dấu gạch ngang, chấm, gạch dưới.';
  const key = usernameOfCode(c);
  if (members.some((m) => m.id !== own.memberId && usernameOfCode(m.code) === key)) return 'Số hiệu đã có trong hệ thống.';
  if (accounts.some((a) => a.username === key && a.username !== own.ownUsername && (!own.memberId || a.memberId !== own.memberId))) {
    return 'Số hiệu trùng tên đăng nhập của tài khoản khác.';
  }
  return undefined;
}

/** Vai trò tài khoản theo cương vị: cấp trưởng → Chỉ huy, cấp phó → Chỉ huy (cấp phó), còn lại → Cán bộ */
export const accountRoleOf: Record<MemberRole, RoleId> = { truong: 'chi-huy', pho: 'chi-huy-pho', 'can-bo': 'can-bo' };

/** Vai trò chỉ huy — suy ra từ cương vị trên hồ sơ nhân sự, không chọn tay trên tài khoản */
export const COMMAND_ROLES: RoleId[] = ['can-bo', 'chi-huy', 'chi-huy-pho'];
/** Tài khoản hệ thống: giữ nguyên vai trò, không suy ra từ cương vị */
const SYSTEM_ROLES: RoleId[] = ['quan-tri', 'sieu-quan-tri'];

/**
 * Vai trò hiệu lực: tài khoản có hồ sơ nhân sự → vai trò chỉ huy theo cương vị + các vai trò chức năng đã gán
 * (Tham mưu, TCCB, Lãnh đạo…). Cấp phó chưa được phân công thì phụ trách đơn vị của mình.
 */
export function withCommandRole(a: Account, members: UnitMember[]): Account {
  if (!a.memberId || a.roles.some((r) => SYSTEM_ROLES.includes(r))) return a;
  const m = members.find((x) => x.id === a.memberId);
  if (!m) return a;
  const command = accountRoleOf[m.role];
  const roles = [command, ...a.roles.filter((r) => !COMMAND_ROLES.includes(r))];
  const assignedUnitIds = command === 'chi-huy-pho' && !a.assignedUnitIds.length ? [m.unitId] : a.assignedUnitIds;
  return { ...a, roles, assignedUnitIds };
}

/** Tài khoản đi kèm nhân sự mới */
export function accountForMember(m: UnitMember): Account {
  return {
    username: usernameOfCode(m.code),
    displayName: m.name,
    memberId: m.id,
    password: STAFF_DEFAULT_PASSWORD,
    mustChangePassword: true,
    roles: [accountRoleOf[m.role]],
    // Cấp phó: phạm vi "được phân công" mặc định là đơn vị của mình
    assignedUnitIds: m.role === 'pho' ? [m.unitId] : [],
    ...statusPatch('active'),
    createdAt: nowStamp()
  };
}

/* ---------- Nhập Excel: 11 trường hồ sơ + Cương vị ---------- */

const HEAD = [
'Số hiệu *',
'Họ tên *',
'Ngày sinh (dd/mm/yyyy)',
'Giới tính (Nam/Nữ)',
'Quê quán',
'Số điện thoại',
'Trình độ',
'Cấp bậc',
'Chức vụ',
'Đảng viên (Có/Không)',
'Đơn vị * (tên hoặc tên rút gọn)',
'Cương vị (Trưởng/Phó/Cán bộ — trống: suy ra từ chức vụ)'];


export type StaffImportRow = {
  line: number;
  member: Omit<UnitMember, 'id'>;
  /** Số hiệu đã có + chọn "cập nhật": id nhân sự sẽ được cập nhật thay vì tạo mới */
  existingId?: string;
  /** Cương vị không ghi trong file, suy ra từ chức vụ */
  roleInferred: boolean;
  /** Tên đơn vị như trong file (để hiện khi không tìm thấy) */
  unitText: string;
  errors: string[];
};

const iso2vn = (iso: string) => iso ? iso.split('-').reverse().join('/') : '';

function download(buf: ArrayBuffer, name: string) {
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** File mẫu: trang 1 điền dữ liệu, trang 2 danh sách đơn vị và cấp bậc hợp lệ */
export async function downloadStaffTemplate(units: Unit[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Nhan su');
  ws.addRow(HEAD).font = { bold: true };
  ws.columns = [14, 26, 16, 12, 18, 16, 14, 14, 22, 14, 30, 22].map((width) => ({ width }));
  ws.getColumn(1).numFmt = '@'; // số hiệu dạng chữ, giữ số 0 đầu
  ws.addRow(['021-999', 'Nguyễn Văn A', iso2vn('1995-05-20'), 'Nam', 'Hà Nội', '0912 345 678', 'Đại học', 'Thượng úy', 'Cán bộ', 'Có', units[1]?.shortName ?? units[0]?.name ?? '', 'Cán bộ']);
  const ref = wb.addWorksheet('Danh muc');
  ref.columns = [{ width: 36 }, { width: 18 }, { width: 4 }, { width: 18 }];
  ref.addRow(['Đơn vị', 'Tên rút gọn', '', 'Cấp bậc']).font = { bold: true };
  const n = Math.max(units.length, rankOptions.length);
  for (let i = 0; i < n; i++) ref.addRow([units[i]?.name ?? '', units[i]?.shortName ?? '', '', rankOptions[i] ?? '']);
  ref.addRow([]);
  ref.addRow([`Mỗi dòng tạo một nhân sự và một tài khoản: tên đăng nhập = số hiệu, mật khẩu ban đầu ${STAFF_DEFAULT_PASSWORD} (phải đổi ở lần đăng nhập đầu).`]);
  download(await wb.xlsx.writeBuffer() as ArrayBuffer, 'Mau-nhap-nhan-su.xlsx');
}

/** Danh sách tài khoản vừa tạo để phát cho cán bộ */
export async function downloadCreatedAccounts(rows: {code: string;name: string;unit: string;}[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Tai khoan');
  ws.addRow(['STT', 'Số hiệu', 'Họ tên', 'Đơn vị', 'Tên đăng nhập', 'Mật khẩu ban đầu']).font = { bold: true };
  ws.columns = [6, 14, 26, 28, 16, 16].map((width) => ({ width }));
  rows.forEach((r, i) => ws.addRow([i + 1, r.code, r.name, r.unit, usernameOfCode(r.code), STAFF_DEFAULT_PASSWORD]));
  ws.addRow([]);
  ws.addRow(['', 'Người dùng phải đổi mật khẩu ở lần đăng nhập đầu.']);
  download(await wb.xlsx.writeBuffer() as ArrayBuffer, 'Danh-sach-tai-khoan-moi.xlsx');
}

const cellText = (v: ExcelJS.CellValue): string => {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return iso2vn(v.toISOString().slice(0, 10));
  if (typeof v === 'object' && 'text' in v) return String((v as {text: string;}).text).trim();
  if (typeof v === 'object' && 'result' in v) return String((v as {result: unknown;}).result ?? '').trim();
  return String(v).trim();
};

const findUnitByText = (units: Unit[], text: string) => {
  const q = normalize(text);
  return units.find((u) => normalize(u.name) === q || (u.shortName && normalize(u.shortName) === q));
};

/** "Trưởng" / "Cấp trưởng" / "Phó" / "Cán bộ"… → cương vị; null nếu không hiểu */
function parseRole(text: string): MemberRole | null {
  const t = normalize(text);
  if (/^(cap )?truong$/.test(t)) return 'truong';
  if (/^(cap )?pho$/.test(t)) return 'pho';
  if (/^(can bo|khong giu chuc vu)$/.test(t)) return 'can-bo';
  return null;
}

/** Suy cương vị từ chức vụ: "Phó …" → cấp phó; "… trưởng", "Chỉ huy …", "Chính trị viên" → cấp trưởng; còn lại cán bộ */
export function roleFromPosition(position: string): MemberRole {
  const t = normalize(position);
  if (/^pho\b/.test(t) || /\bpho (truong|chinh tri vien|chi huy)/.test(t)) return 'pho';
  if (/truong\b/.test(t) || /^chi huy\b/.test(t) || /^chinh tri vien\b/.test(t)) return 'truong';
  return 'can-bo';
}

/**
 * Đọc file theo mẫu, kiểm từng dòng (bắt buộc, định dạng, đơn vị, trùng trong file và trong hệ thống).
 * `updateExisting`: số hiệu đã có → cập nhật hồ sơ đó (ô trống giữ giá trị cũ) thay vì báo trùng.
 */
export async function readStaffFile(
file: File,
units: Unit[],
members: UnitMember[],
accounts: Account[],
updateExisting = false)
: Promise<StaffImportRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('File không có trang tính.');
  const out: StaffImportRow[] = [];
  const seen = new Map<string, number>();
  ws.eachRow((row, line) => {
    if (line === 1) return;
    const c = (i: number) => cellText(row.getCell(i).value);
    const values = Array.from({ length: 12 }, (_, i) => c(i + 1));
    if (values.every((v) => !v)) return;
    const [code, name, birth, gender, hometown, phone, education, rank, position, party, unitText, roleText] = values;
    const errors: string[] = [];
    const key = usernameOfCode(code);
    const existing = updateExisting && code ? members.find((m) => usernameOfCode(m.code) === key) : undefined;

    // Cập nhật: không tính trùng với chính hồ sơ / tài khoản của người đó
    const own = existing ? { memberId: existing.id, ownUsername: accounts.find((a) => a.memberId === existing.id)?.username } : {};
    const ce = codeError(code, members, accounts, own);
    if (ce) errors.push(ce);
    if (code && seen.has(key)) errors.push(`Số hiệu trùng dòng ${seen.get(key)} trong file.`);else
    if (code) seen.set(key, line);
    if (!name && !existing) errors.push('Thiếu họ tên.');
    const birthDate = birth ? parseDate(birth) : '';
    if (birthDate === null) errors.push('Ngày sinh không đúng dd/mm/yyyy.');
    const g = normalize(gender);
    if (gender && g !== 'nam' && g !== 'nu') errors.push('Giới tính phải là Nam hoặc Nữ.');
    if (phone && !/^[0-9 +.]{9,15}$/.test(phone)) errors.push('Số điện thoại không hợp lệ.');
    if (rank && !rankOptions.some((r) => normalize(r) === normalize(rank))) errors.push(`Cấp bậc "${rank}" không có trong danh mục.`);
    const unit = unitText ? findUnitByText(units, unitText) : undefined;
    if (!unitText && !existing) errors.push('Thiếu đơn vị.');else
    if (unitText && !unit) errors.push(`Không tìm thấy đơn vị "${unitText}".`);
    const parsedRole = roleText ? parseRole(roleText) : null;
    if (roleText && !parsedRole) errors.push(`Cương vị "${roleText}" phải là Trưởng, Phó hoặc Cán bộ.`);

    const finalPosition = position || existing?.position || 'Cán bộ';
    out.push({
      line,
      unitText,
      errors,
      existingId: existing?.id,
      roleInferred: !roleText && !existing,
      member: {
        code: existing?.code ?? code,
        name: name || existing?.name || '',
        gender: gender ? g === 'nu' ? 'Nữ' : 'Nam' : existing?.gender ?? 'Nam',
        birthDate: birthDate || existing?.birthDate || '',
        hometown: hometown || existing?.hometown || '',
        phone: phone || existing?.phone || '',
        education: education || existing?.education || '',
        rank: rankOptions.find((r) => normalize(r) === normalize(rank)) ?? existing?.rank ?? '',
        position: finalPosition,
        role: parsedRole ?? existing?.role ?? roleFromPosition(finalPosition),
        partyMember: party ? ['co', 'x', '1', 'true'].includes(normalize(party)) : existing?.partyMember ?? false,
        unitId: unit?.id ?? existing?.unitId ?? '',
        status: existing?.status ?? 'active',
        joinedAt: existing?.joinedAt ?? new Date().toISOString().slice(0, 10),
        results: existing?.results ?? []
      }
    });
  });
  return out;
}
