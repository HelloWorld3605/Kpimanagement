import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { SideDrawer } from '../ui/SideDrawer';
import { EmptyMark } from '../ui/EmptyMark';
import { MemberAvatar } from './MemberAvatar';
import { childUnits, findUnit, isLeader, levelLabels, normalize, unitMembers } from '../../utils/org';

type UnitMembersDrawerProps = {
  unitId?: string;
  onClose: () => void;
  onOpenMember: (id: string) => void;
};

/** Danh sách nhân sự của một đơn vị, mở ngay trên sơ đồ tổ chức — không rời khỏi sơ đồ */
export function UnitMembersDrawer({ unitId, onClose, onOpenMember }: UnitMembersDrawerProps) {
  const unit = unitId ? findUnit(unitId) : undefined;
  const [query, setQuery] = useState('');
  const [includeSub, setIncludeSub] = useState(false);
  const hasChildren = unit ? childUnits(unit.id).length > 0 : false;

  useEffect(() => {
    setQuery('');
    setIncludeSub(false);
  }, [unitId]);

  const all = useMemo(() => unit ? unitMembers(unit.id, includeSub) : [], [unit, includeSub]);
  const q = normalize(query.trim());
  const rows = all.
  filter((m) => !q || normalize(`${m.name} ${m.code} ${m.position}`).includes(q)).
  sort((a, b) => Number(isLeader(b)) - Number(isLeader(a)));

  return (
    <SideDrawer
      open={Boolean(unit)}
      onClose={onClose}
      contentKey={unitId}
      labelledBy="unit-members-title"
      header={
      unit &&
      <div className="min-w-0">
            <p className="text-[12px] text-gray-500">{levelLabels[unit.level].split(' · ')[0]}</p>
            <h2 id="unit-members-title" className="truncate text-[16px] font-semibold text-gray-900">
              {unit.name}
            </h2>
            <p className="mt-0.5 text-[13px] tabular-nums text-gray-500">{all.length} cán bộ</p>
          </div>

      }>
      
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-3">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Tìm cán bộ</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, số hiệu, chức vụ…"
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-[14px] text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          
        </label>
        {hasChildren &&
        <label className="flex items-center gap-2 whitespace-nowrap text-[13px] text-gray-700">
            <input type="checkbox" checked={includeSub} onChange={(e) => setIncludeSub(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            Gồm đơn vị trực thuộc
          </label>
        }
      </div>

      {rows.length === 0 ?
      <div className="py-16 text-center">
          <EmptyMark />
          <p className="mt-2 text-[14px] text-gray-500">{all.length ? 'Không có cán bộ nào khớp từ khoá.' : 'Đơn vị chưa có cán bộ.'}</p>
        </div> :

      <ul className="divide-y divide-gray-100">
          {rows.map((m) =>
        <li key={m.id}>
              <button
            type="button"
            onClick={() => onOpenMember(m.id)}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ transition: 'background-color 120ms ease-out' }}>
            
                <MemberAvatar name={m.name} strong={isLeader(m)} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-gray-900">{m.name}</span>
                  <span className="block truncate text-[12px] text-gray-500">
                    {m.rank} · {m.position}
                    {includeSub && m.unitId !== unit?.id && ` · ${findUnit(m.unitId)?.name ?? ''}`}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] tabular-nums text-gray-400">{m.code}</span>
              </button>
            </li>
        )}
        </ul>
      }
    </SideDrawer>);

}