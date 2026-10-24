import React from 'react';

type Tone = 'success' | 'warning' | 'neutral' | 'brand';

const tones: Record<Tone, string> = {
  success: 'bg-success-50 text-success-700 ring-success-200',
  warning: 'bg-warning-50 text-warning-700 ring-warning-200',
  neutral: 'bg-gray-50 text-gray-600 ring-gray-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200'
};

export function StatusPill({ tone, children }: {tone: Tone;children: React.ReactNode;}) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>);

}