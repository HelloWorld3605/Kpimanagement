import React, { useEffect, useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { FormField, inputClass, inputErrorClass } from '../catalog/FormField';
import { Select } from '../ui/Select';
import { AssigneeSelect } from './AssigneeSelect';
import { MemberMultiSelect } from './MemberMultiSelect';
import { findMember } from '../../utils/org';
import { KpiTask, WorkItem } from '../../types/work';
import { UnitMember } from '../../types/org';
import { assignedQty } from '../../utils/workItems';
import { assigneeLabel, parseAssigneeKey, TODAY_ISO, TODAY_LABEL } from '../../utils/work';
import { displayDate } from '../../utils/profile';

type Row = {key: string;assignee: string;qty: string;deadline: string;collaboratorIds: string[];};

type AssignWorkDialogProps = {
  open: boolean;
  /** Công việc chọn sẵn; trống thì chọn trong danh sách */
  workId?: string;
  items: WorkItem[];
  tasks: KpiTask[];
  unitIds: string[];
  me?: UnitMember;
  onClose: () => void;
  onAssign: (item: WorkItem, list: KpiTask[]) => void;
};

const newRow = (deadline: string, qty = ''): Row => ({ key: Math.random().toString(36).slice(2, 8), assignee: '', qty, deadline, collaboratorIds: [] });

/** Bước 2 — Phân công: chia số lượng còn lại của một công việc cho một hoặc nhiều đơn vị / cán bộ */
export function AssignWorkDialog({ open, workId, items, tasks, unitIds, me, onClose, onAssign }: AssignWorkDialogProps) {
  const [itemId, setItemId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [tried, setTried] = useState(false);
  const item = items.find((w) => w.id === itemId);
  const remaining = item ? Math.max(0, item.qty - assignedQty(item, tasks)) : 0;

  useEffect(() => {
    if (!open) return;
    const w = items.find((x) => x.id === workId);
    setItemId(w?.id ?? '');
    setRows(w ? [newRow(w.deadline, String(Math.max(0, w.qty - assignedQty(w, tasks))))] : []);
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, workId]);

  const pick = (id: string) => {
    const w = items.find((x) => x.id === id);
    setItemId(id);
    setRows(w ? [newRow(w.deadline, String(Math.max(0, w.qty - assignedQty(w, tasks))))] : []);
    setTried(false);
  };

  const setRow = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => r.key === key ? { ...r, ...patch } : r));
  const total = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0);

  const rowErrors = rows.map((r, i) => {
    const e: Partial<Record<'assignee' | 'qty' | 'deadline', string>> = {};
    const q = Number(r.qty);
    if (!r.assignee) e.assignee = 'Chọn người / đơn vị';else
    if (rows.findIndex((x) => x.assignee === r.assignee) !== i) e.assignee = 'Đã chọn ở dòng trên';
    if (!Number.isInteger(q) || q < 1) e.qty = 'Từ 1 trở lên';
    if (!r.deadline) e.deadline = 'Chọn hạn';else
    if (item && r.deadline > item.deadline) e.deadline = `Không sau ${displayDate(item.deadline)}`;else
    if (r.deadline < TODAY_ISO) e.deadline = 'Hạn đã qua';
    return e;
  });
  const overTotal = total > remaining;
  const valid = Boolean(item) && rows.length > 0 && !overTotal && rowErrors.every((e) => !Object.keys(e).length);

  const submit = () => {
    setTried(true);
    if (!valid || !item || !me) return;
    const list: KpiTask[] = rows.map((r, i) => {
      const assignee = parseAssigneeKey(r.assignee)!;
      return {
        id: `k${Date.now()}${i}`,
        code: item.code,
        source: item.source,
        version: item.version,
        name: item.name,
        unit: item.unit,
        point: item.point,
        qty: Number(r.qty),
        approved: 0,
        deadline: r.deadline,
        periodId: item.periodId,
        assignee,
        collaboratorIds: r.collaboratorIds.filter((id) => !(assignee.kind === 'member' && assignee.memberId === id)),
        watcherIds: [],
        assignedById: me.id,
        basis: item.basis,
        fields: { ...item.fields },
        status: 'assigned',
        reminders: 0,
        workItemId: item.id,
        history: [{ at: TODAY_LABEL, by: me.name, text: `Phân công ${r.qty} ${item.unit} từ nhiệm vụ ${item.code} cho ${assigneeLabel(assignee).primary}` }]
      };
    });
    onAssign(item, list);
  };

  const openItems = items.filter((w) => w.status === 'open' && w.qty - assignedQty(w, tasks) > 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Phân công nhiệm vụ"
      description="Chia số lượng của nhiệm vụ đã tạo cho đơn vị chủ trì hoặc cán bộ thực hiện."
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-[13px] tabular-nums ${overTotal ? 'font-medium text-brand-600' : 'text-gray-600'}`} role={overTotal ? 'alert' : undefined}>
            {item ? overTotal ? `Vượt ${total - remaining} so với số còn lại (${remaining})` : `Phân công ${total}/${remaining} còn lại` : 'Chọn nhiệm vụ để phân công'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnGhost} style={btnTransition}>
              Huỷ
            </button>
            <button type="button" disabled={!item} onClick={submit} className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`} style={btnTransition}>
              Phân công
            </button>
          </div>
        </div>
      }>
      
      <div className="space-y-5 px-4 py-4">
        <FormField label="Nhiệm vụ" htmlFor="as-item" required>
          <Select id="as-item" value={itemId} onChange={pick} placeholder="Chọn nhiệm vụ chờ phân công" searchThreshold={8}>
            <option value="">Chọn nhiệm vụ chờ phân công</option>
            {openItems.map((w) =>
            <option key={w.id} value={w.id}>
                {w.code} · {w.name} — còn {w.qty - assignedQty(w, tasks)}/{w.qty}
              </option>
            )}
          </Select>
          {openItems.length === 0 && <p className="mt-1 text-xs text-gray-500">Không có nhiệm vụ nào chờ phân công. Tạo nhiệm vụ trước ở màn Tạo nhiệm vụ.</p>}
        </FormField>

        {item &&
        <>
            <dl className="grid grid-cols-2 gap-3 rounded-md bg-gray-50 px-3 py-2.5 text-[13px] sm:grid-cols-4">
              <div>
                <dt className="text-gray-500">Tổng số lượng</dt>
                <dd className="tabular-nums text-gray-900">
                  {item.qty} {item.unit}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Còn chưa phân công</dt>
                <dd className="font-semibold tabular-nums text-gray-900">{remaining}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Điểm / sản phẩm</dt>
                <dd className="tabular-nums text-gray-900">{item.point}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Hạn nhiệm vụ</dt>
                <dd className="tabular-nums text-gray-900">{displayDate(item.deadline)}</dd>
              </div>
            </dl>

            <div className="space-y-3">
              <div className="hidden grid-cols-[1fr_120px_170px_36px] gap-3 text-[13px] font-medium text-gray-600 sm:grid">
                <span>Chủ trì</span>
                <span>Số lượng</span>
                <span>Hạn</span>
                <span />
              </div>
              {rows.map((r, i) => {
              const e = tried ? rowErrors[i] : {};
              const lead = parseAssigneeKey(r.assignee);
              const leadId = lead?.kind === 'member' ? lead.memberId : undefined;
              const collabNames = r.collaboratorIds.map((id) => findMember(id)?.name).filter(Boolean);
              return (
                <div key={r.key} className={`space-y-2 ${rows.length > 1 ? 'rounded-md border border-gray-200 p-3' : ''}`}>
                  <div className="grid gap-3 sm:grid-cols-[1fr_120px_170px_36px] sm:items-start">
                    <div>
                      <AssigneeSelect
                        id={`as-a-${r.key}`}
                        value={r.assignee}
                        onChange={(v) => setRow(r.key, { assignee: v })}
                        unitIds={unitIds}
                        allowUnits
                        invalid={Boolean(e.assignee)}
                        placeholder="Chọn đơn vị hoặc cán bộ" />
                      
                      {e.assignee && <p className="mt-1 text-xs text-brand-600">{e.assignee}</p>}
                    </div>
                    <div>
                      <input
                        type="number"
                        min={1}
                        value={r.qty}
                        onChange={(ev) => setRow(r.key, { qty: ev.target.value })}
                        aria-label={`Số lượng dòng ${i + 1}`}
                        className={`${inputClass} tabular-nums ${e.qty ? inputErrorClass : ''}`} />
                      
                      {e.qty && <p className="mt-1 text-xs text-brand-600">{e.qty}</p>}
                    </div>
                    <div>
                      <input
                        type="date"
                        min={TODAY_ISO}
                        max={item.deadline}
                        value={r.deadline}
                        onChange={(ev) => setRow(r.key, { deadline: ev.target.value })}
                        aria-label={`Hạn dòng ${i + 1}`}
                        className={`${inputClass} ${e.deadline ? inputErrorClass : ''}`} />
                      
                      {e.deadline && <p className="mt-1 text-xs text-brand-600">{e.deadline}</p>}
                    </div>
                    <button
                      type="button"
                      disabled={rows.length === 1}
                      onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                      aria-label={`Xoá dòng ${i + 1}`}
                      className="flex h-10 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-brand-600 disabled:invisible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      style={btnTransition}>
                      
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="sm:pr-[48px]">
                    <label htmlFor={`as-c-${r.key}`} className="mb-1 block text-[13px] font-medium text-gray-600">
                      Phối hợp
                    </label>
                    <MemberMultiSelect
                      id={`as-c-${r.key}`}
                      value={r.collaboratorIds}
                      onChange={(ids) => setRow(r.key, { collaboratorIds: ids })}
                      unitIds={unitIds}
                      excludeIds={leadId ? [leadId] : []}
                      placeholder="Chọn một hoặc nhiều cán bộ phối hợp" />
                    
                    {collabNames.length > 0 &&
                    <p className="mt-1.5 text-[13px] text-gray-600">
                        <span className="text-gray-500">Cán bộ phối hợp: </span>
                        {collabNames.map((n, k) =>
                      <React.Fragment key={k}>
                            {k > 0 && ', '}
                            <span className="font-medium text-gray-900">[{n}]</span>
                          </React.Fragment>
                      )}
                      </p>
                    }
                  </div>
                  </div>);

            })}
              <button
              type="button"
              onClick={() => {
                const left = Math.max(0, remaining - total);
                setRows((rs) => [...rs, newRow(item.deadline, left ? String(left) : '')]);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-[14px] font-medium text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={btnTransition}>
              
                <PlusIcon className="h-4 w-4" aria-hidden />
                Thêm người chủ trì
              </button>
            </div>
            <p className="text-[13px] text-gray-500">Người theo dõi và thông tin khác chỉnh trong chi tiết từng lần phân công sau khi giao.</p>
          </>
        }
      </div>
    </Modal>);

}