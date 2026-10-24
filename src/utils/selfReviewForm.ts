import { SelfReview } from '../types/selfReview';
import { StaffProfile } from '../data/staffProfile';
import {
  INCOMPLETE_NOTE,
  TASKS_MAX,
  criteriaScore,
  finalTotal,
  fmt,
  hasResult,
  rankOptions,
  resultOf,
  sectionAchieved,
  sectionMax,
  selfTotal,
  taskEfficiency,
  taskPoints,
  taskShares,
  tasksScore } from
'./selfReview';

/** Mô hình dữ liệu chung cho bản in PDF và bản Word — bám đúng Mẫu KĐLĐCH - 1 */

export const FORM_CODE = 'Mẫu KĐLĐCH - 1';
export const FORM_TITLE = 'BẢN TỰ ĐÁNH GIÁ, XẾP LOẠI CỦA CÁ NHÂN';
export const RANK_HINT =
'(Theo 04 mức: 1- Hoàn thành xuất sắc nhiệm vụ; 2- Hoàn thành tốt nhiệm vụ; 3- Hoàn thành nhiệm vụ; 4- Không hoàn thành nhiệm vụ)';
export const FOOTNOTE_1 = 'Trường hợp chấm điểm khác so với điểm cá nhân tự đánh giá, thì nêu rõ tiêu chí, nhiệm vụ có sự khác biệt, lý do điều chỉnh điểm.';
export const FOOTNOTE_2 = [
'Đối với Chỉ huy Tiểu đoàn và tương đương trở xuống, do Tiểu đoàn trưởng và tương đương xác nhận; riêng đối với Chỉ huy đại đội trở xuống thuộc E11, E12 do Đại đội trưởng xác nhận.',
'- Đối với Lãnh đạo cấp phòng và tương đương do Trưởng phòng, Trung đoàn trưởng và tương đương xác nhận.',
'- Trường hợp báo cáo của cá nhân cấp trưởng thì cấp phó ký xác nhận (ưu tiên cấp phó là phó bí thư cấp ủy/chi bộ).'];


export type FormCriterionRow = {
  kind: 'section' | 'item';
  code: string;
  content: string;
  max: string;
  yes: boolean;
  no: boolean;
  got: string;
  note: string;
};

export type FormTaskRow = {
  code: string;
  name: string;
  target: string;
  actual: string;
  percent: string;
  max: string;
  got: string;
  note: string;
};

export type FormInfoLine = {label: string;value: string;label2?: string;value2?: string;};

export type SelfReviewForm = {
  fileBase: string;
  parentUnit: string;
  unit: string;
  dateLine: string;
  periodLine: string;
  info: FormInfoLine[];
  criteriaRows: FormCriterionRow[];
  criteriaTotal: {max: string;got: string;};
  taskRows: FormTaskRow[];
  taskTotal: {max: string;got: string;};
  rank: string;
  signer: string;
  appraisal: {score: string;rank: string;response: string;signer: string;} | null;
};

const pad = (n: number) => String(n).padStart(2, '0');

function slug(s: string) {
  return s.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/g, 'd').
  replace(/Đ/g, 'D').
  replace(/[^a-zA-Z0-9]+/g, '-').
  replace(/^-|-$/g, '');
}

