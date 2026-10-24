import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheckIcon } from 'lucide-react';
import { EmptyMark } from '../ui/EmptyMark';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { NotificationRow } from './NotificationRow';
import { useNotifications } from '../../contexts/NotificationContext';
import { AppNotification } from '../../types/notification';

type NotificationPopupProps = {
  open: boolean;
  onClose: () => void;
};

type Filter = 'all' | 'unread';

/** Pop up vuông giữa màn hình: thông báo gần đây; "Xem tất cả" mở màn Thông báo */
export function NotificationPopup({ open, onClose }: NotificationPopupProps) {
  const navigate = useNavigate();
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<Filter>('all');
  const list = (filter === 'unread' ? items.filter((n) => !n.read) : items).slice(0, 8);

  const openItem = (n: AppNotification) => {
    markRead(n.id);
    if (n.link) {
      onClose();
      navigate(n.link);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="square"
      title="Thông báo"
      description={unread ? `${unread} thông báo chưa đọc` : 'Đã đọc hết thông báo'}
      footer={
      <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={markAllRead} disabled={!unread} className={`${btnGhost} -ml-2 px-2 disabled:cursor-not-allowed disabled:opacity-50`} style={btnTransition}>
            <CheckCheckIcon className="h-4 w-4" aria-hidden />
            Đánh dấu đã đọc
          </button>
          <button
          type="button"
          data-autofocus
          onClick={() => {
            onClose();
            navigate('/thong-bao');
          }}
          className={btnPrimary}
          style={btnTransition}>
          
            Xem tất cả
          </button>
        </div>
      }>
      
      <div className="flex h-full flex-col">
        <div role="tablist" aria-label="Lọc thông báo" className="flex shrink-0 gap-5 border-b border-gray-200 px-4">
          {(
          [
          ['all', 'Tất cả'],
          ['unread', `Chưa đọc${unread ? ` (${unread})` : ''}`]] as
          const).
          map(([id, label]) => {
            const on = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(id)}
                className={`relative py-2.5 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${on ? 'text-brand-700' : 'text-gray-500 hover:text-gray-800'}`}
                style={{ transition: 'color 150ms ease-out' }}>
                
                {label}
                {on && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" aria-hidden />}
              </button>);

          })}
        </div>
        {list.length === 0 ?
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <EmptyMark />
            <p className="mt-2 text-[14px] text-gray-600">Không có thông báo chưa đọc.</p>
          </div> :

        <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
            {list.map((n) =>
          <li key={n.id}>
                <NotificationRow item={n} onOpen={openItem} compact />
              </li>
          )}
          </ul>
        }
      </div>
    </Modal>);

}