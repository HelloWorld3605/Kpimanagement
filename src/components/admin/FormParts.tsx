import React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

/** Ô nhập trong form Người dùng / Nhân sự */
export const formField =
'h-9 w-full rounded-md border bg-white px-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50 disabled:text-gray-500';
export const formSectionTitle = 'mb-3 text-[12px] font-semibold uppercase tracking-wider text-gray-500';

export function Field({ label, htmlFor, required, children }: {label: string;htmlFor: string;required?: boolean;children: React.ReactNode;}) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-[14px] font-medium text-gray-800">
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </label>
      {children}
    </div>);

}

export function PasswordInput({
  value,
  onChange,
  visible,
  onToggle,
  className,
  ...rest



}: {value: string;onChange: (v: string) => void;visible: boolean;onToggle: () => void;className: string;id: string;} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className' | 'type'>) {
  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? 'text' : 'password'}
        autoComplete="new-password"
        value={value}
        placeholder="Tối thiểu 8 ký tự"
        onChange={(e) => onChange(e.target.value)}
        className={`${className} pr-10`} />
      
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>);

}