import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFillHeight } from '../hooks/useFillHeight';
import { ListTreeIcon, NetworkIcon } from 'lucide-react';
import { PageTabs } from '../components/PageTabs';
import { OrgTree } from '../components/org/OrgTree';
import { UnitOverview } from '../components/org/UnitOverview';
import { UnitMembers } from '../components/org/UnitMembers';
import { OrgChart } from '../components/org/OrgChart';
import { MemberDrawer } from '../components/org/MemberDrawer';
import { UnitMembersDrawer } from '../components/org/UnitMembersDrawer';
import { OrgEditorDialog } from '../components/orgEditor/OrgEditorDialog';
import { btnSecondary, btnTransition } from '../components/ui/Modal';
import { useAccess } from '../contexts/AccessContext';
import { usePermissions } from '../hooks/usePermissions';
import { findMember, findUnit, rootUnit } from '../utils/org';

type View = 'tree' | 'chart';

export function OrgStructure() {
  const location = useLocation();
  const requested = (location.state as {unitId?: string;} | null)?.unitId;
  const [view, setView] = useState<View>('tree');
  const [selectedId, setSelectedId] = useState(requested && findUnit(requested) ? requested : rootUnit.id);
  const [chartRootId, setChartRootId] = useState(rootUnit.id);
  const [openMemberId, setOpenMemberId] = useState<string>();
  const [chartUnitId, setChartUnitId] = useState<string>();
  // Thêm, đổi tên, đổi cấp, chuyển, xoá đơn vị đều làm trong "Chỉnh sửa cơ cấu" — không có nút riêng ở từng đơn vị
  const [editorOpen, setEditorOpen] = useState(false);
  // Đọc từ context để màn vẽ lại khi cơ cấu đổi (máy này hoặc máy khác qua Firestore)
  const { units, members } = useAccess();
  const canEdit = usePermissions().can('org', 'write');

  const unit = findUnit(selectedId) ?? rootUnit;
  const openMember = openMemberId ? findMember(openMemberId) : undefined;
  const closeDrawer = useCallback(() => setOpenMemberId(undefined), []);
  // Khung hai cột lấp đúng phần màn hình còn lại → trang không cuộn; chỉ cột chi tiết bên phải cuộn
  const fill = useFillHeight<HTMLDivElement>(1024);
  const detailRef = useRef<HTMLDivElement>(null);

  // Đổi đơn vị: đưa cột chi tiết về đầu; cây giữ nguyên vị trí cuộn
  useEffect(() => {
    detailRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  // Đơn vị đang xem có thể vừa bị xoá trong trình sửa cơ cấu
  useEffect(() => {
    if (!units.some((u) => u.id === selectedId)) setSelectedId(units.find((u) => u.parentId === null)?.id ?? rootUnit.id);
    if (!units.some((u) => u.id === chartRootId)) setChartRootId(units.find((u) => u.parentId === null)?.id ?? rootUnit.id);
  }, [units, selectedId, chartRootId]);

  const goToUnit = (id: string) => {
    setSelectedId(id);
    setView('tree');
    setOpenMemberId(undefined);
  };

  return (
    <div className="flex flex-1 flex-col bg-white">
      <PageTabs
        ariaLabel="Chế độ xem cơ cấu tổ chức"
        active={view}
        onChange={(id) => setView(id as View)}
        tabs={[
        { id: 'tree', label: 'Cây tổ chức', icon: ListTreeIcon },
        { id: 'chart', label: 'Sơ đồ tổ chức', icon: NetworkIcon }]
        }
        actions={
        <div className="flex items-center gap-3 pr-2">
            <span className="hidden whitespace-nowrap text-[13px] text-gray-500 sm:inline">
              {units.length} đơn vị · {members.length} cán bộ
            </span>
            {canEdit &&
          <button type="button" onClick={() => setEditorOpen(true)} className={`${btnSecondary} h-8 px-3 text-[13px]`} style={btnTransition}>
                <ListTreeIcon className="h-4 w-4" aria-hidden />
                Chỉnh sửa cơ cấu
              </button>
          }
          </div>
        } />
      

      {view === 'tree' ?
      // Từ laptop trở lên: thanh trên cùng, hàng tab, cột cây và khung đứng yên — chỉ cột chi tiết bên phải tự cuộn.
      // Bảng cán bộ trong cột phải dính tiêu đề cột / thanh chuyển trang theo chính cột đó.
      <div
        ref={fill.ref}
        className="grid flex-1 lg:min-h-0 lg:flex-none lg:grid-cols-[300px_minmax(0,1fr)] lg:overflow-hidden"
        style={{ height: fill.height }}>
        
          <aside aria-label="Cây đơn vị" className="flex h-[340px] min-h-0 flex-col overflow-hidden border-b border-gray-200 bg-white lg:h-auto lg:border-b-0">
            <OrgTree selectedId={selectedId} onSelect={setSelectedId} />
          </aside>
          <div ref={detailRef} data-fill-scroll className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-l lg:border-gray-200">
            <UnitOverview unit={unit} onSelectUnit={setSelectedId} onOpenMember={setOpenMemberId} />
            <UnitMembers unitId={unit.id} onOpenMember={setOpenMemberId} />
          </div>
        </div> :

      <OrgChart rootId={chartRootId} onRoot={setChartRootId} onViewMembers={setChartUnitId} />
      }

      <OrgEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)} />
      

      <UnitMembersDrawer
        unitId={chartUnitId}
        onClose={() => setChartUnitId(undefined)}
        onOpenMember={(id) => {
          setChartUnitId(undefined);
          setOpenMemberId(id);
        }} />
      

      <MemberDrawer member={openMember} onClose={closeDrawer} onOpenMember={setOpenMemberId} onGoToUnit={goToUnit} />
    </div>);

}