import React, { useState } from 'react';
import { PlusIcon, Loader2Icon, SearchIcon, FileSpreadsheetIcon, ListChecksIcon, TargetIcon, AlertCircleIcon } from 'lucide-react';
import { GuideSection } from './GuideSection';
import { Select } from '../ui/Select';

/** Mẫu ô chọn dùng chung — mọi ô chọn trong hệ thống dùng components/ui/Select */
function GuideSelect() {
  const [value, setValue] = useState('main');
  return (
    <Select aria-labelledby="sg-select" value={value} onChange={setValue}>
      <option value="main">Chỉ đạo/Xử lý chính</option>
      <option value="coop">Phối hợp</option>
      <option value="watch">Theo dõi</option>
    </Select>);

}

const LABEL = 'mb-2 block text-xs font-medium text-gray-500';
const primary =
'flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
const outline =
'flex h-10 items-center gap-2 rounded-md border border-brand-600 bg-white px-4 text-[14px] font-medium text-brand-600 hover:bg-brand-50 active:scale-[0.98]';
const ghost = 'flex h-10 items-center gap-2 rounded-md px-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100';
const btnTransition = { transition: 'background-color 150ms ease-out, transform 120ms ease-out' };
const input =
'h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

export function ButtonSection() {
  return (
    <GuideSection id="buttons" title="Nút" description="Mỗi khu vực chỉ có một nút chính. Hành động phụ dùng nút viền hoặc nút trơn.">
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <span className={LABEL}>Chính</span>
          <button type="button" className={primary} style={btnTransition}>
            <PlusIcon className="h-4 w-4" />
            Tạo mới
          </button>
        </div>
        <div>
          <span className={LABEL}>Viền</span>
          <button type="button" className={outline} style={btnTransition}>
            <FileSpreadsheetIcon className="h-4 w-4" />
            Xuất
          </button>
        </div>
        <div>
          <span className={LABEL}>Trơn</span>
          <button type="button" className={ghost} style={btnTransition}>
            Huỷ
          </button>
        </div>
        <div>
          <span className={LABEL}>Đang xử lý</span>
          <button type="button" className={primary} disabled>
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Xem báo cáo
          </button>
        </div>
        <div>
          <span className={LABEL}>Vô hiệu</span>
          <button type="button" className={primary} disabled>
            Lưu
          </button>
        </div>
      </div>
    </GuideSection>);

}

export function InputSection() {
  return (
    <GuideSection id="inputs" title="Ô nhập & bộ lọc" description="Thanh lọc xếp ngang một hàng: select → khoảng ngày → đơn vị → tìm kiếm → nút.">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className={LABEL}>Mặc định</span>
          <span className="relative block">
            <input className={`${input} pr-10`} placeholder="Tìm kiếm Cá nhân | Đơn vị" />
            <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </span>
        </label>
        <div>
          <span id="sg-select" className={LABEL}>Select (components/ui/Select)</span>
          <GuideSelect />
        </div>
        <label className="block">
          <span className={LABEL}>Lỗi</span>
          <input className={`${input} border-brand-500 ring-2 ring-brand-100`} defaultValue="32/10/2026" aria-invalid />
          <span className="mt-1.5 flex items-center gap-1 text-xs text-brand-600">
            <AlertCircleIcon className="h-3.5 w-3.5" />
            Ngày không hợp lệ
          </span>
        </label>
        <label className="block">
          <span className={LABEL}>Vô hiệu</span>
          <input className={`${input} cursor-not-allowed bg-gray-50 text-gray-400`} defaultValue="K02BCA.E30.BCT" disabled />
        </label>
      </div>
    </GuideSection>);

}

