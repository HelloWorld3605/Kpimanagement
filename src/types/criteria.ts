import { VersionStatus } from './catalog';

export type Criterion = {
  id: string;
  content: string;
  score: number;
  /** Tiêu chí đảm bảo — mặc định đạt điểm tối đa nếu không có vi phạm */
  guaranteed: boolean;
};

export type CriteriaSection = {
  id: string;
  title: string;
  criteria: Criterion[];
};

export type CriteriaVersion = {
  version: number;
  status: VersionStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  decision?: string;
  records?: number;
  baseVersion?: number;
  createdBy?: string;
  createdAt?: string;
  sections: CriteriaSection[];
};

export type CriteriaSet = {
  id: string;
  label: string;
  titleLine: string;
  requiredTotal: number;
  versions: CriteriaVersion[];
};

export type CriterionDiff = {isNew?: boolean;contentChanged?: boolean;prevScore?: number;};