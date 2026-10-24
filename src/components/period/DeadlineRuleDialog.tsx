import React, { useEffect, useMemo, useState } from 'react';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { FormField, inputClass, inputErrorClass } from '../catalog/FormField';
import { Select } from '../ui/Select';
import { DeadlineRule, DossierType, KpiPeriod, RuleStatus } from '../../types/work';
import { unitMembers } from '../../utils/org';
import { dossierLabels, nextRuleId, ruleStatusMeta, ruleTarget } from '../../utils/period';
import { displayDate } from '../../utils/profile';

type DeadlineRuleDialogProps = {
  open: boolean;
  period: KpiPeriod;
  editing?: DeadlineRule;
  onClose: () => void;
  onSave: (rule: DeadlineRule, basis: string) => void;
};

type Target = 'dossier' | 'member';

/**
 * Thêm / sửa hạn gửi tự đánh giá. Theo loại hồ sơ hoặc một đối tượng cụ thể.
 * Bắt buộc nhập căn cứ cho mỗi lần thay đổi; "Đã có căn cứ" thì phải có hạn.
 */
export function DeadlineRuleDialog({ open, period, editing, onClose, onSave }: DeadlineRuleDialogProps) {
  const [target, setTarget] = useState<Target>('dossier');
  const [dossier, setDossier] = useState<DossierType | ''>('');
  const [memberId, setMemberId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<RuleStatus>('needs-confirmation');
  const [basis, setBasis] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTarget(editing?.memberId ? 'member' : 'dossier');
    setDossier(editing?.dossier ?? '');
    setMemberId(editing?.memberId ?? '');
    setDeadline(editing?.deadline ?? '');
    setStatus(editing?.status ?? 'needs-confirmation');
    setBasis('');
    setTried(false);
  }, [open, editing]);

  const members = useMemo(() => unitMembers(period.unitId, period.includeChildren), [period.unitId, period.includeChildren]);
  const others = period.deadlineRules.filter((r) => r.id !== editing?.id);

  const errors: Partial<Record<'target' | 'deadline' | 'basis', string>> = {};
  if (target === 'dossier' && !dossier) errors.target = 'Chọn loại hồ sơ';
  if (target === 'member' && !memberId) errors.target = 'Chọn đối tượng';
  if (target === 'dossier' && dossier && others.some((r) => !r.memberId && r.dossier === dossier)) errors.target = 'Loại hồ sơ này đã có quy tắc — sửa quy tắc đang có.';
  if (target === 'member' && memberId && others.some((r) => r.memberId === memberId)) errors.target = 'Đối tượng này đã có quy tắc riêng.';
  if (status === 'confirmed' && !deadline) errors.deadline = 'Quy tắc "Đã có căn cứ" phải có hạn cụ thể';
  if (!basis.trim()) errors.basis = 'Nhập căn cứ: số văn bản, điều khoản hoặc ghi chú';

  const err = (k: keyof typeof errors) => tried ? errors[k] : undefined;
  const early = deadline && deadline < period.end;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length) return;
    onSave(
      {
        id: editing?.id ?? nextRuleId(),
        dossier: target === 'dossier' ? dossier as DossierType : undefined,
        memberId: target === 'member' ? memberId : undefined,
        deadline: deadline || null,
        status,
        basis: basis.trim()
      },
      basis.trim()
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? `Sửa hạn — ${ruleTarget(editing)}` : 'Thêm hạn gửi tự đánh giá'}
      description={period.name}
      onSubmit={submit}
      footer={
      <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost} style={btnTransition}>
            Huỷ
          </button>
          <button type="submit" className={btnPrimary} style={btnTransition}>
            Lưu và ghi lịch sử
          </button>
        </div>
      }>
      
      <div className="space-y-5 px-4 py-4">
        <FormField label="Áp dụng cho" required error={err('target')}>
          <div role="radiogroup" aria-label="Áp dụng cho" className="mb-2.5 flex gap-4 text-[14px] text-gray-700">
            {(['dossier', 'member'] as Target[]).map((t) =>
            <label key={t} className="flex items-center gap-2">
                <input type="radio" name="rule-target" checked={target === t} onChange={() => setTarget(t)} disabled={Boolean(editing)} className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500" />
                {t === 'dossier' ? 'Theo loại hồ sơ' : 'Theo đối tượng cụ thể'}
              </label>
            )}
          </div>
          {target === 'dossier' ?
          <Select value={dossier} onChange={(v) => setDossier(v as DossierType)} disabled={Boolean(editing)} invalid={Boolean(err('target'))} placeholder="Chọn loại hồ sơ" aria-label="Loại hồ sơ">
              {(Object.keys(dossierLabels) as DossierType[]).map((d) =>
            <option key={d} value={d}>
                  {dossierLabels[d]}
                </option>
            )}
            </Select> :

          <Select value={memberId} onChange={setMemberId} disabled={Boolean(editing)} invalid={Boolean(err('target'))} placeholder="Chọn cán bộ" aria-label="Đối tượng">
              {members.map((m) =>
            <option key={m.id} value={m.id}>
                  {m.name} · {m.code}
                </option>
            )}
            </Select>
          }
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Hạn gửi"
            htmlFor="rule-deadline"
            error={err('deadline')}
            hint={early ? `Hạn trước ngày kết thúc kiểm đếm (${displayDate(period.end)}) — kiểm tra lại căn cứ.` : 'Để trống nếu chưa có căn cứ đủ rõ.'}>
            
            <input id="rule-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={`${inputClass} ${err('deadline') ? inputErrorClass : ''}`} />
          </FormField>
          <FormField label="Trạng thái quy tắc" required>
            <div role="radiogroup" aria-label="Trạng thái quy tắc" className="space-y-1.5 pt-1 text-[14px] text-gray-700">
              {(['needs-confirmation', 'confirmed'] as RuleStatus[]).map((s) =>
              <label key={s} className="flex items-center gap-2">
                  <input type="radio" name="rule-status" checked={status === s} onChange={() => setStatus(s)} className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500" />
                  {ruleStatusMeta[s].label}
                </label>
              )}
            </div>
          </FormField>
        </div>

        <FormField label="Căn cứ thay đổi" htmlFor="rule-basis" required error={err('basis')} hint={editing ? `Căn cứ hiện tại: ${editing.basis || '—'}` : undefined}>
          <textarea
            id="rule-basis"
            rows={2}
            value={basis}
            onChange={(e) => setBasis(e.target.value)}
            placeholder="Ví dụ: Thông báo 1520/TB-BTL ngày 01/09/2026, mục 2"
            className={`${inputClass} h-auto py-2 ${err('basis') ? inputErrorClass : ''}`} />
          
        </FormField>

        <p className="text-[13px] text-gray-500">Hệ thống không tự điền hay tính hạn từ ngày kết thúc kiểm đếm. Người thực hiện, thời điểm, giá trị trước / sau và căn cứ được lưu vào lịch sử.</p>
      </div>
    </Modal>);

}