import React, { useCallback, useMemo, useState } from 'react';
import { BuildingIcon, UsersIcon } from 'lucide-react';
import { PageTabs } from '../components/PageTabs';
import { ResultsToolbar } from '../components/results/ResultsToolbar';
import { RankDistribution } from '../components/results/RankDistribution';
import { CollectiveResultsTable } from '../components/results/CollectiveResultsTable';
import { IndividualResultsTable } from '../components/results/IndividualResultsTable';
import { MemberDrawer } from '../components/org/MemberDrawer';
import { resultPeriods } from '../data/unitResults';
import { Rank } from '../types/selfReview';
import { descendantIds, directMembers, findMember, findUnit, rootUnit } from '../utils/org';
import { usePermissions } from '../hooks/usePermissions';
import { CollectiveRow, IndividualRow, collectiveRows, findPeriod, flagText, individualRows, matches, rankCounts } from '../utils/results';
import { HiddenColumns } from '../components/ui/TableFrame';
import { TableColumn, hiddenIndexes, useTableColumns } from '../hooks/useTableColumns';
import { ExportColumn, exportTable, visibleExportColumns } from '../utils/tableExport';
import { fmt, rankShort } from '../utils/selfReview';

type View = 'collective' | 'individual';

const collectiveColumns: TableColumn[] = [
{ id: 'stt', label: 'STT', locked: true },
{ id: 'unit', label: 'Tập thể', locked: true },
{ id: 'commander', label: 'Người đứng đầu' },
{ id: 'headcount', label: 'Quân số' },
{ id: 'kpi', label: 'KPI tập thể' },
{ id: 'delta', label: 'So với quý trước' },
{ id: 'rank', label: 'Xếp loại' },
{ id: 'open', label: 'Xem cá nhân' }];


const individualColumns: TableColumn[] = [
{ id: 'stt', label: 'STT', locked: true },
{ id: 'member', label: 'Cán bộ', locked: true },
{ id: 'unit', label: 'Đơn vị' },
{ id: 'position', label: 'Chức vụ' },
{ id: 'kpi', label: 'Điểm KPI' },
{ id: 'delta', label: 'So với quý trước' },
{ id: 'rank', label: 'Xếp loại' }];


const signed = (d?: number) => d === undefined ? '' : `${d > 0 ? '+' : ''}${fmt(d)}`;

const collectiveExportColumns: ExportColumn<CollectiveRow>[] = [
{ header: 'STT', value: (_, i) => i + 1 },
{ id: 'unit', header: 'Tập thể', value: (r) => r.unit.name },
{ id: 'commander', header: 'Người đứng đầu', value: (r) => r.commander?.name ?? '' },
{ id: 'commander', header: 'KPI người đứng đầu', value: (r) => r.commanderKpi === undefined ? '' : fmt(r.commanderKpi) },
{ id: 'headcount', header: 'Quân số', value: (r) => r.headcount },
{ id: 'kpi', header: 'KPI tập thể', value: (r) => fmt(r.kpi) },
{ id: 'delta', header: 'So với quý trước', value: (r) => signed(r.delta) },
{ id: 'rank', header: 'Xếp loại', value: (r) => rankShort(r.rank) },
{ header: 'Lưu ý', value: (r) => r.flags.map((f) => flagText[f]).join('; ') }];


const individualExportColumns: ExportColumn<IndividualRow>[] = [
{ header: 'STT', value: (_, i) => i + 1 },
{ id: 'member', header: 'Họ tên', value: (r) => r.member.name },
{ id: 'member', header: 'Số hiệu', value: (r) => r.member.code },
{ id: 'unit', header: 'Đơn vị', value: (r) => r.unit.name },
{ id: 'position', header: 'Chức vụ', value: (r) => r.member.position },
{ id: 'kpi', header: 'Điểm KPI', value: (r) => r.result ? fmt(r.result.kpi) : 'Chưa đánh giá' },
{ id: 'delta', header: 'So với quý trước', value: (r) => signed(r.delta) },
{ id: 'rank', header: 'Xếp loại', value: (r) => r.result ? rankShort(r.result.rank) : '' }];


