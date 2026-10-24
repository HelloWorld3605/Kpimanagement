import { criteriaSets } from './criteriaCatalog';
import { CriteriaSection } from '../types/criteria';
import { FlowEntry, Mark, ReviewStep, ReviewStatus, ReviewTask, SelfReview, TaskResult } from '../types/selfReview';

/**
 * Phiếu Quý 3/2026 của cán bộ thuộc Đại đội 11 — dữ liệu mẫu cho màn "LĐ phòng đánh giá".
 * Cán bộ không giữ chức vụ gửi lãnh đạo phòng; lãnh đạo phòng gửi thẳng lãnh đạo đơn vị.
 */
const STAFF = criteriaSets.find((s) => s.id === 'staff')!.versions.find((v) => v.version === 2)!.sections;
const LEADER = criteriaSets.find((s) => s.id === 'leader')!.versions[0].sections;

const marksFor = (sections: CriteriaSection[], no: string[] = []) => {
  const out: Record<string, Mark | undefined> = {};
  sections.forEach((s) => s.criteria.forEach((c) => out[c.id] = no.includes(c.id) ? 'no' : 'yes'));
  return out;
};

type Seed = {code: string;name: string;product: string;point: number;};
const catalog: Seed[] = [
{ code: 'TM-01', name: 'Soạn thảo văn bản tham mưu, chỉ đạo', product: 'Văn bản', point: 30 },
{ code: 'TM-03', name: 'Xây dựng kế hoạch công tác quý của phòng', product: 'Kế hoạch', point: 60 },
{ code: 'TM-05', name: 'Tổng hợp báo cáo chuyên đề', product: 'Báo cáo', point: 50 },
{ code: 'TM-08', name: 'Thẩm định hồ sơ trình lãnh đạo', product: 'Hồ sơ', point: 10 },
{ code: 'TM-11', name: 'Theo dõi, đôn đốc thực hiện kết luận chỉ đạo', product: 'Kết luận', point: 20 }];


/** [mã, số giao, số hoàn thành, sửa (số SP, %, lần), nhắc (số SP, %, lần)] */
type Row = [string, number, number | null, [number, number, number?]?, [number, number, number?]?];

const part = (x?: [number, number, number?]) => x ? [{ count: x[0], pct: x[1], ...(x[2] ? { times: x[2] } : {}) }] : [];

function tasks(rows: Row[]): ReviewTask[] {
  return rows.map(([code, qty, done, q, p], i) => {
    const c = catalog.find((x) => x.code === code)!;
    return { id: `t${i + 1}`, code, name: c.name, product: c.product, point: c.point, qty, target: `${qty} ${c.product.toLowerCase()}`, actual: '', note: '', done, quality: part(q), progress: part(p) };
  });
}

const results = (rows: Row[]): Record<string, TaskResult> =>
Object.fromEntries(rows.map(([,, done, q, p], i) => [`t${i + 1}`, { done, quality: part(q), progress: part(p) }]));

const sent = (at: string, by: string, next: string): FlowEntry => ({ at, by, byUnit: '', next, action: 'Gửi kết quả tự đánh giá' });

type Spec = {
  memberId: string;
  leader?: boolean;
  status: ReviewStatus;
  step: ReviewStep;
  submittedAt?: string;
  rows: Row[];
  no?: string[];
  flow?: FlowEntry[];
  returnReason?: string;
  dept?: {rows: Row[];no?: string[];by: string;};
  submittedTo?: string;
};