export function NavigationSection() {
  const [tab, setTab] = useState('all');
  const tabs = [
  { id: 'all', label: 'Tổng hợp', icon: ListChecksIcon },
  { id: 'in', label: 'Văn bản đến', icon: TargetIcon }];

  return (
    <GuideSection
      id="navigation"
      title="Điều hướng & tab"
      description="Tab trong màn nằm ngay dưới header, chỉ xuất hiện khi màn có nhiều phần nội dung (vd. Theo dõi tiến độ: Tổng hợp / Văn bản đến / Văn bản đi / Hồ sơ công việc). Mục active trên sidebar: nền đỏ sẫm, chữ vàng, vạch vàng bên trái.">
      
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <span className={LABEL}>Tab trong màn</span>
          <div className="flex gap-1 border-b border-gray-200">
            {tabs.map(({ id, label, icon: Icon }) =>
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-[14px] font-medium ${
              tab === id ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'}`
              }
              style={{ transition: 'color 150ms ease-out' }}>
              
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                {label}
                {tab === id && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-brand-600" />}
              </button>
            )}
          </div>
        </div>
        <div>
          <span className={LABEL}>Mục sidebar</span>
          <div className="overflow-hidden rounded-md bg-brand-800 text-[15px]">
            <div className="px-4 py-3 text-white/90">Mặc định</div>
            <div className="bg-white/10 px-4 py-3 text-white/90">Hover</div>
            <div className="relative bg-brand-900/70 px-4 py-3 font-semibold text-gold-300">
              <span className="absolute inset-y-0 left-0 w-1.5 bg-gold-400" />
              Đang chọn
            </div>
          </div>
        </div>
      </div>
    </GuideSection>);

}

export function BadgeSection() {
  return (
    <GuideSection id="badges" title="Badge & trạng thái" description="Số đếm dạng tròn. Số quá hạn trong bảng tô đỏ đậm, số 0 hiển thị gạch mờ.">
      <div className="flex flex-wrap items-center gap-8">
        <div>
          <span className={LABEL}>Trên nền trắng</span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">12</span>
        </div>
        <div>
          <span className={LABEL}>Trên sidebar</span>
          <span className="inline-flex rounded bg-brand-800 p-2">
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-semibold text-brand-900">3</span>
          </span>
        </div>
        <div>
          <span className={LABEL}>Số liệu bảng</span>
          <span className="flex items-center gap-5 text-[14px] tabular-nums">
            <span className="text-gray-700">49</span>
            <span className="font-semibold text-brand-600">3</span>
            <span className="text-gray-300">–</span>
          </span>
        </div>
      </div>
    </GuideSection>);

}

export function TableSection() {
  const th = 'border border-gray-200 bg-gray-50 px-3 py-2 text-center text-[13px] font-semibold text-gray-700';
  const td = 'border border-gray-200 px-3 py-2 text-center tabular-nums';
  return (
    <GuideSection
      id="tables"
      title="Bảng dữ liệu"
      description="Tiêu đề nhiều tầng: tầng nhóm nền brand-50 chữ brand-700, tầng con nền gray-50. Dòng đơn vị in đậm, dòng tổng cộng nền gray-100.">
      
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full min-w-[520px] border-collapse text-[14px] text-gray-700">
          <thead>
            <tr>
              <th rowSpan={2} className={`${th} text-left`}>Cá nhân | Đơn vị</th>
              <th colSpan={2} className="border border-gray-200 bg-brand-50 px-3 py-2 text-center text-[13px] font-semibold text-brand-700">Hoàn thành</th>
            </tr>
            <tr>
              <th className={th}>Tổng số</th>
              <th className={th}>Quá hạn</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50/60 font-semibold text-gray-900">
              <td className="border border-gray-200 px-3 py-2">BAN CHÍNH TRỊ</td>
              <td className={td}>112</td>
              <td className={`${td} text-brand-600`}>2</td>
            </tr>
            <tr>
              <td className="border border-gray-200 py-2 pl-8 pr-3">Nguyễn Văn Hùng</td>
              <td className={td}>49</td>
              <td className={`${td} text-gray-300`}>–</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold text-gray-900">
              <td className="border border-gray-200 px-3 py-2">Tổng cộng</td>
              <td className={td}>112</td>
              <td className={`${td} text-brand-600`}>2</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </GuideSection>);

}