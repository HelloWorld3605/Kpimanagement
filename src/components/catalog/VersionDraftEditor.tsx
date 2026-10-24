import React, { useMemo, useState } from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { Select } from '../ui/Select';
import { TaskCatalog, TaskVersion } from '../../types/catalog';
import { scopeOptions } from '../../data/taskCatalog';
import { fieldErrors, versionContent } from '../../utils/catalog';
import { FieldsEditor } from './FieldsEditor';
import { FormField, inputClass, inputErrorClass } from './FormField';
import { GroupBadge } from './GroupBadge';

type VersionDraftEditorProps = {
  task: TaskCatalog;
  draft: TaskVersion;
  base?: TaskVersion;
  onChange: (patch: Partial<TaskVersion>) => void;
  onDiscard: () => void;
  onApply: (basis: string) => void;
};

export function VersionDraftEditor({ task, draft, base, onChange, onDiscard, onApply }: VersionDraftEditorProps) {
  const [basis, setBasis] = useState('');
  const [attempted, setAttempted] = useState(false);

  const lockedIds = useMemo(() => new Set(base?.fields.map((f) => f.id) ?? []), [base]);
  const changed = !base || versionContent(draft) !== versionContent(base);
  const scoreValid = Number.isInteger(draft.score) && draft.score >= 0 && draft.score <= 100;
  const errors = {
    name: !draft.name.trim() ? 'Nhập tên nhiệm vụ' : undefined,
    output: !draft.output.trim() ? 'Nhập sản phẩm đầu ra' : undefined,
    unit: !draft.unit.trim() ? 'Nhập đơn vị tính' : undefined,
    score: !scoreValid ? 'Điểm chuẩn từ 0 đến 100' : undefined,
    basis: !basis.trim() ? 'Bắt buộc khi áp dụng' : undefined
  };
  const valid = !Object.values(errors).some(Boolean) && Object.keys(fieldErrors(draft.fields)).length === 0;
  const show = (k: keyof typeof errors) => attempted ? errors[k] : undefined;

  const apply = () => {
    setAttempted(true);
    if (changed && valid) onApply(basis.trim());
  };

  return (
    <div>
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-gray-900">Bản nháp</h2>
          <span className="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700 ring-1 ring-inset ring-warning-200">
            v{draft.version}
          </span>
        </div>
        <p className="mt-1 text-[14px] text-gray-600">
          {draft.baseVersion ? `Dựng từ v${draft.baseVersion}` : 'Tạo mới'} lúc {draft.createdAt} bởi {draft.createdBy}. Sau khi áp dụng,
          phiên bản bị khoá; công việc đã giao giữ phiên bản của mình.
        </p>
      </div>

      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <h3 className="text-[15px] font-semibold text-gray-900">Thông tin chung</h3>
      </div>
      <div className="grid gap-x-5 gap-y-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr]">
        <FormField label="Tên nhiệm vụ" htmlFor="d-name" required error={show('name')}>
          <input id="d-name" value={draft.name} onChange={(e) => onChange({ name: e.target.value })} className={`${inputClass} ${show('name') ? inputErrorClass : ''}`} />
        </FormField>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-gray-600">Hệ lực lượng</span>
          <p className="flex h-10 items-center text-[14px] text-gray-900">{task.force}</p>
          <p className="-mt-1 text-xs text-gray-500">Cố định theo mã</p>
        </div>
        <FormField label="Phạm vi áp dụng" htmlFor="d-scope" required>
          <Select id="d-scope" value={draft.scope} onChange={(v) => onChange({ scope: v })}>
            {scopeOptions.map((s) =>
            <option key={s}>{s}</option>
            )}
          </Select>
        </FormField>
        <FormField label="Sản phẩm đầu ra" htmlFor="d-output" required error={show('output')}>
          <input id="d-output" value={draft.output} onChange={(e) => onChange({ output: e.target.value })} className={`${inputClass} ${show('output') ? inputErrorClass : ''}`} />
        </FormField>
        <FormField label="Đơn vị tính" htmlFor="d-unit" required error={show('unit')}>
          <input id="d-unit" value={draft.unit} onChange={(e) => onChange({ unit: e.target.value })} className={`${inputClass} ${show('unit') ? inputErrorClass : ''}`} />
        </FormField>
        <FormField label="Điểm chuẩn (thang 100)" htmlFor="d-score" required error={show('score')}>
          <div className="flex items-center gap-2">
            <input
              id="d-score"
              type="number"
              min={0}
              max={100}
              value={Number.isNaN(draft.score) ? '' : draft.score}
              onChange={(e) => onChange({ score: e.target.value === '' ? NaN : Number(e.target.value) })}
              className={`${inputClass} ${show('score') ? inputErrorClass : ''}`} />
            
            {scoreValid && <GroupBadge score={draft.score} />}
          </div>
        </FormField>
        <FormField
          label="Căn cứ áp dụng"
          htmlFor="d-basis"
          required
          error={show('basis')}
          hint="Số quyết định ban hành phiên bản này."
          className="md:col-span-3">
          
          <input id="d-basis" value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Số quyết định ban hành…" className={`${inputClass} ${show('basis') ? inputErrorClass : ''}`} />
        </FormField>
      </div>

      <div className="flex items-center gap-1.5 border-y border-gray-200 bg-gray-50 px-6 py-3">
        <h3 className="text-[15px] font-semibold text-gray-900">Thông tin khác</h3>
        <span className="text-[14px] text-gray-500">· {draft.fields.length}</span>
      </div>
      <div className="px-6 py-5">
        <FieldsEditor fields={draft.fields} onChange={(fields) => onChange({ fields })} lockedIds={lockedIds} showErrors={attempted} />
      </div>

      {!changed &&
      <div className="flex items-center gap-2 border-t border-warning-200 bg-warning-50 px-6 py-3 text-[14px] text-warning-700" role="status">
          <AlertTriangleIcon className="h-4 w-4 shrink-0" />
          Chưa có thay đổi so với phiên bản đang áp dụng.
        </div>
      }

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
        <p className="text-xs text-gray-500">Bản nháp được lưu tự động.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="h-10 rounded-md px-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100"
            style={{ transition: 'background-color 150ms ease-out' }}>
            
            Huỷ bản nháp
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={!changed}
            className="h-10 rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
            
            Áp dụng v{draft.version}
          </button>
        </div>
      </div>
    </div>);

}