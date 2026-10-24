import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { SelfReview } from '../types/selfReview';
import { selfReviews } from '../data/selfReviews';
import { teamReviews } from '../data/teamReviews';
import { useSyncedCollection } from '../hooks/useSyncedCollection';
import { useEnsureSeeds } from '../hooks/useEnsureSeeds';

type SelfReviewContextValue = {
  reviews: SelfReview[];
  updateReview: (id: string, updater: (r: SelfReview) => SelfReview) => void;
};

const SelfReviewContext = createContext<SelfReviewContextValue | null>(null);
const idOf = (r: SelfReview) => r.id;

export function SelfReviewProvider({ children }: {children: React.ReactNode;}) {
  const [reviews, setReviews] = useSyncedCollection<SelfReview>('selfReviews', idOf, () => [...selfReviews, ...teamReviews]);
  useEnsureSeeds(reviews, setReviews, teamReviews, idOf);
  const updateReview = useCallback(
    (id: string, updater: (r: SelfReview) => SelfReview) => setReviews((prev) => prev.map((r) => r.id === id ? updater(r) : r)),
    []
  );
  const value = useMemo(() => ({ reviews, updateReview }), [reviews, updateReview]);
  return <SelfReviewContext.Provider value={value}>{children}</SelfReviewContext.Provider>;
}

export function useSelfReview() {
  const ctx = useContext(SelfReviewContext);
  if (!ctx) throw new Error('useSelfReview must be used inside SelfReviewProvider');
  return ctx;
}