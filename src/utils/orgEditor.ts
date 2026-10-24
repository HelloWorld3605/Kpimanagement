import { Unit, UnitLevel, UnitMember } from '../types/org';
import { childLevelOf, levelLabels, normalize } from './org';

/** Một dòng trong trình sửa cơ cấu — cây được biểu diễn phẳng theo thứ tự duyệt, `depth` quyết định cha */
export type DraftRow = {
  key: string;
  /** Mã đơn vị đã có; trống = đơn vị mới */
  id?: string;
  name: string;
  shortName: string;
  level: UnitLevel;
  depth: number;
};

/** Dòng đọc được từ văn bản dán / file Excel; depth bắt đầu từ 1 */
export type ParsedRow = {depth: number;name: string;shortName: string;level?: UnitLevel;};

export type RowChange = 'new' | 'edited' | 'moved' | null;

export const unitLevels = Object.keys(levelLabels) as UnitLevel[];
export const levelShort = (l: UnitLevel) => levelLabels[l].split(' · ')[0];

let seq = 0;
export const newKey = () => `dr${Date.now().toString(36)}${++seq}`;

/** Cơ cấu hiện tại → các dòng nháp (gốc ở depth 0) */
export function toDraft(units: Unit[]): DraftRow[] {
  const root = units.find((u) => u.parentId === null);
  if (!root) return [];
  const out: DraftRow[] = [];
  const walk = (u: Unit, depth: number) => {
    out.push({ key: u.id, id: u.id, name: u.name, shortName: u.shortName ?? '', level: u.level, depth });
    units.filter((c) => c.parentId === u.id).forEach((c) => walk(c, depth + 1));
  };
  walk(root, 0);
  return out;
}

/** Chỉ số dòng cuối cùng thuộc nhánh của dòng i (kể cả chính nó) */
export function subtreeEnd(rows: DraftRow[], i: number) {
  let j = i;
  while (j + 1 < rows.length && rows[j + 1].depth > rows[i].depth) j++;
  return j;
}

export function parentIndex(rows: DraftRow[], i: number) {
  for (let j = i - 1; j >= 0; j--) if (rows[j].depth < rows[i].depth) return j;
  return -1;
}

/** Số thứ tự kiểu 1 · 1.2 · 1.2.3 (gốc không đánh số) */
export function outlineNumbers(rows: DraftRow[]) {
  const counters: number[] = [];
  return rows.map((r) => {
    if (r.depth === 0) return '';
    counters.length = r.depth;
    counters[r.depth - 1] = (counters[r.depth - 1] ?? 0) + 1;
    return counters.slice(0, r.depth).join('.');
  });
}

const shift = (rows: DraftRow[], i: number, by: number) => {
  const end = subtreeEnd(rows, i);
  return rows.map((r, k) => k >= i && k <= end ? { ...r, depth: r.depth + by } : r);
};

/** Thụt vào: trở thành đơn vị trực thuộc của dòng anh em phía trên */
export function indent(rows: DraftRow[], i: number) {
  if (i <= 1 || rows[i].depth === 0) return rows;
  if (rows[i - 1].depth < rows[i].depth) return rows;
  return shift(rows, i, 1);
}

/** Thụt ra: lên cùng cấp với đơn vị cha (các anh em phía dưới thành trực thuộc của nó) */
export function outdent(rows: DraftRow[], i: number) {
  if (rows[i].depth <= 1) return rows;
  const end = subtreeEnd(rows, i);
  const parentEnd = subtreeEnd(rows, parentIndex(rows, i));
  // Chuyển nhánh xuống cuối nhánh cha để giữ thứ tự anh em phía sau
  const block = rows.slice(i, end + 1).map((r) => ({ ...r, depth: r.depth - 1 }));
  const before = rows.slice(0, i);
  const between = rows.slice(end + 1, parentEnd + 1);
  const after = rows.slice(parentEnd + 1);
  return [...before, ...between, ...block, ...after];
}

/** Đổi chỗ với anh em liền trên / liền dưới (mang theo cả nhánh) */
export function move(rows: DraftRow[], i: number, dir: -1 | 1) {
  if (rows[i].depth === 0) return rows;
  const end = subtreeEnd(rows, i);
  if (dir === -1) {
    let p = i - 1;
    while (p > 0 && rows[p].depth > rows[i].depth) p--;
    if (p <= 0 || rows[p].depth !== rows[i].depth) return rows;
    return [...rows.slice(0, p), ...rows.slice(i, end + 1), ...rows.slice(p, i), ...rows.slice(end + 1)];
  }
  const n = end + 1;
  if (n >= rows.length || rows[n].depth !== rows[i].depth) return rows;
  const nEnd = subtreeEnd(rows, n);
  return [...rows.slice(0, i), ...rows.slice(n, nEnd + 1), ...rows.slice(i, end + 1), ...rows.slice(nEnd + 1)];
}

