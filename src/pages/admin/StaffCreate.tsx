import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { useGuardedNavigate } from '../../contexts/UnsavedChangesContext';
import { StaffForm } from '../../components/admin/StaffForm';
import { emptyStaffForm, memberPatchFromValues } from '../../utils/staffForm';
import { STAFF_DEFAULT_PASSWORD, accountForMember } from '../../utils/staffAccount';
import { isFirebaseConfigured } from '../../utils/firebase';
import { provisionAuthUser } from '../../utils/firebaseAccounts';
import { UnitMember } from '../../types/org';

/** Tạo nhân sự: điền hồ sơ; tài khoản tạo kèm theo số hiệu (mật khẩu cố định) */
export function StaffCreate() {
  const navigate = useNavigate();
  const goBack = useGuardedNavigate();
  const [params] = useSearchParams();
  const { accounts, addMember, addAccount, linkAccount } = useAccess();
  useBreadcrumbLabel('Tạo nhân sự');

  // ?account=045-318 (từ chi tiết tài khoản chưa gắn nhân sự) → số hiệu = tên đăng nhập, gắn tài khoản đó thay vì tạo mới
  const [initial] = useState(() => {
    const preset = accounts.find((a) => a.username === params.get('account') && !a.memberId);
    return preset ? { ...emptyStaffForm, username: preset.username, code: preset.username, name: preset.displayName ?? '' } : emptyStaffForm;
  });

  return (
    <StaffForm
      key={initial.username}
      mode="create"
      initial={initial}
      onCancel={() => goBack('/nhan-su')}
      onSubmit={(f) => {
        const id = `m-${Date.now().toString(36)}`;
        const member: UnitMember = { id, ...memberPatchFromValues(f), joinedAt: new Date().toISOString().slice(0, 10), results: [] };
        if (f.username) {
          addMember(member);
          linkAccount(f.username, id);
          toast.success(`Đã tạo hồ sơ nhân sự ${member.name}`, { description: `Gắn với tài khoản ${f.username}.` });
          navigate(`/nhan-su/${id}`);
          return;
        }
        const account = accountForMember(member);
        addMember(member);
        addAccount(account);
        toast.success(`Đã tạo nhân sự ${member.name}`, { description: `Tài khoản ${account.username} · mật khẩu ${STAFF_DEFAULT_PASSWORD}.` });
        // Có Firebase: tạo luôn người dùng đăng nhập; lỗi thì người dùng vẫn tự kích hoạt ở lần đăng nhập đầu
        if (isFirebaseConfigured) {
          provisionAuthUser(account.username, STAFF_DEFAULT_PASSWORD).catch((err: Error) =>
          toast.warning(`Chưa tạo được đăng nhập Firebase cho ${account.username}: ${err.message} Người dùng vẫn tự kích hoạt được ở lần đăng nhập đầu.`)
          );
        }
        navigate(`/nhan-su/${id}`);
      }} />);


}
