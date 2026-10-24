import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccess } from '../contexts/AccessContext';
import { useAuth } from '../contexts/AuthContext';
import { accountName } from '../utils/staff';

/** Xoá tài khoản ngay, kèm Hoàn tác trong thông báo; không cho xoá tài khoản đang đăng nhập */
export function useDeleteAccount() {
  const { accounts, addAccount, removeAccount } = useAccess();
  const { username: me } = useAuth();

  const canDelete = useCallback((username: string) => username !== me, [me]);

  const remove = useCallback(
    (username: string) => {
      if (username === me) {
        toast.error('Không xoá được tài khoản đang đăng nhập.');
        return false;
      }
      const index = accounts.findIndex((a) => a.username === username);
      const account = accounts[index];
      if (!account) return false;
      removeAccount(username);
      const name = accountName(account);
      toast.success(`Đã xoá tài khoản ${username}${name !== username ? ` · ${name}` : ''}`, {
        duration: 6000,
        action: {
          label: 'Hoàn tác',
          onClick: () => {
            addAccount(account, index);
            toast('Đã khôi phục tài khoản');
          }
        }
      });
      return true;
    },
    [accounts, addAccount, removeAccount, me]
  );

  return { remove, canDelete };
}