import { CalendarDaysIcon, ClipboardListIcon, FileCheckIcon, InfoIcon, LucideIcon } from 'lucide-react';
import { AppNotification, NotificationCategory } from '../types/notification';

/** "Bây giờ" cố định cho dữ liệu mẫu */
const NOW = new Date('2026-10-22T10:00');

export const categoryMeta: Record<NotificationCategory, {label: string;icon: LucideIcon;}> = {
  task: { label: 'Nhiệm vụ', icon: ClipboardListIcon },
  review: { label: 'Duyệt & đánh giá', icon: FileCheckIcon },
  period: { label: 'Kỳ đánh giá', icon: CalendarDaysIcon },
  system: { label: 'Hệ thống', icon: InfoIcon }
};

const pad = (n: number) => String(n).padStart(2, '0');

export function relativeTime(at: string) {
  const d = new Date(at);
  const mins = Math.round((NOW.getTime() - d.getTime()) / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24 && d.getDate() === NOW.getDate()) return `${hours} giờ trước`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (dayGroup(at) === 'Hôm qua') return `Hôm qua, ${time}`;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${time}`;
}

export function dayGroup(at: string): 'Hôm nay' | 'Hôm qua' | 'Trước đó' {
  const d = new Date(at);
  const start = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate()).getTime();
  if (d.getTime() >= start) return 'Hôm nay';
  if (d.getTime() >= start - 86400000) return 'Hôm qua';
  return 'Trước đó';
}

export function groupByDay(items: AppNotification[]) {
  const order = ['Hôm nay', 'Hôm qua', 'Trước đó'] as const;
  return order.
  map((label) => ({ label, items: items.filter((n) => dayGroup(n.at) === label) })).
  filter((g) => g.items.length > 0);
}