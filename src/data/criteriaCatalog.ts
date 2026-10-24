import { CriteriaSet } from '../types/criteria';

export const effectiveQuarterOptions = ['Quý 4/2026', 'Quý 1/2027', 'Quý 2/2027', 'Quý 3/2027'];

export const criteriaSets: CriteriaSet[] = [
{
  id: 'staff',
  label: 'Cán bộ không giữ chức vụ',
  titleLine: 'CÁN BỘ KHÔNG GIỮ CHỨC VỤ',
  requiredTotal: 30,
  versions: [
  {
    version: 2,
    status: 'active',
    effectiveFrom: 'Quý 1/2026',
    decision: 'QĐ 214/QĐ-CAT ngày 28/12/2025',
    records: 455,
    sections: [
    { id: 's1', title: 'Phẩm chất chính trị', criteria: [
      { id: 'c11', content: 'Chấp hành chủ trương, đường lối của Đảng, pháp luật Nhà nước', score: 3, guaranteed: true },
      { id: 'c12', content: 'Tham gia học tập, quán triệt nghị quyết', score: 2, guaranteed: false }]
    },
    { id: 's2', title: 'Đạo đức, lối sống', criteria: [
      { id: 'c21', content: 'Trung thực, khách quan, không tham nhũng, lãng phí', score: 3, guaranteed: true },
      { id: 'c22', content: 'Lối sống lành mạnh, đoàn kết nội bộ', score: 2, guaranteed: false }]
    },
    { id: 's3', title: 'Tác phong, lề lối công tác', criteria: [
      { id: 'c31', content: 'Chấp hành thời giờ làm việc', score: 3, guaranteed: false },
      { id: 'c32', content: 'Thái độ phục vụ người dân, doanh nghiệp', score: 2, guaranteed: false }]
    },
    { id: 's4', title: 'Ý thức tổ chức kỷ luật', criteria: [
      { id: 'c41', content: 'Chấp hành sự phân công của tổ chức', score: 3, guaranteed: true },
      { id: 'c42', content: 'Thực hiện quy chế, nội quy cơ quan', score: 2, guaranteed: false }]
    },
    { id: 's5', title: 'Năng lực, kỹ năng', criteria: [
      { id: 'c51', content: 'Ứng dụng công nghệ thông tin, chuyển đổi số', score: 3, guaranteed: false },
      { id: 'c52', content: 'Học tập nâng cao trình độ', score: 2, guaranteed: false }]
    },
    { id: 's6', title: 'Tinh thần trách nhiệm, phối hợp', criteria: [
      { id: 'c61', content: 'Phối hợp với đồng nghiệp, đơn vị liên quan', score: 3, guaranteed: false },
      { id: 'c62', content: 'Chủ động đề xuất, sáng kiến', score: 2, guaranteed: false }]
    }]

  },
  {
    version: 1,
    status: 'replaced',
    effectiveFrom: 'Quý 1/2025',
    effectiveTo: 'Năm 2025',
    decision: 'QĐ 98/QĐ-CAT ngày 20/12/2024',
    records: 612,
    sections: [
    { id: 's1', title: 'Phẩm chất chính trị', criteria: [
      { id: 'c11', content: 'Chấp hành chủ trương, đường lối của Đảng, pháp luật Nhà nước', score: 3, guaranteed: true },
      { id: 'c12', content: 'Tham gia học tập, quán triệt nghị quyết', score: 2, guaranteed: false }]
    },
    { id: 's2', title: 'Đạo đức, lối sống', criteria: [
      { id: 'c21', content: 'Trung thực, khách quan, không tham nhũng, lãng phí', score: 3, guaranteed: true },
      { id: 'c22', content: 'Lối sống lành mạnh, đoàn kết nội bộ', score: 2, guaranteed: false }]
    },
    { id: 's3', title: 'Tác phong, lề lối công tác', criteria: [
      { id: 'c31', content: 'Chấp hành thời giờ làm việc', score: 2, guaranteed: false },
      { id: 'c32', content: 'Thái độ phục vụ người dân, doanh nghiệp', score: 3, guaranteed: false }]
    },
    { id: 's4', title: 'Ý thức tổ chức kỷ luật', criteria: [
      { id: 'c41', content: 'Chấp hành sự phân công của tổ chức', score: 3, guaranteed: true },
      { id: 'c42', content: 'Thực hiện quy chế, nội quy cơ quan', score: 2, guaranteed: false }]
    },
    { id: 's5', title: 'Năng lực, kỹ năng', criteria: [
      { id: 'c51', content: 'Ứng dụng công nghệ thông tin', score: 3, guaranteed: false },
      { id: 'c52', content: 'Học tập nâng cao trình độ', score: 2, guaranteed: false }]
    },
    { id: 's6', title: 'Tinh thần trách nhiệm, phối hợp', criteria: [
      { id: 'c61', content: 'Phối hợp với đồng nghiệp, đơn vị liên quan', score: 5, guaranteed: false }]
    }]

  }]

},
{
  id: 'leader',
  label: 'Lãnh đạo, chỉ huy',
  titleLine: 'CÁN BỘ LÃNH ĐẠO, CHỈ HUY',
  requiredTotal: 30,
  versions: [
  {
    version: 1,
    status: 'active',
    effectiveFrom: 'Quý 1/2025',
    decision: 'QĐ 102/QĐ-CAT ngày 20/12/2024',
    records: 128,
    sections: [
    { id: 'l1', title: 'Phẩm chất chính trị', criteria: [
      { id: 'l11', content: 'Chấp hành chủ trương, đường lối của Đảng, pháp luật Nhà nước', score: 3, guaranteed: true },
      { id: 'l12', content: 'Lãnh đạo quán triệt, triển khai nghị quyết tại đơn vị', score: 2, guaranteed: false }]
    },
    { id: 'l2', title: 'Năng lực lãnh đạo, chỉ huy', criteria: [
      { id: 'l21', content: 'Xây dựng, tổ chức thực hiện kế hoạch công tác', score: 4, guaranteed: false },
      { id: 'l22', content: 'Quyết đoán, dám chịu trách nhiệm', score: 3, guaranteed: false },
      { id: 'l23', content: 'Kiểm tra, đôn đốc cấp dưới thực hiện nhiệm vụ', score: 3, guaranteed: false }]
    },
    { id: 'l3', title: 'Kết quả hoạt động của đơn vị phụ trách', criteria: [
      { id: 'l31', content: 'Hoàn thành chỉ tiêu, nhiệm vụ được giao', score: 5, guaranteed: false },
      { id: 'l32', content: 'Không để xảy ra vi phạm nghiêm trọng trong đơn vị', score: 5, guaranteed: true }]
    },
    { id: 'l4', title: 'Đạo đức, lối sống', criteria: [
      { id: 'l41', content: 'Gương mẫu, liêm chính', score: 3, guaranteed: true },
      { id: 'l42', content: 'Đoàn kết, quy tụ cán bộ', score: 2, guaranteed: false }]
    }]

  }]

},
{
  id: 'unit',
  label: 'Tập thể đơn vị',
  titleLine: 'TẬP THỂ ĐƠN VỊ',
  requiredTotal: 30,
  versions: [
  {
    version: 1,
    status: 'active',
    effectiveFrom: 'Quý 1/2025',
    decision: 'QĐ 103/QĐ-CAT ngày 20/12/2024',
    records: 24,
    sections: [
    { id: 'u1', title: 'Kết quả thực hiện nhiệm vụ', criteria: [
      { id: 'u11', content: 'Hoàn thành chỉ tiêu, kế hoạch công tác năm', score: 8, guaranteed: false },
      { id: 'u12', content: 'Chất lượng công tác tham mưu, báo cáo', score: 4, guaranteed: false }]
    },
    { id: 'u2', title: 'Xây dựng lực lượng', criteria: [
      { id: 'u21', content: 'Không có cán bộ vi phạm kỷ luật', score: 4, guaranteed: true },
      { id: 'u22', content: 'Công tác đào tạo, bồi dưỡng cán bộ', score: 3, guaranteed: false }]
    },
    { id: 'u3', title: 'Chấp hành chế độ, quy định', criteria: [
      { id: 'u31', content: 'Chế độ thông tin, báo cáo', score: 3, guaranteed: false },
      { id: 'u32', content: 'Quản lý tài sản, hậu cần', score: 3, guaranteed: true }]
    },
    { id: 'u4', title: 'Phong trào thi đua', criteria: [
      { id: 'u41', content: 'Tham gia phong trào thi đua', score: 3, guaranteed: false },
      { id: 'u42', content: 'Sáng kiến, mô hình mới', score: 2, guaranteed: false }]
    }]

  }]

}];