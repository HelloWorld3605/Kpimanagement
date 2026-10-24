import { criteriaSets } from './criteriaCatalog';
import { CriteriaSection } from '../types/criteria';
import { Mark, ReviewTask, SelfReview, TaskResult } from '../types/selfReview';

const staff = criteriaSets.find((s) => s.id === 'staff')!;
const V2 = staff.versions.find((v) => v.version === 2)!.sections;
const V1 = staff.versions.find((v) => v.version === 1)!.sections;

const APPRAISER = 'Trần Minh Đức — Trưởng phòng';

function marksFor(sections: CriteriaSection[], no: string[] = [], unmarked: string[] = []) {
  const out: Record<string, Mark | undefined> = {};
  sections.forEach((s) =>
  s.criteria.forEach((c) => {
    out[c.id] = unmarked.includes(c.id) ? undefined : no.includes(c.id) ? 'no' : 'yes';
  })
  );
  return out;
}

const taskBase = [
{ id: 't1', code: 'TM-01', name: 'Soạn thảo văn bản tham mưu, chỉ đạo', product: 'Văn bản', point: 30, qty: 12, target: '12 văn bản ban hành đúng hạn', actual: '12 văn bản ban hành, 1 văn bản chậm 2 ngày' },
{ id: 't2', code: 'TM-03', name: 'Xây dựng kế hoạch công tác quý của phòng', product: 'Kế hoạch', point: 60, qty: 1, target: '01 kế hoạch trình trước ngày 05', actual: 'Trình ngày 04, được phê duyệt' },
{ id: 't3', code: 'TM-05', name: 'Tổng hợp báo cáo chuyên đề', product: 'Báo cáo', point: 50, qty: 3, target: '03 báo cáo chuyên đề', actual: '03 báo cáo, 1 báo cáo phải bổ sung số liệu' },
{ id: 't4', code: 'TM-08', name: 'Thẩm định hồ sơ trình lãnh đạo', product: 'Hồ sơ', point: 10, qty: 20, target: '20 hồ sơ', actual: '20 hồ sơ, không sai sót' },
{ id: 't5', code: 'TM-11', name: 'Theo dõi, đôn đốc thực hiện kết luận chỉ đạo', product: 'Kết luận', point: 20, qty: 6, target: '06 kết luận', actual: '06/06 kết luận hoàn thành' }];


/** Kết quả mẫu: chỉ ghi phần sản phẩm không đạt 100%. q/p: [số lượng, %, số lần] */
type R = {done: number | null;q?: [number, number, number?][];p?: [number, number, number?][];};
const parts = (xs: [number, number, number?][] = []) => xs.map(([count, pct, times]) => ({ count, pct, ...(times ? { times } : {}) }));
const toResult = (r: R): TaskResult => ({ done: r.done, quality: parts(r.q), progress: parts(r.p) });
const ok = (done: number): R => ({ done });

function tasksFor(results: R[], keepActual = true): ReviewTask[] {
  return taskBase.map((t, i) => ({
    ...t,
    actual: keepActual || results[i].done !== null ? t.actual : '',
    ...toResult(results[i]),
    note: ''
  }));
}

const resultMap = (results: R[]) => Object.fromEntries(taskBase.map((t, i) => [t.id, toResult(results[i])]));

