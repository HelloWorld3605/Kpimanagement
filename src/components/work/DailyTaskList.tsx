import React, { useMemo, useState } from 'react';
import { Select } from '../ui/Select';
import { CheckIcon, ClockAlertIcon, Columns3Icon, ListIcon, PlusIcon, Undo2Icon, UsersIcon } from 'lucide-react';
import { FilterField, TableToolbar, toolbarField } from '../ui/TableToolbar';
import { TableColumn, hiddenIndexes, useTableColumns } from '../../hooks/useTableColumns';
import { ExportColumn, exportTable, visibleExportColumns } from '../../utils/tableExport';
import { DailyStatus, DailyTask } from '../../types/work';
import { UnitMember } from '../../types/org';
import { StatusPill } from '../catalog/StatusPill';
import { MemberAvatar } from '../org/MemberAvatar';
import { btnPrimary, btnTransition } from '../ui/Modal';
import { HiddenColumns, TableFrame } from '../ui/TableFrame';
import { EmptyMark } from '../ui/EmptyMark';
import { displayDate } from '../../utils/profile';
import { normalize } from '../../utils/org';
import { dailyStatusMeta, dailyStatusOrder, memberName, TODAY_ISO } from '../../utils/work';

type DailyTaskListProps = {
  tasks: DailyTask[];
  me?: UnitMember;
  canWrite: boolean;
  onCreate: () => void;
  onAccept: (id: string) => void;
  onReturn: (id: string) => void;
};

type View = 'list' | 'board';

const isLate = (t: DailyTask) => t.status !== 'done' && t.deadline < TODAY_ISO;

const dailyColumns: TableColumn[] = [
{ id: 'name', label: 'Việc', locked: true },
{ id: 'lead', label: 'Chủ trì' },
{ id: 'collab', label: 'Phối hợp' },
{ id: 'deadline', label: 'Hạn' },
{ id: 'status', label: 'Trạng thái' },
{ id: 'actions', label: 'Nghiệm thu' }];


const dailyExportColumns: ExportColumn<DailyTask>[] = [
{ id: 'name', header: 'Việc', value: (t) => t.name },
{ id: 'name', header: 'Mô tả', value: (t) => t.description ?? '' },
{ id: 'lead', header: 'Chủ trì', value: (t) => memberName(t.leadId) },
{ id: 'collab', header: 'Phối hợp', value: (t) => t.collaboratorIds.map(memberName).join(', ') },
{ id: 'deadline', header: 'Hạn', value: (t) => displayDate(t.deadline) },
{ id: 'status', header: 'Trạng thái', value: (t) => isLate(t) ? `${dailyStatusMeta[t.status].label} · Quá hạn` : dailyStatusMeta[t.status].label }];


