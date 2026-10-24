import React, { useEffect, useState } from 'react';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { FormField, inputClass, inputErrorClass } from '../catalog/FormField';
import { Select } from '../ui/Select';

type ReasonDialogProps = {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  /** Nhãn ô lý do: "Lý do", "Căn cứ"… */
  reasonLabel?: string;
  reasonRequired?: boolean;
  /** Bắt buộc chọn người duyệt (mở lại kỳ, điều chỉnh có thẩm quyền) */
  approvers?: {id: string;name: string;}[];
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (reason: string, approverId?: string) => void;
};

/** Xác nhận một thao tác có ghi nhật ký: lý do / căn cứ và (tuỳ thao tác) người duyệt */
export function ReasonDialog({ open, title, description, reasonLabel = 'Lý do', reasonRequired = true, approvers, confirmLabel, onClose, onConfirm }: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [approver, setApprover] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setApprover('');
      setTried(false);
    }
  }, [open]);

  const reasonError = reasonRequired && !reason.trim() ? `Nhập ${reasonLabel.toLowerCase()}` : undefined;
  const approverError = approvers && !approver ? 'Chọn người duyệt' : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (reasonError || approverError) return;
    onConfirm(reason.trim(), approver || undefined);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      onSubmit={submit}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost} style={btnTransition}>
            Huỷ
          </button>
          <button type="submit" className={btnPrimary} style={btnTransition}>
            {confirmLabel}
          </button>
        </div>
      }>
      
      <div className="space-y-4 px-4 py-4">
        <FormField label={reasonLabel} htmlFor="reason-text" required={reasonRequired} error={tried ? reasonError : undefined}>
          <textarea
            id="reason-text"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`${inputClass} h-auto py-2 ${tried && reasonError ? inputErrorClass : ''}`} />
          
        </FormField>
        {approvers &&
        <FormField label="Người duyệt" required error={tried ? approverError : undefined}>
            <Select value={approver} onChange={setApprover} invalid={tried && Boolean(approverError)} placeholder="Chọn người duyệt" aria-label="Người duyệt">
              {approvers.map((a) =>
            <option key={a.id} value={a.id}>
                  {a.name}
                </option>
            )}
            </Select>
          </FormField>
        }
      </div>
    </Modal>);

}