import React from 'react';
import { AlertTriangleIcon, EraserIcon, RotateCcwIcon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, btnGhost, btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { useAccess } from '../../contexts/AccessContext';
import { useOrgEditor } from './useOrgEditor';
import { OrgEditorRow } from './OrgEditorRow';
import { OrgBulkPanel } from './OrgBulkPanel';

type OrgEditorDialogProps = {
  open: boolean;
  onClose: () => void;
};

const th = 'sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-2 py-2 text-left text-[12px] font-semibold text-gray-600';

/** Sửa toàn bộ cơ cấu trên một bảng: gõ, thụt lề, kéo lên xuống, dán hàng loạt — chỉ ghi khi bấm Lưu */
export function OrgEditorDialog({ open, onClose }: OrgEditorDialogProps) {
  const { units, members, replaceUnits } = useAccess();
  const ed = useOrgEditor(open, units, members);
  const { summary, issues } = ed;

  const close = () => {
    if (ed.dirty && !window.confirm('Bỏ các thay đổi cơ cấu chưa lưu?')) return;
    onClose();
  };

  const save = () => {
    if (ed.errorCount) {
      toast.error('Còn lỗi trong cơ cấu — sửa các dòng được đánh dấu trước khi lưu');
      return;
    }
    replaceUnits(ed.build());
    const parts = [summary.added && `thêm ${summary.added}`, summary.edited && `sửa ${summary.edited}`, summary.removed && `xoá ${summary.removed}`].filter(Boolean);
    toast.success(`Đã lưu cơ cấu tổ chức${parts.length ? ` · ${parts.join(' · ')} đơn vị` : ''}`);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      ed.undo();
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="full"
      title="Chỉnh sửa cơ cấu tổ chức"
      description="Sửa trực tiếp trên bảng. Enter thêm đơn vị cùng cấp · Shift+Enter thêm trực thuộc · Tab / Shift+Tab đổi cấp · Alt+↑↓ đổi thứ tự · Ctrl+Z hoàn tác"
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 text-[13px]">
            {ed.errorCount > 0 ?
          <p className="flex items-center gap-1.5 font-medium text-brand-600" role="alert">
                <AlertTriangleIcon className="h-4 w-4 shrink-0" aria-hidden />
                Còn {ed.errorCount} lỗi cần sửa trước khi lưu
              </p> :
          ed.dirty ?
          <p className="tabular-nums text-gray-600">
                <span className="text-success-700">+{summary.added} mới</span> · <span className="text-warning-700">{summary.edited} sửa/chuyển</span> ·{' '}
                <span className="text-brand-600">{summary.removed} xoá</span>
              </p> :

          <p className="text-gray-500">Chưa có thay đổi</p>
          }
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={close} className={btnSecondary} style={btnTransition}>
              Huỷ
            </button>
            <button type="button" onClick={save} disabled={!ed.dirty} className={btnPrimary} style={btnTransition}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      }>
      
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_360px]" onKeyDown={onKeyDown}>
        <section aria-label="Cây đơn vị" className="flex min-h-0 flex-col lg:border-r lg:border-gray-200">
          <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 px-3 py-2">
            <button type="button" onClick={ed.undo} disabled={!ed.canUndo} className={`${btnGhost} h-8 px-2.5 text-[13px] disabled:opacity-40`} style={btnTransition}>
              <Undo2Icon className="h-4 w-4" aria-hidden />
              Hoàn tác
            </button>
            <button type="button" onClick={ed.actions.reset} disabled={!ed.dirty} className={`${btnGhost} h-8 px-2.5 text-[13px] disabled:opacity-40`} style={btnTransition}>
              <RotateCcwIcon className="h-4 w-4" aria-hidden />
              Về bản đang lưu
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Xoá toàn bộ đơn vị, chỉ giữ đơn vị gốc? Có thể hoàn tác trước khi lưu.')) ed.actions.clearAll();
              }}
              disabled={ed.rows.length <= 1}
              className={`${btnGhost} h-8 px-2.5 text-[13px] hover:text-brand-700 disabled:opacity-40`}
              style={btnTransition}>
              
              <EraserIcon className="h-4 w-4" aria-hidden />
              Làm lại từ đầu
            </button>
            <span className="ml-auto text-[12px] tabular-nums text-gray-500">{ed.rows.length} đơn vị</span>
          </div>

          {issues.removedWithStaff.length > 0 &&
          <div className="border-b border-brand-100 bg-brand-50 px-4 py-2 text-[13px] text-brand-700" role="alert">
              <p className="font-medium">Không xoá được đơn vị còn cán bộ — chuyển cán bộ sang đơn vị khác trước, hoặc bấm Hoàn tác:</p>
              <p className="mt-0.5">{issues.removedWithStaff.map((x) => `${x.unit.name} (${x.count})`).join(' · ')}</p>
            </div>
          }

          <div className="min-h-[320px] flex-1 overflow-auto lg:min-h-0">
            <table className="w-full min-w-[860px] text-[14px]">
              <thead>
                <tr>
                  <th scope="col" className={`${th} w-16`}>STT</th>
                  <th scope="col" className={th}>Tên đơn vị</th>
                  <th scope="col" className={`${th} w-36`}>Tên viết tắt</th>
                  <th scope="col" className={`${th} w-36`}>Cấp</th>
                  <th scope="col" className={`${th} w-16 text-right`}>Cán bộ</th>
                  <th scope="col" className={`${th} w-24`}>
                    <span className="sr-only">Thay đổi</span>
                  </th>
                  <th scope="col" className={`${th} w-[200px]`}>
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ed.rows.map((r, i) =>
                <OrgEditorRow
                  key={r.key}
                  row={r}
                  number={ed.numbers[i]}
                  change={ed.changes[i]}
                  error={issues.rows[r.key]}
                  staff={r.id ? ed.directCount.get(r.id) ?? 0 : 0}
                  active={ed.activeKey === r.key}
                  autoFocus={ed.focusKey === r.key}
                  onFocused={ed.clearFocus}
                  onActivate={() => ed.setActiveKey(r.key)}
                  onEdit={(patch) => ed.actions.edit(r.key, patch)}
                  onSnapshot={ed.actions.snapshot}
                  onIndent={() => ed.actions.indent(r.key)}
                  onOutdent={() => ed.actions.outdent(r.key)}
                  onMoveUp={() => ed.actions.moveUp(r.key)}
                  onMoveDown={() => ed.actions.moveDown(r.key)}
                  onAddSibling={() => ed.actions.add(r.key, false)}
                  onAddChild={() => ed.actions.add(r.key, true)}
                  onRemove={() => ed.actions.remove(r.key)} />

                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside aria-label="Nhập hàng loạt" className="flex min-h-0 flex-col border-t border-gray-200 lg:border-t-0">
          <OrgBulkPanel rows={ed.rows} numbers={ed.numbers} activeKey={ed.activeKey} onApply={ed.actions.applyParsed} />
        </aside>
      </div>
    </Modal>);

}