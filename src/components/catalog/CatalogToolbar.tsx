import React from 'react';
import { PlusIcon } from 'lucide-react';
import { Select } from '../ui/Select';
import { FilterField, TableToolbar, toolbarField } from '../ui/TableToolbar';
import { btnPrimary, btnTransition } from '../ui/Modal';
import { catalogColumns, forceOptions } from '../../data/taskCatalog';
import { CatalogColumnId } from '../../types/catalog';
import { ExportFormat } from '../../utils/tableExport';

export type CatalogFilters = {query: string;force: string;group: string;status: string;};

type CatalogToolbarProps = {
  filters: CatalogFilters;
  onChange: (f: CatalogFilters) => void;
  visible: Set<CatalogColumnId>;
  onToggleColumn: (id: CatalogColumnId) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onExport: (format: ExportFormat) => void | Promise<void>;
  /** Không truyền → ẩn nút Tạo mới (không có quyền ghi) */
  onCreate?: () => void;
  leading?: React.ReactNode;
};

const selects = [
{ key: 'force' as const, label: 'Hệ lực lượng', options: [['', 'Tất cả hệ lực lượng'], ...forceOptions.map((f) => [f, f])] },
{ key: 'group' as const, label: 'Nhóm điểm', options: [['', 'Tất cả nhóm'], ['1', 'Nhóm 1'], ['2', 'Nhóm 2'], ['3', 'Nhóm 3']] },
{
  key: 'status' as const,
  label: 'Trạng thái',
  options: [['', 'Tất cả trạng thái'], ['Đang sử dụng', 'Đang sử dụng'], ['Chưa áp dụng', 'Chưa áp dụng'], ['Ngừng sử dụng', 'Ngừng sử dụng']]
}];


export function CatalogToolbar({ filters, onChange, visible, onToggleColumn, refreshing, onRefresh, onExport, onCreate, leading }: CatalogToolbarProps) {
  const hidden = new Set<string>(catalogColumns.filter((c) => !visible.has(c.id)).map((c) => c.id));
  return (
    <TableToolbar
      query={filters.query}
      onQuery={(query) => onChange({ ...filters, query })}
      placeholder="Tìm theo mã, tên nhiệm vụ"
      filters={selects.map((s) =>
      <FilterField key={s.key} label={s.label}>
          <Select aria-label={s.label} value={filters[s.key]} onChange={(v) => onChange({ ...filters, [s.key]: v })} className={toolbarField}>
            {s.options.map(([v, l]) =>
          <option key={v} value={v}>
                {l}
              </option>
          )}
          </Select>
        </FilterField>
      )}
      activeFilters={selects.filter((s) => filters[s.key]).length}
      onClearFilters={() => onChange({ ...filters, force: '', group: '', status: '' })}
      onRefresh={onRefresh}
      refreshing={refreshing}
      columns={catalogColumns}
      hidden={hidden}
      onToggleColumn={(id) => onToggleColumn(id as CatalogColumnId)}
      onExport={onExport}
      leading={leading}
      actions={
      onCreate &&
      <button type="button" onClick={onCreate} className={btnPrimary} style={btnTransition}>
            <PlusIcon className="h-4 w-4" aria-hidden />
            Tạo mới
          </button>

      } />);


}