export function DailyTaskList({ tasks, me, canWrite, onCreate, onAccept, onReturn }: DailyTaskListProps) {
  const [view, setView] = useState<View>('board');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'' | DailyStatus>('');
  const { hidden, toggle: toggleColumn } = useTableColumns('daily-tasks');

  const rows = useMemo(() => {
    const q = normalize(query.trim());
    return tasks.
    filter((t) => (!q || normalize(`${t.name} ${memberName(t.leadId)}`).includes(q)) && (!status || t.status === status)).
    sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [tasks, query, status]);

  const actionsFor = (t: DailyTask) => <ReviewActions task={t} me={me} canWrite={canWrite} onAccept={onAccept} onReturn={onReturn} />;

  return (
    <div>
      <TableToolbar
        className="mb-3 border-b border-gray-200 px-4 py-3"
        query={query}
        onQuery={setQuery}
        placeholder="Tìm theo tên việc, người chủ trì"
        filters={
        <FilterField label="Trạng thái">
            <Select aria-label="Trạng thái" value={status} onChange={(v) => setStatus(v as '' | DailyStatus)} className={toolbarField}>
              <option value="">Tất cả trạng thái</option>
              {dailyStatusOrder.map((s) =>
            <option key={s} value={s}>
                  {dailyStatusMeta[s].label}
                </option>
            )}
            </Select>
          </FilterField>
        }
        activeFilters={status ? 1 : 0}
        onClearFilters={() => setStatus('')}
        leading={<p className="text-[13px] text-gray-500">{rows.length} việc · không tính điểm KPI, không gắn kỳ.</p>}
        columns={view === 'list' ? dailyColumns : undefined}
        hidden={hidden}
        onToggleColumn={toggleColumn}
        onExport={(format) => exportTable('viec-hang-ngay', visibleExportColumns(dailyExportColumns, view === 'list' ? hidden : undefined), rows, format)}
        actions={
        <div role="radiogroup" aria-label="Kiểu xem" className="flex h-10 items-center rounded-md border border-gray-300 p-0.5">
          {(
          [
          ['board', 'Bảng trạng thái', Columns3Icon],
          ['list', 'Danh sách', ListIcon]] as
          const).
          map(([v, label, Icon]) =>
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={view === v}
            onClick={() => setView(v)}
            className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded px-3 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            view === v ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:text-gray-900'}`
            }
            style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
            
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          )}
        </div>
        } />
      

      {tasks.length === 0 ?
      <div className="flex flex-col items-center px-4 py-16 text-center">
          <EmptyMark size="md" />
          <p className="mt-3 text-[15px] font-semibold text-gray-900">Chưa có việc hằng ngày</p>
          <p className="mt-1 text-[14px] text-gray-500">Giao việc điều hành thường xuyên cho cán bộ trong đơn vị.</p>
          {canWrite &&
        <button type="button" onClick={onCreate} className={`${btnPrimary} mt-4`} style={btnTransition}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Giao việc hằng ngày
            </button>
        }
        </div> :
      view === 'board' ?
      <div className="overflow-x-auto px-4 pb-4">
          <div className="grid min-w-[1100px] grid-cols-5 gap-3">
            {dailyStatusOrder.map((s) => {
            const col = rows.filter((t) => t.status === s);
            return (
              <section key={s} aria-label={dailyStatusMeta[s].label} className="flex min-h-[240px] flex-col rounded-md bg-gray-50 p-2">
                  <h3 className="flex items-center justify-between px-1.5 pb-2 pt-1 text-[13px] font-semibold text-gray-700">
                    {dailyStatusMeta[s].label}
                    <span className="tabular-nums text-gray-500">{col.length}</span>
                  </h3>
                  <ul className="space-y-2">
                    {col.map((t) =>
                  <li key={t.id} className="rounded-md border border-gray-200 bg-white p-3">
                        <p className="text-[14px] font-medium leading-snug text-gray-900">{t.name}</p>
                        <div className="mt-2 flex items-center gap-2 text-[13px] text-gray-600">
                          <MemberAvatar name={memberName(t.leadId)} size="sm" />
                          <span className="min-w-0 flex-1 truncate">{memberName(t.leadId)}</span>
                          {t.collaboratorIds.length > 0 &&
                      <span className="flex items-center gap-0.5 text-xs text-gray-500" title={t.collaboratorIds.map(memberName).join(', ')}>
                              <UsersIcon className="h-3.5 w-3.5" aria-hidden />+{t.collaboratorIds.length}
                            </span>
                      }
                        </div>
                        <Deadline task={t} />
                        {actionsFor(t)}
                      </li>
                  )}
                  </ul>
                </section>);

          })}
          </div>
        </div> :

      <HiddenColumns indexes={hiddenIndexes(dailyColumns, hidden)}>
        <TableFrame label="Danh sách việc hằng ngày" className="mx-4 mb-4" reserve={0}>
          <table className="data-table w-full min-w-[900px] text-[14px] text-gray-700">
            <thead>
              <tr>
                {['Việc', 'Chủ trì', 'Phối hợp', 'Hạn', 'Trạng thái', ''].map((h, i) =>
                <th key={i} className="whitespace-nowrap border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700">
                    {h}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 &&
              <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[14px] text-gray-500">
                    <EmptyMark className="mb-2" />
                    Không có việc phù hợp.
                  </td>
                </tr>
              }
              {rows.map((t) =>
              <tr key={t.id}>
                  <td className="border-b border-gray-100 px-3 py-3">
                    <p className="font-medium text-gray-900">{t.name}</p>
                    {t.description && <p className="line-clamp-1 text-xs text-gray-500">{t.description}</p>}
                  </td>
                  <td className="whitespace-nowrap border-b border-gray-100 px-3 py-3">{memberName(t.leadId)}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-[13px] text-gray-600">{t.collaboratorIds.map(memberName).join(', ') || '—'}</td>
                  <td className="whitespace-nowrap border-b border-gray-100 px-3 py-3">
                    <Deadline task={t} inline />
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3">
                    <StatusPill tone={dailyStatusMeta[t.status].tone}>{dailyStatusMeta[t.status].label}</StatusPill>
                  </td>
                  <td className="w-56 border-b border-gray-100 px-3 py-3">{actionsFor(t)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </TableFrame>
        </HiddenColumns>
      }
    </div>);

}

function Deadline({ task, inline }: {task: DailyTask;inline?: boolean;}) {
  const late = isLate(task);
  return (
    <p className={`${inline ? '' : 'mt-2'} flex items-center gap-1 text-[13px] tabular-nums ${late ? 'font-medium text-brand-600' : 'text-gray-500'}`}>
      {late && <ClockAlertIcon className="h-3.5 w-3.5" aria-label="Quá hạn" />}
      Hạn {displayDate(task.deadline)}
    </p>);

}

type ReviewActionsProps = {task: DailyTask;me?: UnitMember;canWrite: boolean;onAccept: (id: string) => void;onReturn: (id: string) => void;};

/** Người giao nghiệm thu hoặc trả lại; không tự nghiệm thu việc mình chủ trì */
function ReviewActions({ task, me, canWrite, onAccept, onReturn }: ReviewActionsProps) {
  if (task.status !== 'review' || !canWrite || !me || task.assignedById !== me.id) return null;
  if (task.leadId === me.id) return <p className="mt-2 text-xs text-gray-500">Bạn chủ trì việc này — cần cấp trên nghiệm thu.</p>;
  const btn =
  'inline-flex h-8 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';
  return (
    <div className="mt-2.5 flex gap-1.5">
      <button type="button" onClick={() => onAccept(task.id)} className={`${btn} bg-brand-600 text-white hover:bg-brand-700`} style={{ transition: 'background-color 150ms ease-out' }}>
        <CheckIcon className="h-3.5 w-3.5" aria-hidden />
        Nghiệm thu
      </button>
      <button type="button" onClick={() => onReturn(task.id)} className={`${btn} border border-gray-300 text-gray-700 hover:bg-gray-50`} style={{ transition: 'background-color 150ms ease-out' }}>
        <Undo2Icon className="h-3.5 w-3.5" aria-hidden />
        Trả lại
      </button>
    </div>);

}