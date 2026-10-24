import React from 'react';
import { AppNotification } from '../../types/notification';
import { categoryMeta, relativeTime } from '../../utils/notification';

type NotificationRowProps = {
  item: AppNotification;
  onOpen: (item: AppNotification) => void;
  /** compact: dùng trong pop up — nội dung cắt 2 dòng, không hiện nhãn loại */
  compact?: boolean;
};

export function NotificationRow({ item, onOpen, compact }: NotificationRowProps) {
  const meta = categoryMeta[item.category];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`relative flex w-full items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
      compact ? 'px-4 py-3' : 'px-4 py-3.5'} ${
      item.read ? 'hover:bg-gray-50' : 'bg-brand-50/60 hover:bg-brand-50'}`}
      style={{ transition: 'background-color 150ms ease-out' }}>
      
      {!item.read && <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-600" aria-hidden />}
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.read ? 'bg-gray-100 text-gray-500' : 'bg-brand-100 text-brand-700'}`}
        aria-hidden>
        
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={`truncate text-[14px] ${item.read ? 'font-medium text-gray-800' : 'font-semibold text-gray-900'}`}>{item.title}</span>
          <span className="shrink-0 text-xs text-gray-500">{relativeTime(item.at)}</span>
        </span>
        <span className={`mt-0.5 block text-[13px] text-gray-600 ${compact ? 'line-clamp-2' : ''}`}>{item.body}</span>
        {!compact && <span className="mt-1 block text-xs text-gray-500">{meta.label}</span>}
      </span>
      {!item.read && <span className="sr-only">Chưa đọc</span>}
    </button>);

}