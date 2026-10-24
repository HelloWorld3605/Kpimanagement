import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = {period: string;self: number | null;final: number | null;};

/** Điểm tự chấm và kết quả cuối qua các kỳ; vạch 90 / 70 / 50 là ngưỡng xếp loại */
export function ScoreTrend({ data }: {data: Point[];}) {
  if (data.length === 0) return <p className="py-16 text-center text-[14px] text-gray-500">Chưa có kỳ đánh giá nào.</p>;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="rgb(var(--gray-200))" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: 'rgb(var(--gray-500))' }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} ticks={[0, 50, 70, 90, 100]} tick={{ fontSize: 12, fill: 'rgb(var(--gray-500))' }} tickLine={false} axisLine={false} />
          {[90, 70, 50].map((y) =>
          <ReferenceLine key={y} y={y} stroke="rgb(var(--gray-300))" strokeDasharray="4 4" />
          )}
          <Tooltip
            formatter={(v: number) => v?.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
            contentStyle={{ borderRadius: 6, border: '1px solid rgb(var(--gray-200))', fontSize: 13 }} />
          
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line type="monotone" dataKey="self" name="Tự chấm" stroke="rgb(var(--gray-500))" strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
          <Line type="monotone" dataKey="final" name="Kết quả cuối" stroke="rgb(var(--brand-600))" strokeWidth={2.5} dot={{ r: 4 }} connectNulls isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>);

}