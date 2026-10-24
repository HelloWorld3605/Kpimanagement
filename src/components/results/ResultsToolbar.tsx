import React from 'react';
import { Select } from '../ui/Select';
import { FilterField, TableToolbar, toolbarField } from '../ui/TableToolbar';
import { resultPeriods } from '../../data/unitResults';
import { findUnit, unitPath } from '../../utils/org';
import { TableColumn } from '../../hooks/useTableColumns';
import { ExportFormat } from '../../utils/tableExport';

type ResultsToolbarProps = {
  period: string;
  onPeriod: (p: string) => void;
  scopeId: string;
  /** Các đơn vị trong phạm vi của tài khoản, theo thứ tự cây */
  scopeIds: string[];
  onScope: (id: string) => void;
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
  /** Điều kiện lọc riêng của từng kiểu xem, đặt cuối bảng lọc */
  extra?: React.ReactNode;
  activeFilters: number;
  onClearFilters: () => void;
  columns: TableColumn[];
  hidden: Set<string>;
  onToggleColumn: (id: string) => void;
  onExport: (format: ExportFormat) => void | Promise<void>;
  leading?: React.ReactNode;
};

export function ResultsToolbar({ period, onPeriod, scopeId, scopeIds, onScope, extra, ...rest }: ResultsToolbarProps) {
  const depths = scopeIds.map((id) => unitPath(id).length - 1);
  const minDepth = Math.min(...depths, 99);
  return (
    <TableToolbar
      {...rest}
      className="border-b border-gray-200 px-6 py-3"
      filters={
      <>
          <FilterField label="Kỳ đánh giá">
            <Select value={period} onChange={onPeriod} aria-label="Kỳ đánh giá" className={toolbarField}>
              {resultPeriods.map((p) =>
            <option key={p.id} value={p.id}>
                  {p.id}
                </option>
            )}
            </Select>
          </FilterField>
          {scopeIds.length > 0 &&
        <FilterField label="Phạm vi đơn vị">
              <Select value={scopeId} onChange={onScope} aria-label="Phạm vi đơn vị" disabled={scopeIds.length === 1} className={toolbarField}>
                {scopeIds.map((id, i) =>
            <option key={id} value={id}>
                    {'\u00A0\u00A0\u00A0'.repeat(depths[i] - minDepth)}
                    {findUnit(id)?.name ?? ''}
                  </option>
            )}
              </Select>
            </FilterField>
        }
          {extra}
        </>
      } />);


}