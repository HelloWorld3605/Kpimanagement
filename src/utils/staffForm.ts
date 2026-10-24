import { findUnit, unitPath } from './org';
import { MemberRole, MemberStatus, UnitMember } from '../types/org';

/** Form nhân sự: tài khoản gắn kèm + hồ sơ cá nhân + nơi công tác */
export type StaffFormValues = {
  /** Tên đăng nhập của tài khoản gắn kèm; '' = chưa gắn */
  username: string;
  name: string;
  code: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ';
  hometown: string;
  phone: string;
  rank: string;
  position: string;
  memberRole: MemberRole;
  education: string;
  partyMember: boolean;
  workStatus: MemberStatus;
  agencyId: string;
  departmentId: string;
};
export type StaffFormErrors = Partial<Record<keyof StaffFormValues, string>>;

export const emptyStaffForm: StaffFormValues = {
  username: '',
  name: '',
  code: '',
  birthDate: '',
  gender: 'Nam',
  hometown: '',
  phone: '',
  rank: '',
  position: '',
  memberRole: 'can-bo',
  education: '',
  partyMember: false,
  workStatus: 'active',
  agencyId: '',
  departmentId: ''
};

/** Cơ quan = Bộ Tư lệnh hoặc đơn vị trực thuộc trực tiếp; Phòng ban = đơn vị sâu hơn bên trong cơ quan đó */
export function splitUnit(unitId: string) {
  const path = unitPath(unitId);
  if (path.length <= 1) return { agencyId: path[0]?.id ?? '', departmentId: '' };
  return { agencyId: path[1].id, departmentId: path.length > 2 ? unitId : '' };
}

/** "Bộ Tư lệnh" / "Phòng Tham mưu" + phòng ban bên trong (nếu có) */
export function workplaceOf(unitId: string | undefined) {
  if (!unitId) return { agency: undefined, department: undefined };
  const { agencyId, departmentId } = splitUnit(unitId);
  return { agency: findUnit(agencyId), department: departmentId ? findUnit(departmentId) : undefined };
}

export function valuesFromMember(m: UnitMember, username: string): StaffFormValues {
  return {
    username,
    name: m.name,
    code: m.code,
    birthDate: m.birthDate,
    gender: m.gender,
    hometown: m.hometown,
    phone: m.phone,
    rank: m.rank,
    position: m.position,
    memberRole: m.role,
    education: m.education,
    partyMember: m.partyMember,
    workStatus: m.status,
    ...splitUnit(m.unitId)
  };
}

/** Phần hồ sơ ghi vào nhân sự (không gồm mã, ngày vào ngành, kết quả các quý) */
export function memberPatchFromValues(f: StaffFormValues): Omit<UnitMember, 'id' | 'joinedAt' | 'results'> {
  return {
    code: f.code.trim(),
    name: f.name.trim(),
    gender: f.gender,
    birthDate: f.birthDate,
    hometown: f.hometown.trim(),
    rank: f.rank,
    position: f.position.trim() || 'Cán bộ',
    role: f.memberRole,
    unitId: f.departmentId || f.agencyId,
    partyMember: f.partyMember,
    education: f.education.trim(),
    phone: f.phone.trim(),
    status: f.workStatus
  };
}

type ValidateOptions = {mode: 'create' | 'edit';members: UnitMember[];memberId?: string;};

export function validateStaffForm(f: StaffFormValues, { mode, members, memberId }: ValidateOptions): StaffFormErrors {
  const e: StaffFormErrors = {};
  if (mode === 'create' && !f.username) e.username = 'Chọn tài khoản để tạo hồ sơ nhân sự.';
  if (!f.name.trim()) e.name = 'Nhập họ tên.';
  if (!f.code.trim()) e.code = 'Nhập số hiệu.';else
  if (members.some((m) => m.code === f.code.trim() && m.id !== memberId)) e.code = 'Số hiệu đã có trong hệ thống.';
  if (f.birthDate && f.birthDate > new Date().toISOString().slice(0, 10)) e.birthDate = 'Ngày sinh không hợp lệ.';
  if (f.phone.trim() && !/^[0-9 +.]{9,15}$/.test(f.phone.trim())) e.phone = 'Số điện thoại không hợp lệ.';
  if (!f.agencyId) e.agencyId = 'Chọn cơ quan, đơn vị.';
  return e;
}