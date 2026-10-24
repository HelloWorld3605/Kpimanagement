import React from 'react';
import { Building2Icon } from 'lucide-react';
import { Modal, btnSecondary, btnTransition } from '../ui/Modal';
import { EmptyMark } from '../ui/EmptyMark';
import { SelfReview } from '../../types/selfReview';
import { UnitMember } from '../../types/org';

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700';

/** Pop up "Tiến độ công việc": các lần gửi, trả lại, thẩm định, duyệt của một phiếu */
export function FlowDialog({ open, onClose, review, owner }: {open: boolean;onClose: () => void;review?: SelfReview;owner?: UnitMember;}) {
  const flow = review?.flow ?? [];
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Tiến độ công việc"
      description={review ? `Tiến độ công việc ${review.period} của ${owner ? `${owner.position} ${owner.name}` : 'cán bộ'}` : undefined}
      footer={
      <div className="flex justify-end">
          <button type="button" onClick={onClose} className={btnSecondary} style={btnTransition}>
            Đóng
          </button>
        </div>
      }>
      
      <div className="overflow-x-auto px-4 py-4">
        <table className="w-full min-w-[720px] text-[14px] text-gray-700">
          <thead>
            <tr>
              <th className={`${th} w-12 text-center`}>STT</th>
              <th className={th}>Ngày thực hiện</th>
              <th className={th}>Người thực hiện</th>
              <th className={th}>Người xử lý tiếp theo</th>
              <th className={th}>Nội dung</th>
              <th className={th}>Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {flow.length === 0 &&
            <tr>
                <td colSpan={6} className="py-10 text-center">
                  <EmptyMark />
                  <p className="mt-2 text-gray-500">Phiếu chưa được gửi.</p>
                </td>
              </tr>
            }
            {flow.map((f, i) =>
            <tr key={i} className="border-b border-gray-100 align-top last:border-0">
                <td className="px-3 py-2.5 text-center tabular-nums text-gray-500">{i + 1}</td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">{f.at}</td>
                <td className="px-3 py-2.5">
                  <span className="text-gray-900">{f.by}</span>
                  {f.byUnit &&
                <span className="mt-0.5 flex items-center gap-1 text-[12px] text-gray-500">
                      <Building2Icon className="h-3 w-3" aria-hidden />
                      {f.byUnit}
                    </span>
                }
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-gray-900">{f.next ?? '—'}</span>
                  {f.nextUnit &&
                <span className="mt-0.5 flex items-center gap-1 text-[12px] text-gray-500">
                      <Building2Icon className="h-3 w-3" aria-hidden />
                      {f.nextUnit}
                    </span>
                }
                </td>
                <td className="px-3 py-2.5">{f.action}</td>
                <td className="px-3 py-2.5 text-[13px] text-gray-600">{f.content}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>);

}