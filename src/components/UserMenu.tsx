import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckIcon, ChevronDownIcon, LogOutIcon, RepeatIcon, UserRoundIcon } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { useAccess } from '../contexts/AccessContext';
import { usePermissions } from '../hooks/usePermissions';
import { initials } from '../utils/profile';
import { findMember, findUnit } from '../utils/org';
import { roleLabel } from '../utils/access';

export function UserMenu() {
  const { profile } = useProfile();
  const { logout, loginAs } = useAuth();
  const { accounts, demoSwitcher } = useAccess();
  const { account, member } = usePermissions();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) setSwitching(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unit = member ? findUnit(member.unitId)?.name : undefined;
  const switchTo = async (username: string) => {
    setOpen(false);
    try {
      await loginAs(username);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không đổi được tài khoản.');
    }
  };

  const itemClass =
  'flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] text-gray-800 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none';

  return (
    <div ref={ref} className="relative ml-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ transition: 'background-color 150ms ease-out' }}>
        
        {profile.avatar ?
        <img src={profile.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200" /> :

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {initials(profile.name)}
          </span>
        }
        <span className="hidden whitespace-nowrap text-[15px] font-medium text-gray-800 lg:inline">{profile.name}</span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 ${open ? 'rotate-180' : ''}`} style={{ transition: 'transform 150ms ease-out' }} />
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-40 mt-2 w-80 origin-top-right overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          
            {/* Đầu menu theo màu chủ đạo — đổi theo "Tùy chỉnh giao diện" */}
            <div className="bg-brand-600 px-4 py-3">
              <p className="truncate text-[14px] font-semibold text-white">
                {profile.rank} {profile.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-white/80">
                {account?.username} · Số hiệu {profile.code}
                {unit && ` · ${unit}`}
              </p>
            </div>
            {switching ?
          <div className="max-h-[360px] overflow-y-auto py-1">
                <p className="px-4 pb-1 pt-2 text-xs text-gray-500">Chọn tài khoản demo để xem giao diện theo vai trò</p>
                {accounts.
            filter((a) => a.active).
            map((a) => {
              const m = findMember(a.memberId);
              const current = a.username === account?.username;
              return (
                <button
                  key={a.username}
                  type="button"
                  role="menuitemradio"
                  aria-checked={current}
                  onClick={() => !current && switchTo(a.username)}
                  className={`${itemClass} items-start`}
                  style={{ transition: 'background-color 120ms ease-out' }}>
                  
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                          {current && <CheckIcon className="h-4 w-4 text-brand-600" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-gray-900">{a.roles.map(roleLabel).join(' · ')}</span>
                          <span className="block truncate text-xs text-gray-500">
                            {a.username} · {m?.name}
                          </span>
                        </span>
                      </button>);

            })}
              </div> :

          <div className="py-1">
                <Link to="/ho-so-ca-nhan" role="menuitem" className={itemClass} style={{ transition: 'background-color 120ms ease-out' }}>
                  <UserRoundIcon className="h-4 w-4 text-gray-500" />
                  Hồ sơ cá nhân
                </Link>
                {demoSwitcher &&
            <button type="button" role="menuitem" onClick={() => setSwitching(true)} className={itemClass} style={{ transition: 'background-color 120ms ease-out' }}>
                    <RepeatIcon className="h-4 w-4 text-gray-500" />
                    Đổi tài khoản demo
                  </button>
            }
                <button type="button" role="menuitem" onClick={logout} className={itemClass} style={{ transition: 'background-color 120ms ease-out' }}>
                  <LogOutIcon className="h-4 w-4 text-gray-500" />
                  Đăng xuất
                </button>
              </div>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}