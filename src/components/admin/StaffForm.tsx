import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { InfoIcon } from 'lucide-react';
import { useAccess } from '../../contexts/AccessContext';
import { useUnsavedChanges } from '../../contexts/UnsavedChangesContext';
import { Select } from '../ui/Select';
import { btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { Field, formField, formSectionTitle } from './FormParts';
import { rankOptions } from '../../data/profile';
import { childUnits, descendantIds, findUnit, rootUnit, statusMeta } from '../../utils/org';
import { roleLabel } from '../../utils/access';
import { StaffFormErrors, StaffFormValues, validateStaffForm } from '../../utils/staffForm';
import { memberRoleLabels } from '../../utils/staff';
import { MemberRole, MemberStatus } from '../../types/org';

type StaffFormProps = {
  mode: 'create' | 'edit';
  initial: StaffFormValues;
  /** Nhân sự đang sửa — bỏ qua khi kiểm tra trùng số hiệu */
  memberId?: string;
  onSubmit: (values: StaffFormValues) => void;
  onCancel: () => void;
};

/** Form nhân sự dùng chung cho Tạo mới và Sửa: chọn tài khoản + hồ sơ cá nhân + nơi công tác */
export function StaffForm({ mode, initial, memberId, onSubmit, onCancel }: StaffFormProps) {
  const { accounts, members } = useAccess();
  const [form, setForm] = useState<StaffFormValues>(initial);
  const [errors, setErrors] = useState<StaffFormErrors>({});
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useUnsavedChanges(dirty);
  const grid = 'grid gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-3';

  // Chỉ tài khoản chưa gắn nhân sự (và tài khoản đang gắn với chính nhân sự này)
  const freeAccounts = useMemo(() => accounts.filter((a) => !a.memberId || a.memberId === memberId), [accounts, memberId]);
  const agencies = useMemo(() => [rootUnit, ...childUnits(rootUnit.id)], [members]);
  const departments = useMemo(
    () => form.agencyId && form.agencyId !== rootUnit.id ? descendantIds(form.agencyId).filter((id) => id !== form.agencyId) : [],
    [form.agencyId]
  );

  const set = <K extends keyof StaffFormValues,>(key: K, value: StaffFormValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const pickAccount = (username: string) => {
    const a = accounts.find((x) => x.username === username);
    // Họ tên điền sẵn từ tài khoản khi còn trống
    setForm((f) => ({ ...f, username, name: f.name.trim() ? f.name : a?.displayName ?? '' }));
    setErrors((e) => ({ ...e, username: undefined, name: undefined }));
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStaffForm(form, { mode, members, memberId });
    setErrors(e);
    const first = (Object.keys(e) as (keyof StaffFormValues)[])[0];
    if (first) {
      document.getElementById(`staff-${first}`)?.focus();
      return;
    }
    onSubmit(form);
  };

  const err = (key: keyof StaffFormValues) =>
  errors[key] ?
  <p id={`staff-${key}-error`} className="mt-1 text-[12px] text-brand-700">
        {errors[key]}
      </p> :
  null;
  const input = (key: keyof StaffFormValues) => ({
    id: `staff-${key}`,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `staff-${key}-error` : undefined,
    className: `${formField} ${errors[key] ? 'border-brand-600' : 'border-gray-300'}`
  });

  const picked = accounts.find((a) => a.username === form.username);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <form onSubmit={submit} noValidate className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 divide-y divide-gray-200">
          <section aria-labelledby="sec-staff-account" className="px-6 py-5">
            <h2 id="sec-staff-account" className={formSectionTitle}>
              Tài khoản
            </h2>
            {mode === 'create' && freeAccounts.length === 0 ?
            <div className="flex items-start gap-2.5 rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-[14px] text-warning-700">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>
                  Mọi tài khoản đều đã gắn hồ sơ nhân sự.{' '}
                  <Link to="/nguoi-dung/tao-moi" className="font-medium underline underline-offset-2">
                    Tạo tài khoản
                  </Link>{' '}
                  trước rồi quay lại tạo nhân sự.
                </p>
              </div> :

            <div className={grid}>
                <Field label="Tài khoản đăng nhập" htmlFor="staff-username" required={mode === 'create'}>
                  <Select
                  id="staff-username"
                  value={form.username}
                  invalid={!!errors.username}
                  placeholder="Chọn tài khoản chưa gắn nhân sự"
                  searchThreshold={6}
                  onChange={pickAccount}>
                  
                    {mode === 'edit' && <option value="">Chưa gắn tài khoản</option>}
                    {freeAccounts.map((a) =>
                  <option key={a.username} value={a.username}>
                        {a.username}
                        {a.displayName ? ` · ${a.displayName}` : ''}
                      </option>
                  )}
                  </Select>
                  {err('username')}
                </Field>
                {picked &&
              <div className="min-w-0 md:col-span-1 xl:col-span-2">
                    <p className="mb-1.5 text-[14px] font-medium text-gray-800">Vai trò của tài khoản</p>
                    <p className="flex h-9 items-center truncate text-[14px] text-gray-700">
                      {picked.roles.length ? picked.roles.map(roleLabel).join(' · ') : <span className="text-warning-700">Chưa có vai trò</span>}
                    </p>
                  </div>
              }
              </div>
            }
          </section>

          <section aria-labelledby="sec-staff-profile" className="px-6 py-5">
            <h2 id="sec-staff-profile" className={formSectionTitle}>
              Hồ sơ cá nhân
            </h2>
            <div className={grid}>
              <Field label="Họ tên" htmlFor="staff-name" required>
                <input {...input('name')} value={form.name} placeholder="Nguyễn Văn A" onChange={(e) => set('name', e.target.value)} />
                {err('name')}
              </Field>
              <Field label="Số hiệu" htmlFor="staff-code" required>
                <input {...input('code')} value={form.code} placeholder="VD: 045-318" className={`${input('code').className} font-mono`} onChange={(e) => set('code', e.target.value)} />
                {err('code')}
              </Field>
              <Field label="Ngày sinh" htmlFor="staff-birthDate">
                <input {...input('birthDate')} type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
                {err('birthDate')}
              </Field>
              <Field label="Giới tính" htmlFor="staff-gender">
                <Select id="staff-gender" value={form.gender} onChange={(v) => set('gender', v as StaffFormValues['gender'])}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </Select>
              </Field>
              <Field label="Quê quán" htmlFor="staff-hometown">
                <input {...input('hometown')} value={form.hometown} placeholder="Tỉnh / thành phố" onChange={(e) => set('hometown', e.target.value)} />
              </Field>
              <Field label="Số điện thoại" htmlFor="staff-phone">
                <input {...input('phone')} type="tel" value={form.phone} placeholder="0912 345 678" onChange={(e) => set('phone', e.target.value)} />
                {err('phone')}
              </Field>
              <Field label="Trình độ" htmlFor="staff-education">
                <input {...input('education')} value={form.education} placeholder="VD: Đại học" onChange={(e) => set('education', e.target.value)} />
              </Field>
              <Field label="Cấp bậc" htmlFor="staff-rank">
                <Select id="staff-rank" value={form.rank} onChange={(v) => set('rank', v)} placeholder="Chọn cấp bậc">
                  {rankOptions.map((r) =>
                  <option key={r} value={r}>
                      {r}
                    </option>
                  )}
                </Select>
              </Field>
              <Field label="Chức vụ" htmlFor="staff-position">
                <input {...input('position')} value={form.position} placeholder="VD: Trợ lý tham mưu" onChange={(e) => set('position', e.target.value)} />
              </Field>
              <Field label="Đảng viên" htmlFor="staff-partyMember">
                <label className="flex h-9 cursor-pointer items-center gap-2.5 text-[14px] text-gray-700">
                  <input id="staff-partyMember" type="checkbox" className="theme-check" checked={form.partyMember} onChange={(e) => set('partyMember', e.target.checked)} />
                  Là đảng viên
                </label>
              </Field>
            </div>
          </section>

          <section aria-labelledby="sec-staff-work" className="px-6 py-5">
            <h2 id="sec-staff-work" className={formSectionTitle}>
              Nơi công tác
            </h2>
            <div className={grid}>
              <Field label="Cơ quan, đơn vị" htmlFor="staff-agencyId" required>
                <Select
                  id="staff-agencyId"
                  value={form.agencyId}
                  invalid={!!errors.agencyId}
                  placeholder="Chưa gán"
                  onChange={(v) => {
                    setForm((f) => ({ ...f, agencyId: v, departmentId: '' }));
                    setErrors((e) => ({ ...e, agencyId: undefined }));
                  }}>
                  
                  {agencies.map((u) =>
                  <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  )}
                </Select>
                {err('agencyId')}
              </Field>
              <Field label="Phòng ban" htmlFor="staff-departmentId">
                <Select id="staff-departmentId" value={form.departmentId} disabled={!departments.length} placeholder="Chưa gán" onChange={(v) => set('departmentId', v)}>
                  <option value="">{departments.length ? 'Trực thuộc cơ quan' : 'Chưa gán'}</option>
                  {departments.map((id) =>
                  <option key={id} value={id}>
                      {findUnit(id)?.name}
                    </option>
                  )}
                </Select>
              </Field>
              <Field label="Cương vị trong đơn vị" htmlFor="staff-memberRole">
                <Select id="staff-memberRole" value={form.memberRole} onChange={(v) => set('memberRole', v as MemberRole)}>
                  {(Object.keys(memberRoleLabels) as MemberRole[]).map((r) =>
                  <option key={r} value={r}>
                      {memberRoleLabels[r]}
                    </option>
                  )}
                </Select>
              </Field>
              <Field label="Trạng thái công tác" htmlFor="staff-workStatus">
                <Select id="staff-workStatus" value={form.workStatus} onChange={(v) => set('workStatus', v as MemberStatus)}>
                  {(Object.keys(statusMeta) as MemberStatus[]).map((s) =>
                  <option key={s} value={s}>
                      {statusMeta[s].label}
                    </option>
                  )}
                </Select>
              </Field>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-6 py-3">
          <button type="submit" disabled={mode === 'edit' && !dirty || mode === 'create' && freeAccounts.length === 0} className={btnPrimary} style={btnTransition}>
            {mode === 'create' ? 'Tạo mới' : 'Lưu'}
          </button>
          <button type="button" onClick={onCancel} className={btnSecondary} style={btnTransition}>
            Huỷ
          </button>
        </div>
      </form>
    </div>);

}