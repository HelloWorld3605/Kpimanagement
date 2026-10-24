import { CriteriaSection, CriteriaSet, CriteriaVersion, CriterionDiff } from '../types/criteria';
import { CURRENT_USER, TODAY } from './catalog';

const ROMAN: [number, string][] = [
[10, 'X'],
[9, 'IX'],
[5, 'V'],
[4, 'IV'],
[1, 'I']];


export function toRoman(n: number) {
  let out = '';
  let rest = n;
  for (const [v, s] of ROMAN) {
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  }
  return out;
}

export const newId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export const sectionTotal = (s: CriteriaSection) => s.criteria.reduce((a, c) => a + (Number.isFinite(c.score) ? c.score : 0), 0);
export const versionTotal = (sections: CriteriaSection[]) => sections.reduce((a, s) => a + sectionTotal(s), 0);

export const activeCriteria = (s: CriteriaSet) => s.versions.find((v) => v.status === 'active');
export const draftCriteria = (s: CriteriaSet) => s.versions.find((v) => v.status === 'draft');

export function diffSections(current: CriteriaSection[], prev: CriteriaSection[]) {
  const prevMap = new Map(prev.flatMap((s) => s.criteria).map((c) => [c.id, c]));
  const diff: Record<string, CriterionDiff> = {};
  current.forEach((s) =>
  s.criteria.forEach((c) => {
    const p = prevMap.get(c.id);
    if (!p) diff[c.id] = { isNew: true };else
    {
      const d: CriterionDiff = {};
      if (p.content.trim() !== c.content.trim()) d.contentChanged = true;
      if (p.score !== c.score) d.prevScore = p.score;
      if (d.contentChanged || d.prevScore !== undefined) diff[c.id] = d;
    }
  })
  );
  return diff;
}

const content = (sections: CriteriaSection[]) => JSON.stringify(sections);

export function draftIssues(set: CriteriaSet, draft: CriteriaVersion, base?: CriteriaVersion) {
  const issues: string[] = [];
  if (base && content(draft.sections) === content(base.sections)) issues.push(`Chưa có thay đổi so với v${base.version}.`);
  const total = versionTotal(draft.sections);
  if (total !== set.requiredTotal) issues.push(`Tổng điểm đang là ${total}, cần đúng ${set.requiredTotal}.`);
  if (draft.sections.some((s) => !s.title.trim() || s.criteria.some((c) => !c.content.trim())))
  issues.push('Còn nhóm hoặc tiêu chí chưa nhập nội dung.');
  if (draft.sections.some((s) => s.criteria.length === 0)) issues.push('Mỗi nhóm cần ít nhất một tiêu chí.');
  if (draft.sections.some((s) => s.criteria.some((c) => !Number.isInteger(c.score) || c.score < 0)))
  issues.push('Điểm tối đa phải là số nguyên không âm.');
  return issues;
}

export function createCriteriaDraft(set: CriteriaSet): CriteriaSet {
  const base = activeCriteria(set) ?? set.versions[0];
  const draft: CriteriaVersion = {
    version: Math.max(...set.versions.map((v) => v.version)) + 1,
    status: 'draft',
    baseVersion: base.version,
    createdBy: CURRENT_USER,
    createdAt: TODAY,
    sections: base.sections.map((s) => ({ ...s, criteria: s.criteria.map((c) => ({ ...c })) }))
  };
  return { ...set, versions: [draft, ...set.versions] };
}

export function updateCriteriaDraft(set: CriteriaSet, sections: CriteriaSection[]): CriteriaSet {
  return { ...set, versions: set.versions.map((v) => v.status === 'draft' ? { ...v, sections } : v) };
}

export function discardCriteriaDraft(set: CriteriaSet): CriteriaSet {
  return { ...set, versions: set.versions.filter((v) => v.status !== 'draft') };
}

function prevQuarter(label: string) {
  const m = label.match(/Quý (\d)\/(\d{4})/);
  if (!m) return label;
  const q = Number(m[1]);
  const y = Number(m[2]);
  return q === 1 ? `Quý 4/${y - 1}` : `Quý ${q - 1}/${y}`;
}

export function publishCriteriaDraft(set: CriteriaSet, info: {decision: string;effectiveFrom: string;}): CriteriaSet {
  return {
    ...set,
    versions: set.versions.map((v) => {
      if (v.status === 'active') return { ...v, status: 'replaced', effectiveTo: prevQuarter(info.effectiveFrom) };
      if (v.status === 'draft') return { ...v, status: 'active', decision: info.decision, effectiveFrom: info.effectiveFrom, records: 0 };
      return v;
    })
  };
}