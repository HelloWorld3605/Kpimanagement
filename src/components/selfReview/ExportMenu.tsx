import React from 'react';
import { FileSpreadsheetIcon, FileTextIcon, PrinterIcon } from 'lucide-react';
import { PrintExportMenu } from '../ui/PrintExportMenu';
import { SelfReview } from '../../types/selfReview';
import { staffProfile } from '../../data/staffProfile';
import { useProfile } from '../../contexts/ProfileContext';
import { usePermissions } from '../../hooks/usePermissions';
import { displayDate } from '../../utils/profile';
import { unitPath } from '../../utils/org';
import { buildSelfReviewForm } from '../../utils/selfReviewForm';
import { printSelfReviewPdf } from '../../utils/selfReviewPdf';
import { downloadSelfReviewDocx } from '../../utils/selfReviewDocx';
import { downloadSelfReviewXlsx } from '../../utils/selfReviewXlsx';

/** "In / Xuất" phiếu tự đánh giá */
export function ExportMenu({ review }: {review: SelfReview;}) {
  const { profile } = useProfile();
  const { member } = usePermissions();

  const form = () => {
    const path = member ? unitPath(member.unitId) : [];
    const own = path[path.length - 1];
    const parent = path.length > 1 ? path[path.length - 2] : own;
    return buildSelfReviewForm(review, {
      ...staffProfile,
      parentUnit: (parent?.name ?? staffProfile.parentUnit).toUpperCase(),
      unit: (own?.name ?? staffProfile.unit).toUpperCase(),
      name: profile.name,
      birthDate: displayDate(profile.birthDate),
      hometown: profile.hometown,
      rank: profile.rank,
      salaryCoefficient: profile.salaryCoefficient,
      govPosition: profile.position,
      workUnit: path.
      slice(1).
      reverse().
      map((u) => u.name).
      join(' – '),
      title: profile.specialty
    });
  };

  return (
    <PrintExportMenu
      options={[
      { id: 'pdf', label: 'In / Xuất PDF', hint: 'Mở hộp thoại in, chọn “Lưu dưới dạng PDF”', icon: PrinterIcon, run: () => printSelfReviewPdf(form()), errorText: 'Không mở được bản in, thử lại.' },
      { id: 'docx', label: 'Tải Word (.docx)', hint: 'Đúng Mẫu KĐLĐCH - 1, sửa được', icon: FileTextIcon, run: () => downloadSelfReviewDocx(form()), errorText: 'Không tạo được file Word, thử lại.' },
      { id: 'xlsx', label: 'Tải Excel (.xlsx)', hint: 'Điểm dạng số, dòng tổng tự cộng — tiện tổng hợp', icon: FileSpreadsheetIcon, run: () => downloadSelfReviewXlsx(form()), errorText: 'Không tạo được file Excel, thử lại.' }]
      } />);


}