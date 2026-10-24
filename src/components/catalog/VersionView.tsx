import React from 'react';
import { LockIcon } from 'lucide-react';
import { TaskCatalog, TaskVersion } from '../../types/catalog';
import { cleanOptions, fieldTypeLabel } from '../../utils/catalog';
import { GroupBadge } from './GroupBadge';
import { HorizontalSwipe } from '../ui/HorizontalSwipe';

type VersionViewProps = {
  task: TaskCatalog;
  version: TaskVersion;
};

export function VersionView({ task, version: v }: VersionViewProps) {
  const isActive = v.status === 'active';
  const info = [
  { label: 'Mã · tên nhiệm vụ', value: `${task.code} · ${v.name}`, wide: true },
  { label: 'Hệ lực lượng', value: task.force },
  { label: 'Phạm vi áp dụng', value: v.scope },
  { label: 'Sản phẩm đầu ra', value: v.output, wide: true },
  { label: 'Đơn vị tính', value: v.unit }];


  return (
    <div>
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {isActive ? 'Phiên bản đang áp dụng' : 'Phiên bản đã thay thế'}
          </h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">v{v.version}</span>
        </div>
        <p className="mt-1 text-[14px] text-gray-600">
          {isActive ?
          `Áp dụng từ ${v.effectiveFrom} theo ${v.basis}. Công việc giao mới dùng phiên bản này; công việc đã giao giữ phiên bản của mình.` :
          `Áp dụng ${v.effectiveFrom} → ${v.effectiveTo} theo ${v.basis}. Chỉ để tra cứu, không dùng cho công việc mới.`}
        </p>
      </div>

      <SectionTitle title="Thông tin chung" />
      <dl className="grid gap-x-8 gap-y-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr]">
        {info.map((i) =>
        <div key={i.label}>
            <dt className="text-xs text-gray-500">{i.label}</dt>
            <dd className="mt-1 text-[14px] text-gray-900">{i.value}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-gray-500">Điểm chuẩn · nhóm điểm</dt>
          <dd className="mt-1 flex items-center gap-2">
            <span className="text-xl font-semibold tabular-nums text-gray-900">{v.score}</span>
            <GroupBadge score={v.score} />
          </dd>
        </div>
      </dl>

      <SectionTitle title="Thông tin khác" count={v.fields.length} />
      <div className="px-6 py-5">
        {v.fields.length === 0 ?
        <p className="text-[14px] text-gray-500">Danh mục này chỉ dùng trường chung.</p> :

        <HorizontalSwipe className="overflow-hidden rounded-md border border-gray-200" containerProps={{ 'aria-label': 'Trường riêng' }}>
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="border-b border-gray-200 bg-gray-50 text-[13px] text-gray-700">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Tên trường</th>
                  <th className="px-4 py-2.5 font-semibold">Mã</th>
                  <th className="px-4 py-2.5 font-semibold">Kiểu</th>
                  <th className="px-4 py-2.5 font-semibold">Bắt buộc</th>
                  <th className="px-4 py-2.5 font-semibold">Đơn vị / Lựa chọn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {v.fields.map((f) => {
                const opts = cleanOptions(f.options);
                return (
                  <tr key={f.id}>
                      <td className="px-4 py-3 text-gray-900">
                        {f.name}
                        {f.hint && <p className="mt-0.5 text-xs text-gray-500">{f.hint}</p>}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-gray-600">{f.code}</td>
                      <td className="px-4 py-3 text-gray-700">{fieldTypeLabel(f.type)}</td>
                      <td className="px-4 py-3 text-gray-700">{f.required ? 'Có' : 'Không'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {f.type === 'select' && opts.length ? opts.join(' · ') : f.type === 'number' && f.unit ? f.unit : '—'}
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </HorizontalSwipe>
        }
      </div>
    </div>);

}

function SectionTitle({ title, count }: {title: string;count?: number;}) {
  return (
    <div className="flex items-center gap-1.5 border-y border-gray-200 bg-gray-50 px-6 py-3">
      <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
      {count !== undefined && <span className="text-[14px] text-gray-500">· {count}</span>}
      <LockIcon className="ml-1 h-3.5 w-3.5 text-gray-400" aria-label="Đã khoá" />
    </div>);

}