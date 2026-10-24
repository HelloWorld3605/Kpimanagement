import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { useAccess } from '../contexts/AccessContext';
import { DEMO_PASSWORD } from '../data/accounts';
import { roleLabel } from '../utils/access';
import { FloatingPanel } from './ui/FloatingPanel';

/** Chọn nhanh tài khoản demo trên màn đăng nhập: bấm mũi tên mở danh sách nổi, không đẩy bố cục */
export function DemoAccounts({ onPick }: {onPick: (username: string) => void;}) {
  const { accounts } = useAccess();
  const active = accounts.filter((a) => a.active);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchor?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, anchor]);

  return (
    <section aria-label="Tài khoản demo" className="mt-[clamp(14px,3vh,28px)] border-t border-gray-200 pt-[clamp(10px,2vh,18px)]">
      <div ref={setAnchor} className="flex items-center justify-between gap-3">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="demo-accounts-list"
          className="-ml-1 flex items-center gap-1 rounded px-1 py-0.5 text-sm font-semibold text-gray-900 hover:text-[#a30d18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a30d18]/40"
          style={{ transition: 'color 150ms ease-out' }}>
          
          Tài khoản demo
          <ChevronDownIcon
            className="h-4 w-4"
            aria-hidden
            style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
          
        </button>
        <p className="text-xs text-gray-500">
          Mật khẩu chung <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-800">{DEMO_PASSWORD}</code>
        </p>
      </div>

      <AnimatePresence>
        {open &&
        <FloatingPanel anchor={anchor} panelRef={panelRef} maxHeight={360}>
            <ul id="demo-accounts-list" role="listbox" aria-label="Chọn tài khoản demo" className="overflow-y-auto overscroll-contain py-1">
              {active.map((a) =>
            <li key={a.username} role="option" aria-selected={false}>
                  <button
                type="button"
                onClick={() => {
                  onPick(a.username);
                  setOpen(false);
                }}
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-[#a30d18]/[0.05] focus-visible:bg-[#a30d18]/[0.05] focus-visible:outline-none"
                style={{ transition: 'background-color 120ms ease-out' }}>
                
                    <span className="truncate text-[13px] font-medium text-gray-900">{a.roles.map(roleLabel).join(' · ')}</span>
                    <span className="truncate font-mono text-xs text-gray-500">{a.username}</span>
                  </button>
                </li>
            )}
            </ul>
          </FloatingPanel>
        }
      </AnimatePresence>
    </section>);

}