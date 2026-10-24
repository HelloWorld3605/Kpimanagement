import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { SwatchBookIcon, ComponentIcon } from 'lucide-react';
import { docSections, styleGuideVersion } from '../data/styleGuide';
import { PageTabs, PageTab } from '../components/PageTabs';
import { ColorSection, TypographySection, LayoutSection, MotionSection } from '../components/styleGuide/FoundationSections';
import {
  ButtonSection,
  InputSection,
  NavigationSection,
  BadgeSection,
  TableSection } from
'../components/styleGuide/ComponentSections';

const guideTabs: PageTab[] = [
{ id: 'foundation', label: 'Nền tảng', icon: SwatchBookIcon },
{ id: 'components', label: 'Thành phần', icon: ComponentIcon }];


export function StyleGuide() {
  const [tab, setTab] = useState('foundation');
  const created = parseISO(styleGuideVersion.createdAt);
  const versionName = `${styleGuideVersion.label}_${format(created, 'yyyyMMdd-HHmm')}`;
  const sections = docSections.filter((s) => s.tab === tab);

  return (
    <div>
      <PageTabs tabs={guideTabs} active={tab} onChange={setTab} ariaLabel="Phần tài liệu" />
      <header className="border-b border-gray-200 px-6 py-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-brand-50 px-2.5 py-1 font-mono text-[13px] font-medium text-brand-700">{versionName}</span>
        </div>
        <p className="mt-2 max-w-3xl text-[14px] text-gray-600">
          Bản đầu tiên của hệ thống giao diện Quản lý KPI — tạo lúc {format(created, 'HH:mm, dd/MM/yyyy')}. Mọi màn hình mới
          dùng chung màu, kiểu chữ, thành phần và quy tắc bố cục dưới đây.
        </p>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr]">
        <nav aria-label="Mục lục tài liệu" className="hidden border-r border-gray-200 lg:block">
          <ul className="sticky top-32 space-y-0.5 p-4">
            {sections.map((s) =>
            <li key={s.id}>
                <a
                href={`#${s.id}`}
                className="block rounded-md px-3 py-2 text-[14px] text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
                
                  {s.label}
                </a>
              </li>
            )}
          </ul>
        </nav>
        <div className="min-w-0 px-6 lg:px-8">
          {tab === 'foundation' ?
          <>
              <ColorSection />
              <TypographySection />
              <LayoutSection />
              <MotionSection />
            </> :

          <>
              <ButtonSection />
              <InputSection />
              <NavigationSection />
              <BadgeSection />
              <TableSection />
            </>
          }
        </div>
      </div>
    </div>);

}