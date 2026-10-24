import React, { useState } from 'react';
import { CheckIcon, Undo2Icon } from 'lucide-react';
import { SideDrawer } from '../ui/SideDrawer';
import { StatusPill } from '../catalog/StatusPill';
import { ReasonDialog } from '../period/ReasonDialog';
import { btnSecondary, btnTransition } from '../ui/Modal';
import { KpiTask, TaskProduct } from '../../types/work';
import { productCounts } from '../../utils/myTasks';
import { assigneeLabel, isOverdue, kpiStatusMeta } from '../../utils/work';
import { displayDate } from '../../utils/profile';

type ProductReviewDrawerProps = {
  task: KpiTask | null;
  onClose: () => void;
  onApprove: (task: KpiTask, ids: string[]) => void;
  onReturn: (task: KpiTask, id: string, reason: string) => void;
};

const statusTone = { pending: 'warning', approved: 'success', returned: 'brand' } as const;
const statusLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', returned: 'Bị trả lại' };

/** Lãnh đạo duyệt / trả lại sản phẩm của một nhiệm vụ, xem nhật ký */
export function ProductReviewDrawer({ task, onClose, onApprove, onReturn }: ProductReviewDrawerProps) {
  const [returning, setReturning] = useState<TaskProduct | null>(null);
  if (!task) return <SideDrawer open={false} onClose={onClose} header={null} labelledBy="pr-title">{null}</SideDrawer>;

  const c = productCounts(task);
  const products = [...(task.products ?? [])].sort((a, b) => (a.status === 'pending' ? -1 : 0) - (b.status === 'pending' ? -1 : 0) || b.doneAt.localeCompare(a.doneAt));
  const pendingIds = products.filter((p) => p.status === 'pending').map((p) => p.id);
  const who = assigneeLabel(task.assignee);
  const meta = kpiStatusMeta[task.status];

  return (
    <SideDrawer
      open
      onClose={onClose}
      contentKey={task.id}
      labelledBy="pr-title"
      widthClassName="max-w-[620px]"
      header={
      <div>
          <p className="text-[12px] text-gray-500">
            {task.code} · {who.primary}
          </p>
          <h2 id="pr-title" className="mt-0.5 text-[16px] font-semibold leading-6 text-gray-900">
            {task.name}
          </h2>
        </div>
      }
      footer={
      <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] tabular-nums text-gray-600">
            {c.approved}/{task.qty} đã duyệt · {c.pending} chờ duyệt
          </p>
          <button
          type="button"
          disabled={!pendingIds.length}
          onClick={() => onApprove(task, pendingIds)}
          className={`${btnSecondary} disabled:cursor-not-allowed disabled:opacity-50`}
          style={btnTransition}>
          
            <CheckIcon className="h-4 w-4" aria-hidden />
            Duyệt tất cả ({pendingIds.length})
          </button>
        </div>
      }>
      
      <div className="space-y-6 px-5 py-5">
        <dl className="grid grid-cols-3 gap-4 text-[14px]">
          <div>
            <dt className="text-[12px] text-gray-500">Trạng thái</dt>
            <dd className="mt-0.5">
              <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-gray-500">Hạn</dt>
            <dd className={`mt-0.5 tabular-nums ${isOverdue(task) ? 'font-semibold text-brand-600' : 'text-gray-900'}`}>{displayDate(task.deadline)}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-gray-500">Nhắc hạn</dt>
            <dd className="mt-0.5 tabular-nums text-gray-900">{task.reminders} lần</dd>
          </div>
        </dl>

        <section aria-labelledby="pr-products" className="space-y-2">
          <h3 id="pr-products" className="text-[14px] font-semibold text-gray-900">
            Sản phẩm báo cáo
          </h3>
          {products.length === 0 ?
          <p className="text-[13px] text-gray-500">Cán bộ chưa báo cáo sản phẩm nào.</p> :

          <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
              {products.map((p) =>
            <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-3 py-2.5 text-[14px]">
                  <div className="min-w-0">
                    <p className="text-gray-900">{p.name}</p>
                    <p className="text-[12px] text-gray-500">
                      {displayDate(p.doneAt)}
                      {p.note && ` · ${p.note}`}
                    </p>
                    {p.reason && <p className="mt-0.5 text-[12px] text-brand-600">Lý do trả lại: {p.reason}</p>}
                  </div>
                  {p.status === 'pending' ?
              <div className="flex gap-1">
                      <button
                  type="button"
                  onClick={() => setReturning(p)}
                  className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  style={btnTransition}>
                  
                        <Undo2Icon className="h-3.5 w-3.5" aria-hidden />
                        Trả lại
                      </button>
                      <button
                  type="button"
                  onClick={() => onApprove(task, [p.id])}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-brand-600 px-2.5 text-[13px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  style={btnTransition}>
                  
                        <CheckIcon className="h-3.5 w-3.5" aria-hidden />
                        Duyệt
                      </button>
                    </div> :

              <StatusPill tone={statusTone[p.status]}>{statusLabel[p.status]}</StatusPill>
              }
                </li>
            )}
            </ul>
          }
        </section>

        <section aria-labelledby="pr-log" className="space-y-2">
          <h3 id="pr-log" className="text-[14px] font-semibold text-gray-900">
            Nhật ký nhiệm vụ
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
      </div>

      <ReasonDialog
        open={Boolean(returning)}
        title="Trả lại sản phẩm"
        description={returning?.name}
        reasonLabel="Lý do trả lại"
        confirmLabel="Trả lại"
        onClose={() => setReturning(null)}
        onConfirm={(reason) => {
          if (returning) onReturn(task, returning.id, reason);
          setReturning(null);
        }} />
      
    </SideDrawer>);

}