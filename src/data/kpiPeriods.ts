import { KpiPeriod } from '../types/work';

/** Kỳ kiểm đếm 15 → 14 theo Hướng dẫn K02. Mỗi kỳ chấm độc lập, không có kỳ cha / kỳ con. */
type Seed = Pick<KpiPeriod, 'id' | 'name' | 'kind' | 'year' | 'index' | 'start' | 'end' | 'phase'> & Partial<KpiPeriod>;

const base = (s: Seed): KpiPeriod => ({
  unitId: 'btl',
  includeChildren: true,
  deadlineRules: [],
  appraisalDeadline: null,
  reportDeadline: null,
  countingLocked: s.phase === 'closed' || s.phase === 'approval',
  resultVersion: 1,
  deadlineHistory: [],
  events: [],
  createdBy: 'Phòng Tham mưu tác chiến',
  createdAt: '01/06/2026 08:00',
  ...s
});

export const kpiPeriods: KpiPeriod[] = [
base({
  id: 'q1-2027',
  name: 'Quý I/2027 – Bộ Tư lệnh',
  kind: 'quarter',
  year: 2027,
  index: 1,
  start: '2026-12-15',
  end: '2027-03-14',
  phase: 'open',
  createdAt: '15/10/2026 09:10'
}),
base({
  id: 'q4-2026',
  name: 'Quý IV/2026 – Bộ Tư lệnh',
  kind: 'quarter',
  year: 2026,
  index: 4,
  start: '2026-09-15',
  end: '2026-12-14',
  phase: 'running',
  createdAt: '10/09/2026 08:30',
  deadlineRules: [
  { id: 'r-q4-cn', dossier: 'individual', deadline: '2026-12-18', status: 'needs-confirmation', basis: 'Dự kiến theo lịch quý trước, chờ văn bản của kỳ này' },
  { id: 'r-q4-ld', dossier: 'leader', deadline: null, status: 'needs-confirmation', basis: 'Chưa có văn bản quy định hạn cho hồ sơ lãnh đạo, chỉ huy' }],

  deadlineHistory: [
  {
    id: 'h-q4-1',
    at: '12/09/2026 14:05',
    by: 'Nguyễn Văn Hùng',
    rule: 'Cá nhân không giữ chức vụ',
    action: 'create',
    before: '—',
    after: '18/12/2026 · Cần xác nhận nghiệp vụ',
    basis: 'Dự kiến theo lịch quý trước, chờ văn bản của kỳ này'
  },
  {
    id: 'h-q4-2',
    at: '12/09/2026 14:07',
    by: 'Nguyễn Văn Hùng',
    rule: 'Lãnh đạo, chỉ huy',
    action: 'create',
    before: '—',
    after: 'Chưa cấu hình hạn · Cần xác nhận nghiệp vụ',
    basis: 'Chưa có văn bản quy định hạn cho hồ sơ lãnh đạo, chỉ huy'
  }],

  events: [
  { at: '10/09/2026 08:30', by: 'Nguyễn Văn Hùng', text: 'Tạo kỳ' },
  { at: '15/09/2026 07:30', by: 'Nguyễn Văn Hùng', text: 'Chuyển giai đoạn: Đã mở → Đang thực hiện' }]

}),
base({
  id: 'q3-2026',
  name: 'Quý III/2026 – Bộ Tư lệnh',
  kind: 'quarter',
  year: 2026,
  index: 3,
  start: '2026-06-15',
  end: '2026-09-14',
  phase: 'closed',
  appraisalDeadline: '2026-09-28',
  reportDeadline: '2026-10-05',
  deadlineRules: [
  { id: 'r-q3-cn', dossier: 'individual', deadline: '2026-09-20', status: 'confirmed', basis: 'Thông báo 1520/TB-BTL ngày 01/09/2026, mục 2' },
  { id: 'r-q3-ld', dossier: 'leader', deadline: '2026-09-22', status: 'confirmed', basis: 'Thông báo 1520/TB-BTL ngày 01/09/2026, mục 2' },
  { id: 'r-q3-tt', dossier: 'collective', deadline: '2026-09-25', status: 'confirmed', basis: 'Thông báo 1520/TB-BTL ngày 01/09/2026, mục 3' }],

  deadlineHistory: [
  {
    id: 'h-q3-1',
    at: '20/06/2026 10:00',
    by: 'Nguyễn Văn Hùng',
    rule: 'Cá nhân không giữ chức vụ',
    action: 'create',
    before: '—',
    after: 'Chưa cấu hình hạn · Cần xác nhận nghiệp vụ',
    basis: 'Chờ thông báo lịch đánh giá quý III'
  },
  {
    id: 'h-q3-2',
    at: '02/09/2026 09:15',
    by: 'Nguyễn Văn Hùng',
    rule: 'Cá nhân không giữ chức vụ',
    action: 'update',
    before: 'Chưa cấu hình hạn · Cần xác nhận nghiệp vụ',
    after: '20/09/2026 · Đã có căn cứ',
    basis: 'Thông báo 1520/TB-BTL ngày 01/09/2026, mục 2'
  }],

  events: [
  { at: '15/09/2026 07:00', by: 'Hệ thống', text: 'Khoá kiểm đếm' },
  { at: '06/10/2026 16:20', by: 'Trần Quốc Bảo', text: 'Chuyển giai đoạn: Phê duyệt → Đã đóng' }]

}),
base({ id: 'm-2026-12', name: 'Tháng 12/2026 – Bộ Tư lệnh', kind: 'month', year: 2026, index: 12, start: '2026-11-15', end: '2026-12-14', phase: 'draft', createdAt: '20/10/2026 08:00' }),
base({ id: 'm-2026-11', name: 'Tháng 11/2026 – Bộ Tư lệnh', kind: 'month', year: 2026, index: 11, start: '2026-10-15', end: '2026-11-14', phase: 'running' }),
base({ id: 'm-2026-10', name: 'Tháng 10/2026 – Bộ Tư lệnh', kind: 'month', year: 2026, index: 10, start: '2026-09-15', end: '2026-10-14', phase: 'approval' }),
base({ id: 'm-2026-09', name: 'Tháng 09/2026 – Bộ Tư lệnh', kind: 'month', year: 2026, index: 9, start: '2026-08-15', end: '2026-09-14', phase: 'closed' }),
base({
  id: 'y-2026',
  name: 'Năm 2026 – Bộ Tư lệnh',
  kind: 'year',
  year: 2026,
  index: 0,
  start: '2025-12-15',
  end: '2026-12-14',
  phase: 'running',
  rangeStatus: 'needs-confirmation',
  rangeBasis: 'Khoảng kiểm đếm năm chưa có văn bản hướng dẫn — nhập tạm theo quý I đến quý IV'
})];