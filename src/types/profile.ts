export type Profile = {
  /** Số hiệu CAND */
  code: string;
  name: string;
  /** yyyy-mm-dd */
  birthDate: string;
  hometown: string;
  rank: string;
  salaryCoefficient: string;
  position: string;
  specialty: string;
  /** Ảnh đại diện (data URL); rỗng thì hiện chữ viết tắt */
  avatar: string;
};