import React, { createContext, useContext } from 'react';

const PageTabsSlotContext = createContext<HTMLElement | null>(null);

type PageTabsProviderProps = {
  slot: HTMLElement | null;
  children: React.ReactNode;
};

export function PageTabsProvider({ slot, children }: PageTabsProviderProps) {
  return <PageTabsSlotContext.Provider value={slot}>{children}</PageTabsSlotContext.Provider>;
}

export function usePageTabsSlot() {
  return useContext(PageTabsSlotContext);
}