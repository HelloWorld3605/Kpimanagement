import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CornerDownLeftIcon, PlusIcon, SearchIcon, UserIcon, BoxIcon } from "lucide-react";
import { navEntries } from "../data/navigation";
import { usePermissions } from "../hooks/usePermissions";
import { useGuardedNavigate } from "../contexts/UnsavedChangesContext";
import { foldText } from "../contexts/TableSearchContext";
type Command = {
  id: string;
  group: string;
  label: string;
  icon: BoxIcon;
  path: string;
  keywords: string;
};
type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};
const ease = [0.23, 1, 0.32, 1] as const;

/** Ô tìm nhanh (Ctrl/⌘ + K): gõ tên màn hoặc thao tác để đi tới ngay */
export function CommandPalette({
  open,
  onClose
}: CommandPaletteProps) {
  const reduce = useReducedMotion();
  const {
    can
  } = usePermissions();
  const go = useGuardedNavigate();
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [];
    navEntries.forEach((entry) => {
      if (entry.type === 'link') {
        if (can(entry.feature)) list.push({
          id: entry.id,
          group: 'Chung',
          label: entry.label,
          icon: entry.icon,
          path: entry.path,
          keywords: entry.label
        });
        return;
      }
      entry.items.forEach((i) => {
        if (can(i.feature)) list.push({
          id: i.id,
          group: entry.label,
          label: i.label,
          icon: i.icon,
          path: i.path,
          keywords: `${entry.label} ${i.label}`
        });
      });
    });
    const quick: Command[] = [{
      id: 'profile',
      group: 'Thao tác nhanh',
      label: 'Hồ sơ cá nhân',
      icon: UserIcon,
      path: '/ho-so-ca-nhan',
      keywords: 'ho so ca nhan tai khoan'
    }];
    if (can('task-catalog', 'write')) quick.unshift({
      id: 'new-task',
      group: 'Thao tác nhanh',
      label: 'Tạo danh mục nhiệm vụ',
      icon: PlusIcon,
      path: '/danh-muc-nhiem-vu/tao-moi',
      keywords: 'tao moi danh muc nhiem vu'
    });
    return [...quick, ...list];
  }, [can]);
  const results = useMemo(() => {
    const q = foldText(text.trim());
    if (!q) return commands;
    const words = q.split(/\s+/);
    return commands.filter((c) => {
      const hay = foldText(`${c.keywords} ${c.label}`);
      return words.every((w) => hay.includes(w));
    });
  }, [commands, text]);
  const groups = useMemo(() => {
    const map = new Map<string, {
      cmd: Command;
      index: number;
    }[]>();
    results.forEach((cmd, index) => {
      if (!map.has(cmd.group)) map.set(cmd.group, []);
      map.get(cmd.group)!.push({
        cmd,
        index
      });
    });
    return [...map.entries()];
  }, [results]);
  useEffect(() => {
    if (!open) return;
    setText('');
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);
  useEffect(() => setActive(0), [text]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({
      block: 'nearest'
    });
  }, [active]);
  const run = (cmd?: Command) => {
    if (!cmd) return;
    onClose();
    go(cmd.path);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => results.length ? (a + 1) % results.length : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => results.length ? (a - 1 + results.length) % results.length : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };
  return createPortal(<AnimatePresence>
      {open && <motion.div className="fixed inset-0 z-[80] flex items-start justify-center bg-gray-900/30 px-4 pt-[12vh]" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} transition={{
      duration: 0.15,
      ease: 'easeOut'
    }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div role="dialog" aria-modal="true" aria-label="Tìm nhanh" initial={{
        opacity: 0,
        scale: reduce ? 1 : 0.98,
        y: reduce ? 0 : -6
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: reduce ? 1 : 0.98,
        y: reduce ? 0 : -6
      }} transition={{
        duration: 0.16,
        ease
      }} onKeyDown={onKeyDown} className="flex max-h-[70vh] w-full max-w-[640px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-gray-200 px-4">
              <SearchIcon className="h-[18px] w-[18px] shrink-0 text-gray-400" aria-hidden />
              <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder="Gõ tên màn hoặc thao tác…" aria-label="Tìm nhanh" role="combobox" aria-expanded aria-controls="command-list" aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined} className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none" />
              <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-sans text-[11px] text-gray-500">Esc</kbd>
            </div>

            <div ref={listRef} id="command-list" role="listbox" aria-label="Kết quả" className="min-h-0 flex-1 overflow-y-auto py-1.5">
              {groups.length === 0 && <p className="px-4 py-10 text-center text-[14px] text-gray-500">Không tìm thấy “{text.trim()}”.</p>}
              {groups.map(([group, items]) => <div key={group} role="group" aria-label={group}>
                  <p className="px-4 pb-1 pt-2.5 text-[12px] font-semibold text-gray-500">{group}</p>
                  {items.map(({
              cmd,
              index
            }) => {
              const on = index === active;
              const Icon = cmd.icon;
              return <div key={cmd.id} id={`cmd-${cmd.id}`} role="option" aria-selected={on} data-index={index} onMouseMove={() => !on && setActive(index)} onClick={() => run(cmd)} className={`relative mx-1.5 flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-[14px] ${on ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}>
                        {on && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-brand-600" aria-hidden />}
                        <Icon className={`h-4 w-4 shrink-0 ${on ? 'text-brand-600' : 'text-gray-500'}`} aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                        {on && <CornerDownLeftIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />}
                      </div>;
            })}
                </div>)}
            </div>

            <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2 text-[12px] text-gray-500">
              <span>
                <kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd> chọn
              </span>
              <span>
                <kbd className="font-sans">Enter</kbd> mở
              </span>
              <span>
                <kbd className="font-sans">/</kbd> tìm trong bảng
              </span>
            </div>
          </motion.div>
        </motion.div>}
    </AnimatePresence>, document.body);
}