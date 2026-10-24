import React from 'react';
import { PlusIcon } from 'lucide-react';
import { VersionStatus } from '../../types/catalog';
import { StatusPill } from './StatusPill';

export type VersionHistoryItem = {
  version: number;
  status: VersionStatus;
  subtitle: string;
  meta?: string;
};

type VersionHistoryProps = {
  items: VersionHistoryItem[];
  selected: number;
  onSelect: (v: number) => void;
  canCreate: boolean;
  createHint?: string;
  onCreate: () => void;
  /** Không có quyền ghi → ẩn nút Tạo mới */
  manageable?: boolean;
};

export function VersionHistory({ items, selected, onSelect, canCreate, createHint, onCreate, manageable = true }: VersionHistoryProps) {
  const sorted = [...items].sort((a, b) => b.version - a.version);
  return (
    <aside aria-label="Lịch sử phiên bản" className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex items-center justify-between bg-brand-800 px-4 py-3 text-white">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide">Lịch sử phiên bản</h2>
        {manageable &&
        <button
          type="button"
          onClick={onCreate}
          disabled={!canCreate}
          title={createHint}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[13px] font-medium text-gold-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 disabled:cursor-not-allowed disabled:text-white/40 disabled:hover:bg-transparent"
          style={{ transition: 'background-color 150ms ease-out' }}>
          
            <PlusIcon className="h-3.5 w-3.5" />
            Tạo mới
          </button>
        }
      </div>
      <ul>
        {sorted.map((v) => {
          const isSel = v.version === selected;
          return (
            <li key={v.version} className="border-b border-gray-100 last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(v.version)}
                aria-current={isSel ? 'true' : undefined}
                className={`relative flex w-full items-start justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                isSel ? 'bg-brand-50' : 'hover:bg-gray-50'}`
                }
                style={{ transition: 'background-color 150ms ease-out' }}>
                
                {isSel && <span className="absolute inset-y-0 left-0 w-1 bg-brand-600" aria-hidden />}
                <span>
                  <span className="block text-[14px] font-semibold text-gray-900">v{v.version}</span>
                  <span className="mt-0.5 block text-xs text-gray-600">{v.subtitle}</span>
                  {v.meta && <span className="block text-xs text-gray-400">{v.meta}</span>}
                </span>
                {v.status === 'draft' && <StatusPill tone="warning">Bản nháp</StatusPill>}
                {v.status === 'active' && <StatusPill tone="success">Đang áp dụng</StatusPill>}
                {v.status === 'replaced' && <StatusPill tone="neutral">Đã thay thế</StatusPill>}
              </button>
            </li>);

        })}
      </ul>
    </aside>);

}