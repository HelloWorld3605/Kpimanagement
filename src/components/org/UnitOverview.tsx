import React from 'react';
import { ChevronRightIcon, ShieldCheckIcon } from 'lucide-react';
import { Unit } from '../../types/org';
import { MemberAvatar } from './MemberAvatar';
import { authorityNote, childUnits, commanderOf, leadersOf, levelLabels, memberCount, unitPath } from '../../utils/org';

type UnitOverviewProps = {
  unit: Unit;
  onSelectUnit: (id: string) => void;
  onOpenMember: (id: string) => void;
  /** Nút thao tác trên đơn vị (thêm trực thuộc, sửa, xoá) — chỉ khi có quyền sửa */
  actions?: React.ReactNode;
};

export function UnitOverview({ unit, onSelectUnit, onOpenMember, actions }: UnitOverviewProps) {
  const path = unitPath(unit.id);
  const children = childUnits(unit.id);
  const leaders = leadersOf(unit.id);
  const commander = leaders.find((m) => m.role === 'truong');
  const deputies = leaders.filter((m) => m.role === 'pho');

  return (
    <>
      <header className="border-b border-gray-200 px-6 py-5">
        {path.length > 1 &&
        <nav aria-label="Cấp trên" className="mb-2 flex flex-wrap items-center gap-1 text-[13px] text-gray-500">
            {path.slice(0, -1).map((u) =>
          <React.Fragment key={u.id}>
                <button
              type="button"
              onClick={() => onSelectUnit(u.id)}
              className="rounded hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{ transition: 'color 120ms ease-out' }}>
              
                  {u.shortName ?? u.name}
                </button>
                <ChevronRightIcon className="h-3.5 w-3.5 text-gray-300" aria-hidden />
              </React.Fragment>
          )}
          </nav>
        }
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{unit.name}</h1>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
        <p className="mt-1 text-[14px] text-gray-600">
          {levelLabels[unit.level]}
          <span className="mx-2 text-gray-300">|</span>
          <span className="font-medium tabular-nums text-gray-900">{memberCount(unit.id)}</span> cán bộ
          {children.length > 0 &&
          <>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-medium tabular-nums text-gray-900">{children.length}</span> đơn vị trực thuộc
            </>
          }
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-gray-500">
          <ShieldCheckIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          {authorityNote(unit.level)}
        </p>
      </header>

      <div className={`grid border-b border-gray-200 ${children.length > 0 ? 'lg:grid-cols-2 lg:divide-x lg:divide-gray-200' : ''}`}>
        <section aria-labelledby="unit-leaders" className="px-6 py-5">
          <h2 id="unit-leaders" className="text-[15px] font-semibold text-gray-900">
            Chỉ huy đơn vị
          </h2>
          {leaders.length === 0 ?
          <p className="mt-3 text-[14px] text-gray-500">Chưa bố trí chỉ huy.</p> :

          <>
              {commander &&
            <button
              type="button"
              onClick={() => onOpenMember(commander.id)}
              className="mt-3 flex w-full items-center gap-3 rounded-md p-2 -mx-2 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{ transition: 'background-color 120ms ease-out' }}>
              
                  <MemberAvatar name={commander.name} strong size="lg" />
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-gray-900">{commander.name}</span>
                    <span className="block truncate text-[13px] text-gray-600">
                      {commander.rank} · {commander.position}
                    </span>
                    <span className="block text-[12px] text-gray-500">Xác nhận phiếu đánh giá của cán bộ trong đơn vị</span>
                  </span>
                </button>
            }
              {deputies.length > 0 &&
            <ul className={`mt-2 grid gap-1 ${children.length > 0 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
                  {deputies.map((d) =>
              <li key={d.id}>
                      <button
                  type="button"
                  onClick={() => onOpenMember(d.id)}
                  className="-mx-2 flex w-full items-center gap-2.5 rounded-md p-2 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  style={{ transition: 'background-color 120ms ease-out' }}>
                  
                        <MemberAvatar name={d.name} size="md" />
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-medium text-gray-900">{d.name}</span>
                          <span className="block truncate text-[12px] text-gray-500">
                            {d.rank} · {d.position}
                          </span>
                        </span>
                      </button>
                    </li>
              )}
                </ul>
            }
            </>
          }
        </section>

        {children.length > 0 &&
        <section aria-labelledby="unit-children" className="border-t border-gray-200 px-6 py-5 lg:border-t-0">
            <h2 id="unit-children" className="text-[15px] font-semibold text-gray-900">
              Đơn vị trực thuộc
            </h2>
            <ul className="mt-2 divide-y divide-gray-100">
              {children.map((c) => {
              const head = commanderOf(c.id);
              return (
                <li key={c.id}>
                    <button
                    type="button"
                    onClick={() => onSelectUnit(c.id)}
                    className="group -mx-2 flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    style={{ transition: 'background-color 120ms ease-out' }}>
                    
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-gray-900">{c.name}</span>
                        <span className="block truncate text-[12px] text-gray-500">
                          {head ? `${head.position}: ${head.rank} ${head.name}` : 'Chưa bố trí chỉ huy'}
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] tabular-nums text-gray-500">{memberCount(c.id)} người</span>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-gray-500" aria-hidden />
                    </button>
                  </li>);

            })}
            </ul>
          </section>
        }
      </div>
    </>);

}