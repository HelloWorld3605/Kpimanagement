import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, GitBranchIcon, LockIcon } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { useProfile } from '../contexts/ProfileContext';
import { useBreadcrumbLabel } from '../contexts/BreadcrumbContext';
import { FormField, inputClass, inputErrorClass } from '../components/catalog/FormField';
import { rankOptions } from '../data/profile';
import { Profile } from '../types/profile';
import { ProfileErrors, sameProfile, validateProfile } from '../utils/profile';
import { usePermissions } from '../hooks/usePermissions';
import { unitPath } from '../utils/org';
import { ProfileAvatarPicker } from '../components/ProfileAvatarPicker';

import { toast } from 'sonner';
import { useUnsavedChanges } from '../contexts/UnsavedChangesContext';

export function ProfilePage() {
  useBreadcrumbLabel('Hồ sơ cá nhân');
  const { profile, saveProfile } = useProfile();
  const [form, setForm] = useState<Profile>(profile);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saved, setSaved] = useState(false);

  const dirty = !sameProfile(form, profile);
  useUnsavedChanges(dirty);
  const { member } = usePermissions();
  const path = member ? unitPath(member.unitId) : [];
  const workUnit = path[path.length - 1];
  const parentUnit = path.length > 1 ? path[path.length - 2] : workUnit;

  // Đổi tài khoản → nạp lại hồ sơ của cán bộ tương ứng
  useEffect(() => {
    setForm(profile);
    setErrors({});
  }, [profile]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const set = <K extends keyof Profile,>(key: K, value: Profile[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    setSaved(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateProfile(form);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    saveProfile({ ...form, code: form.code.trim(), name: form.name.trim().replace(/\s+/g, ' ') });
    setSaved(true);
    toast.success('Đã lưu hồ sơ cá nhân');
  };

  const field = (key: keyof Profile) => `${inputClass} ${errors[key] ? inputErrorClass : ''}`;

  return (
    <form onSubmit={submit} noValidate>
      <div className="border-b border-gray-200 px-4 py-5">
        <ProfileAvatarPicker name={form.name || profile.name} value={form.avatar} onChange={(v) => set('avatar', v)}>
          <p className="truncate text-lg font-semibold text-gray-900">{profile.name}</p>
          <p className="mt-0.5 text-[14px] text-gray-600">
            Số hiệu {profile.code}
            {profile.rank && ` · ${profile.rank}`}
            {profile.position && ` · ${profile.position}`}
            {workUnit && ` · ${workUnit.name}`}
          </p>
        </ProfileAvatarPicker>
      </div>

      <div className="divide-y divide-gray-200">
        <Section index={1} title="Thông tin cá nhân" description="Thông tin định danh, dùng trên phiếu tự đánh giá và các báo cáo.">
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <FormField label="Số hiệu" htmlFor="code" required error={errors.code}>
              <input id="code" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="Ví dụ: 123-456" className={`${field('code')} tabular-nums`} />
            </FormField>
            <FormField label="Họ và tên" htmlFor="name" required error={errors.name}>
              <input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" className={field('name')} />
            </FormField>
            <FormField label="Ngày sinh" htmlFor="birthDate" error={errors.birthDate}>
              <input id="birthDate" type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} className={field('birthDate')} />
            </FormField>
            <FormField label="Quê quán" htmlFor="hometown">
              <input id="hometown" value={form.hometown} onChange={(e) => set('hometown', e.target.value)} placeholder="Xã/phường, huyện/quận, tỉnh/thành phố" className={field('hometown')} />
            </FormField>
          </div>
        </Section>

        <Section index={2} title="Cấp bậc & Chức vụ" description="Cập nhật khi có quyết định thăng cấp, nâng lương hoặc điều động.">
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <FormField label="Cấp bậc" htmlFor="rank">
              <SelectBox id="rank" value={form.rank} onChange={(v) => set('rank', v)}>
                <option value="">-- Chọn cấp bậc --</option>
                {rankOptions.map((r) =>
                <option key={r} value={r}>
                    {r}
                  </option>
                )}
              </SelectBox>
            </FormField>
            <FormField label="Hệ số lương" htmlFor="salary" error={errors.salaryCoefficient}>
              <input
                id="salary"
                inputMode="decimal"
                value={form.salaryCoefficient}
                onChange={(e) => set('salaryCoefficient', e.target.value)}
                placeholder="Ví dụ: 5,70"
                className={`${field('salaryCoefficient')} tabular-nums`} />
              
            </FormField>
            <FormField label="Chức vụ" htmlFor="position">
              <input id="position" value={form.position} onChange={(e) => set('position', e.target.value)} placeholder="Ví dụ: Cán bộ, Phó Đại đội trưởng" className={field('position')} />
            </FormField>
            <FormField label="Công tác chuyên trách" htmlFor="specialty">
              <input id="specialty" value={form.specialty} onChange={(e) => set('specialty', e.target.value)} placeholder="Lĩnh vực phụ trách" className={field('specialty')} />
            </FormField>
          </div>
        </Section>

        <Section
          index={3}
          title="Biên chế đơn vị"
          description={
          <span className="inline-flex items-center gap-1.5">
              <GitBranchIcon className="h-3.5 w-3.5" />
              Tự động từ Cây tổ chức
            </span>
          }>
          
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <FormField label="ĐV Chủ quản" htmlFor="parentUnit" hint="Theo cây tổ chức, không chỉnh sửa">
              <LockedInput id="parentUnit" value={parentUnit?.name ?? '—'} />
            </FormField>
            <FormField label="Đơn vị công tác" htmlFor="workUnit" hint="Thay đổi khi có quyết định điều động">
              <LockedInput id="workUnit" value={workUnit?.name ?? '—'} />
            </FormField>
          </div>
          {path.length > 0 &&
          <p className="mt-4 text-[13px] text-gray-500">
              {path.map((u, i) =>
            <React.Fragment key={u.id}>
                  {i > 0 && <span className="mx-1.5 text-gray-300">›</span>}
                  <span className={i === path.length - 1 ? 'font-medium text-gray-900' : 'text-gray-700'}>{u.shortName ?? u.name}</span>
                </React.Fragment>
            )}
            </p>
          }
        </Section>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3">
        <div className="min-h-[20px] text-[14px]" aria-live="polite">
          <AnimatePresence mode="wait">
            {saved ?
            <motion.span
              key="saved"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center gap-1.5 font-medium text-success-700">
              
                <CheckIcon className="h-4 w-4" />
                Đã lưu hồ sơ
              </motion.span> :

            <motion.span key="state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="text-gray-500">
                {dirty ? 'Có thay đổi chưa lưu' : 'Hồ sơ đã cập nhật'}
              </motion.span>
            }
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!dirty}
            onClick={() => {
              setForm(profile);
              setErrors({});
            }}
            className="h-10 rounded-md px-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            style={{ transition: 'background-color 150ms ease-out' }}>
            
            Hoàn tác
          </button>
          <button
            type="submit"
            disabled={!dirty}
            className="h-10 rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
            
            Lưu thay đổi
          </button>
        </div>
      </div>
    </form>);

}

function Section({ index, title, description, children }: {index: number;title: string;description: React.ReactNode;children: React.ReactNode;}) {
  return (
    <section aria-labelledby={`profile-s${index}`} className="grid gap-4 px-4 py-6 lg:grid-cols-[260px_1fr] lg:gap-10">
      <div>
        <h2 id={`profile-s${index}`} className="text-[15px] font-semibold text-gray-900">
          {index}. {title}
        </h2>
        <p className="mt-1 text-[13px] text-gray-500">{description}</p>
      </div>
      <div className="max-w-4xl">{children}</div>
    </section>);

}

function LockedInput({ id, value }: {id: string;value: string;}) {
  return (
    <div className="relative">
      <input id={id} value={value} disabled className={`${inputClass} pr-9`} />
      <LockIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
    </div>);

}

type SelectBoxProps = {id: string;value: string;onChange: (v: string) => void;disabled?: boolean;children: React.ReactNode;};

function SelectBox({ id, value, onChange, disabled, children }: SelectBoxProps) {
  return (
    <Select id={id} value={value} disabled={disabled} onChange={onChange}>
      {children}
    </Select>);

}