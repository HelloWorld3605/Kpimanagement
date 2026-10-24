import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskCatalog } from '../../contexts/TaskCatalogContext';
import { catalogColumns } from '../../data/taskCatalog';
import { CatalogColumnId } from '../../types/catalog';
import { CatalogToolbar, CatalogFilters } from '../../components/catalog/CatalogToolbar';
import { CatalogTable, SortState } from '../../components/catalog/CatalogTable';
import { TablePager } from '../../components/ui/TablePager';
import { ReadOnlyNote } from '../../components/ReadOnlyNote';
import { usePermissions } from '../../hooks/usePermissions';
import { catalogExportColumns, catalogSortValue, catalogStatusLabel, displayVersion, scoreGroup } from '../../utils/catalog';
import { exportTable, visibleExportColumns } from '../../utils/tableExport';
import { useListScrollMemory, useListState } from '../../hooks/useListState';

const emptyFilters: CatalogFilters = { query: '', force: '', group: '', status: '' };

export function TaskCatalogList() {
  const { tasks } = useTaskCatalog();
  const navigate = useNavigate();
  const canWrite = usePermissions().can('task-catalog', 'write');
  // Tìm kiếm, bộ lọc, sắp xếp, trang và vị trí cuộn giữ nguyên khi mở chi tiết rồi quay lại
  const [filters, setFilters] = useListState('catalog.filters', emptyFilters);
  const [visible, setVisible] = useState<Set<CatalogColumnId>>(new Set(catalogColumns.map((c) => c.id)));
  const [sort, setSort] = useListState<SortState>('catalog.sort', null);
  const [page, setPage] = useListState('catalog.page', 1);
  const [pageSize, setPageSize] = useListState('catalog.pageSize', 20);
  useListScrollMemory('catalog');
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const list = tasks.filter((t) => {
      const v = displayVersion(t);
      if (q && !`${t.code} ${v.name} ${v.output}`.toLowerCase().includes(q)) return false;
      if (filters.force && t.force !== filters.force) return false;
      if (filters.group && String(scoreGroup(v.score)) !== filters.group) return false;
      if (filters.status && catalogStatusLabel(t) !== filters.status) return false;
      return true;
    });
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const x = catalogSortValue(a, sort.key);
      const y = catalogSortValue(b, sort.key);
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi');
      return sort.dir === 'asc' ? r : -r;
    });
  }, [tasks, filters, sort]);

  const hasFilters = Object.values(filters).some((v) => v.trim() !== '');
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleColumn = (id: CatalogColumnId) =>
  setVisible((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const onSort = (key: CatalogColumnId) =>
  setSort((s) => s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null);

  const refresh = () => {
    setRefreshing(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <div>
      <CatalogToolbar
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        visible={visible}
        onToggleColumn={toggleColumn}
        refreshing={refreshing}
        onRefresh={refresh}
        onExport={(format) =>
        exportTable(
          'danh-muc-nhiem-vu',
          visibleExportColumns(catalogExportColumns, new Set(catalogColumns.filter((c) => !visible.has(c.id)).map((c) => c.id))),
          filtered,
          format
        )
        }
        onCreate={canWrite ? () => navigate('/danh-muc-nhiem-vu/tao-moi') : undefined} />
      
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-[14px] text-gray-600">
            {filtered.length === tasks.length ? `${tasks.length} danh mục` : `${filtered.length} / ${tasks.length} danh mục phù hợp`}
          </p>
          {!canWrite && <ReadOnlyNote feature="task-catalog" />}
        </div>
        {hasFilters &&
        <button
          type="button"
          onClick={() => {
            setFilters(emptyFilters);
            setPage(1);
          }}
          className="rounded text-[14px] font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
            Xoá bộ lọc
          </button>
        }
      </div>
      <CatalogTable
        rows={rows}
        visible={visible}
        sort={sort}
        onSort={onSort}
        onOpen={(code) => navigate(`/danh-muc-nhiem-vu/${code}`)}
        loading={refreshing}
        startIndex={(safePage - 1) * pageSize} />
      
      <TablePager
        total={filtered.length}
        page={safePage}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }} />
      
    </div>);

}