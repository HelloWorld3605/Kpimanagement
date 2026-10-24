import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { NavGroup } from '../data/navigation';
import { usePermissions } from '../hooks/usePermissions';
import { isPathActive } from '../utils/navigation';

type Anchor = {x: number;y: number;};

/**
 * Tên nhóm trên breadcrumb: bấm để mở danh sách các mục con của nhóm (theo sidebar).
 * Danh sách thả thẳng xuống, căn giữa dưới tên nhóm, gắn vào body để không bị phần nào che.
 */
export function BreadcrumbGroupMenu({ group }: {group: NavGroup;}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const { pathname } = useLocation();
  const { can } = usePermissions();
  const items = group.items.filter((i) => can(i.feature));

  useEffect(() => setOpen(false), [pathname]);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const r = buttonRef.current?.getBoundingClientRect();
      if (r) setAnchor({ x: r.left + r.width / 2, y: r.bottom + 8 });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="hidden sm:block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1 whitespace-nowrap rounded px-1 py-0.5 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        open ? 'text-gray-900' : 'text-gray-500'}`
        }
        style={{ transition: 'color 150ms ease-out' }}>
        
        {group.label}
        <ChevronDownIcon className="h-4 w-4" aria-hidden />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && anchor &&
          // Lớp ngoài lo vị trí + căn giữa, lớp trong lo chuyển động để hai transform không đè nhau
          <div className="fixed z-[100] -translate-x-1/2" style={{ left: anchor.x, top: anchor.y }}>
              <motion.ul
              ref={menuRef}
              role="menu"
              aria-label={group.label}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="min-w-[220px] rounded-md border border-gray-200 bg-white py-1.5 shadow-lg">
              
                {items.map((i) => {
                const active = isPathActive(pathname, i.path);
                return (
                  <li key={i.path} role="none">
                      <Link
                      to={i.path}
                      role="menuitem"
                      aria-current={active ? 'page' : undefined}
                      className={`relative block whitespace-nowrap py-2 pl-4 pr-5 text-[14px] focus-visible:outline-none focus-visible:bg-gray-100 ${
                      active ? 'bg-brand-50 font-semibold text-brand-800' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`
                      }
                      style={{ transition: 'background-color 120ms ease-out, color 120ms ease-out' }}>
                      
                        {/* Vạch vàng bên trái — giống mục đang mở trên sidebar */}
                        {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-gold-400" aria-hidden />}
                        {i.label}
                      </Link>
                    </li>);

              })}
              </motion.ul>
            </div>
          }
        </AnimatePresence>,
        document.body
      )}
    </div>);

}