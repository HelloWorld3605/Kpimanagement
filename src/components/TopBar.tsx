import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MenuIcon, HomeIcon, StarIcon, BellIcon, PaletteIcon, SearchIcon } from 'lucide-react';
import { ThemeCustomizer } from './ThemeCustomizer';
import { CommandPalette } from './CommandPalette';
import { UserMenu } from './UserMenu';
import { BreadcrumbGroupMenu } from './BreadcrumbGroupMenu';
import { notificationsItem } from '../data/navigation';
import { usePermissions } from '../hooks/usePermissions';
import { AccessBadge } from './AccessBadge';
import { findNavContext } from '../utils/navigation';
import { useBreadcrumbOverride } from '../contexts/BreadcrumbContext';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationPopup } from './notifications/NotificationPopup';

type TopBarProps = {
  onToggleSidebar: () => void;
};

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const [starred, setStarred] = useState(false);
  const { pathname } = useLocation();
  const { group, item, sub: pathSub } = findNavContext(pathname);
  const override = useBreadcrumbOverride();
  const { can } = usePermissions();
  const { unread } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const sub = pathSub ? override ?? pathSub : undefined;
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  // Ctrl/⌘ + K mở ô tìm nhanh ở mọi màn
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    // Thanh trên cùng cố định 44px (bảng dính tiêu đề cột ngay bên dưới); phần còn lại thu theo cỡ chung 80%
    <header className="flex h-[44px] shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-5">
      <div className="flex min-w-0 items-center gap-4 text-gray-600">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Thu gọn menu"
          className="flex h-9 w-9 items-center justify-center rounded border border-gray-200 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'background-color 150ms ease-out' }}>
          
          <MenuIcon className="h-[18px] w-[18px]" />
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[17px]">
          {group ?
          <BreadcrumbGroupMenu group={group} /> :

          <Link to="/" aria-label="Trang chủ" className="rounded hover:text-gray-900">
              <HomeIcon className="h-[18px] w-[18px]" />
            </Link>
          }
          {item &&
          <>
              <span className="text-gray-400">›</span>
              {sub ?
            <Link to={item.path} className="shrink-0 whitespace-nowrap text-gray-500 hover:text-gray-900">
                  {item.label}
                </Link> :

            <span className="truncate font-semibold text-gray-900">{item.label}</span>
            }
            </>
          }
          {!item && override &&
          <>
              <span className="text-gray-400">›</span>
              <span className="truncate font-semibold text-gray-900">{override}</span>
            </>
          }
          {sub &&
          <>
              <span className="text-gray-400">›</span>
              <span className="truncate font-semibold text-gray-900" title={sub}>
                {sub}
              </span>
            </>
          }
          <button
            type="button"
            onClick={() => setStarred((s) => !s)}
            aria-pressed={starred}
            aria-label="Đánh dấu yêu thích"
            className="ml-1 rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            
            <StarIcon className={`h-5 w-5 ${starred ? 'fill-gold-400 text-gold-500' : 'text-brand-600'}`} />
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-haspopup="dialog"
          aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
          className="hidden h-8 w-56 items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-2.5 text-[13px] text-gray-500 hover:border-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:flex lg:w-64"
          style={{ transition: 'border-color 150ms ease-out, color 150ms ease-out' }}>
          
          <SearchIcon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1 truncate text-left">Tìm kiếm…</span>
          <kbd className="rounded border border-gray-300 bg-white px-1.5 font-sans text-[11px] text-gray-500">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <AccessBadge />
        <button
          type="button"
          onClick={() => setThemeOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={themeOpen}
          aria-label="Tùy chỉnh giao diện"
          title="Tùy chỉnh giao diện"
          className={`rounded-md p-2 text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${themeOpen ? 'bg-brand-50' : ''}`}
          style={{ transition: 'background-color 150ms ease-out' }}>
          
          <PaletteIcon className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <ThemeCustomizer open={themeOpen} onClose={() => setThemeOpen(false)} />
        {can(notificationsItem.feature) &&
        <>
            <button
            type="button"
            onClick={() => setNotifOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={notifOpen}
            aria-label={unread ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'}
            title="Thông báo"
            className={`relative rounded-md p-2 text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${notifOpen ? 'bg-brand-50' : ''}`}
            style={{ transition: 'background-color 150ms ease-out' }}>
            
              <BellIcon className="h-5 w-5" strokeWidth={1.75} />
              {unread ?
            <span className="pointer-events-none absolute -right-0.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                  {unread}
                </span> :
            null}
            </button>
            <NotificationPopup open={notifOpen} onClose={() => setNotifOpen(false)} />
          </>
        }
        <UserMenu />
      </div>
    </header>);

}