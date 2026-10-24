import React from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Unit } from '../../types/org';
import { childUnits, memberCount } from '../../utils/org';

type OrgTreeNodeProps = {
  unit: Unit;
  depth: number;
  selectedId: string;
  expanded: Set<string>;
  visible: Set<string> | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
};

export function OrgTreeNode({ unit, depth, selectedId, expanded, visible, onToggle, onSelect }: OrgTreeNodeProps) {
  if (visible && !visible.has(unit.id)) return null;
  const children = childUnits(unit.id).filter((c) => !visible || visible.has(c.id));
  const hasChildren = children.length > 0;
  const isOpen = hasChildren && (visible ? true : expanded.has(unit.id));
  const isSelected = unit.id === selectedId;
  const indent = depth * 16;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isOpen : undefined} aria-selected={isSelected}>
      <div
        className={`relative flex items-center rounded-md ${isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
        style={{ paddingLeft: indent, transition: 'background-color 120ms ease-out' }}>
        
        {isSelected && <span aria-hidden className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r bg-brand-600" />}
        {hasChildren ?
        <button
          type="button"
          onClick={() => onToggle(unit.id)}
          aria-label={isOpen ? `Thu gọn ${unit.name}` : `Mở rộng ${unit.name}`}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
            <ChevronRightIcon
            className={`h-4 w-4 ${isOpen ? 'rotate-90' : ''}`}
            style={{ transition: 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
          
          </button> :

        <span className="w-7 shrink-0" />
        }
        <button
          type="button"
          onClick={() => onSelect(unit.id)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded py-1.5 pr-2 text-left text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
          <span className={`truncate ${isSelected ? 'font-semibold text-brand-700' : depth === 0 ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {unit.name}
          </span>
          <span className={`ml-auto shrink-0 text-xs tabular-nums ${isSelected ? 'text-brand-600' : 'text-gray-400'}`}>
            {memberCount(unit.id)}
          </span>
        </button>
      </div>
      {isOpen &&
      <div className="relative">
          <span aria-hidden className="absolute bottom-2 top-0 w-px bg-gray-200" style={{ left: indent + 14 }} />
          <ul role="group">
            {children.map((c) =>
          <OrgTreeNode
            key={c.id}
            unit={c}
            depth={depth + 1}
            selectedId={selectedId}
            expanded={expanded}
            visible={visible}
            onToggle={onToggle}
            onSelect={onSelect} />

          )}
          </ul>
        </div>
      }
    </li>);

}