export const selfReviews: SelfReview[] = [
{
  id: 'quy-3-2026',
  period: 'Quý 3/2026',
  template: 'Mẫu CĐKPI-02',
  criteriaLabel: 'Bộ tiêu chí cán bộ không giữ chức vụ v2',
  createdAt: '01/10/2026',
  deadline: '25/10/2026',
  status: 'draft',
  sections: V2,
  marks: marksFor(V2, [], ['c52', 'c61', 'c62']),
  notes: {},
  tasks: tasksFor([{ done: 12, p: [[1, 75, 1]] }, ok(1), { done: null }, { done: null }, { done: null }], false)
},
{
  id: 'quy-2-2026',
  period: 'Quý 2/2026',
  template: 'Mẫu CĐKPI-02',
  criteriaLabel: 'Bộ tiêu chí cán bộ không giữ chức vụ v2',
  createdAt: '01/07/2026',
  deadline: '18/07/2026',
  status: 'rescored',
  submittedAt: '15/07/2026',
  sections: V2,
  marks: marksFor(V2, ['c62']),
  notes: { c62: 'Chưa có sáng kiến được công nhận trong kỳ' },
  tasks: tasksFor([{ done: 12, p: [[1, 75, 1]] }, ok(1), { done: 3, q: [[1, 75, 1]] }, ok(20), ok(6)]),
  proposedRank: 'excellent',
  appraisal: {
    decision: 'rescored',
    by: APPRAISER,
    at: '31/07/2026',
    comment:
    'Nhiệm vụ 2, 3 hoàn thành nhưng còn chậm so với kế hoạch; tiêu chí 3.2 chưa đảm bảo do có phản ánh về thái độ phục vụ người dân.',
    marks: marksFor(V2, ['c62', 'c32']) as Record<string, Mark>,
    results: resultMap([
    { done: 12, p: [[1, 75, 1]] },
    { done: 1, p: [[1, 50, 2]] },
    { done: 3, q: [[1, 75, 1]], p: [[2, 75, 1]] },
    ok(20),
    ok(6)]
    ),
    rank: 'good'
  }
},
{
  id: 'quy-1-2026',
  period: 'Quý 1/2026',
  template: 'Mẫu CĐKPI-02',
  criteriaLabel: 'Bộ tiêu chí cán bộ không giữ chức vụ v2',
  createdAt: '01/04/2026',
  deadline: '18/04/2026',
  status: 'accepted',
  submittedAt: '16/04/2026',
  sections: V2,
  marks: marksFor(V2),
  notes: {},
  tasks: tasksFor([ok(12), ok(1), { done: 3, q: [[1, 110]] }, ok(20), ok(6)]),
  proposedRank: 'excellent',
  appraisal: { decision: 'accepted', by: APPRAISER, at: '30/04/2026', rank: 'excellent' }
},
{
  id: 'quy-4-2025',
  period: 'Quý 4/2025',
  template: 'Mẫu CĐKPI-02',
  criteriaLabel: 'Bộ tiêu chí cán bộ không giữ chức vụ v1',
  createdAt: '01/01/2026',
  deadline: '16/01/2026',
  status: 'accepted',
  submittedAt: '14/01/2026',
  sections: V1,
  marks: marksFor(V1, ['c52']),
  notes: {},
  tasks: tasksFor([{ done: 12, q: [[2, 75, 1]] }, ok(1), { done: 3, p: [[1, 75, 1]] }, { done: 20, q: [[3, 75, 1]] }, { done: 6, p: [[1, 50, 2]] }]),
  proposedRank: 'good',
  appraisal: { decision: 'accepted', by: APPRAISER, at: '31/01/2026', rank: 'good' }
},
{
  id: 'quy-3-2025',
  period: 'Quý 3/2025',
  template: 'Mẫu CĐKPI-01',
  criteriaLabel: 'Bộ tiêu chí cán bộ không giữ chức vụ v1',
  createdAt: '01/10/2025',
  deadline: '18/10/2025',
  status: 'rescored',
  submittedAt: '17/10/2025',
  sections: V1,
  marks: marksFor(V1),
  notes: {},
  tasks: tasksFor([{ done: 12, p: [[1, 75, 1]] }, ok(1), ok(3), { done: 20, q: [[2, 75, 1]] }, ok(6)]),
  proposedRank: 'good',
  appraisal: {
    decision: 'rescored',
    by: APPRAISER,
    at: '31/10/2025',
    comment: 'Tiêu chí 4.2 chưa đảm bảo (01 lần vi phạm nội quy ra vào cơ quan); hiệu suất các nhiệm vụ điều chỉnh theo báo cáo tiến độ.',
    marks: marksFor(V1, ['c42']) as Record<string, Mark>,
    results: resultMap([
    { done: 12, p: [[3, 75, 1]] },
    ok(1),
    { done: 3, q: [[1, 75, 1]] },
    { done: 20, q: [[2, 75, 1]] },
    { done: 6, p: [[1, 75, 1]] }]
    ),
    rank: 'good'
  }
}];