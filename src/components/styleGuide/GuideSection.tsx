import React from 'react';

type GuideSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function GuideSection({ id, title, description, children }: GuideSectionProps) {
  return (
    <section id={id} className="scroll-mt-32 border-b border-gray-200 py-8 last:border-b-0">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-[14px] text-gray-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>);

}