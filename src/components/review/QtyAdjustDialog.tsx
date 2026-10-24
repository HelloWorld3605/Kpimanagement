import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { FormField } from '../catalog/FormField';
import { TaskAverage } from '../../utils/reviewFlow';
import { TODAY_ISO } from '../../utils/work';

const inputClass =
'h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

type QtyAdjustDialogProps = {
  open: boolean;
  taskName: string;
  before: number;
  average?: TaskAverage;
  onClose: () => void;
  onConfirm: (after: number, reason: string, effectiveFrom: string) => void;
};

/**
 * Lãnh đạo giao lại số lượng công việc khi thẩm định: nhập số mới, lý do, thời điểm áp dụng,
 * rồi xác nhận "Bạn có chắc muốn thay đổi Số lượng giao từ X thành Y?". Điểm được tính lại theo số mới.
 */
export function QtyAdjustDialog({ open, taskName, before, average, onClose, onConfirm }: QtyAdjustDialogProps) {
  const [after, setAfter] = useState(before);
  const [reason, setReason] = useState('');
  const [effective, setEffective] = useState(TODAY_ISO);
  const [confirming, setConfirming] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAfter(before);
    setReason('');
    setEffective(TODAY_ISO);
    setConfirming(false);
    setTried(false);
  }, [open, before]);

  const errors = {
    after: after < 1 ? 'Số lượng giao phải từ 1 trở lên' : after === before ? 'Số mới phải khác số đang giao' : undefined,
    reason: !reason.trim() ? 'Nhập lý do điều chỉnh' : undefined
  };
  const valid = !errors.after && !errors.reason;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={confirming ? 'Xác nhận' : 'Giao lại số lượng nhiệm vụ'}
      description={taskName}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={confirming ? () => setConfirming(false) : onClose} className={btnGhost} style={btnTransition}>
            {confirming ? 'Không' : 'Huỷ'}
          </button>
          <button
          type="button"
          onClick={() => {
            if (confirming) return onConfirm(after, reason.trim(), effective);
            setTried(true);
            if (valid) setConfirming(true);
          }}
          className={btnPrimary}
          style={btnTransition}>
          
            {confirming ? 'Đồng ý' : 'Tiếp tục'}
          </button>
        </div>
      }>
      
      {confirming ?
      <div className="flex items-start gap-3 px-4 py-5 text-[14px] text-gray-800">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" aria-hidden />
          <div>
            <p>
              Bạn có chắc muốn thay đổi Số lượng giao từ <strong className="tabular-nums">{before}</strong> thành <strong className="tabular-nums">{after}</strong>?
            </p>
            <p className="mt-1.5 text-[13px] text-gray-500">
              Điểm số lượng (A), chất lượng (B), tiến độ (C) của cán bộ được tính lại theo số mới. Người điều chỉnh, thời điểm và lý do được lưu vào lịch sử.
            </p>
          </div>
        </div> :

      <div className="space-y-4 px-4 py-4">
          <div className="flex items-center gap-6 text-[14px]">
            <div>
              <p className="text-[12px] text-gray-500">Đang giao</p>
              <p className="text-lg font-semibold tabular-nums text-gray-900">{before}</p>
            </div>
            {average &&
          <div>
                <p className="text-[12px] text-gray-500">Bình quân mỗi người</p>
                <p className="text-lg font-semibold tabular-nums text-gray-900">
                  {average.avg.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                  <span className="ml-1.5 text-[12px] font-normal text-gray-500">
                    ({average.total} / {average.people})
                  </span>
                </p>
              </div>
          }
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Số lượng giao mới" htmlFor="qty-after" required error={tried ? errors.after : undefined}>
              <input id="qty-after" type="number" min={1} value={after} onChange={(e) => setAfter(Math.max(0, Math.floor(Number(e.target.value) || 0)))} className={`${inputClass} tabular-nums`} />
            </FormField>
            <FormField label="Áp dụng từ ngày" htmlFor="qty-effective" required>
              <input id="qty-effective" type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className={inputClass} />
            </FormField>
          </div>
          <FormField label="Lý do điều chỉnh" htmlFor="qty-reason" required error={tried ? errors.reason : undefined} hint="Ví dụ: số lượng giao chưa đều giữa các cán bộ cùng nhiệm vụ.">
            <textarea id="qty-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputClass} h-auto py-2`} />
          </FormField>
        </div>
      }
    </Modal>);

}