import React from 'react';
import { FileSpreadsheetIcon, FileTextIcon, PrinterIcon } from 'lucide-react';
import { ExportFormat } from '../../utils/tableExport';
import { PrintExportMenu } from './PrintExportMenu';

type ExportDropdownProps = {
  onExport: (format: ExportFormat) => void | Promise<void>;
};

/** "In / Xuất" của thanh công cụ bảng: in, Excel, CSV cho danh sách đang lọc */
export function ExportDropdown({ onExport }: ExportDropdownProps) {
  return (
    <PrintExportMenu
      caption="Danh sách đang lọc"
      options={[
      { id: 'print', label: 'In / Xuất PDF', hint: 'Mở hộp thoại in, chọn “Lưu dưới dạng PDF”', icon: PrinterIcon, run: () => onExport('print'), errorText: 'Không mở được bản in, thử lại.' },
      { id: 'xlsx', label: 'Tải Excel (.xlsx)', hint: 'Giữ định dạng cột, có bộ lọc', icon: FileSpreadsheetIcon, run: () => onExport('xlsx') },
      { id: 'csv', label: 'Tải CSV (.csv)', hint: 'Văn bản thuần, mở được ở mọi phần mềm', icon: FileTextIcon, run: () => onExport('csv') }]
      } />);


}