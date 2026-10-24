import React from 'react';
import { FileSpreadsheetIcon, FileTextIcon, PrinterIcon } from 'lucide-react';
import { PrintExportMenu } from '../ui/PrintExportMenu';
import { ScoresheetForm } from '../../utils/scoresheet';
import { printScoresheetPdf } from '../../utils/scoresheetPdf';
import { downloadScoresheetDocx } from '../../utils/scoresheetDocx';
import { downloadScoresheetXlsx } from '../../utils/scoresheetXlsx';

/** "In / Xuất" bảng điểm KPI — file ra đúng mẫu CĐKPI */
export function ScoresheetExport({ form }: {form: ScoresheetForm;}) {
  return (
    <PrintExportMenu
      options={[
      { id: 'pdf', label: 'In / Xuất PDF', hint: 'Mở hộp thoại in, chọn “Lưu dưới dạng PDF”', icon: PrinterIcon, run: () => printScoresheetPdf(form), errorText: 'Không mở được bản in, thử lại.' },
      { id: 'docx', label: 'Tải Word (.docx)', hint: `Đúng ${form.code}, sửa được`, icon: FileTextIcon, run: () => downloadScoresheetDocx(form), errorText: 'Không tạo được file Word, thử lại.' },
      { id: 'xlsx', label: 'Tải Excel (.xlsx)', hint: 'Điểm dạng số, tổng và chỉ số tự tính', icon: FileSpreadsheetIcon, run: () => downloadScoresheetXlsx(form), errorText: 'Không tạo được file Excel, thử lại.' }]
      } />);


}