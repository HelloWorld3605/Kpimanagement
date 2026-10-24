import React, { useEffect, useState } from 'react';
import { ArrowRightLeftIcon, CalendarPlusIcon, CalendarXIcon, PencilIcon, TriangleAlertIcon, UndoIcon } from 'lucide-react';
import { KpiPeriod, KpiTask } from '../../types/work';
import { TaskCatalog } from '../../types/catalog';
import { SideDrawer } from '../ui/SideDrawer';
import { StatusPill } from '../catalog/StatusPill';
import { GroupBadge } from '../catalog/GroupBadge';
import { AssigneeCell } from './AssigneeCell';
import { displayDate } from '../../utils/profile';
import { editBlockReason, fmtNumber, isOverdue, kpiStatusMeta, memberName, moveBlockReason, periodRange, taskM } from '../../utils/work';

type KpiTaskDrawerProps = {
  task?: KpiTask;
  periods: KpiPeriod[];
  catalogs: TaskCatalog[];
  canWrite: boolean;
  onClose: () => void;
  onEdit: (t: KpiTask) => void;
  onMove: (t: KpiTask) => void;
  onUnassign: (t: KpiTask) => void;
  onRevoke: (t: KpiTask) => void;
};

export function KpiTaskDrawer({ task, periods, catalogs, canWrite, onClose, onEdit, onMove, onUnassign, onRevoke }: KpiTaskDrawerProps) {
  return (
    <SideDrawer
      open={Boolean(task)}
      onClose={onClose}
      contentKey={task?.id}
      labelledBy="kpi-task-title"
      header={task && <DrawerHeader task={task} />}
      footer={
      task &&
      canWrite && <DrawerActions task={task} period={periods.find((p) => p.id === task.periodId)} onEdit={onEdit} onMove={onMove} onUnassign={onUnassign} onRevoke={onRevoke} />
      }>
      
      {task && <DrawerBody task={task} periods={periods} catalogs={catalogs} />}
    </SideDrawer>);

}

function DrawerHeader({ task }: {task: KpiTask;}) {
  const status = kpiStatusMeta[task.status];
  return (
    <>
      <p className="text-[13px] font-medium tabular-nums text-gray-500">
        {task.code}
        {task.source === 'catalog' ? ` · phiên bản v${task.version}` : ' · việc phát sinh'}
      </p>
      <h2 id="kpi-task-title" className="mt-0.5 text-lg font-semibold leading-snug text-gray-900">
        {task.name}
      </h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
        {task.source === 'adhoc' && <StatusPill tone="warning">Ngoại lệ · xem xét khi đánh giá</StatusPill>}
        {isOverdue(task) && <StatusPill tone="brand">Quá hạn</StatusPill>}
      </div>
    </>);

}

