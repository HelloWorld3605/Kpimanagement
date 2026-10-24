import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheckIcon } from 'lucide-react';
import { EmptyMark } from '../components/ui/EmptyMark';
import { Select } from '../components/ui/Select';
import { TableToolbar, FilterField, toolbarBtn } from '../components/ui/TableToolbar';
import { NotificationRow } from '../components/notifications/NotificationRow';
import { useNotifications } from '../contexts/NotificationContext';
import { useListState } from '../hooks/useListState';
import { ExportColumn, exportTable } from '../utils/tableExport';
import { AppNotification, NotificationCategory } from '../types/notification';
import { categoryMeta, groupByDay } from '../utils/notification';

type ReadFilter = '' | 'unread' | 'read';

const fold = (s: string) =>
s.
normalize('NFD').
replace(/[\u0300-\u036f]/g, '').
replace(/đ/g, 'd').
replace(/Đ/g, 'D').
toLowerCase();

const exportColumns: ExportColumn<AppNotification>[] = [
{ header: 'STT', value: (_, i) => i + 1 },
{ header: 'Tiêu đề', value: (n) => n.title },
{ header: 'Nội dung', value: (n) => n.body },
{ header: 'Loại', value: (n) => categoryMeta[n.category].label },
{ header: 'Thời gian', value: (n) => n.at.replace('T', ' ') },
{ header: 'Trạng thái', value: (n) => n.read ? 'Đã đọc' : 'Chưa đọc' }];


export function Notifications() {
  const navigate = useNavigate();
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [query, setQuery] = useListState('notifications:query', '');
  const [readFilter, setReadFilter] = useListState<ReadFilter>('notifications:read', '');
  const [category, setCategory] = useListState<NotificationCategory | ''>('notifications:category', '');

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return items.filter(
      (n) =>
      (!readFilter || (readFilter === 'unread' ? !n.read : n.read)) && (
      !category || n.category === category) && (
      !q || fold(`${n.title} ${n.body}`).includes(q))
    );
  }, [items, readFilter, category, query]);
  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const activeFilters = (readFilter ? 1 : 0) + (category ? 1 : 0);
  const clearFilters = () => {
    setReadFilter('');
    setCategory('');
  };

  const openItem = (n: AppNotification) => {
    markRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="flex flex-1 flex-col">
      <TableToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Tìm kiếm…"
        activeFilters={activeFilters}
        onClearFilters={clearFilters}
        filters={
        <>
            <FilterField label="Trạng thái">
              <Select aria-label="Trạng thái" value={readFilter} onChange={(v) => setReadFilter(v as ReadFilter)}>
                <option value="">Tất cả</option>
                <option value="unread">{`Chưa đọc${unread ? ` (${unread})` : ''}`}</option>
                <option value="read">Đã đọc</option>
              </Select>
            </FilterField>
            <FilterField label="Loại thông báo">
              <Select aria-label="Loại thông báo" value={category} onChange={(v) => setCategory(v as NotificationCategory | '')}>
                <option value="">Tất cả</option>
                {(Object.keys(categoryMeta) as NotificationCategory[]).map((c) =>
              <option key={c} value={c}>
                    {categoryMeta[c].label}
                  </option>
              )}
              </Select>
            </FilterField>
          </>
        }
        onExport={(format) => exportTable('thong-bao', exportColumns, filtered, format)}
        actions={
        <button
          type="button"
          onClick={markAllRead}
          disabled={!unread}
          className={`${toolbarBtn} disabled:cursor-not-allowed disabled:opacity-50`}
          style={{ transition: 'background-color 150ms ease-out' }}>
          
            <CheckCheckIcon className="h-4 w-4" aria-hidden />
            Đánh dấu đã đọc
          </button>
        } />
      

      {groups.length === 0 ?
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <EmptyMark size="md" />
          <p className="mt-3 text-[14px] font-medium text-gray-800">Không có thông báo phù hợp</p>
          <p className="mt-1 text-[13px] text-gray-500">Thử bỏ bớt bộ lọc hoặc từ khoá để xem các thông báo khác.</p>
        </div> :

      <div className="flex-1">
          {groups.map((g) =>
        <section key={g.label} aria-label={g.label}>
              {/* Cuộn theo trang như các màn danh sách: nhãn ngày dính ngay dưới thanh trên cùng */}
              <h2 className="sticky top-[var(--sticky-top,44px)] z-[1] border-b border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500">{g.label}</h2>
              <ul className="divide-y divide-gray-100 border-b border-gray-200">
                {g.items.map((n) =>
            <li key={n.id}>
                    <NotificationRow item={n} onOpen={openItem} />
                  </li>
            )}
              </ul>
            </section>
        )}
        </div>
      }
    </div>);

}