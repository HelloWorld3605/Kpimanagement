import React from 'react';
import { Select } from '../ui/Select';
import { CustomField } from '../../types/catalog';
import { inputClass, inputErrorClass } from '../catalog/FormField';

type CustomFieldInputProps = {
  id: string;
  field: CustomField;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
};

/** Ô nhập cho một trường riêng của mục danh mục, theo kiểu dữ liệu đã khai báo */
export function CustomFieldInput({ id, field, value, onChange, invalid }: CustomFieldInputProps) {
  const cls = `${inputClass} ${invalid ? inputErrorClass : ''}`;
  switch (field.type) {
    case 'long_text':
      return (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${cls} h-auto py-2 leading-5`} />);


    case 'select':
      return (
        <Select id={id} value={value} onChange={onChange} invalid={invalid} placeholder={`Chọn ${field.name.toLowerCase()}`}>
          {(field.options ?? []).map((o) =>
          <option key={o}>{o}</option>
          )}
        </Select>);

    case 'date':
      return <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />;
    case 'number':
      return (
        <div className="relative">
          <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} ${field.unit ? 'pr-24' : ''}`} />
          {field.unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-500">{field.unit}</span>}
        </div>);

    default:
      return <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />;
  }
}