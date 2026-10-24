import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRightIcon, LockIcon, LockOpenIcon, PencilIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { useWork } from '../../contexts/WorkContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { usePeriodScope } from '../../hooks/usePeriodScope';
import { AdminDetailHeader } from '../../components/admin/AdminDetailHeader';
import { StatusPill } from '../../components/catalog/StatusPill';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { btnGhost, btnPrimary, btnSecondary, btnTransition } from '../../components/ui/Modal';
import { PeriodFormDialog } from '../../components/period/PeriodFormDialog';
import { DeadlineRuleDialog } from '../../components/period/DeadlineRuleDialog';
import { ReasonDialog } from '../../components/period/ReasonDialog';
import { PeriodTasksTab } from '../../components/period/PeriodTasksTab';
import { AddTasksToPeriodDialog } from '../../components/period/AddTasksToPeriodDialog';
import { PeriodReviewTab } from '../../components/period/PeriodReviewTab';
import { DeadlineRulesTab } from '../../components/period/DeadlineRulesTab';
import { DeadlineHistoryTab, PeriodEventsTab } from '../../components/period/PeriodHistoryTab';
import { nextPhase, usePeriodDetail } from '../../components/period/usePeriodDetail';
import { KpiPeriod } from '../../types/work';
import { periodKindLabels, periodRangeLabel, unitShort } from '../../utils/period';
import { phaseMeta } from '../../utils/work';
import { displayDate } from '../../utils/profile';

type Tab = 'tasks' | 'review' | 'deadlines' | 'history' | 'events';