function DrawerBody({ task, periods, catalogs }: {task: KpiTask;periods: KpiPeriod[];catalogs: TaskCatalog[];}) {
  const period = periods.find((p) => p.id === task.periodId);
  const version = task.source === 'catalog' ? catalogs.find((c) => c.code === task.code)?.versions.find((v) => v.version === task.version) : undefined;
  const fields = version?.fields ?? [];

  return (
    <div className="divide-y divide-gray-200">
      <Section title="Giao việc">
        <div className="mb-4 grid grid-cols-3 gap-3 rounded-md bg-gray-50 px-4 py-3">
          <Stat label="Hoàn thành / Giao" value={`${task.approved}/${task.qty}`} />
          <Stat label="Điểm / sản phẩm" value={String(task.point)} extra={<GroupBadge score={task.point} />} />
          <Stat label="Tổng điểm giao M" value={fmtNumber(taskM(task))} strong />
        </div>
        <Row label="Chủ trì">
          <AssigneeCell assignee={task.assignee} />
        </Row>
        {task.collaboratorIds && task.collaboratorIds.length > 0 && <Row label="Phối hợp">{task.collaboratorIds.map(memberName).join(', ')}</Row>}
        {task.watcherIds && task.watcherIds.length > 0 && <Row label="Theo dõi">{task.watcherIds.map(memberName).join(', ')}</Row>}
        <Row label="Người giao">{memberName(task.assignedById)}</Row>
        <Row label="Kỳ">{period ? `${period.name} (${periodRange(period)})` : <span className="text-gray-500">Chưa gán kỳ</span>}</Row>
        <Row label="Hạn">
          <span className={isOverdue(task) ? 'font-medium text-brand-600' : ''}>{displayDate(task.deadline)}</span>
          {task.reminders > 0 && <span className="ml-2 text-[13px] text-gray-500">· đã nhắc {task.reminders} lần</span>}
        </Row>
        <Row label="Đơn vị tính">{task.unit}</Row>
      </Section>

      <Section title="Nguồn">
        {task.source === 'catalog' ?
        <>
            <Row label="Danh mục">
              {task.code} · v{task.version}
            </Row>
            <p className="mt-1 text-[13px] text-gray-500">Giữ nguyên phiên bản lúc giao, kể cả khi danh mục ra phiên bản mới.</p>
          </> :

        <Row label="Căn cứ giao">{task.basis}</Row>
        }
      </Section>

      {fields.length > 0 &&
      <Section title="Thông tin khác">
          {fields.map((f) =>
        <Row key={f.id} label={f.name}>
              {task.fields[f.code] ?
          <>
                  {f.type === 'date' ? displayDate(task.fields[f.code]) : task.fields[f.code]}
                  {f.unit && ` ${f.unit}`}
                </> :

          <span className="text-gray-400">Chưa nhập</span>
          }
            </Row>
        )}
        </Section>
      }

      <Section title="Lịch sử">
        <ol className="relative space-y-3 border-l border-gray-200 pl-4">
          {[...task.history].reverse().map((h, i) =>
          <li key={i} className="relative text-[14px]">
              <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${i === 0 ? 'bg-brand-600' : 'bg-gray-300'}`} aria-hidden />
              <p className="text-gray-900">{h.text}</p>
              <p className="text-xs text-gray-500">
                {h.at} · {h.by}
              </p>
            </li>
          )}
        </ol>
      </Section>
    </div>);

}

type ActionsProps = Pick<KpiTaskDrawerProps, 'onEdit' | 'onMove' | 'onUnassign' | 'onRevoke'> & {task: KpiTask;period?: KpiPeriod;};

function DrawerActions({ task, period, onEdit, onMove, onUnassign, onRevoke }: ActionsProps) {
  const editReason = editBlockReason(task, period);
  const moveReason = moveBlockReason(task, period);
  const revokable = task.status !== 'reported' && task.status !== 'revoked';
  const btn =
  'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50';
  const style = { transition: 'background-color 150ms ease-out' };

  // Thu hồi chạy ngay — thông báo ở góc màn hình có nút Hoàn tác thay cho hộp xác nhận
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={Boolean(editReason)} onClick={() => onEdit(task)} className={btn} style={style}>
          <PencilIcon className="h-4 w-4" aria-hidden />
          Sửa
        </button>
        <button type="button" disabled={Boolean(moveReason)} onClick={() => onMove(task)} className={btn} style={style}>
          {task.periodId ? <ArrowRightLeftIcon className="h-4 w-4" aria-hidden /> : <CalendarPlusIcon className="h-4 w-4" aria-hidden />}
          {task.periodId ? 'Chuyển kỳ' : 'Gán vào kỳ'}
        </button>
        {task.periodId &&
        <button type="button" disabled={Boolean(moveReason)} onClick={() => onUnassign(task)} className={btn} style={style}>
            <CalendarXIcon className="h-4 w-4" aria-hidden />
            Bỏ khỏi kỳ
          </button>
        }
        {revokable &&
        <button
          type="button"
          onClick={() => onRevoke(task)}
          title="Việc giữ lại trong lịch sử, không tính vào M"
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[14px] font-medium text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={style}>
          
            <UndoIcon className="h-4 w-4" aria-hidden />
            Thu hồi
          </button>
        }
      </div>
      {(editReason || moveReason) && <p className="mt-2 text-xs text-gray-500">{moveReason ?? editReason}</p>}
    </div>);

}

function Section({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section className="px-5 py-5">
      <h3 className="mb-3 text-[14px] font-semibold text-gray-900">{title}</h3>
      {children}
    </section>);

}

function Row({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div className="grid grid-cols-[132px_1fr] items-center gap-3 py-1.5 text-[14px]">
      <span className="text-gray-500">{label}</span>
      <div className="min-w-0 text-gray-900">{children}</div>
    </div>);

}

function Stat({ label, value, extra, strong }: {label: string;value: string;extra?: React.ReactNode;strong?: boolean;}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-0.5 flex items-center gap-1.5 tabular-nums ${strong ? 'text-xl font-semibold text-brand-700' : 'text-lg font-semibold text-gray-900'}`}>
        {value}
        {extra}
      </p>
    </div>);

}