export function removeAt(rows: DraftRow[], i: number) {
  if (rows[i].depth === 0) return rows;
  return [...rows.slice(0, i), ...rows.slice(subtreeEnd(rows, i) + 1)];
}

/** Thêm dòng mới: cùng cấp (sau cả nhánh) hoặc trực thuộc (cuối nhánh) */
export function insertRow(rows: DraftRow[], i: number, asChild: boolean): {rows: DraftRow[];key: string;} {
  const base = rows[i];
  const child = asChild || base.depth === 0;
  const parent = child ? base : rows[parentIndex(rows, i)];
  const row: DraftRow = { key: newKey(), name: '', shortName: '', level: childLevelOf[parent.level], depth: child ? base.depth + 1 : base.depth };
  const at = subtreeEnd(rows, i) + 1;
  return { rows: [...rows.slice(0, at), row, ...rows.slice(at)], key: row.key };
}

/** Đoán cấp từ tên: "Đại đội 11" → dai-doi */
export function guessLevel(name: string): UnitLevel | undefined {
  const n = normalize(name.trim());
  const rules: [RegExp, UnitLevel][] = [
  [/^bo tu lenh/, 'btl'],
  [/^phong\b/, 'phong'],
  [/^trung doan/, 'trung-doan'],
  [/^tieu doan/, 'tieu-doan'],
  [/^dai doi/, 'dai-doi'],
  [/^trung doi/, 'trung-doi'],
  [/^tieu doi/, 'tieu-doi'],
  [/^doi\b/, 'doi']];

  return rules.find(([re]) => re.test(n))?.[1];
}

/** Nhận cấp từ chữ người dùng gõ: mã (dai-doi) hoặc nhãn (Đại đội) */
export function levelFromText(text: string): UnitLevel | undefined {
  const t = normalize(text.trim());
  if (!t) return undefined;
  return unitLevels.find((l) => l === t || normalize(levelShort(l)) === t) ?? guessLevel(text);
}

/**
 * Đọc danh sách dán vào. Mỗi dòng một đơn vị; cấp được nhận theo:
 * số thứ tự 1 / 1.2 / 1.2.3, hoặc thụt đầu dòng (Tab / 2 dấu cách), hoặc gạch đầu dòng lặp (-, --, ---).
 * Trong dòng: Tên [Tab hoặc " | "] Tên viết tắt [Tab hoặc " | "] Cấp.
 */
export function parseOutline(text: string): ParsedRow[] {
  const out: ParsedRow[] = [];
  text.split(/\r?\n/).forEach((raw) => {
    if (!raw.trim()) return;
    const lead = raw.match(/^[\t ]*/)?.[0] ?? '';
    let rest = raw.slice(lead.length);
    let depth = (lead.match(/\t/g)?.length ?? 0) + Math.floor((lead.match(/ /g)?.length ?? 0) / 2) + 1;
    const num = rest.match(/^((?:\d+\.)*\d+)[.)]?\s+/);
    const bullet = rest.match(/^([-+*•]+)\s*/);
    if (num) {
      depth = num[1].split('.').length;
      rest = rest.slice(num[0].length);
    } else if (bullet) {
      depth += bullet[1].length - 1;
      rest = rest.slice(bullet[0].length);
    }
    const [name = '', shortName = '', levelText = ''] = rest.split(/\t| \| /).map((c) => c.trim());
    if (!name) return;
    out.push({ depth, name, shortName, level: levelFromText(levelText) });
  });
  return normalizeDepths(out);
}

/** Đưa cấp về dạng liền mạch: dòng đầu ở cấp 1, không nhảy quá một cấp */
export function normalizeDepths(rows: ParsedRow[]): ParsedRow[] {
  if (!rows.length) return rows;
  const min = Math.min(...rows.map((r) => r.depth));
  let prev = 0;
  return rows.map((r) => {
    const d = Math.max(1, Math.min(r.depth - min + 1, prev + 1));
    prev = d;
    return { ...r, depth: d };
  });
}

