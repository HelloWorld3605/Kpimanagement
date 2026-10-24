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
import { STAFF_DEFAULT_PASSWORD, accountForMember } from '../../utils/staffAccount';
import { isFirebaseConfigured } from '../../utils/firebase';
import { provisionAuthUser } from '../../utils/firebaseAccounts';
import { statusPatch } from '../../utils/accountStatus';
import { nowStamp } from '../../utils/profile';

/** Sửa nhân sự: cùng form với Tạo mới; số hiệu khoá khi đã có tài khoản, chưa có thì tạo theo số hiệu */
export function StaffEdit() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const goBack = useGuardedNavigate();
  const { accounts, members, updateMember, addAccount, updateAccount } = useAccess();
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
        const patch = memberPatchFromValues(f);
        updateMember(member.id, patch);
        // Chưa có tài khoản và chọn tạo: tên đăng nhập = số hiệu, mật khẩu mặc định
        if (!f.username && f.createAccount) {
          const account = accountForMember({ ...member, ...patch });
          addAccount(account);
          if (isFirebaseConfigured) provisionAuthUser(account.username, STAFF_DEFAULT_PASSWORD).catch(() => undefined);
          toast.success(`Đã lưu hồ sơ ${f.name.trim()}`, { description: `Tạo tài khoản ${account.username} · mật khẩu ${STAFF_DEFAULT_PASSWORD}.` });
        } else if (linked && patch.status !== member.status && (patch.status === 'retired' || member.status === 'retired')) {
          // Đã nghỉ / chuyển công tác: giữ hồ sơ, ngừng tài khoản; quay lại công tác thì mở lại
          const retired = patch.status === 'retired';
          updateAccount(linked.username, { ...statusPatch(retired ? 'inactive' : 'active'), updatedAt: nowStamp() });
          toast.success(`Đã lưu hồ sơ ${f.name.trim()}`, { description: `Tài khoản ${linked.username} ${retired ? 'đã ngừng hoạt động' : 'hoạt động trở lại'}.` });
        } else {
          toast.success(`Đã lưu hồ sơ ${f.name.trim()}`);
        }
        navigate(`/nhan-su/${member.id}`);
      }} />);


}