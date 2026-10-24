import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Unit } from '../../types/org';
import { MemberAvatar } from './MemberAvatar';
import { childUnits, commanderOf, levelLabels, memberCount } from '../../utils/org';

type OrgChartNodeProps = {
  unit: Unit;
  depth: number;
  maxDepth: number;
  onRoot: (id: string) => void;
  onViewMembers: (id: string) => void;
};

export function OrgChartNode({ unit, depth, maxDepth, onRoot, onViewMembers }: OrgChartNodeProps) {
  const kids = childUnits(unit.id);
  const commander = commanderOf(unit.id);
  const isRoot = depth === 0;
  const canDrill = !isRoot && kids.length > 0;
  const showKids = depth < maxDepth && kids.length > 0;

  const body =
  <>
      <span className={`block text-[12px] ${isRoot ? 'text-white/80' : 'text-gray-500'}`}>{levelLabels[unit.level].split(' · ')[0]}</span>
      <span className={`mt-0.5 line-clamp-2 block min-h-[40px] text-[14px] font-semibold leading-5 ${isRoot ? 'text-white' : 'text-gray-900'}`}>
        {unit.name}
      </span>
      <span className="mt-2 flex items-center gap-2">
        {commander ?
      <>
            {!isRoot && <MemberAvatar name={commander.name} strong size="sm" />}
            <span className="min-w-0">
              <span className={`block truncate text-[13px] font-medium ${isRoot ? 'text-white' : 'text-gray-800'}`}>{commander.name}</span>
              <span className={`block truncate text-[12px] ${isRoot ? 'text-white/80' : 'text-gray-500'}`}>{commander.position}</span>
            </span>
          </> :

      <span className={`text-[12px] ${isRoot ? 'text-white/80' : 'text-gray-500'}`}>Chưa bố trí chỉ huy</span>
      }
      </span>
    </>;


  return (
    <li>
      <div
        className={`flex w-[208px] flex-col rounded-md border text-left ${
        isRoot ? 'border-brand-600 bg-brand-600' : 'border-gray-200 bg-white shadow-sm'}`
        }>
        
        {canDrill ?
        <button
          type="button"
          onClick={() => onRoot(unit.id)}
          title={`Xem sơ đồ ${unit.name}`}
          className="rounded-t-md px-3 pb-3 pt-2.5 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
          style={{ transition: 'background-color 120ms ease-out' }}>
          
            {body}
          </button> :

        <div className="px-3 pb-3 pt-2.5">{body}</div>
        }
        <div className={`mt-auto flex items-center justify-between border-t px-3 py-2 ${isRoot ? 'border-white/20' : 'border-gray-100'}`}>
          <span className={`text-[12px] tabular-nums ${isRoot ? 'text-white/80' : 'text-gray-500'}`}>{memberCount(unit.id)} cán bộ</span>
          <button
            type="button"
            onClick={() => onViewMembers(unit.id)}
            className={`inline-flex items-center gap-1 rounded text-[12px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            isRoot ? 'text-white hover:text-white/80' : 'text-brand-600 hover:text-brand-800'}`
            }
            style={{ transition: 'color 120ms ease-out' }}>
            
            Nhân sự
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
      {!showKids && kids.length > 0 && !isRoot &&
      <span className="mt-2 text-[12px] text-gray-500">+{kids.length} đơn vị trực thuộc</span>
      }
      {showKids &&
      <ul>
          {kids.map((k) =>
        <OrgChartNode key={k.id} unit={k} depth={depth + 1} maxDepth={maxDepth} onRoot={onRoot} onViewMembers={onViewMembers} />
        )}
        </ul>
      }
    </li>);

}