/** Chi tiết kỳ KPI: mốc thời gian, khoá kiểm đếm, giai đoạn phê duyệt, việc trong kỳ, hạn tự đánh giá và lịch sử */
export function KpiPeriodDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { periods } = useWork();
  const { unitIds, homeUnitId } = usePeriodScope();
  const period = periods.find((p) => p.id === id);
  const d = usePeriodDetail(period);
  const [tab, setTab] = useState<Tab>('tasks');
  useBreadcrumbLabel(period?.name);

  if (!period || !d.actions) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-[15px] font-medium text-gray-900">Không tìm thấy kỳ KPI</p>
        <Link to="/ky-kpi" className="mt-2 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Về danh sách kỳ
        </Link>
      </div>);

  }

  const a = d.actions;
  const closed = period.phase === 'closed';
  const next = nextPhase(period.phase);
  const deletable = d.canDelete && period.phase === 'draft' && d.tasks.length === 0;
  const pendingRules = period.deadlineRules.filter((r) => r.status === 'needs-confirmation').length;

  const tabs: {id: Tab;label: string;count?: number;}[] = [
  { id: 'tasks', label: 'Nhiệm vụ trong kỳ', count: d.tasks.length },
  { id: 'review', label: 'Tiến độ đánh giá' },
  { id: 'deadlines', label: 'Hạn tự đánh giá', count: period.deadlineRules.length },
  { id: 'history', label: 'Lịch sử cấu hình hạn', count: period.deadlineHistory.length },
  { id: 'events', label: 'Nhật ký kỳ', count: period.events.length }];


  return (
    <div className="bg-white">
      <AdminDetailHeader
        backTo="/ky-kpi"
        backLabel="Danh sách kỳ KPI"
        title={period.name}
        code={`${periodKindLabels[period.kind]} · kiểm đếm ${periodRangeLabel(period)}`}
        description="Kỳ chấm điểm độc lập: việc, phiếu và điểm của kỳ này không chia trung bình, không cộng dồn từ kỳ khác."
        actions={
        <>
            {deletable &&
          <button type="button" onClick={() => d.setReason('delete-period')} className={`${btnGhost} text-brand-700`} style={btnTransition}>
                <Trash2Icon className="h-4 w-4" aria-hidden />
                Xoá kỳ
              </button>
          }
            {d.canWrite && !closed && !period.countingLocked &&
          <button type="button" onClick={() => d.setEditOpen(true)} className={btnSecondary} style={btnTransition}>
                <PencilIcon className="h-4 w-4" aria-hidden />
                Sửa
              </button>
          }
            {d.canWrite && !closed &&
          <button type="button" onClick={a.toggleLock} className={btnSecondary} style={btnTransition}>
                {period.countingLocked ? <LockOpenIcon className="h-4 w-4" aria-hidden /> : <LockIcon className="h-4 w-4" aria-hidden />}
                {period.countingLocked ? 'Mở khoá kiểm đếm' : 'Khoá kiểm đếm'}
              </button>
          }
            {d.canWrite && next &&
          <button type="button" onClick={a.advance} className={btnPrimary} style={btnTransition}>
                Chuyển sang {phaseMeta[next].label}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
          }
            {d.canWrite && closed &&
          <button type="button" onClick={() => d.setReason('reopen')} className={btnPrimary} style={btnTransition}>
                <RotateCcwIcon className="h-4 w-4" aria-hidden />
                Mở lại kỳ
              </button>
          }
          </>
        }
        facts={[
        { label: 'Đơn vị áp dụng', value: `${unitShort(period.unitId)}${period.includeChildren ? ' và trực thuộc' : ''}` },
        { label: 'Giai đoạn phê duyệt', value: <StatusPill tone={phaseMeta[period.phase].tone}>{phaseMeta[period.phase].label}</StatusPill> },
        {
          label: 'Khoá kiểm đếm',
          value: period.countingLocked ?
          <span className="inline-flex items-center gap-1">
                <LockIcon className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                Đã khoá
              </span> :

          'Mở'

        },
        { label: 'Phiên bản kết quả', value: period.resultVersion }]
        } />
      

      <section aria-label="Các mốc thời gian" className="border-b border-gray-200 px-4 py-4">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-5">
          <Milestone label="Bắt đầu kiểm đếm" value={displayDate(period.start)} />
          <Milestone
            label="Kết thúc kiểm đếm"
            value={displayDate(period.end)}
            note={period.rangeStatus === 'needs-confirmation' ? <StatusPill tone="warning">Cần xác nhận nghiệp vụ</StatusPill> : undefined} />
          
          <Milestone
            label="Hạn tự đánh giá"
            value={period.deadlineRules.length ? `${period.deadlineRules.length} quy tắc` : 'Chưa cấu hình hạn'}
            muted={!period.deadlineRules.length}
            note={pendingRules ? <StatusPill tone="warning">{pendingRules} cần xác nhận nghiệp vụ</StatusPill> : undefined} />
          
          <Milestone label="Hạn thẩm định" value={period.appraisalDeadline ? displayDate(period.appraisalDeadline) : 'Chưa cấu hình'} muted={!period.appraisalDeadline} />
          <Milestone label="Hạn báo cáo cấp trên" value={period.reportDeadline ? displayDate(period.reportDeadline) : 'Chưa cấu hình'} muted={!period.reportDeadline} />
        </dl>
        {period.rangeBasis && <p className="mt-3 text-[13px] text-gray-500">Ghi chú khoảng kiểm đếm: {period.rangeBasis}</p>}
      </section>

      <div role="tablist" aria-label="Nội dung kỳ" className="scrollbar-none flex gap-6 overflow-x-auto border-b border-gray-200 px-4">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 py-3 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              active ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`
              }
              style={{ transition: 'color 150ms ease-out, border-color 150ms ease-out' }}>
              
              {t.label}
              {t.count !== undefined &&
              <span className={`rounded-full px-1.5 text-[12px] tabular-nums ${active ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
              }
            </button>);

        })}
      </div>

      <div className="px-4 py-5">
        {tab === 'tasks' && <PeriodTasksTab period={period} tasks={d.tasks} canAdd={d.canWrite} onAdd={() => d.setAddOpen(true)} />}
        {tab === 'review' && <PeriodReviewTab period={period} />}
        {tab === 'deadlines' &&
        <DeadlineRulesTab
          period={period}
          canWrite={d.canWrite}
          onAdd={() => d.setRuleDialog({ open: true })}
          onEdit={(r) => d.setRuleDialog({ open: true, editing: r })}
          onRemove={(r) => {
            d.setRemovingRule(r);
            d.setReason('delete-rule');
          }} />

        }
        {tab === 'history' && <DeadlineHistoryTab period={period} />}
        {tab === 'events' && <PeriodEventsTab period={period} />}
      </div>

      <PeriodFormDialog
        open={d.editOpen}
        editing={period}
        unitIds={unitIds}
        defaultUnitId={homeUnitId}
        periods={periods}
        taskCount={d.tasks.length}
        by={d.by}
        onClose={() => d.setEditOpen(false)}
        onSave={(p: KpiPeriod) => a.save(p)} />
      
      <DeadlineRuleDialog open={d.ruleDialog.open} period={period} editing={d.ruleDialog.editing} onClose={() => d.setRuleDialog({ open: false })} onSave={a.saveRule} />
      <AddTasksToPeriodDialog open={d.addOpen} period={period} candidates={d.candidates} onClose={() => d.setAddOpen(false)} onConfirm={a.addTasks} />
      <ReasonDialog
        open={d.reason !== null && d.reason !== 'delete-period'}
        title={
        d.reason === 'unlock' ? 'Mở khoá kiểm đếm' : d.reason === 'close' ? 'Đóng kỳ' : d.reason === 'reopen' ? 'Mở lại kỳ' : 'Xoá quy tắc hạn'
        }
        description={
        d.reason === 'close' ?
        'Kỳ đã đóng thì khoá kết quả lịch sử. Muốn sửa sau này phải mở lại kỳ có người duyệt.' :
        d.reason === 'reopen' ?
        `Tạo phiên bản kết quả ${period.resultVersion + 1}; phiên bản ${period.resultVersion} vẫn được giữ.` :
        d.reason === 'delete-rule' ?
        'Hồ sơ thuộc quy tắc này sẽ hiện "Chưa cấu hình hạn". Thay đổi được ghi vào lịch sử.' :
        'Kỳ nhận thêm việc trở lại. Lý do được ghi vào nhật ký kỳ.'
        }
        reasonLabel={d.reason === 'delete-rule' ? 'Căn cứ' : 'Lý do'}
        reasonRequired={d.reason !== 'close'}
        approvers={d.reason === 'reopen' ? d.approvers : undefined}
        confirmLabel={d.reason === 'close' ? 'Đóng kỳ' : d.reason === 'reopen' ? 'Mở lại kỳ' : d.reason === 'delete-rule' ? 'Xoá quy tắc' : 'Mở khoá'}
        onClose={() => {
          d.setReason(null);
          d.setRemovingRule(null);
        }}
        onConfirm={a.confirmReason} />
      
      <ReasonDialog
        open={d.reason === 'delete-period'}
        title={`Xoá ${period.name}?`}
        description="Chỉ xoá được kỳ ở giai đoạn Nháp và chưa có việc nào."
        reasonRequired={false}
        reasonLabel="Ghi chú"
        confirmLabel="Xoá kỳ"
        onClose={() => d.setReason(null)}
        onConfirm={() => {
          a.remove();
          toast.success(`Đã xoá ${period.name}`);
          navigate('/ky-kpi');
        }} />
      
    </div>);

}

function Milestone({ label, value, note, muted }: {label: string;value: string;note?: React.ReactNode;muted?: boolean;}) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-gray-500">{label}</dt>
      <dd className={`mt-0.5 text-[14px] font-medium tabular-nums ${muted ? 'text-gray-400' : 'text-gray-900'}`}>{value}</dd>
      {note && <dd className="mt-1">{note}</dd>}
    </div>);

}