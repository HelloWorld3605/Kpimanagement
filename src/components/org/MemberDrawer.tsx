import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronRightIcon, InfoIcon, XIcon } from 'lucide-react';
import { UnitMember } from '../../types/org';
import { MemberAvatar } from './MemberAvatar';
import { StatusPill } from '../catalog/StatusPill';
import { RankBadge } from '../selfReview/RankBadge';
import { displayDate } from '../../utils/profile';
import { usePermissions } from '../../hooks/usePermissions';
import { confirmerOf, criteriaSetOf, isLeader, kpiBarClass, statusMeta, unitPath } from '../../utils/org';

type MemberDrawerProps = {
  member?: UnitMember;
  onClose: () => void;
  onOpenMember: (id: string) => void;
  onGoToUnit: (id: string) => void;
};

const ease = [0.23, 1, 0.32, 1] as const;

export function MemberDrawer({ member, onClose, onOpenMember, onGoToUnit }: MemberDrawerProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const memberId = member?.id;
  useEffect(() => {
    if (!memberId) return;
    // preventScroll: không để trình duyệt cuộn khung trang tới nút đang trượt vào
    closeRef.current?.focus({ preventScroll: true });
    bodyRef.current?.scrollTo({ top: 0 });
  }, [memberId]);

  const isOpen = Boolean(member);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Render ra body: drawer không còn nằm trong vùng cuộn của trang nên không làm trang đo lại / nhấp nháy
  return createPortal(
    <AnimatePresence>
      {member &&
      <>
          <motion.div
          key="overlay"
          className="fixed inset-0 z-40 bg-gray-900/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          onClick={onClose}
          aria-hidden />
        
          <motion.aside
          key="drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-drawer-title"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col bg-white shadow-xl"
          initial={{ x: reduce ? 0 : 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: reduce ? 0 : 32, opacity: 0 }}
          transition={{ duration: 0.24, ease }}>
          
            <DrawerContent
            member={member}
            closeRef={closeRef}
            bodyRef={bodyRef}
            onClose={onClose}
            onOpenMember={onOpenMember}
            onGoToUnit={onGoToUnit} />
          
          </motion.aside>
        </>
      }
    </AnimatePresence>,
    document.body
  );
}

type DrawerContentProps = Omit<MemberDrawerProps, 'member'> & {
  member: UnitMember;
  closeRef: React.RefObject<HTMLButtonElement>;
  bodyRef: React.RefObject<HTMLDivElement>;
};

