import { units } from '../data/orgUnits';
import { members } from '../data/orgMembers';
import { MemberRole, MemberStatus, Unit, UnitLevel, UnitMember } from '../types/org';

export type Tone = 'success' | 'warning' | 'neutral' | 'brand';

let unitMap = new Map(units.map((u) => [u.id, u]));

/** Đơn vị gốc — cập nhật khi dữ liệu cơ cấu tải về từ Firestore (live binding) */
export let rootUnit = units.find((u) => u.parentId === null) as Unit;

/**
 * Thay toàn bộ sổ đơn vị / sổ cán bộ dùng chung (dữ liệu từ Firestore).
 * Sửa tại chỗ để mọi nơi đang import `units` / `members` đọc được bản mới.
 */
export function applyOrgData(nextUnits: Unit[], nextMembers: UnitMember[]) {
  if (nextUnits.length && nextUnits !== units) units.splice(0, units.length, ...nextUnits);
  if (nextMembers !== members) members.splice(0, members.length, ...nextMembers);
  unitMap = new Map(units.map((u) => [u.id, u]));
  rootUnit = units.find((u) => u.parentId === null) ?? rootUnit;
}

/** Mã đơn vị mới từ tên: "Đội Kỹ thuật" → "doi-ky-thuat", thêm số nếu trùng */
export function newUnitId(name: string) {
  const base =
  normalize(name).
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-|-$/g, '') || 'don-vi';
  let id = base;
  for (let i = 2; unitMap.has(id); i++) id = `${base}-${i}`;
  return id;
}

/** Cấp con mặc định khi thêm đơn vị trực thuộc */
export const childLevelOf: Record<UnitLevel, UnitLevel> = {
  btl: 'phong',
  phong: 'doi',
  'trung-doan': 'tieu-doan',
  'tieu-doan': 'dai-doi',
  doi: 'tieu-doi',
  'dai-doi': 'trung-doi',
  'trung-doi': 'tieu-doi',
  'tieu-doi': 'tieu-doi'
};
export const findUnit = (id: string) => unitMap.get(id);
export const findMember = (id: string) => members.find((m) => m.id === id);
export const childUnits = (id: string) => units.filter((u) => u.parentId === id);

/** Đơn vị và toàn bộ cấp dưới, theo thứ tự duyệt cây. */
export function descendantIds(id: string): string[] {
  return [id, ...childUnits(id).flatMap((c) => descendantIds(c.id))];
}

/** Đường dẫn từ gốc đến đơn vị. */
export function unitPath(id: string): Unit[] {
  const path: Unit[] = [];
  let cur = findUnit(id);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId ? findUnit(cur.parentId) : undefined;
  }
  return path;
}

const roleOrder: Record<MemberRole, number> = { truong: 0, pho: 1, 'can-bo': 2 };

export function directMembers(unitId: string) {
  return members.
  filter((m) => m.unitId === unitId).
  sort((a, b) => roleOrder[a.role] - roleOrder[b.role] || a.code.localeCompare(b.code));
}

export function unitMembers(unitId: string, includeSub: boolean) {
  return (includeSub ? descendantIds(unitId) : [unitId]).flatMap(directMembers);
}

export const memberCount = (unitId: string) => unitMembers(unitId, true).length;
export const commanderOf = (unitId: string) => directMembers(unitId).find((m) => m.role === 'truong');
export const leadersOf = (unitId: string) => directMembers(unitId).filter((m) => m.role !== 'can-bo');
export const isLeader = (m: UnitMember) => m.role !== 'can-bo';
export const latestResult = (m: UnitMember) => m.results[m.results.length - 1];

/** Người xác nhận phiếu: cấp trưởng đơn vị; nếu chính là cấp trưởng thì cấp trưởng đơn vị cấp trên. */
export function confirmerOf(m: UnitMember) {
  if (m.role !== 'truong') {
    const commander = commanderOf(m.unitId);
    if (commander) return commander;
  }
  const parentId = findUnit(m.unitId)?.parentId;
  return parentId ? commanderOf(parentId) : undefined;
}

export const levelLabels: Record<UnitLevel, string> = {
  btl: 'Bộ Tư lệnh',
  phong: 'Cấp phòng',
  'trung-doan': 'Trung đoàn · tương đương cấp phòng',
  'tieu-doan': 'Tiểu đoàn',
  doi: 'Cấp đội',
  'dai-doi': 'Đại đội',
  'trung-doi': 'Trung đội',
  'tieu-doi': 'Tiểu đội'
};

export function authorityNote(level: UnitLevel) {
  if (level === 'btl') return 'Bộ Tư lệnh tự tính KPI tập thể và lãnh đạo hằng tháng';
  if (level === 'phong' || level === 'trung-doan') return 'KPI tập thể và lãnh đạo đơn vị do Lãnh đạo Bộ Tư lệnh quyết định';
  return 'KPI tập thể và chỉ huy đơn vị do cấp phòng quyết định';
}

export const statusMeta: Record<MemberStatus, {label: string;tone: Tone;note?: string;}> = {
  active: { label: 'Đang công tác', tone: 'success' },
  training: { label: 'Đi đào tạo', tone: 'warning', note: 'Đi đào tạo từ 2 tháng trở lên thuộc diện chưa đánh giá trong quý, chuyển sang quý sau.' },
  leave: { label: 'Nghỉ dài ngày', tone: 'warning', note: 'Nghỉ ốm, thai sản từ 2 tháng trở lên thuộc diện chưa đánh giá trong quý, chuyển sang quý sau.' },
  seconded: { label: 'Trưng tập', tone: 'neutral', note: 'Đơn vị nơi trưng tập xác nhận kết quả, đơn vị quản lý chấm điểm.' }
};

export const criteriaSetOf = (m: UnitMember) =>
isLeader(m) ? 'Bộ tiêu chí Lãnh đạo, chỉ huy (18/4/8)' : 'Bộ tiêu chí không giữ chức vụ (20/8/2)';

export const kpiBarClass = (kpi: number) => kpi >= 70 ? 'bg-success-600' : kpi >= 50 ? 'bg-warning-600' : 'bg-brand-600';

export function normalize(s: string) {
  return s.
  toLowerCase().
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/g, 'd');
}

/** Các đơn vị cần hiện trên cây khi tìm kiếm (đơn vị khớp và cấp trên của nó). */
export function visibleUnitIds(query: string): Set<string> | null {
  const q = normalize(query.trim());
  if (!q) return null;
  const set = new Set<string>();
  units.forEach((u) => {
    if (normalize(u.name).includes(q)) unitPath(u.id).forEach((p) => set.add(p.id));
  });
  return set;
}