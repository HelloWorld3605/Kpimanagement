import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccess } from '../contexts/AccessContext';
import { useWork } from '../contexts/WorkContext';
import { accountOfMember } from '../utils/staff';
import { UnitMember } from '../types/org';

/**
 * Xoá hồ sơ nhân sự ngay, kèm Hoàn tác. Chặn khi nhân sự còn việc KPI hoặc đã có kết quả đánh giá.
 * Tài khoản đang gắn được giữ lại, chuyển thành "chưa gắn nhân sự".
 */
export function useDeleteStaff() {
  const { members, accounts, addMember, removeMember, linkAccount } = useAccess();
  const { kpiTasks } = useWork();

  const blockReason = useCallback(
    (m: UnitMember) => {
      const tasks = kpiTasks.filter((t) => t.assignee.kind === 'member' && t.assignee.memberId === m.id || t.assignedById === m.id).length;
      if (tasks) return `${m.name} đang có ${tasks} việc KPI liên quan — thu hồi hoặc giao lại trước khi xoá.`;
      if (m.results.length) return `${m.name} đã có ${m.results.length} kết quả đánh giá — không xoá được hồ sơ.`;
      return null;
    },
    [kpiTasks]
  );

  const remove = useCallback(
    (id: string) => {
      const index = members.findIndex((m) => m.id === id);
      const member = members[index];
      if (!member) return false;
      const reason = blockReason(member);
      if (reason) {
        toast.error(reason);
        return false;
      }
      const account = accountOfMember(accounts, id);
      removeMember(id);
      toast.success(`Đã xoá hồ sơ ${member.name}`, {
        description: account ? `Tài khoản ${account.username} được giữ lại, chưa gắn nhân sự.` : undefined,
        duration: 6000,
        action: {
          label: 'Hoàn tác',
          onClick: () => {
            addMember(member, index);
            if (account) linkAccount(account.username, member.id);
            toast('Đã khôi phục hồ sơ nhân sự');
          }
        }
      });
      return true;
    },
    [members, accounts, blockReason, addMember, removeMember, linkAccount]
  );

  return { remove, blockReason };
}