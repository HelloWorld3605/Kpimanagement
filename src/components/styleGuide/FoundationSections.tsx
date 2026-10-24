import React from 'react';
import { colorGroups, typeScale, layoutRules, motionTokens } from '../../data/styleGuide';
import { GuideSection } from './GuideSection';

export function ColorSection() {
  return (
    <GuideSection id="colors" title="Màu sắc" description="Token màu khai báo trong tailwind.config.js. Luôn dùng token, không dùng mã màu trực tiếp.">
      <div className="space-y-8">
        {colorGroups.map((g) =>
        <div key={g.name}>
            <h3 className="text-[15px] font-semibold text-gray-800">{g.name}</h3>
            <p className="mt-0.5 text-[13px] text-gray-500">{g.description}</p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {g.tokens.map((t) =>
            <li key={t.token} className="flex flex-col">
                  <span className="h-16 rounded-md ring-1 ring-inset ring-black/5" style={{ backgroundColor: t.hex }} />
                  <span className="mt-2 text-[13px] font-semibold text-gray-900">{t.token}</span>
                  <span className="text-xs uppercase text-gray-500">{t.hex}</span>
                  <span className="mt-1 text-xs leading-4 text-gray-500">{t.usage}</span>
                </li>
            )}
            </ul>
          </div>
        )}
      </div>
    </GuideSection>);

}

export function TypographySection() {
  return (
    <GuideSection id="typography" title="Kiểu chữ" description="Font Roboto cho toàn bộ giao diện — dễ đọc, hỗ trợ tiếng Việt đầy đủ.">
      <dl className="divide-y divide-gray-100">
        {typeScale.map((t) =>
        <div key={t.name} className="grid grid-cols-1 items-baseline gap-1 py-3 sm:grid-cols-[180px_160px_1fr]">
            <dt className="text-[13px] font-medium text-gray-500">{t.name}</dt>
            <dd className="text-xs text-gray-400">{t.spec}</dd>
            <dd className={t.className}>{t.sample}</dd>
          </div>
        )}
      </dl>
    </GuideSection>);

}

export function LayoutSection() {
  return (
    <GuideSection id="layout" title="Bố cục" description="Layout ngang: sidebar trái, header phía trên (kèm tab trong màn nếu màn có nhiều phần), nội dung trải hết chiều rộng.">
      <div className="mb-6 grid h-40 grid-cols-[64px_1fr] overflow-hidden rounded-md ring-1 ring-gray-200">
        <div className="bg-brand-800" />
        <div className="flex flex-col bg-gray-100">
          <div className="h-7 border-b border-gray-200 bg-white" />
          <div className="flex h-6 items-end gap-3 border-b border-gray-200 bg-white px-3">
            <span className="h-[3px] w-12 bg-brand-600" />
            <span className="h-[3px] w-12 bg-transparent" />
          </div>
          <div className="m-3 flex-1 rounded bg-white ring-1 ring-gray-200" />
        </div>
      </div>
      <table className="w-full text-left text-[14px]">
        <tbody className="divide-y divide-gray-100">
          {layoutRules.map((r) =>
          <tr key={r.rule}>
              <th className="w-40 py-2.5 pr-4 font-medium text-gray-900">{r.rule}</th>
              <td className="py-2.5 pr-4 text-gray-700">{r.value}</td>
              <td className="py-2.5 text-gray-500">{r.note}</td>
            </tr>
          )}
        </tbody>
      </table>
    </GuideSection>);

}

export function MotionSection() {
  return (
    <GuideSection id="motion" title="Chuyển động" description="Ngắn, dứt khoát. Không phần tử nào chuyển động quá 300ms. Không dùng transition-all.">
      <table className="w-full text-left text-[14px]">
        <thead>
          <tr className="border-b border-gray-200 text-[13px] text-gray-500">
            <th className="py-2 pr-4 font-medium">Tên</th>
            <th className="py-2 pr-4 font-medium">Thời lượng</th>
            <th className="py-2 pr-4 font-medium">Easing</th>
            <th className="py-2 font-medium">Dùng cho</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {motionTokens.map((m) =>
          <tr key={m.name}>
              <td className="py-2.5 pr-4 font-medium text-gray-900">{m.name}</td>
              <td className="py-2.5 pr-4 tabular-nums text-gray-700">{m.duration}</td>
              <td className="py-2.5 pr-4 font-mono text-[13px] text-gray-600">{m.easing}</td>
              <td className="py-2.5 text-gray-500">{m.usage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </GuideSection>);

}