import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { useGuardedNavigate } from '../../contexts/UnsavedChangesContext';
import { UserForm } from '../../components/admin/UserForm';
import { emptyUserForm } from '../../utils/userForm';
import { nowStamp } from '../../utils/profile';
import { statusPatch } from '../../utils/accountStatus';
import { isFirebaseConfigured } from '../../utils/firebase';
import { provisionAuthUser } from '../../utils/firebaseAccounts';

/** Tạo tài khoản: đăng nhập + vai trò. Hồ sơ nhân sự tạo sau ở màn Nhân sự. */
export function UserCreate() {
  const navigate = useNavigate();
  const goBack = useGuardedNavigate();
  const { addAccount } = useAccess();
  useBreadcrumbLabel('Tạo người dùng');

  return (
    <UserForm
      mode="create"
      initial={emptyUserForm}
      onCancel={() => goBack('/nguoi-dung')}
      onSubmit={(f) => {
        const username = f.username.trim();
        addAccount({
          username,
          displayName: f.displayName.trim(),
          email: f.email.trim() || undefined,
          password: f.password,
          roles: f.roles,
          assignedUnitIds: f.roles.includes('chi-huy-pho') ? [f.deputyUnitId] : [],
          ...statusPatch(f.status),
          createdAt: nowStamp()
        });
        toast.success(`Đã tạo tài khoản ${username}`, {
          description: 'Tài khoản chưa gắn hồ sơ nhân sự.',
          duration: 8000,
          action: { label: 'Tạo hồ sơ nhân sự', onClick: () => navigate(`/nhan-su/tao-moi?account=${encodeURIComponent(username)}`) }
        });
        // Có Firebase: tạo luôn người dùng đăng nhập trên Firebase Auth (không làm phiên quản trị bị đăng xuất)
        if (isFirebaseConfigured) {
          provisionAuthUser(username, f.password).catch((err: Error) =>
          toast.warning(`Chưa tạo được đăng nhập Firebase cho ${username}: ${err.message} Người dùng vẫn tự kích hoạt được ở lần đăng nhập đầu.`)
          );
        }
        navigate('/nguoi-dung');
      }} />);


}