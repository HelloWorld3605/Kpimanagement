export type StaffProfile = {
  parentUnit: string;
  unit: string;
  city: string;
  name: string;
  birthDate: string;
  hometown: string;
  rank: string;
  salaryCoefficient: string;
  partyPosition: string;
  partyCell: string;
  govPosition: string;
  workUnit: string;
  unionPosition: string;
  title: string;
};

export const staffProfile: StaffProfile = {
  parentUnit: 'CÔNG AN THÀNH PHỐ HÀ NỘI',
  unit: 'PHÒNG THAM MƯU',
  city: 'Hà Nội',
  name: 'Nguyễn Văn Hùng',
  birthDate: '12/05/1988',
  hometown: 'Xã Thanh Lâm, huyện Mê Linh, thành phố Hà Nội',
  rank: 'Thiếu tá',
  salaryCoefficient: '5,70',
  partyPosition: 'Đảng viên',
  partyCell: 'Chi bộ Đội Tổng hợp',
  govPosition: 'Cán bộ',
  workUnit: 'Đội Tổng hợp – Phòng Tham mưu',
  unionPosition: '',
  title: 'Cán bộ tham mưu tổng hợp'
};