export function PublishedResults() {
  const [view, setView] = useState<View>('collective');
  const [period, setPeriod] = useState(resultPeriods[0].id);
  const { canSee } = usePermissions();
  // Chỉ các đơn vị người dùng với tới được: thấy kết quả tập thể, hoặc thấy ít nhất một cá nhân bên trong
  const reachable = useMemo(
    () =>
    descendantIds(rootUnit.id).filter(
      (id) =>
      canSee('collective-result', { unitId: id }) ||
      directMembers(id).some((m) => canSee('individual-result', { unitId: id, memberId: m.id }))
    ),
    [canSee]
  );
  const [pickedScope, setScopeId] = useState<string>();
  const scopeId = pickedScope && reachable.includes(pickedScope) ? pickedScope : reachable[0] ?? rootUnit.id;
  const [query, setQuery] = useState('');
  const [rank, setRank] = useState<Rank | null>(null);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [openMemberId, setOpenMemberId] = useState<string>();
  const closeDrawer = useCallback(() => setOpenMemberId(undefined), []);

  const meta = findPeriod(period);
  const scope = findUnit(scopeId) ?? rootUnit;

  const collective = useMemo(
    () => reachable.length ? collectiveRows(period, scopeId).filter((r) => canSee('collective-result', { unitId: r.unit.id })) : [],
    [period, scopeId, reachable, canSee]
  );
  const individual = useMemo(
    () =>
    reachable.length ?
    individualRows(period, scopeId).filter((r) => canSee('individual-result', { unitId: r.unit.id, memberId: r.member.id })) :
    [],
    [period, scopeId, reachable, canSee]
  );
  const flaggedCount = collective.filter((r) => r.flags.length > 0).length;

  const isCollective = view === 'collective';
  const columns = isCollective ? collectiveColumns : individualColumns;
  const { hidden, toggle: toggleColumn } = useTableColumns(isCollective ? 'results-collective' : 'results-individual');
  const counts = isCollective ?
  rankCounts(collective.map((r) => r.rank)) :
  rankCounts(individual.flatMap((r) => r.result ? [r.result.rank] : []));
  const rated = isCollective ? collective.length : individual.filter((r) => r.result).length;
  const unrated = isCollective ? 0 : individual.length - rated;

  const collectiveShown = collective.filter(
    (r) => (!rank || r.rank === rank) && (!flaggedOnly || r.flags.length > 0) && matches(r.unit.name, query)
  );
  const individualShown = individual.filter(
    (r) => (!rank || r.result?.rank === rank) && (matches(r.member.name, query) || matches(r.member.code, query) || matches(r.member.position, query))
  );

  const resetFilters = () => {
    setRank(null);
    setQuery('');
    setFlaggedOnly(false);
  };
  const switchView = (v: View) => {
    setView(v);
    resetFilters();
  };
  const openUnit = (unitId: string) => {
    setScopeId(unitId);
    switchView('individual');
  };

  // Khoá reset phân trang khi bộ lọc đổi
  const tableKey = [view, period, scopeId, query, rank, flaggedOnly].join('|');

  return (
    <div className="bg-white">
      <PageTabs
        ariaLabel="Đối tượng kết quả"
        active={view}
        onChange={(id) => switchView(id as View)}
        tabs={[
        { id: 'collective', label: 'Tập thể', icon: BuildingIcon },
        { id: 'individual', label: 'Cá nhân', icon: UsersIcon }]
        } />
      

      {/* Tóm tắt kỳ đặt trên thanh lọc: đọc tổng quan trước, rồi mới lọc chi tiết */}
      <section aria-labelledby="results-summary" className="flex flex-wrap items-start gap-x-12 gap-y-5 border-b border-gray-200 px-6 py-6">
        <div className="min-w-[220px]">
          <h1 id="results-summary" className="text-xl font-bold text-gray-900">
            {period}
          </h1>
          <p className="mt-1 text-[14px] text-gray-600">
            <span className="font-semibold tabular-nums text-gray-900">{rated}</span> {isCollective ? 'tập thể' : 'cá nhân'} được xếp loại
            {scope.id !== rootUnit.id && ` · ${scope.name}`}
          </p>
          {unrated > 0 && <p className="mt-0.5 text-[13px] text-gray-500">{unrated} cá nhân chưa đánh giá, chuyển sang quý sau</p>}
          {meta &&
          <p className="mt-2 text-[12px] text-gray-500">
              {meta.decidedBy} quyết định · công khai {meta.publishedAt}
            </p>
          }
        </div>
        <RankDistribution counts={counts} active={rank} onToggle={(r) => setRank((cur) => cur === r ? null : r)} />
      </section>

      <ResultsToolbar
        period={period}
        onPeriod={(p) => {
          setPeriod(p);
          setRank(null);
        }}
        scopeId={scopeId}
        scopeIds={reachable}
        onScope={(id) => {
          setScopeId(id);
          setRank(null);
        }}
        query={query}
        onQuery={setQuery}
        placeholder={isCollective ? 'Tìm tập thể' : 'Tìm họ tên, số hiệu, chức vụ'}
        activeFilters={[period !== resultPeriods[0].id, scopeId !== (reachable[0] ?? rootUnit.id), rank, flaggedOnly].filter(Boolean).length}
        onClearFilters={() => {
          setPeriod(resultPeriods[0].id);
          setScopeId(undefined);
          setRank(null);
          setFlaggedOnly(false);
        }}
        columns={columns}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onExport={(format) =>
        isCollective ?
        exportTable(`ket-qua-tap-the-${period}`, visibleExportColumns(collectiveExportColumns, hidden), collectiveShown, format) :
        exportTable(`ket-qua-ca-nhan-${period}`, visibleExportColumns(individualExportColumns, hidden), individualShown, format)
        }
        extra={
        isCollective && flaggedCount > 0 ?
        <label className="flex h-10 cursor-pointer select-none items-center gap-2 whitespace-nowrap text-[14px] text-gray-700">
              <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => setFlaggedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          
              Chỉ tập thể cần lưu ý
              <span className="rounded-full bg-warning-50 px-1.5 text-xs font-semibold tabular-nums text-warning-700 ring-1 ring-inset ring-warning-200">
                {flaggedCount}
              </span>
            </label> :
        null
        } />
      

      <div className="flex flex-wrap items-center justify-between gap-2 px-6 pb-3 pt-5">
        <p className="text-[14px] text-gray-600">
          <span className="font-semibold text-gray-900">{isCollective ? 'Kết quả tập thể' : 'Kết quả cá nhân'}</span>
          <span className="mx-2 text-gray-300">|</span>
          {isCollective ? collectiveShown.length : individualShown.length} kết quả
          {isCollective && <span className="ml-2 text-[13px] text-gray-500">· Bấm một tập thể để xem kết quả cá nhân bên trong</span>}
        </p>
        {(rank || query || flaggedOnly) &&
        <button
          type="button"
          onClick={resetFilters}
          className="rounded text-[13px] font-medium text-brand-600 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
            Xoá bộ lọc
          </button>
        }
      </div>

      <HiddenColumns indexes={hiddenIndexes(columns, hidden)}>
        {isCollective ?
        <CollectiveResultsTable key={tableKey} rows={collectiveShown} onOpenUnit={openUnit} /> :

        <IndividualResultsTable key={tableKey} rows={individualShown} onOpenMember={setOpenMemberId} />
        }
      </HiddenColumns>

      <MemberDrawer
        member={openMemberId ? findMember(openMemberId) : undefined}
        onClose={closeDrawer}
        onOpenMember={setOpenMemberId}
        onGoToUnit={(id) => {
          setOpenMemberId(undefined);
          if (reachable.includes(id)) setScopeId(id);
        }} />
      
    </div>);

}