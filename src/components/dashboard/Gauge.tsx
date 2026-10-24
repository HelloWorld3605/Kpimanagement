import React from 'react';

type GaugeProps = {label: string;value: number | null;hint: string;};

const R = 52;
const ARC = Math.PI * R;

/** Đồng hồ nửa vòng 0–100% cho một chỉ số hiệu suất */
export function Gauge({ label, value, hint }: GaugeProps) {
  const v = value === null ? 0 : Math.max(0, Math.min(100, value));
  const tone = value === null ? 'text-gray-300' : v >= 100 ? 'text-success-600' : v >= 80 ? 'text-brand-600' : 'text-warning-600';
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 128 72" className="w-40" role="img" aria-label={`${label}: ${value === null ? 'chưa có dữ liệu' : `${v.toFixed(1)}%`}`}>
        <path d={`M 12 64 A ${R} ${R} 0 0 1 116 64`} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" className="text-gray-100" />
        <path
          d={`M 12 64 A ${R} ${R} 0 0 1 116 64`}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={ARC}
          strokeDashoffset={ARC * (1 - v / 100)}
          className={tone}
          style={{ transition: 'stroke-dashoffset 300ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
        
        <text x="64" y="60" textAnchor="middle" className="fill-gray-900 text-[20px] font-semibold tabular-nums">
          {value === null ? '—' : `${v.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`}
        </text>
      </svg>
      <figcaption className="mt-1 text-center">
        <p className="text-[14px] font-medium text-gray-900">{label}</p>
        <p className="text-[12px] text-gray-500">{hint}</p>
      </figcaption>
    </figure>);

}