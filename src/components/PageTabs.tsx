import React from "react";
import { createPortal } from "react-dom";
import { usePageTabsSlot } from "../contexts/PageTabsContext";
import { BoxIcon } from "lucide-react";
export type PageTab = {
  id: string;
  label: string;
  icon?: BoxIcon;
  count?: number;
};
type PageTabsProps = {
  tabs: PageTab[];
  active: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  /** Hành động theo ngữ cảnh, hiển thị bên phải hàng tab */
  actions?: React.ReactNode;
};

/** Thanh tab ngang dưới header — chia nội dung của MỘT màn thành nhiều phần. */
export function PageTabs({
  tabs,
  active,
  onChange,
  ariaLabel,
  actions
}: PageTabsProps) {
  const slot = usePageTabsSlot();
  if (!slot) return null;
  return createPortal(<div className="flex items-center gap-3 border-b border-gray-200 bg-white px-3">
      <div role="tablist" aria-label={ariaLabel} className="scrollbar-none flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return <button key={tab.id} role="tab" type="button" aria-selected={isActive} onClick={() => onChange(tab.id)} className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${isActive ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'}`} style={{
          transition: 'color 150ms ease-out'
        }}>
              {Icon && <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />}
              {tab.label}
              {tab.count ? <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">
                  {tab.count}
                </span> : null}
              {isActive && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-brand-600" aria-hidden />}
            </button>;
      })}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 py-1.5">{actions}</div>}
    </div>, slot);
}