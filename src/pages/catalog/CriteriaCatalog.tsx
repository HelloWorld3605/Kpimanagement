import React, { useState } from 'react';
import { AlertTriangleIcon, PlusIcon } from 'lucide-react';
import { useCriteriaCatalog } from '../../contexts/CriteriaCatalogContext';
import { PageTabs } from '../../components/PageTabs';
import { VersionHistory } from '../../components/catalog/VersionHistory';
import { CriteriaDocument } from '../../components/criteria/CriteriaDocument';
import { PublishDialog } from '../../components/criteria/PublishDialog';
import { ReadOnlyNote } from '../../components/ReadOnlyNote';
import { usePermissions } from '../../hooks/usePermissions';
import {
  activeCriteria,
  createCriteriaDraft,
  diffSections,
  discardCriteriaDraft,
  draftCriteria,
  draftIssues,
  newId,
  publishCriteriaDraft,
  updateCriteriaDraft } from
'../../utils/criteria';

const ghostBtn = 'h-9 rounded-md px-3 text-[14px] font-medium text-gray-700 hover:bg-gray-100';

export function CriteriaCatalog() {
  const { sets, updateSet } = useCriteriaCatalog();
  const [tab, setTab] = useState(sets[0].id);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});
  const [publishOpen, setPublishOpen] = useState(false);
  const canWrite = usePermissions().can('criteria-catalog', 'write');

  const set = sets.find((s) => s.id === tab) ?? sets[0];
  const active = activeCriteria(set);
  const draft = draftCriteria(set);
  const fallback = ((canWrite ? draft ?? active : active ?? draft) ?? set.versions[0]).version;
  const selected = set.versions.find((v) => v.version === (selectedMap[set.id] ?? fallback)) ?? set.versions[0];
  const isDraft = selected.status === 'draft';
  const prev = isDraft ?
  set.versions.find((v) => v.version === selected.baseVersion) :
  set.versions.find((v) => v.version === selected.version - 1);
  const diff = prev ? diffSections(selected.sections, prev.sections) : null;
  const issues = isDraft ? draftIssues(set, selected, prev) : [];

  const select = (v: number) => setSelectedMap((m) => ({ ...m, [set.id]: v }));

  const addCriterionToLast = () => {
    const sections = selected.sections.map((s, i, arr) =>
    i === arr.length - 1 ? { ...s, criteria: [...s.criteria, { id: newId('c'), content: '', score: 0, guaranteed: false }] } : s
    );
    updateSet(set.id, (s) => updateCriteriaDraft(s, sections));
  };

  const actions = !canWrite ?
  <ReadOnlyNote feature="criteria-catalog" className="hidden pr-2 lg:flex" /> :
  isDraft ?
  <>
        <button
      type="button"
      className={ghostBtn}
      onClick={() => {
        updateSet(set.id, discardCriteriaDraft);
        select(active?.version ?? set.versions[0].version);
      }}
      style={{ transition: 'background-color 150ms ease-out' }}>
      
          Huỷ nháp
        </button>
        <button type="button" className={`${ghostBtn} flex items-center gap-1.5`} onClick={addCriterionToLast} style={{ transition: 'background-color 150ms ease-out' }}>
          <PlusIcon className="h-4 w-4" />
          Thêm tiêu chí
        </button>
        <span className="h-6 w-px bg-gray-200" aria-hidden />
        <button
      type="button"
      disabled={issues.length > 0}
      title={issues[0]}
      onClick={() => setPublishOpen(true)}
      className="h-9 whitespace-nowrap rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
      style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
      
          Ban hành v{selected.version}
        </button>
      </> :
  null;

  return (
    <div>
      <PageTabs
        tabs={sets.map((s) => ({ id: s.id, label: s.label }))}
        active={tab}
        onChange={setTab}
        ariaLabel="Đối tượng đánh giá"
        actions={actions} />
      

      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0 rounded-md bg-gray-100 p-4 sm:p-6">
          {isDraft && canWrite && issues.length > 0 &&
          <div className="mx-auto mb-4 flex max-w-[880px] items-start gap-2 rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-[14px] text-warning-700" role="status">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <ul className="space-y-0.5">
                {issues.map((i) =>
              <li key={i}>{i}</li>
              )}
              </ul>
            </div>
          }
          <CriteriaDocument
            set={set}
            version={selected}
            prev={prev}
            diff={diff}
            readOnly={!canWrite}
            onChange={(sections) => updateSet(set.id, (s) => updateCriteriaDraft(s, sections))} />
          
          {isDraft && canWrite &&
          <p className="mx-auto mt-3 max-w-[880px] text-xs text-gray-500">
              Dựng từ v{selected.baseVersion} lúc {selected.createdAt} bởi {selected.createdBy}. Bản nháp được lưu tự động.
            </p>
          }
        </div>

        <div className="xl:sticky xl:top-36 xl:self-start">
          <VersionHistory
            items={set.versions.map((v) => ({
              version: v.version,
              status: v.status,
              subtitle:
              v.status === 'draft' ? `Dựng từ v${v.baseVersion}` : v.status === 'active' ? `Từ ${v.effectiveFrom}` : `${v.effectiveFrom} → ${v.effectiveTo}`,
              meta: v.records === undefined ? undefined : v.records ? `${v.records} hồ sơ` : 'Chưa có hồ sơ'
            }))}
            selected={selected.version}
            onSelect={select}
            manageable={canWrite}
            canCreate={!draft}
            createHint={draft ? 'Đã có bản dự thảo đang soạn' : 'Tạo dự thảo mới từ phiên bản đang áp dụng'}
            onCreate={() => {
              updateSet(set.id, createCriteriaDraft);
              select(Math.max(...set.versions.map((v) => v.version)) + 1);
            }} />
          
        </div>
      </div>

      <PublishDialog
        open={publishOpen}
        version={selected.version}
        setLabel={set.label.toLowerCase()}
        onClose={() => setPublishOpen(false)}
        onConfirm={(info) => {
          updateSet(set.id, (s) => publishCriteriaDraft(s, info));
          setPublishOpen(false);
        }} />
      
    </div>);

}