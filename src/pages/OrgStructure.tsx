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
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { UnitFormDialog } from '../components/org/UnitFormDialog';
import { btnSecondary, btnTransition } from '../components/ui/Modal';
import { useAccess } from '../contexts/AccessContext';
import { usePermissions } from '../hooks/usePermissions';
import { childLevelOf, findMember, findUnit, newUnitId, rootUnit } from '../utils/org';

type View = 'tree' | 'chart';

export function OrgStructure() {
  const location = useLocation();
  const requested = (location.state as {unitId?: string;} | null)?.unitId;
  const [view, setView] = useState<View>('tree');
  const [selectedId, setSelectedId] = useState(requested && findUnit(requested) ? requested : rootUnit.id);
  const [chartRootId, setChartRootId] = useState(rootUnit.id);
  const [openMemberId, setOpenMemberId] = useState<string>();
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null);
  // Đọc từ context để màn vẽ lại khi cơ cấu đổi (máy này hoặc máy khác qua Firestore)
  const { units, members, addUnit, updateUnit, removeUnit } = useAccess();
  const canEdit = usePermissions().can('org', 'write');

  const unit = findUnit(selectedId) ?? rootUnit;

  const deleteUnit = () => {
    const reason = removeUnit(unit.id);
    if (reason) {
      toast.error(reason);
      return;
    }
    const parentId = unit.parentId ?? rootUnit.id;
    const removed = unit;
    setSelectedId(parentId);
    toast.success(`Đã xoá ${removed.name}`, {
      action: { label: 'Hoàn tác', onClick: () => addUnit(removed) },
      duration: 6000
    });
  };

  const unitActions = canEdit ?
  <>
      <button type="button" onClick={() => setDialog('add')} className={`${btnSecondary} h-9 px-3 text-[13px]`} style={btnTransition}>
        <PlusIcon className="h-4 w-4" aria-hidden />
        Thêm trực thuộc
      </button>
      <button type="button" onClick={() => setDialog('edit')} aria-label="Sửa đơn vị" title="Sửa đơn vị" className={`${btnSecondary} h-9 w-9 px-0`} style={btnTransition}>
        <PencilIcon className="h-4 w-4" />
      </button>
      {unit.parentId !== null &&
    <button type="button" onClick={deleteUnit} aria-label="Xoá đơn vị" title="Xoá đơn vị" className={`${btnSecondary} h-9 w-9 px-0 hover:text-brand-700`} style={btnTransition}>
          <Trash2Icon className="h-4 w-4" />
        </button>
    }
    </> :
  undefined;
  const openMember = openMemberId ? findMember(openMemberId) : undefined;
  const closeDrawer = useCallback(() => setOpenMemberId(undefined), []);
  // Khung hai cột lấp đúng phần màn hình còn lại → trang không cuộn; chỉ cột chi tiết bên phải cuộn
  const fill = useFillHeight<HTMLDivElement>(1024);
  const detailRef = useRef<HTMLDivElement>(null);

  // Đổi đơn vị: đưa cột chi tiết về đầu; cây giữ nguyên vị trí cuộn
  useEffect(() => {
    detailRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

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
        <span className="hidden whitespace-nowrap pr-2 text-[13px] text-gray-500 sm:inline">
            {units.length} đơn vị · {members.length} cán bộ
          </span>
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
          <div ref={detailRef} className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-l lg:border-gray-200">
            <UnitOverview unit={unit} onSelectUnit={setSelectedId} onOpenMember={setOpenMemberId} actions={unitActions} />
            <UnitMembers unitId={unit.id} onOpenMember={setOpenMemberId} />
          </div>
        </div> :

      <OrgChart rootId={chartRootId} onRoot={setChartRootId} onViewMembers={goToUnit} />
      }

      <MemberDrawer member={openMember} onClose={closeDrawer} onOpenMember={setOpenMemberId} onGoToUnit={goToUnit} />

      <UnitFormDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        unit={dialog === 'edit' ? unit : undefined}
        parent={unit}
        defaultLevel={childLevelOf[unit.level]}
        onSubmit={(values) => {
          if (dialog === 'edit') {
            updateUnit(unit.id, values);
            toast.success(`Đã lưu ${values.name}`);
          } else {
            const id = newUnitId(values.name);
            addUnit({ id, parentId: unit.id, ...values });
            setSelectedId(id);
            toast.success(`Đã thêm ${values.name}`);
          }
          setDialog(null);
        }} />
      
    </div>);

}