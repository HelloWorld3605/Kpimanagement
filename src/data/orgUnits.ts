import { Unit } from '../types/org';

/** Đại đội 1 → 10 trực thuộc Trung đoàn 11 */
const companies: Unit[] = Array.from({ length: 10 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Đại đội ${i + 1}`,
  shortName: `c${i + 1}`,
  level: 'dai-doi',
  parentId: 'e-thudo'
}));

export const units: Unit[] = [
{ id: 'btl', name: 'Bộ Tư lệnh Cảnh sát cơ động', shortName: 'Bộ Tư lệnh', level: 'btl', parentId: null },
// Mã giữ 'e-thudo' để cán bộ, tài khoản đang gắn không phải đổi
{ id: 'e-thudo', name: 'Trung đoàn 11', shortName: 'E11', level: 'trung-doan', parentId: 'btl' },
{ id: 'e11-bch', name: 'Ban Chỉ huy Trung đoàn', shortName: 'BCH', level: 'tieu-doan', parentId: 'e-thudo' },
{ id: 'e11-btm', name: 'Ban Tham mưu', shortName: 'BTM', level: 'tieu-doan', parentId: 'e-thudo' },
{ id: 'e11-bct', name: 'Ban Chính trị', shortName: 'BCT', level: 'tieu-doan', parentId: 'e-thudo' },
{ id: 'e11-bhc', name: 'Ban Hậu cần', shortName: 'BHC', level: 'tieu-doan', parentId: 'e-thudo' },
{ id: 'e11-bhl', name: 'Ban Huấn luyện', shortName: 'BHL', level: 'tieu-doan', parentId: 'e-thudo' },
...companies];
