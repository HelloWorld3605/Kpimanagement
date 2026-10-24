import React, { useState } from 'react';
import { AlertTriangleIcon, SendIcon } from 'lucide-react';

type SubmitBarProps = {
  period: string;
  missing: {criteria: number;tasks: number;rank: boolean;rankRule: boolean;};
  showErrors: boolean;
  onAttempt: () => boolean;
  onSubmit: () => void;
};

export function SubmitBar({ period, missing, showErrors, onAttempt, onSubmit }: SubmitBarProps) {
  const [confirming, setConfirming] = useState(false);
  const parts = [
  missing.criteria && `${missing.criteria} tiêu chí chưa chấm`,
  missing.tasks && `${missing.tasks} nhiệm vụ chưa nhập đủ hoặc sai kết quả`,
  missing.rank && 'chưa đề xuất xếp loại',
  missing.rankRule && 'mức xếp loại chưa đúng quy định khi chưa hoàn thành 100% nhiệm vụ'].
  filter(Boolean);

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3">
      {showErrors && parts.length > 0 ?
      <p className="flex items-center gap-2 text-[14px] text-brand-600" role="alert">
          <AlertTriangleIcon className="h-4 w-4 shrink-0" />
          Còn {parts.join(', ')}.
        </p> :

      <p className="text-xs text-gray-500">Bản nháp được lưu tự động. Hệ thống tự gửi nguyên trạng khi hết hạn nộp.</p>
      }
      <div className="flex items-center gap-2">
        {confirming ?
        <>
            <span className="text-[14px] text-gray-700">Gửi phiếu {period}? Sau khi gửi không sửa được.</span>
            <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-10 rounded-md px-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100"
            style={{ transition: 'background-color 150ms ease-out' }}>
            
              Quay lại
            </button>
            <button
            type="button"
            onClick={onSubmit}
            className="flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 active:scale-[0.98]"
            style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
            
              <SendIcon className="h-4 w-4" />
              Xác nhận gửi
            </button>
          </> :

        <button
          type="button"
          onClick={() => onAttempt() && setConfirming(true)}
          className="flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
          
            <SendIcon className="h-4 w-4" />
            Gửi thẩm định
          </button>
        }
      </div>
    </div>);

}