import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import { customRoleId, useAccess } from '../../contexts/AccessContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { useGuardedNavigate, useUnsavedChanges } from '../../contexts/UnsavedChangesContext';
import { RolePermissionGrid } from '../../components/admin/RolePermissionGrid';
import { btnPrimary, btnSecondary, btnTransition } from '../../components/ui/Modal';
import { grantedCount, roleCode } from '../../utils/permissions';
import { normalize } from '../../utils/org';
import { RoleFeatures, RoleId } from '../../types/access';

type Errors = Partial<Record<'code' | 'label', string>>;

const input =
'w-full rounded-md border bg-white px-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

/** Tạo vai trò mới: thông tin vai trò + cấp quyền chức năng ngay trên một màn */
export function RoleCreate() {
  const navigate = useNavigate();
  const goBack = useGuardedNavigate();
  const { roles, addRole } = useAccess();
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [map, setMap] = useState<RoleFeatures[RoleId]>({});
  const [errors, setErrors] = useState<Errors>({});
  useBreadcrumbLabel('Tạo vai trò');

  const granted = grantedCount(map);
  useUnsavedChanges(!!(code.trim() || label.trim() || description.trim() || granted));

  const validate = (): Errors => {
    const e: Errors = {};
    const c = code.trim();
    if (!c) e.code = 'Nhập mã vai trò.';else
    if (!/^[A-Z][A-Z0-9_]*$/.test(c)) e.code = 'Chỉ dùng chữ in hoa không dấu, số và dấu gạch dưới, bắt đầu bằng chữ.';else
    if (roles.some((r) => roleCode(r.id) === c || r.id === customRoleId(c))) e.code = 'Mã vai trò đã tồn tại.';
    if (!label.trim()) e.label = 'Nhập tên vai trò.';else
    if (roles.some((r) => normalize(r.label) === normalize(label.trim()))) e.label = 'Tên vai trò đã tồn tại.';
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(e.code ? 'role-code' : 'role-label')?.focus();
      return;
    }
    const id = addRole({ code, label, description }, map);
    toast.success(`Đã tạo vai trò ${label.trim()} với ${granted} quyền`);
    navigate(`/vai-tro/${id}`);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col bg-white">
      <div className="flex-1 px-4 pb-6 pt-3">
        <Link
          to="/vai-tro"
          className="inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'color 150ms ease-out' }}>
          
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Danh sách vai trò
        </Link>

        <section aria-labelledby="role-info" className="mt-4 rounded-md border border-gray-200">
          <h2 id="role-info" className="border-b border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-gray-900">
            Thông tin vai trò
          </h2>
          <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.7fr)]">
            <div>
              <label htmlFor="role-code" className="mb-1.5 block text-[13px] font-medium text-gray-700">
                Mã vai trò <span className="text-brand-600">*</span>
              </label>
              <input
                id="role-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'));
                  if (errors.code) setErrors((x) => ({ ...x, code: undefined }));
                }}
                placeholder="VD: KE_TOAN"
                aria-invalid={!!errors.code}
                aria-describedby={errors.code ? 'role-code-error' : undefined}
                className={`${input} h-9 font-mono ${errors.code ? 'border-brand-600' : 'border-gray-300'}`} />
              
              {errors.code &&
              <p id="role-code-error" className="mt-1 text-[12px] text-brand-700">
                  {errors.code}
                </p>
              }
            </div>
            <div>
              <label htmlFor="role-label" className="mb-1.5 block text-[13px] font-medium text-gray-700">
                Tên vai trò <span className="text-brand-600">*</span>
              </label>
              <input
                id="role-label"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  if (errors.label) setErrors((x) => ({ ...x, label: undefined }));
                }}
                placeholder="VD: Cán bộ thống kê"
                aria-invalid={!!errors.label}
                aria-describedby={errors.label ? 'role-label-error' : undefined}
                className={`${input} h-9 ${errors.label ? 'border-brand-600' : 'border-gray-300'}`} />
              
              {errors.label &&
              <p id="role-label-error" className="mt-1 text-[12px] text-brand-700">
                  {errors.label}
                </p>
              }
            </div>
            <div>
              <label htmlFor="role-description" className="mb-1.5 block text-[13px] font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                id="role-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
                placeholder="Vai trò này dùng để làm gì"
                className={`${input} min-h-[36px] resize-y border-gray-300 py-[7px]`} />
              
            </div>
          </div>
        </section>

        <section aria-labelledby="role-perms" className="mt-5">
          <h2 id="role-perms" className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-gray-900">
            Quyền
            <span className={`rounded-full px-1.5 text-[12px] tabular-nums ${granted ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>{granted}</span>
          </h2>
          <RolePermissionGrid value={map} editing onChange={setMap} />
          <p className="mt-2 text-[12px] text-gray-500">Thêm, sửa tự bật Xem; Xoá tự bật Thêm, sửa. Phạm vi dữ liệu chỉnh sau tại màn Phạm vi dữ liệu.</p>
        </section>
      </div>

      <div className="sticky bottom-0 z-10 flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-3">
        <button type="submit" className={btnPrimary} style={btnTransition}>
          Tạo mới
        </button>
        <button type="button" onClick={() => goBack('/vai-tro')} className={btnSecondary} style={btnTransition}>
          Huỷ
        </button>
      </div>
    </form>);

}