export function buildSelfReviewForm(r: SelfReview, p: StaffProfile): SelfReviewForm {
  const match = r.period.match(/Quý\s*(\d+)\/(\d{4})/);
  const quarter = match?.[1] ?? '……';
  const year = match?.[2] ?? '……';

  const [dd, mm, yyyy] = r.submittedAt?.split('/') ?? [];
  const dateLine = r.submittedAt ?
  `${p.city}, ngày ${dd} tháng ${mm} năm ${yyyy}` :
  `${p.city}, ngày ...... tháng ...... năm 20......`;

  const criteriaRows: FormCriterionRow[] = [];
  r.sections.forEach((s, si) => {
    const anyMarked = s.criteria.some((c) => r.marks[c.id]);
    criteriaRows.push({
      kind: 'section',
      code: String(si + 1),
      content: s.title,
      max: pad(sectionMax(s)),
      yes: false,
      no: false,
      got: anyMarked ? String(sectionAchieved(s, r.marks)) : '',
      note: ''
    });
    s.criteria.forEach((c, ci) => {
      const m = r.marks[c.id];
      criteriaRows.push({
        kind: 'item',
        code: `${si + 1}.${ci + 1}`,
        content: c.content,
        max: pad(c.score),
        yes: m === 'yes',
        no: m === 'no',
        got: m ? String(m === 'yes' ? c.score : 0) : '',
        note: r.notes[c.id] ?? ''
      });
    });
  });
  const anyCriteria = Object.values(r.marks).some(Boolean);
  const criteriaMax = r.sections.reduce((a, s) => a + sectionMax(s), 0);

  const shares = taskShares(r.tasks);
  const taskRows: FormTaskRow[] = r.tasks.map((t, i) => {
    const entered = hasResult(t);
    const short = entered && t.done as number < t.qty;
    return {
      code: String(i + 1),
      name: t.name,
      target: t.target,
      actual: t.actual,
      percent: entered ? `${fmt(taskEfficiency(t))}%` : '',
      max: fmt(shares[t.id]),
      got: entered ? fmt(taskPoints(t, shares[t.id])) : '',
      note: t.note || (short ? INCOMPLETE_NOTE : '')
    };
  });
  const anyTask = r.tasks.some(hasResult);
  const taskMax = TASKS_MAX;

  const rankIndex = rankOptions.findIndex((o) => o.value === r.proposedRank);
  const rank = rankIndex >= 0 ? `${rankIndex + 1}- ${rankOptions[rankIndex].label}` : '';

  let appraisal: SelfReviewForm['appraisal'] = null;
  const final = finalTotal(r);
  if (r.appraisal && final !== null) {
    const self = selfTotal(r);
    let score = `${fmt(final)} điểm`;
    if (r.appraisal.decision === 'accepted') {
      score += ' (thống nhất với điểm cá nhân tự đánh giá)';
    } else {
      const diffs: string[] = [];
      const appMarks = r.appraisal.marks ?? {};
      r.sections.forEach((s, si) =>
      s.criteria.forEach((c, ci) => {
        if (appMarks[c.id] && appMarks[c.id] !== r.marks[c.id]) {
          const from = r.marks[c.id] === 'yes' ? c.score : 0;
          const to = appMarks[c.id] === 'yes' ? c.score : 0;
          diffs.push(`tiêu chí ${si + 1}.${ci + 1} (${from} → ${to} điểm)`);
        }
      })
      );
      r.tasks.forEach((t, i) => {
        const from = taskPoints(t, shares[t.id]);
        const to = taskPoints(t, shares[t.id], resultOf(t, r.appraisal?.results));
        if (from !== to) diffs.push(`nhiệm vụ ${i + 1} (${fmt(from)} → ${fmt(to)} điểm)`);
      });
      score += ` (cá nhân tự chấm ${fmt(self)} điểm; điều chỉnh: ${diffs.join('; ') || 'không'})`;
    }
    const ar = rankOptions.find((o) => o.value === r.appraisal?.rank);
    appraisal = {
      score,
      rank: ar ? ar.label : '',
      response: r.appraisal.comment ?? '',
      signer: r.appraisal.by.split(' — ')[0]
    };
  }

  return {
    fileBase: `Phieu-tu-danh-gia_${slug(p.name)}_Quy-${quarter}-${year}`,
    parentUnit: p.parentUnit,
    unit: p.unit,
    dateLine,
    periodLine: `Quý ${quarter}, năm ${year}`,
    info: [
    { label: 'Họ và tên', value: p.name, label2: 'Ngày sinh', value2: p.birthDate },
    { label: 'Quê quán', value: p.hometown },
    { label: 'Cấp bậc', value: p.rank, label2: 'Hệ số lương', value2: p.salaryCoefficient },
    { label: 'Chức vụ đảng', value: p.partyPosition },
    { label: 'Chi bộ', value: p.partyCell },
    { label: 'Chức vụ chính quyền', value: p.govPosition },
    { label: 'Đơn vị công tác', value: p.workUnit },
    { label: 'Chức vụ đoàn thể (nếu có)', value: p.unionPosition },
    { label: 'Chức danh chuyên môn, nghiệp vụ', value: p.title }],

    criteriaRows,
    criteriaTotal: { max: String(criteriaMax), got: anyCriteria ? fmt(criteriaScore(r.sections, r.marks)) : '' },
    taskRows,
    taskTotal: { max: String(taskMax), got: anyTask ? fmt(tasksScore(r.tasks)) : '' },
    rank,
    signer: p.name,
    appraisal
  };
}