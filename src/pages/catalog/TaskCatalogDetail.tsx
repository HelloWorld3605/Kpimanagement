import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { useTaskCatalog } from '../../contexts/TaskCatalogContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { VersionHistory } from '../../components/catalog/VersionHistory';
import { VersionView } from '../../components/catalog/VersionView';
import { VersionDraftEditor } from '../../components/catalog/VersionDraftEditor';
import { StatusPill } from '../../components/catalog/StatusPill';
import { ReadOnlyNote } from '../../components/ReadOnlyNote';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'sonner';
import {
  activeVersion,
  applyDraft,
  catalogStatusLabel,
  createDraft,
  discardDraft,
  displayVersion,
  draftVersion,
  updateDraft } from
'../../utils/catalog';

export function TaskCatalogDetail() {
  const { code } = useParams();
  const { tasks, updateTask } = useTaskCatalog();
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const task = tasks.find((t) => t.code === code);
  const canWrite = usePermissions().can('task-catalog', 'write');
  useBreadcrumbLabel(task ? displayVersion(task).name : undefined);

  if (!task) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <EmptyMark size="lg" />
        <h1 className="mt-3 text-lg font-semibold text-gray-900">Không tìm thấy danh mục {code}</h1>
        <Link to="/danh-muc-nhiem-vu" className="mt-4 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Quay lại danh sách
        </Link>
      </div>);

  }

  const active = activeVersion(task);
  const draft = draftVersion(task);
  const fallback = ((canWrite ? draft ?? active : active ?? draft) ?? task.versions[0]).version;
  const selected = task.versions.find((v) => v.version === (selectedVersion ?? fallback)) ?? displayVersion(task);
  const status = catalogStatusLabel(task);
  const inactive = task.status === 'inactive';

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-3">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] text-gray-600">
          <span className="font-semibold tracking-wide text-gray-900">{task.code}</span>
          <span>· {task.force}</span>
          <span>· tạo {task.createdAt}</span>
          <StatusPill tone={status === 'Đang sử dụng' ? 'success' : status === 'Chưa áp dụng' ? 'warning' : 'neutral'}>{status}</StatusPill>
        </p>
        {!canWrite ?
        <ReadOnlyNote feature="task-catalog" /> :

        <button
          type="button"
          onClick={() => {
            const before = task.status;
            updateTask(task.code, (t) => ({ ...t, status: inactive ? 'active' : 'inactive' }));
            toast.success(inactive ? `Đã sử dụng lại ${task.code}` : `Đã ngừng sử dụng ${task.code}`, {
              duration: 6000,
              action: { label: 'Hoàn tác', onClick: () => updateTask(task.code, (t) => ({ ...t, status: before })) }
            });
          }}
          className={`h-10 rounded-md px-4 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
          inactive ? 'border border-brand-600 text-brand-600 hover:bg-brand-50' : 'text-gray-700 hover:bg-gray-100'}`
          }
          style={{ transition: 'background-color 150ms ease-out' }}>
          
          {inactive ? 'Sử dụng lại' : 'Ngừng sử dụng'}
        </button>
        }
      </header>

      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0 rounded-md border border-gray-200">
          {selected.status === 'draft' && canWrite ?
          <VersionDraftEditor
            key={selected.version}
            task={task}
            draft={selected}
            base={active}
            onChange={(patch) => updateTask(task.code, (t) => updateDraft(t, patch))}
            onDiscard={() => {
              updateTask(task.code, discardDraft);
              setSelectedVersion(active?.version ?? null);
            }}
            onApply={(basis) => {
              updateTask(task.code, (t) => applyDraft(t, basis));
              setSelectedVersion(selected.version);
              toast.success(`Đã áp dụng v${selected.version} cho ${task.code}`);
            }} /> :


          <VersionView task={task} version={selected} />
          }
        </div>
        <div className="xl:sticky xl:top-24 xl:self-start">
          <VersionHistory
            items={task.versions.map((v) => ({
              version: v.version,
              status: v.status,
              subtitle:
              v.status === 'draft' ?
              v.baseVersion ?
              `Dựng từ v${v.baseVersion}` :
              'Bản đầu tiên' :
              v.status === 'active' ?
              `Từ ${v.effectiveFrom}` :
              `${v.effectiveFrom} → ${v.effectiveTo}`
            }))}
            selected={selected.version}
            onSelect={setSelectedVersion}
            manageable={canWrite}
            canCreate={!draft && !inactive}
            createHint={draft ? 'Đã có bản nháp đang soạn' : inactive ? 'Danh mục đã ngừng sử dụng' : 'Tạo phiên bản mới từ phiên bản đang áp dụng'}
            onCreate={() => {
              updateTask(task.code, createDraft);
              setSelectedVersion(Math.max(...task.versions.map((v) => v.version)) + 1);
            }} />
          
        </div>
      </div>
    </div>);

}