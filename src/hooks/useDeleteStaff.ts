import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccess } from '../contexts/AccessContext';
import { useWork } from '../contexts/WorkContext';
import { accountOfMember } from '../utils/staff';
import { statusPatch } from '../utils/accountStatus';
import { UnitMember } from '../types/org';

/**
 * Xoá hồ sơ nhân sự ngay, kèm Hoàn tác. Chặn khi nhân sự còn việc KPI hoặc đã có kết quả đánh giá
 * (khi đó dùng trạng thái "Đã nghỉ / chuyển công tác"). Tài khoản đang gắn (tên đăng nhập = số hiệu)
 * được giữ lại nhưng ngừng hoạt động — không để tài khoản rời còn đăng nhập được.
 */
export function useDeleteStaff() {
  const { members, accounts, addMember, removeMember, linkAccount, updateAccount } = useAccess();
  const { kpiTasks } = useWork();

  const blockReason = useCallback(
    (m: UnitMember) => {
      const tasks = kpiTasks.filter((t) => t.assignee.kind === 'member' && t.assignee.memberId === m.id || t.assignedById === m.id).length;
      if (tasks) return `${m.name} đang có ${tasks} việc KPI liên quan — thu hồi hoặc giao lại trước khi xoá.`;
      if (m.results.length) return `${m.name} đã có ${m.results.length} kết quả đánh giá — không xoá; chuyển trạng thái "Đã nghỉ / chuyển công tác" để ngừng tài khoản.`;
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
      const prevStatus = account ? { status: account.status, active: account.active } : null;
      removeMember(id);
      if (account) updateAccount(account.username, statusPatch('inactive'));
      toast.success(`Đã xoá hồ sơ ${member.name}`, {
        description: account ? `Tài khoản ${account.username} được giữ lại nhưng ngừng hoạt động.` : undefined,
        duration: 6000,
        action: {
          label: 'Hoàn tác',
          onClick: () => {
            addMember(member, index);
            if (account) {
              linkAccount(account.username, member.id);
              if (prevStatus) updateAccount(account.username, prevStatus);
            }
            toast('Đã khôi phục hồ sơ nhân sự');
          }
        }
      });
      return true;
    },
    [members, accounts, blockReason, addMember, removeMember, linkAccount, updateAccount]
  );

  return { remove, blockReason };
}