const specs: Spec[] = [
{
  memberId: 'm39',
  status: 'submitted',
  step: 'dept',
  submittedAt: '07/10/2026',
  rows: [['TM-01', 12, 12, undefined, [1, 75, 1]], ['TM-03', 1, 1], ['TM-05', 4, 4, [1, 75, 1]], ['TM-08', 18, 18], ['TM-11', 6, 6]],
  flow: [sent('07/10/2026 11:48:01', 'Phạm Văn Hưng', 'Hồ Văn Thịnh')]
},
{
  memberId: 'm40',
  status: 'submitted',
  step: 'dept',
  submittedAt: '07/10/2026',
  rows: [['TM-01', 10, 9], ['TM-03', 1, 1], ['TM-05', 2, 2], ['TM-08', 24, 24, [2, 75, 1]], ['TM-11', 5, 5]],
  no: ['c52'],
  flow: [sent('07/10/2026 15:04:55', 'Đỗ Văn Kiên', 'Hồ Văn Thịnh')],
  dept: { rows: [['TM-01', 10, 9, undefined, [1, 75, 1]], ['TM-03', 1, 1], ['TM-05', 2, 2], ['TM-08', 24, 24, [3, 75, 1]], ['TM-11', 5, 5]], no: ['c52'], by: 'Hồ Văn Thịnh' }
},
{
  memberId: 'm42',
  status: 'submitted',
  step: 'dept',
  submittedAt: '08/10/2026',
  rows: [['TM-01', 14, 14], ['TM-03', 1, 1], ['TM-05', 3, 3, [1, 110]], ['TM-08', 20, 19], ['TM-11', 7, 7]],
  flow: [sent('08/10/2026 15:10:47', 'Bùi Đức Mạnh', 'Hồ Văn Thịnh')]
},
{
  memberId: 'm43',
  status: 'returned',
  step: 'self',
  rows: [['TM-01', 8, 8], ['TM-03', 1, 1], ['TM-05', 3, 2], ['TM-08', 16, 16], ['TM-11', 6, 6]],
  returnReason: 'Thiếu tài liệu minh chứng cho nhiệm vụ 3; tiêu chí 5.2 chưa nêu lý do.',
  flow: [
  sent('06/10/2026 09:20:12', 'Nguyễn Văn Tùng', 'Hồ Văn Thịnh'),
  { at: '09/10/2026 08:15:40', by: 'Hồ Văn Thịnh', next: 'Nguyễn Văn Tùng', action: 'Trả lại phiếu tự đánh giá', content: 'Thiếu tài liệu minh chứng cho nhiệm vụ 3; tiêu chí 5.2 chưa nêu lý do.' }]

},
{
  memberId: 'm45',
  status: 'draft',
  step: 'self',
  rows: [['TM-01', 12, null], ['TM-03', 1, null], ['TM-05', 3, null], ['TM-08', 20, null], ['TM-11', 6, null]]
},
{
  memberId: 'm36',
  leader: true,
  status: 'submitted',
  step: 'unit',
  submittedAt: '09/10/2026',
  submittedTo: 'm34',
  rows: [['TM-01', 6, 6], ['TM-03', 1, 1], ['TM-05', 2, 2], ['TM-11', 8, 8, undefined, [1, 75, 1]]],
  flow: [sent('09/10/2026 10:02:33', 'Lê Quang Huy', 'Hồ Văn Thịnh')]
}];


export const teamReviews: SelfReview[] = specs.map((s) => {
  const sections = s.leader ? LEADER : STAFF;
  return {
    id: `tr-${s.memberId}-q3-2026`,
    memberId: s.memberId,
    kind: s.leader ? 'ldch' : 'cn',
    period: 'Quý 3/2026',
    template: s.leader ? 'Mẫu CĐKPI-LĐCH' : 'Mẫu CĐKPI-CN',
    criteriaLabel: s.leader ? 'Bộ tiêu chí lãnh đạo, chỉ huy v1' : 'Bộ tiêu chí cán bộ không giữ chức vụ v2',
    createdAt: '01/10/2026',
    deadline: '25/10/2026',
    status: s.status,
    step: s.step,
    submittedAt: s.submittedAt,
    sections,
    marks: s.status === 'draft' ? {} : marksFor(sections, s.no),
    notes: {},
    tasks: tasks(s.rows),
    proposedRank: s.status === 'draft' ? undefined : 'good',
    flow: s.flow ?? [],
    returnReason: s.returnReason,
    submittedTo: s.submittedTo,
    ...(s.dept ? { deptMarks: marksFor(sections, s.dept.no), deptResults: results(s.dept.rows), deptBy: s.dept.by } : {})
  };
});