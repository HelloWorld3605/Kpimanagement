import { Profile } from '../types/profile';

export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** yyyy-mm-dd → dd/mm/yyyy */
export function displayDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Thời điểm hiện tại dạng dd/mm/yyyy hh:mm (cùng định dạng "Đăng nhập gần nhất") */
export function nowStamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export type ProfileErrors = Partial<Record<keyof Profile, string>>;

export function validateProfile(p: Profile): ProfileErrors {
  const e: ProfileErrors = {};
  if (!p.code.trim()) e.code = 'Nhập số hiệu';
  if (!p.name.trim()) e.name = 'Nhập họ và tên';
  if (p.salaryCoefficient.trim() && !/^\d{1,2}([,.]\d{1,2})?$/.test(p.salaryCoefficient.trim()))
  e.salaryCoefficient = 'Hệ số dạng 5,70';
  if (p.birthDate && p.birthDate > new Date().toISOString().slice(0, 10)) e.birthDate = 'Ngày sinh không hợp lệ';
  return e;
}

export const sameProfile = (a: Profile, b: Profile) => (Object.keys(a) as (keyof Profile)[]).every((k) => a[k] === b[k]);