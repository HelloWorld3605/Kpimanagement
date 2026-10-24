import React, { useState } from 'react';
import { useAccess } from '../../contexts/AccessContext';
import { useUnsavedChanges } from '../../contexts/UnsavedChangesContext';
import { Select } from '../ui/Select';
import { btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { Field, PasswordInput, formField, formSectionTitle } from './FormParts';
import { descendantIds, findUnit, rootUnit } from '../../utils/org';
import { UserFormErrors, UserFormValues, validateUserForm } from '../../utils/userForm';
import { accountStatusMeta, accountStatusOrder } from '../../utils/accountStatus';
import { AccountStatus, RoleId } from '../../types/access';

type UserFormProps = {
  mode: 'create' | 'edit';
  initial: UserFormValues;
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
  /** Cột phụ bên phải (màn sửa) */
  aside?: React.ReactNode;
};

const deputyUnits = () => descendantIds(rootUnit.id).filter((id) => id !== rootUnit.id);

/** Form tài khoản dùng chung cho Tạo mới và Sửa: đăng nhập + vai trò. Hồ sơ nghiệp vụ ở màn Nhân sự. */
export function UserForm({ mode, initial, onSubmit, onCancel, aside }: UserFormProps) {
  const { accounts, roles } = useAccess();
  const [form, setForm] = useState<UserFormValues>(initial);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useUnsavedChanges(dirty);
  const grid = aside ? 'grid gap-x-6 gap-y-4 md:grid-cols-2 2xl:grid-cols-3' : 'grid gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-3';

  const set = <K extends keyof UserFormValues,>(key: K, value: UserFormValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleRole = (id: RoleId, on: boolean) => {
    setForm((f) => ({ ...f, roles: on ? [...f.roles, id] : f.roles.filter((r) => r !== id), deputyUnitId: id === 'chi-huy-pho' && !on ? '' : f.deputyUnitId }));
    setErrors((e) => ({ ...e, roles: undefined, deputyUnitId: undefined }));
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateUserForm(form, { mode, accounts });
    setErrors(e);
    const first = (Object.keys(e) as (keyof UserFormValues)[])[0];
    if (first) {
      document.getElementById(`user-${first}`)?.focus();
      return;
    }
    onSubmit(form);
  };

  const err = (key: keyof UserFormValues) =>
  errors[key] ?
  <p id={`user-${key}-error`} className="mt-1 text-[12px] text-brand-700">
        {errors[key]}
      </p> :
  null;
  const input = (key: keyof UserFormValues) => ({
    id: `user-${key}`,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `user-${key}-error` : undefined,
    className: `${formField} ${errors[key] ? 'border-brand-600' : 'border-gray-300'}`
  });

  const main =
  <form onSubmit={submit} noValidate className={`flex min-w-0 flex-col ${aside ? 'rounded-md border border-gray-200' : 'flex-1'}`}>
      <div className="flex-1 divide-y divide-gray-200">
        <section aria-labelledby="sec-account" className="px-6 py-5">
          <h2 id="sec-account" className={formSectionTitle}>
            Thông tin tài khoản
          </h2>
          <div className={grid}>
            <Field label="Tên đăng nhập" htmlFor="user-username" required={mode === 'create'}>
              <input
              {...input('username')}
              value={form.username}
              disabled={mode === 'edit'}
              autoComplete="off"
              placeholder="nguyenvana"
              className={`${input('username').className} font-mono`}
              onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s+/g, ''))} />
            
              {mode === 'edit' ? <p className="mt-1 text-[12px] text-gray-500">Không đổi được tên đăng nhập.</p> : err('username')}
            </Field>
            <Field label="Họ tên hiển thị" htmlFor="user-displayName" required>
              <input {...input('displayName')} value={form.displayName} placeholder="Nguyễn Văn A" onChange={(e) => set('displayName', e.target.value)} />
              {err('displayName')}
            </Field>
            <Field label="Email" htmlFor="user-email">
              <input {...input('email')} type="email" value={form.email} placeholder="nguyenvana@donvi.vn" onChange={(e) => set('email', e.target.value)} />
              {err('email')}
            </Field>
          </div>
        </section>

        <section aria-labelledby="sec-login" className="px-6 py-5">
          <h2 id="sec-login" className={formSectionTitle}>
            Đăng nhập
          </h2>
          <div className={grid}>
            {mode === 'create' &&
          <Field label="Mật khẩu ban đầu" htmlFor="user-password" required>
                <PasswordInput
              {...input('password')}
              value={form.password}
              visible={showPassword}
              onToggle={() => setShowPassword((s) => !s)}
              onChange={(v) => set('password', v)} />
            
                {err('password')}
              </Field>
          }
            <Field label="Trạng thái" htmlFor="user-status">
              <Select id="user-status" value={form.status} onChange={(v) => set('status', v as AccountStatus)}>
                {accountStatusOrder.map((s) =>
              <option key={s} value={s}>
                    {accountStatusMeta[s].label}
                  </option>
              )}
              </Select>
            </Field>
          </div>
        </section>

        <section aria-labelledby="sec-roles" className="px-6 py-5">
          <h2 id="sec-roles" className={formSectionTitle}>
            Vai trò <span className="text-brand-600">*</span>
          </h2>
          <div id="user-roles" tabIndex={-1} role="group" aria-labelledby="sec-roles" className={`grid gap-3 focus:outline-none md:grid-cols-2 ${aside ? '2xl:grid-cols-3' : 'xl:grid-cols-3'}`}>
            {roles.map((r) => {
            const on = form.roles.includes(r.id);
            return (
              <label
                key={r.id}
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 ${on ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                style={{ transition: 'border-color 120ms ease-out, background-color 120ms ease-out' }}>
                
                  <input type="checkbox" className="theme-check" checked={on} onChange={(e) => toggleRole(r.id, e.target.checked)} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-gray-900">{r.label}</span>
                    {r.description &&
                  <span className="block truncate text-[12px] text-gray-500" title={r.description}>
                        {r.description}
                      </span>
                  }
                  </span>
                </label>);

          })}
          </div>
          {err('roles')}
          {form.roles.includes('chi-huy-pho') &&
        <div className="mt-4 max-w-md">
              <Field label="Đơn vị phụ trách (Chỉ huy cấp phó)" htmlFor="user-deputyUnitId" required>
                <Select id="user-deputyUnitId" value={form.deputyUnitId} invalid={!!errors.deputyUnitId} placeholder="Chọn đơn vị phụ trách" onChange={(v) => set('deputyUnitId', v)}>
                  {deputyUnits().map((id) =>
              <option key={id} value={id}>
                      {findUnit(id)?.name}
                    </option>
              )}
                </Select>
                {err('deputyUnitId')}
              </Field>
            </div>
        }
          <p className="mt-4 text-[13px] text-gray-500">Phạm vi dữ liệu theo đơn vị chỉ có hiệu lực khi tài khoản đã gắn hồ sơ nhân sự (màn Nhân sự).</p>
        </section>
      </div>

      <div className="sticky bottom-0 z-10 flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-6 py-3">
        <button type="submit" disabled={mode === 'edit' && !dirty} className={btnPrimary} style={btnTransition}>
          {mode === 'create' ? 'Tạo mới' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className={btnSecondary} style={btnTransition}>
          Huỷ
        </button>
      </div>
    </form>;


  if (!aside) return <div className="flex flex-1 flex-col bg-white">{main}</div>;
  return (
    <div className="grid flex-1 items-start gap-4 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      {main}
      <div className="flex flex-col gap-4 lg:sticky lg:top-[60px]">{aside}</div>
    </div>);

}