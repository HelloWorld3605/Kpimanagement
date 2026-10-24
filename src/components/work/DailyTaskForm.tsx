import React, { useEffect, useState } from 'react';
import { DailyTask } from '../../types/work';
import { UnitMember } from '../../types/org';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { FormField, inputClass, inputErrorClass } from '../catalog/FormField';
import { AssigneeSelect } from './AssigneeSelect';
import { directMembers, findUnit } from '../../utils/org';
import { TODAY_ISO } from '../../utils/work';

type DailyTaskFormProps = {
  open: boolean;
  me?: UnitMember;
  unitIds: string[];
  onClose: () => void;
  onSave: (t: DailyTask) => void;
};

/** Việc hằng ngày: 1 người chủ trì, có thể thêm phối hợp — không điểm, không số lượng, không danh mục, không kỳ */
export function DailyTaskForm({ open, me, unitIds, onClose, onSave }: DailyTaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lead, setLead] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName('');
    setDescription('');
    setLead('');
    setCollaborators([]);
    setDeadline('');
    setAttempted(false);
  }, [open]);

  const leadId = lead.split(':')[1] ?? '';
  const errors = {
    name: !name.trim() ? 'Nhập tên việc' : undefined,
    lead: !leadId ? 'Chọn người chủ trì' : undefined,
    deadline: !deadline ? 'Chọn thời hạn' : deadline < TODAY_ISO ? 'Hạn không được trước hôm nay' : undefined
  };
  const err = (k: keyof typeof errors) => attempted ? errors[k] : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.values(errors).some(Boolean) || !me) return;
    onSave({
      id: `w${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      assignedById: me.id,
      leadId,
      collaboratorIds: collaborators.filter((c) => c !== leadId),
      deadline,
      status: 'todo'
    });
  };

  const candidates = unitIds.flatMap((uid) => directMembers(uid).map((m) => ({ m, unit: findUnit(uid) }))).filter(({ m }) => m.id !== me?.id && m.id !== leadId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Giao việc hằng ngày"
      description="Việc điều hành thường xuyên — không tính điểm KPI."
      onSubmit={submit}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost}>
            Huỷ
          </button>
          <button type="submit" className={btnPrimary} style={btnTransition}>
            Giao việc
          </button>
        </div>
      }>
      
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
        <FormField label="Tên việc" htmlFor="df-name" required error={err('name')} className="sm:col-span-2">
          <input id="df-name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} ${err('name') ? inputErrorClass : ''}`} />
        </FormField>
        <FormField label="Nội dung" htmlFor="df-desc" className="sm:col-span-2">
          <textarea id="df-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-auto py-2 leading-5`} />
        </FormField>
        <FormField label="Chủ trì" htmlFor="df-lead" required error={err('lead')}>
          <AssigneeSelect id="df-lead" value={lead} onChange={setLead} unitIds={unitIds} allowUnits={false} excludeMemberIds={me ? [me.id] : []} invalid={Boolean(err('lead'))} />
        </FormField>
        <FormField label="Thời hạn" htmlFor="df-deadline" required error={err('deadline')}>
          <input id="df-deadline" type="date" min={TODAY_ISO} value={deadline} onChange={(e) => setDeadline(e.target.value)} className={`${inputClass} ${err('deadline') ? inputErrorClass : ''}`} />
        </FormField>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-[13px] font-medium text-gray-600">
            Phối hợp <span className="font-normal text-gray-400">· không bắt buộc{collaborators.length ? ` · đã chọn ${collaborators.length}` : ''}</span>
          </legend>
          <div className="max-h-44 overflow-y-auto rounded-md border border-gray-300">
            {candidates.length === 0 ?
            <p className="px-3 py-2.5 text-[13px] text-gray-500">Không có cán bộ khác trong đơn vị.</p> :

            candidates.map(({ m, unit }) =>
            <label key={m.id} className="flex cursor-pointer items-center gap-2.5 border-b border-gray-100 px-3 py-2 text-[14px] last:border-b-0 hover:bg-gray-50">
                  <input
                type="checkbox"
                checked={collaborators.includes(m.id)}
                onChange={(e) => setCollaborators((c) => e.target.checked ? [...c, m.id] : c.filter((x) => x !== m.id))}
                className="h-4 w-4 accent-brand-600" />
              
                  <span className="text-gray-900">{m.name}</span>
                  <span className="truncate text-xs text-gray-500">
                    {m.position} · {unit?.name}
                  </span>
                </label>
            )
            }
          </div>
        </fieldset>
      </div>
    </Modal>);

}