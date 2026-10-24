import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navEntries, NavItem } from '../data/navigation';
import { isPathActive } from '../utils/navigation';
import { usePermissions } from '../hooks/usePermissions';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

type SidebarProps = {
  collapsed: boolean;
};

const LOGO = "/Logo_Bo_Cong_an_VN.png";
const DRUM = "/trong-dong.webp";
const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

/** Hai kiểu thanh bên (Tùy chỉnh giao diện → Thanh bên): tối theo màu chủ đạo, hoặc cùng màu nền khối */
const skins = {
  dark: {
    aside: '',
    active: 'bg-white/[0.12] text-gold-200',
    idle: 'text-gold-200/85 hover:bg-white/[0.07] hover:text-gold-200',
    bar: 'bg-gold-400',
    ring: 'focus-visible:ring-gold-300',
    badge: 'bg-gold-400 text-[#3B1D06]',
    dot: 'bg-gold-400',
    group: 'text-gold-300 hover:text-gold-200',
    divider: 'bg-white/15',
    rule: 'bg-gold-400/70',
    title: 'text-gold-200',
    footer: 'border-white/10 text-gold-200/70'
  },
  surface: {
    aside: 'border-r border-gray-200 bg-white',
    active: 'bg-brand-50 text-brand-700',
    idle: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    bar: 'bg-brand-600',
    ring: 'focus-visible:ring-brand-500',
    badge: 'bg-brand-600 text-white',
    dot: 'bg-brand-600',
    group: 'text-gray-500 hover:text-gray-900',
    divider: 'bg-gray-200',
    rule: 'bg-brand-600/40',
    title: 'text-brand-700',
    footer: 'border-gray-200 text-gray-500'
  }
};

export function Sidebar({ collapsed }: SidebarProps) {
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { unread } = useNotifications();
  const { settings, isDark } = useTheme();
  const skin = skins[settings.sidebar];
  const darkBg = settings.sidebar === 'dark';
  // Trống đồng: nét sáng mờ trên nền tối, nét chìm trên nền sáng
  const drumOnDark = darkBg || isDark;
  // Chỉ hiện mục được quyền xem; nhóm không còn mục nào thì ẩn cả nhóm
  const entries = navEntries.flatMap((e) => {
    if (e.type === 'link') return can(e.feature) ? [e] : [];
    const items = e.items.filter((i) => can(i.feature));
    return items.length ? [{ ...e, items }] : [];
  });

  const renderLink = (navLink: NavItem, opts: {hidden?: boolean;nested?: boolean;} = {}) => {
    // Thông báo: số chưa đọc lấy trực tiếp, đọc xong thì badge tự mất
    const link = navLink.id === 'notifications' ? { ...navLink, badge: unread || undefined } : navLink;
    const Icon = link.icon;
    const isActive = isPathActive(pathname, link.path);
    return (
      <li key={link.id} className="px-3">
        <button
          type="button"
          onClick={() => navigate(link.path)}
          aria-current={isActive ? 'page' : undefined}
          tabIndex={opts.hidden ? -1 : undefined}
          title={link.label}
          className={`relative flex w-full items-center gap-3 rounded py-2 text-left text-[14px] font-medium focus-visible:outline-none focus-visible:ring-1 ${skin.ring} ${
          collapsed ? 'justify-center px-0' : opts.nested ? 'pl-5 pr-3' : 'px-3'} ${
          isActive ? `${skin.active} ${darkBg ? '' : 'font-semibold'}` : skin.idle}`}
          style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
          
          {isActive && <span className={`absolute inset-y-0 left-0 w-[3px] ${skin.bar}`} aria-hidden />}
          <span className="relative shrink-0">
            <Icon className="h-[15px] w-[15px]" strokeWidth={1.6} />
            {collapsed && link.badge ? <span className={`absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full ${skin.dot}`} /> : null}
          </span>
          {!collapsed &&
          <>
              <span className="min-w-0 flex-1 truncate">{link.label}</span>
              {link.badge ?
            <span className={`flex h-5 min-w-[16px] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${skin.badge}`}>
                  {link.badge}
                </span> :
            null}
            </>
          }
        </button>
      </li>);

  };

  return (
    <aside
      className={`relative hidden h-full shrink-0 flex-col overflow-hidden md:flex ${skin.aside} ${collapsed ? 'w-[58px]' : 'w-[212px]'}`}
      style={{ transition: `width 220ms ${EASE}`, backgroundColor: darkBg ? 'rgb(var(--sidebar))' : undefined }}>
      
      {/* Trống đồng chìm làm nền, tâm lệch sang phải, căn giữa chiều dọc */}
      <img
        src={DRUM}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute left-[10px] top-1/2 w-[600px] max-w-none -translate-y-1/2 select-none"
        style={drumOnDark ? { filter: 'invert(1)', mixBlendMode: 'screen', opacity: 0.09 } : { mixBlendMode: 'multiply', opacity: 0.05 }} />
      
      <div className="relative z-10 flex shrink-0 flex-col items-center px-4 pb-1.5 pt-2.5">
        <img src={LOGO} alt="Logo Bộ Công an" className={`${collapsed ? 'h-10 w-10' : 'h-14 w-14'} shrink-0 object-contain`} />
        {!collapsed &&
        <>
            <span className={`mt-1.5 h-px w-14 ${skin.rule}`} aria-hidden />
            <span className={`mt-1.5 whitespace-nowrap font-serif text-[21px] ${skin.title}`}>Quản lý KPI</span>
          </>
        }
      </div>

      <nav className="scrollbar-none relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3" aria-label="Điều hướng chính">
        <ul className="space-y-0.5">
          {entries.map((entry) => {
            if (entry.type === 'link') {
              return <React.Fragment key={entry.id}>{renderLink(entry)}</React.Fragment>;
            }
            const isOpen = collapsed || !closed[entry.id];
            return (
              <li key={entry.id} className="pt-2">
                {collapsed ?
                <div className={`mx-4 mb-2 h-px ${skin.divider}`} aria-hidden /> :

                <button
                  type="button"
                  onClick={() => setClosed((p) => ({ ...p, [entry.id]: !p[entry.id] }))}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center justify-between px-6 py-2 text-left text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset ${skin.group} ${skin.ring}`}
                  style={{ transition: 'color 150ms ease-out' }}>
                  
                    <span className="whitespace-nowrap">{entry.label}</span>
                    <ChevronDownIcon
                    className={`h-4 w-4 ${isOpen ? '' : '-rotate-90'}`}
                    style={{ transition: `transform 200ms ${EASE}` }} />
                  
                  </button>
                }
                <div
                  className="grid"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', transition: `grid-template-rows 200ms ${EASE}` }}
                  aria-hidden={!isOpen}>
                  
                  <ul className="min-h-0 space-y-0.5 overflow-hidden">{entry.items.map((item) => renderLink(item, { hidden: !isOpen, nested: true }))}</ul>
                </div>
              </li>);

          })}
        </ul>
      </nav>

      {!collapsed &&
      <footer className={`relative z-10 shrink-0 border-t px-4 py-3 text-center text-xs ${skin.footer}`}>
          Phiên bản: 3.0.0.2610020853
        </footer>
      }
    </aside>);

}