import React, { createContext, useContext, useEffect, useState } from 'react';

type BreadcrumbContextValue = {
  label?: string;
  setLabel: (label?: string) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue>({ setLabel: () => undefined });

export function BreadcrumbProvider({ children }: {children: React.ReactNode;}) {
  const [label, setLabel] = useState<string>();
  return <BreadcrumbContext.Provider value={{ label, setLabel }}>{children}</BreadcrumbContext.Provider>;
}

/** Đặt nhãn cuối của breadcrumb trên header (thay cho tiêu đề trong nội dung). */
export function useBreadcrumbLabel(label?: string) {
  const { setLabel } = useContext(BreadcrumbContext);
  useEffect(() => {
    setLabel(label);
    return () => setLabel(undefined);
  }, [label, setLabel]);
}

export function useBreadcrumbOverride() {
  return useContext(BreadcrumbContext).label;
}