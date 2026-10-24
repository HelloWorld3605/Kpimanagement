import React, { createContext, useContext, useMemo } from 'react';
import { useSyncedCollection } from '../hooks/useSyncedCollection';
import { AppNotification } from '../types/notification';
import { notifications as seed } from '../data/notifications';

type NotificationContextValue = {
  items: AppNotification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  /** Gửi thông báo nghiệp vụ (trả lại phiếu, trình duyệt, yêu cầu chỉnh sửa…) */
  push: (n: Pick<AppNotification, 'category' | 'title' | 'body' | 'link'>) => void;
};

const isoNow = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: {children: React.ReactNode;}) {
  const [items, setItems] = useSyncedCollection<AppNotification>('notifications', (n) => n.id, () => [...seed].sort((a, b) => b.at.localeCompare(a.at)));

  const value = useMemo<NotificationContextValue>(
    () => ({
      items,
      unread: items.filter((n) => !n.read).length,
      markRead: (id) => setItems((list) => list.map((n) => n.id === id && !n.read ? { ...n, read: true } : n)),
      markAllRead: () => setItems((list) => list.map((n) => n.read ? n : { ...n, read: true })),
      push: (n) => setItems((list) => [{ ...n, id: `n-${Date.now().toString(36)}`, at: isoNow(), read: false }, ...list])
    }),
    [items]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications phải dùng trong NotificationProvider');
  return ctx;
}