import { CatalogColumnId, CustomField, FieldType, Force, TaskCatalog, TaskVersion } from '../types/catalog';
import { fieldTypeOptions } from '../data/taskCatalog';
import type { ExportColumn } from './tableExport';

export const TODAY = '21/10/2026';
export const YESTERDAY = '20/10/2026';
export const CURRENT_USER = 'Nguyễn Văn Hùng';

export function scoreGroup(score: number) {
  return score <= 30 ? 1 : score <= 60 ? 2 : 3;
}

export const activeVersion = (t: TaskCatalog) => t.versions.find((v) => v.status === 'active');
export const draftVersion = (t: TaskCatalog) => t.versions.find((v) => v.status === 'draft');
export const displayVersion = (t: TaskCatalog) => activeVersion(t) ?? draftVersion(t) ?? t.versions[0];
export const latestVersionNumber = (t: TaskCatalog) => Math.max(...t.versions.map((v) => v.version));

export function catalogStatusLabel(t: TaskCatalog) {
  if (t.status === 'inactive') return 'Ngừng sử dụng';
  if (!activeVersion(t)) return 'Chưa áp dụng';
  return 'Đang sử dụng';
}

export function fieldTypeLabel(type: FieldType) {
  return fieldTypeOptions.find((o) => o.value === type)?.label ?? type;
}

export function cleanOptions(options?: string[]) {
  return (options ?? []).map((o) => o.trim()).filter(Boolean);
}

export function slugify(s: string) {
  return s.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/g, 'd').
  replace(/Đ/g, 'D').
  toLowerCase().
  replace(/[^a-z0-9]+/g, '_').
  replace(/^_|_$/g, '');
}

export function emptyField(): CustomField {
  return { id: `f_${Math.random().toString(36).slice(2, 9)}`, name: '', code: '', type: 'short_text', required: true };
}

const prefixes: Record<Force, string> = { 'Tham mưu': 'TM', 'An ninh': 'AN', 'Cảnh sát': 'CS' };

export function suggestCode(tasks: TaskCatalog[], force: Force) {
  const prefix = prefixes[force];
  const max = tasks.
  filter((t) => t.code.startsWith(`${prefix}-`)).
  reduce((m, t) => Math.max(m, Number(t.code.split('-')[1]) || 0), 0);
  return `${prefix}-${String(max + 1).padStart(2, '0')}`;
}

export function versionContent(v: Pick<TaskVersion, 'name' | 'scope' | 'output' | 'unit' | 'score' | 'fields'>) {
  return JSON.stringify({ n: v.name, s: v.scope, o: v.output, u: v.unit, p: v.score, f: v.fields });
}

/** Lỗi của danh sách trường riêng: trả về id trường → thông điệp */
export function fieldErrors(fields: CustomField[]) {
  const errors: Record<string, {name?: string;code?: string;}> = {};
  const seen = new Map<string, number>();
  fields.forEach((f) => seen.set(f.code, (seen.get(f.code) ?? 0) + 1));
  fields.forEach((f) => {
    const e: {name?: string;code?: string;} = {};
    if (!f.name.trim()) e.name = 'Nhập tên trường';
    if (!f.code.trim()) e.code = 'Nhập mã';else
    if (!/^[a-z0-9_]+$/.test(f.code)) e.code = 'Chỉ dùng a-z, 0-9, _';else
    if ((seen.get(f.code) ?? 0) > 1) e.code = 'Mã bị trùng';
    if (e.name || e.code) errors[f.id] = e;
  });
  return errors;
}

export function createDraft(t: TaskCatalog): TaskCatalog {
  const base = activeVersion(t) ?? t.versions[0];
  const draft: TaskVersion = {
    ...base,
    version: latestVersionNumber(t) + 1,
    status: 'draft',
    baseVersion: base.version,
    createdBy: CURRENT_USER,
    createdAt: TODAY,
    effectiveFrom: undefined,
    effectiveTo: undefined,
    basis: undefined,
    fields: base.fields.map((f) => ({ ...f }))
  };
  return { ...t, versions: [draft, ...t.versions] };
}

export function updateDraft(t: TaskCatalog, patch: Partial<TaskVersion>): TaskCatalog {
  return { ...t, versions: t.versions.map((v) => v.status === 'draft' ? { ...v, ...patch } : v) };
}

export function discardDraft(t: TaskCatalog): TaskCatalog {
  return { ...t, versions: t.versions.filter((v) => v.status !== 'draft') };
}

export function applyDraft(t: TaskCatalog, basis: string): TaskCatalog {
  return {
    ...t,
    versions: t.versions.map((v) => {
      if (v.status === 'active') return { ...v, status: 'replaced', effectiveTo: YESTERDAY };
      if (v.status === 'draft')
      return { ...v, status: 'active', effectiveFrom: TODAY, basis, fields: v.fields.map((f) => ({ ...f, options: cleanOptions(f.options) })) };
      return v;
    })
  };
}

export function catalogSortValue(t: TaskCatalog, key: CatalogColumnId): string | number {
  const v = displayVersion(t);
  switch (key) {
    case 'code':
      return t.code;
    case 'name':
      return v.name;
    case 'force':
      return t.force;
    case 'scope':
      return v.scope;
    case 'output':
      return v.output;
    case 'unit':
      return v.unit;
    case 'score':
      return v.score;
    case 'group':
      return scoreGroup(v.score);
    case 'version':
      return activeVersion(t)?.version ?? 0;
    case 'status':
      return catalogStatusLabel(t);
  }
}

/** Cột khi xuất danh mục — id trùng cột trên bảng để bỏ qua cột đang ẩn */
export const catalogExportColumns: ExportColumn<TaskCatalog>[] = [
{ id: 'code', header: 'Mã', value: (t) => t.code },
{ id: 'name', header: 'Tên nhiệm vụ', value: (t) => displayVersion(t).name },
{ id: 'force', header: 'Hệ lực lượng', value: (t) => t.force },
{ id: 'scope', header: 'Phạm vi', value: (t) => displayVersion(t).scope },
{ id: 'output', header: 'Sản phẩm đầu ra', value: (t) => displayVersion(t).output },
{ id: 'unit', header: 'Đơn vị tính', value: (t) => displayVersion(t).unit },
{ id: 'score', header: 'Điểm chuẩn', value: (t) => displayVersion(t).score },
{ id: 'group', header: 'Nhóm điểm', value: (t) => `Nhóm ${scoreGroup(displayVersion(t).score)}` },
{ id: 'version', header: 'Phiên bản', value: (t) => `v${displayVersion(t).version}` },
{ id: 'status', header: 'Trạng thái', value: (t) => catalogStatusLabel(t) }];