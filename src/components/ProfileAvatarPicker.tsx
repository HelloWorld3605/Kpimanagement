import React, { useRef, useState } from 'react';
import { CameraIcon, Trash2Icon } from 'lucide-react';
import { initials } from '../utils/profile';

type ProfileAvatarPickerProps = {
  name: string;
  value: string;
  onChange: (dataUrl: string) => void;
  /** Khối thông tin hiển thị cạnh ảnh (tên, số hiệu…) */
  children?: React.ReactNode;
};

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Đầu trang hồ sơ: bấm ảnh (có biểu tượng máy ảnh ở góc) để chọn/đổi ảnh. Lưu cùng nút "Lưu thay đổi". */
export function ProfileAvatarPicker({ name, value, onChange, children }: ProfileAvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError('Chỉ nhận ảnh JPG, PNG hoặc WebP.');
    if (file.size > MAX_BYTES) return setError('Ảnh tối đa 2 MB.');
    const reader = new FileReader();
    reader.onload = () => {
      setError('');
      onChange(String(reader.result));
    };
    reader.onerror = () => setError('Không đọc được tệp ảnh, thử lại.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={value ? 'Đổi ảnh đại diện (JPG, PNG hoặc WebP, tối đa 2 MB)' : 'Chọn ảnh đại diện (JPG, PNG hoặc WebP, tối đa 2 MB)'}
        aria-describedby="avatar-hint"
        className="group relative h-16 w-16 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
        
        {value ?
        <img src={value} alt={`Ảnh đại diện của ${name}`} className="h-full w-full rounded-full object-cover ring-1 ring-gray-200" /> :

        <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">{initials(name)}</span>
        }
        {/* Biểu tượng máy ảnh ở góc — luôn hiện để dễ nhận biết ảnh bấm được */}
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-800 text-white group-hover:bg-brand-600"
          style={{ transition: 'background-color 150ms ease-out' }}
          aria-hidden>
          
          <CameraIcon className="h-3 w-3" strokeWidth={2.25} />
        </span>
        {/* Gợi ý định dạng — hiện khi rê chuột hoặc focus vào ảnh */}
        <span
          id="avatar-hint"
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-20 mt-2 translate-y-1 whitespace-nowrap rounded bg-gray-900 px-2.5 py-1.5 text-left text-xs font-normal text-white opacity-0 shadow-lg group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          style={{ transition: 'opacity 150ms ease-out, transform 150ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
          
          <span className="block font-medium">{value ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'}</span>
          <span className="block text-gray-300">JPG, PNG hoặc WebP, tối đa 2 MB.</span>
        </span>
      </button>

      <div className="min-w-0 flex-1">
        {children}
        {error &&
        <p className="mt-1 text-xs text-brand-600" role="alert">
            {error}
          </p>
        }
      </div>

      {value &&
      <button
        type="button"
        onClick={() => {
          setError('');
          onChange('');
        }}
        className="inline-flex h-9 items-center gap-2 rounded px-3 text-[14px] font-medium text-gray-600 hover:bg-gray-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ transition: 'background-color 150ms ease-out, color 150ms ease-out' }}>
        
          <Trash2Icon className="h-4 w-4" aria-hidden />
          Xoá ảnh
        </button>
      }
      <input ref={inputRef} type="file" accept={TYPES.join(',')} onChange={pick} className="sr-only" tabIndex={-1} aria-hidden />
    </div>);

}