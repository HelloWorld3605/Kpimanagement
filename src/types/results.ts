import { Rank } from './selfReview';

export type ResultPeriod = {
  id: string;
  publishedAt: string;
  decidedBy: string;
};

export type UnitResult = {
  unitId: string;
  period: string;
  kpi: number;
  rank: Rank;
};