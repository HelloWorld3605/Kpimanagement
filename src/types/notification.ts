export type NotificationCategory = 'task' | 'review' | 'period' | 'system';

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** Thời điểm nhận, dạng ISO yyyy-mm-ddThh:mm */
  at: string;
  read: boolean;
  /** Màn mở ra khi bấm vào thông báo */
  link?: string;
};