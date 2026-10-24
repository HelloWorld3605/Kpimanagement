import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';

type AdminDetailHeaderProps = {
  backTo: string;
  backLabel: string;
  title: string;
  code: string;
  description: string;
  /** Các ô thông tin ngắn dưới mô tả */
  facts: {label: string;value: React.ReactNode;}[];
  actions?: React.ReactNode;
};

/** Phần đầu màn chi tiết quyền / vai trò: quay lại, tên, mã, mô tả, thông tin tóm tắt */
export function AdminDetailHeader({ backTo, backLabel, title, code, description, facts, actions }: AdminDetailHeaderProps) {
  return (
    <header className="border-b border-gray-200 px-4 pb-5 pt-3">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ transition: 'color 150ms ease-out' }}>
        
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-serif text-[24px] leading-tight text-gray-900">{title}</h1>
          <p className="mt-1 font-mono text-[13px] text-gray-500">{code}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-gray-700">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        {facts.map((f) =>
        <div key={f.label} className="min-w-0">
            <dt className="text-[12px] text-gray-500">{f.label}</dt>
            <dd className="mt-0.5 truncate text-[14px] font-medium text-gray-900">{f.value}</dd>
          </div>
        )}
      </dl>
    </header>);

}