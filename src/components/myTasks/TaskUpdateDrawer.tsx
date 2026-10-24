import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, PlusIcon, Trash2Icon, Undo2Icon } from 'lucide-react';
import { SideDrawer } from '../ui/SideDrawer';
import { StatusPill } from '../catalog/StatusPill';
import { FormField, inputClass } from '../catalog/FormField';
import { btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { KpiTask, TaskProduct } from '../../types/work';
import { isFuture, isLead, newProduct, productCounts } from '../../utils/myTasks';
import { TODAY_ISO, isOverdue, kpiStatusMeta, memberName } from '../../utils/work';
import { displayDate } from '../../utils/profile';

type TaskUpdateDrawerProps = {
  task: KpiTask | null;
  memberId?: string;
  suggestions: string[];
  onClose: () => void;
  onAdd: (task: KpiTask, product: TaskProduct) => void;
  onRemove: (task: KpiTask, productId: string) => void;
  onReport: (task: KpiTask) => void;
};

const groups: {status: TaskProduct['status'];label: string;tone: 'warning' | 'success' | 'brand';}[] = [
{ status: 'returned', label: 'Bị trả lại', tone: 'brand' },
{ status: 'pending', label: 'Chờ duyệt', tone: 'warning' },
{ status: 'approved', label: 'Đã duyệt', tone: 'success' }];


/** "Cập nhật thông tin nhiệm vụ": báo cáo sản phẩm, theo dõi duyệt, báo cáo hoàn thành */
export function TaskUpdateDrawer({ task, memberId, suggestions, onClose, onAdd, onRemove, onReport }: TaskUpdateDrawerProps) {
  const [name, setName] = useState('');
  const [doneAt, setDoneAt] = useState(TODAY_ISO);
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setName('');
    setDoneAt(TODAY_ISO);
    setNote('');
    setTried(false);
  }, [task?.id]);

  if (!task) return <SideDrawer open={false} onClose={onClose} header={null} labelledBy="task-update-title">{null}</SideDrawer>;

  const c = productCounts(task);
  const lead = isLead(task, memberId);
  const locked = task.status === 'reported' || task.status === 'revoked';
  const full = c.remaining === 0;
  const pct = task.qty ? Math.round(c.approved / task.qty * 100) : 0;
  const meta = kpiStatusMeta[task.status];
  const errors = {
    name: !name.trim() ? 'Nhập tên sản phẩm' : undefined,
    doneAt: !doneAt ? 'Chọn ngày hoàn thành' : isFuture(doneAt) ? 'Ngày hoàn thành không được sau hôm nay' : undefined
  };

  const add = () => {
    setTried(true);
    if (errors.name || errors.doneAt || full) return;
    onAdd(task, newProduct({ name: name.trim(), doneAt, note: note.trim(), source: 'form' }));
    setName('');
    setNote('');
    setTried(false);
  };

  return (
    <SideDrawer
      open
      onClose={onClose}
      contentKey={task.id}
      labelledBy="task-update-title"
      widthClassName="max-w-[600px]"
      header={
      <div>
          <p className="text-[12px] text-gray-500">{task.code} · Cập nhật thông tin nhiệm vụ</p>
          <h2 id="task-update-title" className="mt-0.5 text-[16px] font-semibold leading-6 text-gray-900">
            {task.name}
          </h2>
        </div>
      }
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-gray-500">
            {locked ? 'Việc đã báo cáo — chỉ xem.' : lead ? 'Báo cáo hoàn thành khi đã đủ số lượng giao.' : 'Bạn là người phối hợp — người chủ trì báo cáo hoàn thành.'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnSecondary} style={btnTransition}>
              Đóng
            </button>
            {lead && !locked &&
          <button type="button" disabled={!full} onClick={() => onReport(task)} className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`} style={btnTransition}>
                <CheckCircle2Icon className="h-4 w-4" aria-hidden />
                Báo cáo hoàn thành
              </button>
          }
          </div>
        </div>
      }>
      
      <div className="space-y-6 px-5 py-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
          <div>
            <dt className="text-[12px] text-gray-500">Trạng thái</dt>
            <dd className="mt-0.5">
              <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-gray-500">Hạn hoàn thành</dt>
            <dd className={`mt-0.5 tabular-nums ${isOverdue(task) ? 'font-semibold text-brand-600' : 'text-gray-900'}`}>
              {displayDate(task.deadline)}
              {isOverdue(task) && ' · quá hạn'}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-gray-500">Sản phẩm · điểm mỗi sản phẩm</dt>
            <dd className="mt-0.5 text-gray-900">
              {task.unit} · <span className="tabular-nums">{task.point}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-gray-500">Người giao</dt>
            <dd className="mt-0.5 text-gray-900">{memberName(task.assignedById)}</dd>
          </div>
        </dl>

        <div>
          <div className="flex items-baseline justify-between text-[14px]">
            <span className="font-medium text-gray-900">Tiến độ</span>
            <span className="tabular-nums text-gray-600">
              <span className="font-semibold text-gray-900">{c.approved}</span> đã duyệt · {c.pending} chờ duyệt · giao {task.qty}
            </span>
          </div>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tỷ lệ sản phẩm đã duyệt">
            <div className="bg-success-600" style={{ width: `${c.approved / Math.max(1, task.qty) * 100}%` }} />
            <div className="bg-warning-600" style={{ width: `${c.pending / Math.max(1, task.qty) * 100}%` }} />
          </div>
        </div>

        {!locked &&
        <section aria-labelledby="add-product" className="space-y-3 border-t border-gray-200 pt-5">
            <h3 id="add-product" className="text-[14px] font-semibold text-gray-900">
              Thêm sản phẩm
            </h3>
            {full ?
          <p className="text-[13px] text-gray-600">Đã đủ số lượng giao ({task.qty}). Muốn báo thêm cần lãnh đạo giao lại số lượng.</p> :

          <>
                <FormField label="Tên sản phẩm" htmlFor="sp-name" required error={tried ? errors.name : undefined} hint="Gõ để chọn lại tên đã dùng.">
                  <input id="sp-name" list="sp-suggestions" value={name} onChange={(e) => setName(e.target.value)} placeholder={`VD: ${task.unit} số …`} className={inputClass} />
                  <datalist id="sp-suggestions">
                    {suggestions.map((s) =>
                <option key={s} value={s} />
                )}
                  </datalist>
                </FormField>
                <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                  <FormField label="Ngày hoàn thành" htmlFor="sp-date" required error={tried ? errors.doneAt : undefined}>
                    <input id="sp-date" type="date" max={TODAY_ISO} value={doneAt} onChange={(e) => setDoneAt(e.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Ghi chú / số văn bản" htmlFor="sp-note">
                    <input id="sp-note" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
                  </FormField>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={add} className={btnSecondary} style={btnTransition}>
                    <PlusIcon className="h-4 w-4" aria-hidden />
                    Thêm sản phẩm
                  </button>
                </div>
              </>
          }
          </section>
        }

        <section aria-labelledby="product-list" className="space-y-4 border-t border-gray-200 pt-5">
          <h3 id="product-list" className="text-[14px] font-semibold text-gray-900">
            Sản phẩm đã báo cáo
          </h3>
          {(task.products ?? []).length === 0 && <p className="text-[13px] text-gray-500">Chưa có sản phẩm nào.</p>}
          {groups.map((g) => {
            const list = (task.products ?? []).filter((p) => p.status === g.status);
            if (!list.length) return null;
            return (
              <div key={g.status}>
                <p className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-gray-700">
                  <StatusPill tone={g.tone}>{g.label}</StatusPill>
                  <span className="tabular-nums text-gray-500">{list.length}</span>
                </p>
                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                  {list.map((p) =>
                  <li key={p.id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-[14px]">
                      <div className="min-w-0">
                        <p className="text-gray-900">{p.name}</p>
                        <p className="text-[12px] text-gray-500">
                          {displayDate(p.doneAt)}
                          {p.note && ` · ${p.note}`}
                          {p.source === 'import' && ' · nạp từ Excel'}
                        </p>
                        {p.reason &&
                      <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-brand-600">
                            <Undo2Icon className="h-3 w-3" aria-hidden />
                            {p.reason}
                          </p>
                      }
                      </div>
                      {!locked && p.status !== 'approved' &&
                    <button
                      type="button"
                      onClick={() => onRemove(task, p.id)}
                      aria-label={`Xoá ${p.name}`}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      style={{ transition: 'background-color 120ms ease-out, color 120ms ease-out' }}>
                      
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                    }
                    </li>
                  )}
                </ul>
              </div>);

          })}
        </section>

        {task.history.length > 0 &&
        <section aria-labelledby="task-log" className="space-y-2 border-t border-gray-200 pt-5">
            <h3 id="task-log" className="text-[14px] font-semibold text-gray-900">
              Nhật ký
            </h3>
            <ol className="space-y-1.5 text-[13px]">
              {[...task.history].reverse().map((h, i) =>
            <li key={i} className="flex gap-3">
                  <span className="w-20 shrink-0 tabular-nums text-gray-500">{h.at}</span>
                  <span className="text-gray-800">
                    {h.text} <span className="text-gray-500">· {h.by}</span>
                  </span>
                </li>
            )}
            </ol>
          </section>
        }
      </div>
    </SideDrawer>);

}