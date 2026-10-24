import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal, btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Field } from './FormParts';
import { useAccess } from '../../contexts/AccessContext';
import { findUnit, unitTreeOptions } from '../../utils/org';
import { UnitMember } from '../../types/org';

type MoveStaffDialogProps = {open: boolean;staff: UnitMember[];onClose: () => void;onDone: () => void;};

/** Chuyển nhiều nhân sự sang một đơn vị; giữ cương vị, chức vụ — kèm Hoàn tác */
export function MoveStaffDialog({ open, staff, onClose, onDone }: MoveStaffDialogProps) {
  const { units, updateMember } = useAccess();
  const [target, setTarget] = useState('');
  const options = useMemo(() => unitTreeOptions(), [units]);
  const moving = staff.filter((m) => m.unitId !== target);

  const submit = () => {
    if (!target) return;
    const before = moving.map((m) => ({ id: m.id, unitId: m.unitId }));
    moving.forEach((m) => updateMember(m.id, { unitId: target }));
    toast.success(`Đã chuyển ${moving.length} nhân sự sang ${findUnit(target)?.name}`, {
      duration: 8000,
      action: { label: 'Hoàn tác', onClick: () => before.forEach((b) => updateMember(b.id, { unitId: b.unitId })) }
    });
    setTarget('');
    onDone();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chuyển đơn vị"
      description={`${staff.length} nhân sự đã chọn. Cương vị, chức vụ giữ nguyên — kiểm tra lại nếu người được chuyển giữ chức vụ chỉ huy.`}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnSecondary} style={btnTransition}>
            Huỷ
          </button>
          <button type="button" onClick={submit} disabled={!target || !moving.length} className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`} style={btnTransition}>
            Chuyển {moving.length || ''} người
          </button>
        </div>
      }>

      <div className="space-y-4 px-5 py-4">
        <Field label="Đơn vị mới" htmlFor="move-target" required>
          <Select id="move-target" value={target} placeholder="Chọn đơn vị" searchThreshold={8} onChange={setTarget}>
            {options.map((u) =>
            <option key={u.id} value={u.id}>
                {u.label}
              </option>
            )}
          </Select>
        </Field>
        <ul className="max-h-48 divide-y divide-gray-100 overflow-auto rounded-md border border-gray-200 text-[13px]">
          {staff.map((m) =>
          <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
              <span className="truncate text-gray-900">
                {m.name} <span className="font-mono text-gray-500">{m.code}</span>
              </span>
              <span className="shrink-0 text-gray-500">{findUnit(m.unitId)?.name ?? '—'}</span>
            </li>
          )}
        </ul>
      </div>
    </Modal>);

}
