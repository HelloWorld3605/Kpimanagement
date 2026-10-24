import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, ChevronsDownUpIcon } from 'lucide-react';
import { EmptyMark } from '../ui/EmptyMark';
import { OrgTreeNode } from './OrgTreeNode';
import { rootUnit, unitPath, visibleUnitIds } from '../../utils/org';

type OrgTreeProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function OrgTree({ selectedId, onSelect }: OrgTreeProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([rootUnit.id, 'e-thudo']));
  const visible = useMemo(() => visibleUnitIds(query), [query]);

  // Luôn mở các cấp trên của đơn vị đang chọn
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      unitPath(selectedId).
      slice(0, -1).
      forEach((u) => next.add(u.id));
      return next;
    });
  }, [selectedId]);

  const toggle = (id: string) =>
  setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);else
    next.add(id);
    return next;
  });

  const collapseAll = () => setExpanded(new Set([rootUnit.id, ...unitPath(selectedId).slice(0, -1).map((u) => u.id)]));

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-gray-200 p-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm đơn vị"
            aria-label="Tìm đơn vị"
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-3 pr-9 text-[14px] text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          
          <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
        </div>
        <button
          type="button"
          onClick={collapseAll}
          title="Thu gọn tất cả"
          aria-label="Thu gọn tất cả"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'background-color 150ms ease-out' }}>
          
          <ChevronsDownUpIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {visible && visible.size === 0 ?
        <div className="flex flex-col items-center px-4 py-10 text-center">
            <EmptyMark />
            <p className="mt-2 text-[13px] text-gray-500">Không có đơn vị khớp “{query.trim()}”</p>
          </div> :

        <ul role="tree" aria-label="Cây đơn vị">
            <OrgTreeNode
            unit={rootUnit}
            depth={0}
            selectedId={selectedId}
            expanded={expanded}
            visible={visible}
            onToggle={toggle}
            onSelect={onSelect} />
          
          </ul>
        }
      </div>
    </div>);

}