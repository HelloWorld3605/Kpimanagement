import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { useGuardedNavigate } from '../../contexts/UnsavedChangesContext';
import { StaffForm } from '../../components/admin/StaffForm';
import { emptyStaffForm, memberPatchFromValues } from '../../utils/staffForm';

/** Tạo nhân sự: chọn một tài khoản chưa gắn nhân sự rồi điền hồ sơ nghiệp vụ */
export function StaffCreate() {
  const navigate = useNavigate();
  const goBack = useGuardedNavigate();
  const [params] = useSearchParams();
  const { accounts, addMember, linkAccount } = useAccess();
  useBreadcrumbLabel('Tạo nhân sự');

  // ?account=annv → chọn sẵn tài khoản (nếu còn trống)
  const [initial] = useState(() => {
    const preset = accounts.find((a) => a.username === params.get('account') && !a.memberId);
    return preset ? { ...emptyStaffForm, username: preset.username, name: preset.displayName ?? '' } : emptyStaffForm;
  });

  return (
    <StaffForm
      key={initial.username}
      mode="create"
      initial={initial}
      onCancel={() => goBack('/nhan-su')}
      onSubmit={(f) => {
        const id = `m-${Date.now().toString(36)}`;
        addMember({ id, ...memberPatchFromValues(f), joinedAt: new Date().toISOString().slice(0, 10), results: [] });
        linkAccount(f.username, id);
        toast.success(`Đã tạo hồ sơ nhân sự ${f.name.trim()}`, { description: `Gắn với tài khoản ${f.username}.` });
        navigate(`/nhan-su/${id}`);
      }} />);


}