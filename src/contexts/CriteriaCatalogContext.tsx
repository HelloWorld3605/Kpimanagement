import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CriteriaSet } from '../types/criteria';
import { criteriaSets } from '../data/criteriaCatalog';
import { useSyncedCollection } from '../hooks/useSyncedCollection';

type CriteriaCatalogContextValue = {
  sets: CriteriaSet[];
  updateSet: (id: string, updater: (s: CriteriaSet) => CriteriaSet) => void;
};

const CriteriaCatalogContext = createContext<CriteriaCatalogContextValue | null>(null);

export function CriteriaCatalogProvider({ children }: {children: React.ReactNode;}) {
  const [sets, setSets] = useSyncedCollection<CriteriaSet>('criteriaSets', (s) => s.id, criteriaSets);
  const updateSet = useCallback(
    (id: string, updater: (s: CriteriaSet) => CriteriaSet) => setSets((prev) => prev.map((s) => s.id === id ? updater(s) : s)),
    []
  );
  const value = useMemo(() => ({ sets, updateSet }), [sets, updateSet]);
  return <CriteriaCatalogContext.Provider value={value}>{children}</CriteriaCatalogContext.Provider>;
}

export function useCriteriaCatalog() {
  const ctx = useContext(CriteriaCatalogContext);
  if (!ctx) throw new Error('useCriteriaCatalog must be used inside CriteriaCatalogProvider');
  return ctx;
}