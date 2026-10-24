import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { useGuardedNavigate } from '../../contexts/UnsavedChangesContext';
import { StaffForm } from '../../components/admin/StaffForm';
import { EmptyMark } from '../../components/ui/EmptyMark';
import { memberPatchFromValues, valuesFromMember } from '../../utils/staffForm';
import { accountOfMember } from '../../utils/staff';

/** Sửa nhân sự: cùng form với Tạo mới; đổi / gỡ tài khoản gắn kèm được */
export function StaffEdit() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const goBack = useGuardedNavigate();
  const { accounts, members, updateMember, linkAccount } = useAccess();
  const member = members.find((m) => m.id === id);
  const linked = accountOfMember(accounts, id);
  const [initial] = useState(() => member ? valuesFromMember(member, linked?.username ?? '') : undefined);
  useBreadcrumbLabel(member ? `Sửa · ${member.name}` : 'Sửa nhân sự');

  if (!member || !initial) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center">
        <EmptyMark size="lg" />
        <p className="mt-3 text-[15px] font-medium text-gray-900">Không tìm thấy nhân sự</p>
        <Link to="/nhan-su" className="mt-2 text-[14px] font-medium text-brand-600 hover:text-brand-700">
          Về danh sách nhân sự
        </Link>
      </div>);

  }

  return (
    <StaffForm
      mode="edit"
      initial={initial}
      memberId={member.id}
      onCancel={() => goBack(`/nhan-su/${member.id}`)}
      onSubmit={(f) => {
        updateMember(member.id, memberPatchFromValues(f));
        if (f.username !== initial.username) {
          if (initial.username) linkAccount(initial.username, null);
          if (f.username) linkAccount(f.username, member.id);
        }
        toast.success(`Đã lưu hồ sơ ${f.name.trim()}`);
        navigate(`/nhan-su/${member.id}`);
      }} />);


}