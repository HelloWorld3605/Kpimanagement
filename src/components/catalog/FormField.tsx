import React from 'react';

export const inputClass =
'h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400';

export const inputErrorClass = 'border-brand-500 ring-2 ring-brand-100';

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

export function FormField({ label, htmlFor, required, hint, error, className = '', children }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </label>
      {children}
      {error ?
      <p className="mt-1 text-xs text-brand-600">{error}</p> :
      hint ?
      <p className="mt-1 text-xs text-gray-500">{hint}</p> :
      null}
    </div>);

}