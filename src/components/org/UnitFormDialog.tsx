import React, { useEffect, useState } from 'react';
import { Modal, btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Unit, UnitLevel } from '../../types/org';
import { levelLabels } from '../../utils/org';

type UnitFormDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Có: sửa đơn vị này; không: thêm đơn vị trực thuộc `parent` */
  unit?: Unit;
  parent?: Unit;
  defaultLevel: UnitLevel;
  onSubmit: (values: {name: string;shortName?: string;level: UnitLevel;}) => void;
};

const inputClass =
'h-10 w-full rounded-md border bg-white px-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

export function UnitFormDialog({ open, onClose, unit, parent, defaultLevel, onSubmit }: UnitFormDialogProps) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [level, setLevel] = useState<UnitLevel>(defaultLevel);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(unit?.name ?? '');
    setShortName(unit?.shortName ?? '');
    setLevel(unit?.level ?? defaultLevel);
    setError('');
  }, [open, unit, defaultLevel]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nhập tên đơn vị.');
      return;
    }
    onSubmit({ name: name.trim(), shortName: shortName.trim() || undefined, level });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={unit ? 'Sửa đơn vị' : 'Thêm đơn vị trực thuộc'}
      description={!unit && parent ? `Trực thuộc ${parent.name}` : undefined}
      onSubmit={submit}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Huỷ
          </button>
          <button type="submit" className={btnPrimary} style={btnTransition}>
            {unit ? 'Lưu' : 'Thêm đơn vị'}
          </button>
        </div>
      }>
      
      <div className="space-y-4 px-4 py-4">
        <div>
          <label htmlFor="unit-name" className="mb-1.5 block text-[14px] font-medium text-gray-800">
            Tên đơn vị <span className="text-brand-600">*</span>
          </label>
          <input
            id="unit-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Vd. Đội Kỹ thuật"
            aria-invalid={!!error}
            className={`${inputClass} ${error ? 'border-brand-600' : 'border-gray-300'}`} />
          
          {error && <p className="mt-1 text-[12px] text-brand-700">{error}</p>}
        </div>
        <div>
          <label htmlFor="unit-short" className="mb-1.5 block text-[14px] font-medium text-gray-800">
            Tên rút gọn
          </label>
          <input
            id="unit-short"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="Không bắt buộc"
            className={`${inputClass} border-gray-300`} />
          
        </div>
        <div>
          <label htmlFor="unit-level" className="mb-1.5 block text-[14px] font-medium text-gray-800">
            Cấp đơn vị
          </label>
          <Select id="unit-level" value={level} onChange={(v) => setLevel(v as UnitLevel)}>
            {(Object.keys(levelLabels) as UnitLevel[]).
            filter((l) => l !== 'btl' || unit?.level === 'btl').
            map((l) =>
            <option key={l} value={l}>
                  {levelLabels[l]}
                </option>
            )}
          </Select>
        </div>
      </div>
    </Modal>);

}