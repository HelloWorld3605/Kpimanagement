import { ScoresheetData, ScoresheetKind } from '../types/scoresheet';

/** Kỳ đang hiển thị — bảng điểm do hệ thống sinh khi chốt kỳ (ngày 14 tháng cuối quý) */
export const scoresheetPeriod = { label: 'Quý III/2026', quarter: 'III', year: 2026, closedOn: { d: 14, m: 9, y: 2026 } };

/** Cán bộ / đơn vị mẫu khi tài khoản đang đăng nhập không thuộc đối tượng của mẫu */
export const sampleSubjects = { tt: 'e-thudo', ldch: 'm07', cn: 'm09' };

export const scoresheets: Record<ScoresheetKind, ScoresheetData> = {
  tt: {
    kind: 'tt',
    tasks: [
    { id: 't1', name: 'Bảo đảm an ninh, trật tự các sự kiện chính trị trên địa bàn', product: 'Phương án', point: 120, qty: 4, done: 4, quality: [{ count: 3, pct: 100 }, { count: 1, pct: 110 }], progress: [{ count: 4, pct: 100 }] },
    { id: 't2', name: 'Huấn luyện chiến đấu theo kế hoạch quý', product: 'Giáo án', point: 50, qty: 6, done: 6, quality: [{ count: 6, pct: 100 }], progress: [{ count: 5, pct: 100 }, { count: 1, pct: 75, times: 1 }] },
    { id: 't3', name: 'Tuần tra, kiểm soát địa bàn được phân công', product: 'Báo cáo', point: 40, qty: 8, done: 8, quality: [{ count: 7, pct: 100 }, { count: 1, pct: 75, times: 1 }], progress: [{ count: 8, pct: 100 }] },
    { id: 't4', name: 'Tổng kết, báo cáo công tác quý', product: 'Báo cáo', point: 70, qty: 1, done: 1, quality: [{ count: 1, pct: 100 }], progress: [{ count: 1, pct: 100 }] },
    { id: 't5', name: 'Xây dựng đơn vị chính quy, quản lý kỷ luật', product: 'Kế hoạch', point: 60, qty: 2, done: 1, quality: [{ count: 1, pct: 100 }], progress: [{ count: 1, pct: 100 }], note: 'Chưa hoàn thành 01 sản phẩm' }]

  },
  ldch: {
    kind: 'ldch',
    dTotal: 12,
    dDone: 11,
    tasks: [
    { id: 'l1', name: 'Chỉ đạo xây dựng kế hoạch công tác quý', product: 'Kế hoạch', point: 80, qty: 1, done: 1, quality: [{ count: 1, pct: 100 }], progress: [{ count: 1, pct: 100 }] },
    { id: 'l2', name: 'Chủ trì giao ban, hội nghị đơn vị', product: 'Biên bản', point: 30, qty: 3, done: 3, quality: [{ count: 3, pct: 100 }], progress: [{ count: 3, pct: 100 }] },
    { id: 'l3', name: 'Ký duyệt báo cáo định kỳ', product: 'Báo cáo', point: 70, qty: 3, done: 3, quality: [{ count: 2, pct: 100 }, { count: 1, pct: 75, times: 1 }], progress: [{ count: 3, pct: 100 }] },
    { id: 'l4', name: 'Kiểm tra công tác huấn luyện của đơn vị thuộc quyền', product: 'Báo cáo', point: 60, qty: 2, done: 2, quality: [{ count: 2, pct: 100 }], progress: [{ count: 2, pct: 100 }] },
    { id: 'l5', name: 'Chỉ đạo thực hiện nhiệm vụ đột xuất', product: 'Kế hoạch', point: 100, qty: 1, done: 1, quality: [{ count: 1, pct: 100 }], progress: [{ count: 1, pct: 110 }] }]

  },
  cn: {
    kind: 'cn',
    tasks: [
    { id: 'c1', name: 'Soạn thảo công văn hướng dẫn nghiệp vụ', product: 'Công văn', point: 30, qty: 5, done: 5, quality: [{ count: 5, pct: 100 }], progress: [{ count: 5, pct: 100 }] },
    { id: 'c2', name: 'Báo cáo sơ kết công tác quý', product: 'Báo cáo', point: 70, qty: 1, done: 1, quality: [{ count: 1, pct: 75, times: 1 }], progress: [{ count: 1, pct: 100 }] },
    { id: 'c3', name: 'Xây dựng kế hoạch huấn luyện nghiệp vụ', product: 'Kế hoạch', point: 80, qty: 3, done: 3, quality: [{ count: 2, pct: 100 }, { count: 1, pct: 110 }], progress: [{ count: 3, pct: 100 }] },
    { id: 'c4', name: 'Hướng dẫn thực hiện chế độ báo cáo thống kê', product: 'Hướng dẫn', point: 60, qty: 2, done: 2, quality: [{ count: 2, pct: 100 }], progress: [{ count: 1, pct: 100 }, { count: 1, pct: 75, times: 1 }] },
    { id: 'c5', name: 'Tổng hợp số liệu, cập nhật phần mềm quản lý', product: 'Báo cáo', point: 20, qty: 6, done: 5, quality: [{ count: 5, pct: 100 }], progress: [{ count: 5, pct: 100 }], note: 'Chưa hoàn thành 01 sản phẩm' }]

  }
};