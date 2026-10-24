import { Rank } from './selfReview';

export type UnitLevel = 'btl' | 'phong' | 'trung-doan' | 'tieu-doan' | 'doi' | 'dai-doi' | 'trung-doi' | 'tieu-doi';

export type Unit = {
  id: string;
  name: string;
  shortName?: string;
  level: UnitLevel;
  parentId: string | null;
};

/** truong: cấp trưởng · pho: cấp phó · can-bo: không giữ chức vụ lãnh đạo, chỉ huy */
export type MemberRole = 'truong' | 'pho' | 'can-bo';

export type MemberStatus = 'active' | 'training' | 'leave' | 'seconded';

export type QuarterResult = {
  period: string;
  kpi: number;
  rank: Rank;
};

export type UnitMember = {
  id: string;
  code: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  birthDate: string;
  hometown: string;
  rank: string;
  position: string;
  role: MemberRole;
  unitId: string;
  joinedAt: string;
  partyMember: boolean;
  education: string;
  phone: string;
  status: MemberStatus;
  results: QuarterResult[];
};