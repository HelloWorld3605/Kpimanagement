import React from 'react';
import { FileSpreadsheetIcon, FileTextIcon, PrinterIcon } from 'lucide-react';
import { PrintExportMenu } from '../ui/PrintExportMenu';
import { downloadAppendixWord, downloadAppendixXlsx, printAppendix } from '../../utils/conversionAppendixExport';

/** "In / Xuất" của Phụ lục phương pháp quy đổi */
export function AppendixExport() {
  return (
    <PrintExportMenu
      options={[
      { id: 'pdf', label: 'In / Xuất PDF', hint: 'Mở hộp thoại in, chọn “Lưu dưới dạng PDF”', icon: PrinterIcon, run: printAppendix, errorText: 'Không mở được bản in, thử lại.' },
      { id: 'doc', label: 'Tải Word (.doc)', hint: 'Khổ A4 ngang, sửa được', icon: FileTextIcon, run: downloadAppendixWord },
      { id: 'xlsx', label: 'Tải Excel (.xlsx)', hint: 'Bảng quy đổi và lưu ý', icon: FileSpreadsheetIcon, run: downloadAppendixXlsx }]
      } />);


}