function DrawerContent({ member, closeRef, bodyRef, onClose, onOpenMember, onGoToUnit }: DrawerContentProps) {
  const path = unitPath(member.unitId);
  const unit = path[path.length - 1];
  const confirmer = confirmerOf(member);
  const status = statusMeta[member.status];
  const { canSee } = usePermissions();
  const target = { unitId: member.unitId, memberId: member.id };
  const showKpi = canSee('member-kpi', target);
  const showPersonal = canSee('member-personal', target);

  return (
    <>
      <div className="flex items-start gap-4 border-b border-gray-200 px-5 py-5">
        <MemberAvatar name={member.name} strong={member.role === 'truong'} size="xl" />
        <div className="min-w-0 flex-1">
          <h2 id="member-drawer-title" className="truncate text-lg font-semibold text-gray-900">
            {member.name}
          </h2>
          <p className="mt-0.5 text-[14px] text-gray-600">
            {member.rank} · {member.position}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {showKpi && <StatusPill tone={status.tone}>{status.label}</StatusPill>}
            <StatusPill tone={isLeader(member) ? 'brand' : 'neutral'}>{isLeader(member) ? 'Lãnh đạo, chỉ huy' : 'Không giữ chức vụ'}</StatusPill>
          </div>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="-mr-1 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'background-color 120ms ease-out, color 120ms ease-out' }}>
          
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <div ref={bodyRef} className="min-h-0 flex-1 divide-y divide-gray-200 overflow-y-auto">
        {showKpi && status.note &&
        <div className="flex gap-2 bg-warning-50 px-5 py-3 text-[13px] text-warning-700">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {status.note}
          </div>
        }

        <DrawerSection title="Công tác">
          <Row label="Đơn vị">
            <button
              type="button"
              onClick={() => onGoToUnit(unit.id)}
              className="group inline-flex items-center gap-1 rounded text-left font-medium text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
              {unit.name}
              <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden />
            </button>
            {path.length > 1 &&
            <span className="mt-0.5 block text-[12px] text-gray-500">
                {path.
              slice(0, -1).
              map((u) => u.shortName ?? u.name).
              join(' › ')}
              </span>
            }
          </Row>
          <Row label="Chức vụ">{member.position}</Row>
          <Row label="Cấp bậc">{member.rank}</Row>
          {showPersonal && <Row label="Ngày vào ngành">{displayDate(member.joinedAt)}</Row>}
          <Row label="Người xác nhận phiếu">
            {confirmer ?
            <button
              type="button"
              onClick={() => onOpenMember(confirmer.id)}
              className="-mx-1.5 -my-1 flex items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{ transition: 'background-color 120ms ease-out' }}>
              
                <MemberAvatar name={confirmer.name} strong size="sm" />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-gray-900">{confirmer.name}</span>
                  <span className="block truncate text-[12px] text-gray-500">{confirmer.position}</span>
                </span>
              </button> :

            <span className="text-gray-500">Cấp trên trực tiếp của Bộ Tư lệnh</span>
            }
          </Row>
          <Row label="Bộ tiêu chí chung">{criteriaSetOf(member)}</Row>
        </DrawerSection>

        {showKpi &&
        <DrawerSection title="Kết quả xếp loại gần đây">
          {member.results.length === 0 ?
          <p className="text-[14px] text-gray-500">Chưa có kết quả.</p> :

          <ul className="space-y-3">
              {[...member.results].reverse().map((r) =>
            <li key={r.period} className="grid grid-cols-[96px_1fr_auto] items-center gap-3 text-[14px]">
                  <span className="text-gray-600">{r.period}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100" aria-hidden>
                      <span className={`block h-full rounded-full ${kpiBarClass(r.kpi)}`} style={{ width: `${Math.min(r.kpi, 100)}%` }} />
                    </span>
                    <span className="w-10 text-right font-medium tabular-nums text-gray-900">{r.kpi.toFixed(1)}</span>
                  </span>
                  <RankBadge rank={r.rank} />
                </li>
            )}
            </ul>
          }
          <p className="mt-3 text-[12px] text-gray-500">Điểm KPI quý · thanh màu theo nhóm cán bộ: từ 70 · 50 đến dưới 70 · dưới 50.</p>
        </DrawerSection>
        }

        {showPersonal &&
        <DrawerSection title="Thông tin cá nhân">
          <Row label="Số hiệu">
            <span className="tabular-nums">{member.code}</span>
          </Row>
          <Row label="Giới tính">{member.gender}</Row>
          <Row label="Ngày sinh">{displayDate(member.birthDate)}</Row>
          <Row label="Quê quán">{member.hometown}</Row>
          <Row label="Trình độ">{member.education}</Row>
          <Row label="Đảng viên">{member.partyMember ? 'Có' : 'Chưa'}</Row>
          <Row label="Điện thoại">
            <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="tabular-nums text-gray-900 hover:text-brand-700">
              {member.phone}
            </a>
          </Row>
        </DrawerSection>
        }

        {!showKpi && !showPersonal &&
        <p className="px-5 py-4 text-[13px] text-gray-500">Tài khoản của bạn chỉ xem được thông tin công tác của cán bộ này.</p>
        }
      </div>
    </>);

}

function DrawerSection({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section className="px-5 py-5">
      <h3 className="mb-3 text-[14px] font-semibold text-gray-900">{title}</h3>
      {children}
    </section>);

}

function Row({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 text-[14px]">
      <span className="text-gray-500">{label}</span>
      <div className="min-w-0 text-gray-900">{children}</div>
    </div>);

}