/** Gắn các dòng đọc được vào cây nháp */
export function applyParsed(rows: DraftRow[], parsed: ParsedRow[], targetKey: string, mode: 'append' | 'replace'): DraftRow[] {
  if (!rows.length || !parsed.length) return rows;
  const root = rows[0];
  const ti = mode === 'replace' ? 0 : Math.max(0, rows.findIndex((r) => r.key === targetKey));
  const target = rows[ti];

  // Cấp mặc định theo cấp của cha từng dòng
  const stack: UnitLevel[] = [target.level];
  const block: DraftRow[] = parsed.map((p) => {
    stack.length = p.depth;
    const level = p.level ?? guessLevel(p.name) ?? childLevelOf[stack[p.depth - 1] ?? target.level];
    stack[p.depth] = level;
    return { key: newKey(), name: p.name, shortName: p.shortName, level, depth: target.depth + p.depth };
  });

  if (mode === 'append') {
    const at = subtreeEnd(rows, ti) + 1;
    return [...rows.slice(0, at), ...block, ...rows.slice(at)];
  }

  // Thay toàn bộ: giữ mã các đơn vị trùng đường dẫn tên → cán bộ đang gắn vẫn còn đơn vị
  const pathOf = (list: DraftRow[]) => {
    const names: string[] = [];
    return list.map((r) => {
      names.length = r.depth;
      names[r.depth] = normalize(r.name.trim());
      return names.slice(1, r.depth + 1).join('/');
    });
  };
  const oldPaths = pathOf(rows);
  const byPath = new Map(rows.map((r, k) => [oldPaths[k], r]));
  const next = [root, ...block];
  const newPaths = pathOf(next);
  const used = new Set<string>();
  return next.map((r, k) => {
    if (k === 0) return r;
    const old = byPath.get(newPaths[k]);
    if (old?.id && !used.has(old.id)) {
      used.add(old.id);
      return { ...r, key: old.key, id: old.id, shortName: r.shortName || old.shortName };
    }
    return r;
  });
}

/** Mã mới từ tên, không trùng với các mã đã dùng */
function makeId(name: string, taken: Set<string>) {
  const base =
  normalize(name).
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-|-$/g, '') || 'don-vi';
  let id = base;
  for (let i = 2; taken.has(id); i++) id = `${base}-${i}`;
  taken.add(id);
  return id;
}

/** Cây nháp → danh sách đơn vị lưu được */
export function fromDraft(rows: DraftRow[], existing: Unit[]): Unit[] {
  const taken = new Set(existing.map((u) => u.id));
  const ids = rows.map((r) => r.id ?? makeId(r.name, taken));
  return rows.map((r, i) => {
    const p = parentIndex(rows, i);
    const u: Unit = { id: ids[i], name: r.name.trim(), level: r.level, parentId: p < 0 ? null : ids[p] };
    if (r.shortName.trim()) u.shortName = r.shortName.trim();
    return u;
  });
}

/** So với cơ cấu đang lưu: dòng nào mới / đã sửa / đã chuyển */
export function rowChanges(rows: DraftRow[], units: Unit[]): RowChange[] {
  const map = new Map(units.map((u) => [u.id, u]));
  return rows.map((r, i) => {
    if (!r.id) return 'new';
    const u = map.get(r.id);
    if (!u) return 'new';
    const p = parentIndex(rows, i);
    const parentId = p < 0 ? null : rows[p].id ?? `new:${rows[p].key}`;
    if (parentId !== u.parentId) return 'moved';
    if (u.name !== r.name.trim() || (u.shortName ?? '') !== r.shortName.trim() || u.level !== r.level) return 'edited';
    return null;
  });
}

export type DraftIssues = {
  /** Lỗi theo key dòng */
  rows: Record<string, string>;
  /** Đơn vị bị xoá nhưng còn cán bộ */
  removedWithStaff: {unit: Unit;count: number;}[];
  removed: Unit[];
};

export function draftIssues(rows: DraftRow[], units: Unit[], members: UnitMember[]): DraftIssues {
  const issues: DraftIssues = { rows: {}, removedWithStaff: [], removed: [] };
  const siblings = new Map<string, string>();
  rows.forEach((r, i) => {
    const name = r.name.trim();
    if (!name) {
      issues.rows[r.key] = 'Nhập tên đơn vị';
      return;
    }
    const sig = `${parentIndex(rows, i)}|${normalize(name)}`;
    if (siblings.has(sig)) issues.rows[r.key] = 'Trùng tên với đơn vị cùng cấp';else
    siblings.set(sig, r.key);
  });
  const kept = new Set(rows.map((r) => r.id).filter(Boolean));
  issues.removed = units.filter((u) => !kept.has(u.id));
  issues.removedWithStaff = issues.removed.
  map((u) => ({ unit: u, count: members.filter((m) => m.unitId === u.id).length })).
  filter((x) => x.count > 0);
  return issues;
}