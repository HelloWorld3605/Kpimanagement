import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, ShieldCheckIcon } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { actionLabels, featureLabels, resourceLabels } from '../data/roles';
import { FeatureId, ResourceId } from '../types/access';
import { describeScope, roleLabel, scopeSummary, widestScope } from '../utils/access';

const shownResources: ResourceId[] = ['review', 'individual-result', 'collective-result', 'member-kpi', 'member-personal'];

/** Vai trò và phạm vi đang áp dụng — bấm để xem đầy đủ mình được xem / sửa gì */
export function AccessBadge() {
  const { account, policy } = usePermissions();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!account) return null;
  const primary = roleLabel(account.roles[0]);
  const writable = (Object.keys(featureLabels) as FeatureId[]).filter((f) =>
  account.roles.some((r) => policy.features[r]?.[f]?.some((a) => a !== 'view'))
  );

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex max-w-[360px] items-center gap-2 rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-2 text-left text-[13px] hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ transition: 'background-color 150ms ease-out' }}>
        
        <ShieldCheckIcon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <span className="truncate">
          <span className="font-medium text-gray-900">
            {primary}
            {account.roles.length > 1 && ` +${account.roles.length - 1}`}
          </span>
          <span className="hidden text-gray-500 xl:inline"> · {scopeSummary(policy, account)}</span>
        </span>
        <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 text-gray-500 ${open ? 'rotate-180' : ''}`} style={{ transition: 'transform 150ms ease-out' }} />
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          role="dialog"
          aria-label="Quyền của tài khoản"
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-40 mt-2 w-[380px] origin-top-right overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-[13px] text-gray-500">Vai trò</p>
              <p className="mt-0.5 text-[14px] font-semibold text-gray-900">{account.roles.map(roleLabel).join(' · ')}</p>
              {account.roles.length > 1 && <p className="mt-0.5 text-xs text-gray-500">Quyền cộng dồn: thấy phần hợp phạm vi của các vai trò.</p>}
            </div>
            <div className="px-4 py-3">
              <p className="mb-2 text-[13px] font-medium text-gray-900">Được xem</p>
              <dl className="space-y-1.5 text-[13px]">
                {shownResources.map((r) => {
                const kind = widestScope(policy, account, r);
                return (
                  <div key={r} className="grid grid-cols-[1fr_auto] gap-3">
                      <dt className="text-gray-600">{resourceLabels[r].split(' (')[0]}</dt>
                      <dd className={`text-right ${kind ? 'font-medium text-gray-900' : 'text-gray-400'}`}>{kind ? describeScope(kind, account) : 'Không'}</dd>
                    </div>);

              })}
              </dl>
            </div>
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="mb-1.5 text-[13px] font-medium text-gray-900">Được sửa</p>
              {writable.length === 0 ?
            <p className="text-[13px] text-gray-500">Không có chức năng được ghi.</p> :

            <ul className="space-y-1 text-[13px] text-gray-700">
                  {writable.map((f) => {
                const actions = Array.from(new Set(account.roles.flatMap((r) => policy.features[r]?.[f] ?? []))).filter((a) => a !== 'view');
                return (
                  <li key={f} className="flex justify-between gap-3">
                        <span>{featureLabels[f]}</span>
                        <span className="text-gray-500">{actions.map((a) => actionLabels[a]).join(', ')}</span>
                      </li>);

              })}
                </ul>
            }
              {writable.includes('self-review') && <p className="mt-2 text-xs text-gray-500">Phiếu tự đánh giá: chỉ phiếu của mình, khi còn nháp.</p>}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}