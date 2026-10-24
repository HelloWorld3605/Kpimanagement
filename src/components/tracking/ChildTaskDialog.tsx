import React, { useEffect, useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { Modal, btnGhost, btnPrimary, btnTransition } from '../ui/Modal';
import { inputClass } from '../catalog/FormField';
import { Select } from '../ui/Select';
import { KpiTask } from '../../types/work';
import { UnitMember } from '../../types/org';
import { TODAY_ISO } from '../../utils/work';

type ChildInput = {name: string;memberId: string;qty: number;deadline: string;};
type Row = {key: string;name: string;memberId: string;qty: string;deadline: string;};

type ChildTaskDialogProps = {
  parent: KpiTask | null;
  /** Mã sẽ cấp cho nhiệm vụ con đầu tiên (các dòng sau tăng dần) */
  nextCode: string;
  /** Số lượng của nhiệm vụ đang chọn còn chưa chia */
  available: number;
  members: UnitMember[];
  onClose: () => void;
  onCreate: (list: ChildInput[]) => void;
};

let seq = 0;
const newRow = (parent: KpiTask, qty: string): Row => ({ key: `r${++seq}`, name: parent.name, memberId: '', qty, deadline: parent.deadline });

/** Tạo một hoặc nhiều nhiệm vụ con từ bất kỳ nhiệm vụ nào (gốc hoặc con) */
export function ChildTaskDialog({ parent, nextCode, available, members, onClose, onCreate }: ChildTaskDialogProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!parent) return;
    setRows([newRow(parent, String(Math.max(1, Math.min(available, parent.qty))))]);
    setTried(false);
  }, [parent, available]);

  const setRow = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => r.key === key ? { ...r, ...patch } : r));
  const total = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0);
  const prefix = nextCode.slice(0, nextCode.lastIndexOf('.') + 1);
  const startN = Number(nextCode.slice(nextCode.lastIndexOf('.') + 1)) || 1;

  const rowErrors = rows.map((r) => {
    const q = Number(r.qty);
    return {
      name: !r.name.trim() ? 'Nhập tên' : undefined,
      memberId: !r.memberId ? 'Chọn cán bộ' : undefined,
      qty: !Number.isInteger(q) || q < 1 ? 'Từ 1 trở lên' : undefined,
      deadline: !r.deadline ? 'Chọn hạn' : parent && r.deadline > parent.deadline ? 'Sau hạn nhiệm vụ cha' : r.deadline < TODAY_ISO ? 'Hạn đã qua' : undefined
    };
  });
  const over = total > available;
  // Vượt số lượng còn chưa chia chỉ cảnh báo — luôn cho phép thêm nhiệm vụ con
  const valid = rows.length > 0 && rowErrors.every((e) => !Object.values(e).some(Boolean));
  const err = (msg?: string) => tried && msg ? <p className="mt-1 text-xs text-brand-600">{msg}</p> : null;

  return (
    <Modal
      open={Boolean(parent)}
      onClose={onClose}
      size="xl"
      title="Thêm nhiệm vụ con"
      description={parent ? `${parent.code} · ${parent.name}` : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (valid) onCreate(rows.map((r) => ({ name: r.name.trim(), memberId: r.memberId, qty: Number(r.qty), deadline: r.deadline })));
      }}
      footer={
      <div className="flex items-center justify-between gap-3">
          <p className={`text-[13px] tabular-nums ${over ? 'font-medium text-warning-700' : 'text-gray-600'}`}>
            Chia {total} / còn {Math.max(0, available)} {parent?.unit.toLowerCase()} chưa chia
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnGhost} style={btnTransition}>
              Huỷ
            </button>
            <button type="submit" className={btnPrimary} style={btnTransition}>
              {rows.length > 1 ? `Tạo ${rows.length} nhiệm vụ con` : 'Tạo nhiệm vụ con'}
            </button>
          </div>
        </div>
      }>
      
      <div className="space-y-4 px-4 py-4">
        {!parent ? null :
        <>
            <p className="text-[13px] text-gray-600">
              Tạo nhiệm vụ con từ bất kỳ nhiệm vụ nào — kể cả nhiệm vụ con — và chia cho nhiều cán bộ cùng lúc. Nhiệm vụ con giữ điểm mỗi sản phẩm ({parent.point}) và kỳ KPI của nhiệm vụ cha.
            </p>
            <div className="hidden grid-cols-[84px_minmax(0,1fr)_200px_96px_150px_36px] gap-3 text-[13px] font-medium text-gray-600 md:grid">
              <span>Mã</span>
              <span>Tên nhiệm vụ con</span>
              <span>Cán bộ thực hiện</span>
              <span>Số lượng</span>
              <span>Hạn</span>
              <span />
            </div>
            {rows.map((r, i) => {
            const e = rowErrors[i];
            const taken = new Set(rows.filter((x) => x.key !== r.key).map((x) => x.memberId));
            return (
              <div key={r.key} className="grid gap-3 border-b border-gray-100 pb-3 md:grid-cols-[84px_minmax(0,1fr)_200px_96px_150px_36px] md:items-start md:border-0 md:pb-0">
                  <span className="pt-2.5 text-[13px] font-medium tabular-nums text-gray-700">
                    {prefix}
                    {startN + i}
                  </span>
                  <div>
                    <input aria-label={`Tên nhiệm vụ con dòng ${i + 1}`} value={r.name} onChange={(ev) => setRow(r.key, { name: ev.target.value })} className={inputClass} />
                    {err(e.name)}
                  </div>
                  <div>
                    <Select aria-label={`Cán bộ dòng ${i + 1}`} value={r.memberId} onChange={(v) => setRow(r.key, { memberId: v })} invalid={tried && Boolean(e.memberId)} placeholder="Chọn cán bộ">
                      <option value="">Chọn cán bộ</option>
                      {members.
                    filter((m) => !taken.has(m.id)).
                    map((m) =>
                    <option key={m.id} value={m.id}>
                            {m.name} — {m.position}
                          </option>
                    )}
                    </Select>
                    {err(e.memberId)}
                  </div>
                  <div>
                    <input
                    aria-label={`Số lượng dòng ${i + 1}`}
                    type="number"
                    min={1}
                    value={r.qty}
                    onChange={(ev) => setRow(r.key, { qty: ev.target.value })}
                    className={`${inputClass} tabular-nums`} />
                  
                    {err(e.qty)}
                  </div>
                  <div>
                    <input
                    aria-label={`Hạn dòng ${i + 1}`}
                    type="date"
                    min={TODAY_ISO}
                    max={parent.deadline}
                    value={r.deadline}
                    onChange={(ev) => setRow(r.key, { deadline: ev.target.value })}
                    className={inputClass} />
                  
                    {err(e.deadline)}
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
                </div>);

          })}
            {over &&
          <p className="text-[13px] font-medium text-warning-700" role="status">
                {available > 0 ? `Tổng số lượng vượt ${available} còn chưa chia.` : 'Nhiệm vụ này đã chia hết số lượng.'} Vẫn có thể tạo thêm nhiệm vụ con; số lượng nhiệm vụ cha không thay đổi.
              </p>
          }
            <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow(parent, String(Math.max(1, available - total)))])}
            className="inline-flex items-center gap-1.5 rounded text-[14px] font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            
              <PlusIcon className="h-4 w-4" aria-hidden />
              Thêm nhiệm vụ con
            </button>
          </>
        }
      </div>
    </Modal>);

}