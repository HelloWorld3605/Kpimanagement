import React from 'react';
import { CircleCheckIcon, ClockIcon, InfoIcon, PencilLineIcon, Undo2Icon } from 'lucide-react';
import { SelfReview } from '../../types/selfReview';

export function StatusNotice({ review: r }: {review: SelfReview;}) {
  if (r.status === 'draft')
  return (
    <Box tone="neutral" icon={InfoIcon}>
        Phiếu do hệ thống tạo ngày {r.createdAt} khi kết thúc {r.period}. Chấm đủ tiêu chí chung, nhập kết quả từng nhiệm vụ, đề xuất mức xếp loại rồi gửi thẩm
        định trước <strong className="font-semibold">{r.deadline}</strong>. Sau khi gửi, phiếu không sửa được nữa.
      </Box>);

  if (r.status === 'returned')
  return (
    <Box tone="brand" icon={Undo2Icon}>
        <p>Phiếu bị trả lại để bổ sung. Sửa theo lý do dưới đây rồi gửi lại cho lãnh đạo.</p>
        {r.returnReason && <p className="mt-1.5 font-medium">Lý do trả lại: “{r.returnReason}”</p>}
      </Box>);

  if (r.status === 'submitted')
  return (
    <Box tone="brand" icon={ClockIcon}>
        Đã gửi ngày {r.submittedAt}, đang chờ {r.step === 'unit' ? 'lãnh đạo đơn vị đánh giá' : 'lãnh đạo phòng thẩm định'}. Lãnh đạo có thể điều chỉnh điểm khi có căn cứ hoặc
        trả lại để bổ sung — kết quả do lãnh đạo đơn vị phê duyệt là kết quả cuối cùng.
      </Box>);

  if (r.status === 'accepted')
  return (
    <Box tone="success" icon={CircleCheckIcon}>
        {r.appraisal?.by} đã chấp thuận nguyên bản ngày {r.appraisal?.at}. Điểm tự chấm là kết quả cuối cùng; phiếu đã khoá.
      </Box>);

  return (
    <Box tone="warning" icon={PencilLineIcon}>
      <p>
        {r.appraisal?.by} đã từ chối và chấm lại ngày {r.appraisal?.at}. Cột <strong className="font-semibold">Thẩm định</strong> là kết quả cuối cùng; dòng tô
        màu là chỗ điểm thay đổi.
      </p>
      {r.appraisal?.comment && <p className="mt-1.5 italic">“{r.appraisal.comment}”</p>}
    </Box>);

}

const tones = {
  neutral: 'border-gray-200 bg-gray-50 text-gray-700',
  brand: 'border-brand-200 bg-brand-50 text-brand-700',
  success: 'border-success-200 bg-success-50 text-success-700',
  warning: 'border-warning-200 bg-warning-50 text-warning-700'
};

function Box({ tone, icon: Icon, children }: {tone: keyof typeof tones;icon: typeof InfoIcon;children: React.ReactNode;}) {
  return (
    <div role="status" className={`flex items-start gap-2.5 rounded-md border px-4 py-3 text-[14px] leading-6 ${tones[tone]}`}>
      <Icon className="mt-1 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>);

}