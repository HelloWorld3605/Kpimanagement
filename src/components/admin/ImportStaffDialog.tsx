import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangleIcon, CheckCircle2Icon, DownloadIcon, RefreshCwIcon, UploadIcon } from 'lucide-react';
import { Modal, btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { useAccess } from '../../contexts/AccessContext';
import {
  STAFF_DEFAULT_PASSWORD,
  StaffImportRow,
  accountForMember,
  downloadCreatedAccounts,
  downloadStaffTemplate,
  readStaffFile,
  usernameOfCode } from
'../../utils/staffAccount';
import { memberRoleLabels } from '../../utils/staff';
import { findUnit } from '../../utils/org';

type ImportStaffDialogProps = {open: boolean;onClose: () => void;};

const th = 'border-b border-gray-200 bg-gray-50 px-3 py-2 text-left text-[13px] font-semibold text-gray-700';
const td = 'border-b border-gray-100 px-3 py-2 align-top';

/**
 * Nhập nhân sự từ Excel: dòng mới tạo nhân sự + tài khoản (tên đăng nhập = số hiệu, mật khẩu ban đầu phải đổi);
 * bật "Cập nhật nhân sự đã có" thì dòng trùng số hiệu cập nhật hồ sơ đó.
 */
export function ImportStaffDialog({ open, onClose }: ImportStaffDialogProps) {
  const { units, members, accounts, addMember, addAccount, updateMember } = useAccess();
  const [rows, setRows] = useState<StaffImportRow[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const valid = rows?.filter((r) => !r.errors.length) ?? [];
  const invalid = rows?.filter((r) => r.errors.length) ?? [];
  const toCreate = valid.filter((r) => !r.existingId);
  const toUpdate = valid.filter((r) => r.existingId);

  const close = () => {
    setRows(null);
    setFile(null);
    onClose();
  };

  const load = async (f: File, update: boolean) => {
    try {
      const list = await readStaffFile(f, units, members, accounts, update);
      setRows(list);
      setFile(f);
      if (!list.length) toast.warning('File không có dòng dữ liệu nào.');
    } catch {
      toast.error('Không đọc được file. Dùng đúng file mẫu (.xlsx).');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = () => {
    const stamp = Date.now().toString(36);
    const created = toCreate.map((r, i) => {
      const member = { id: `m-${stamp}-${i}`, ...r.member };
      addMember(member);
      addAccount(accountForMember(member));
      return { code: member.code, name: member.name, unit: findUnit(member.unitId)?.name ?? '' };
    });
    toUpdate.forEach((r) => updateMember(r.existingId as string, r.member));
    const parts = [created.length && `tạo ${created.length} nhân sự + tài khoản`, toUpdate.length && `cập nhật ${toUpdate.length} nhân sự`].filter(Boolean);
    toast.success(`Đã ${parts.join(', ')}`, {
      description: invalid.length ? `Bỏ qua ${invalid.length} dòng lỗi.` : undefined,
      duration: 12000,
      action: created.length ? { label: 'Tải danh sách tài khoản', onClick: () => downloadCreatedAccounts(created) } : undefined
    });
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="xl"
      title="Nhập nhân sự từ Excel"
      description={`Mỗi dòng mới tạo một nhân sự và một tài khoản: tên đăng nhập = số hiệu, mật khẩu ban đầu ${STAFF_DEFAULT_PASSWORD} (phải đổi ở lần đăng nhập đầu).`}
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-gray-600" aria-live="polite">
            {rows ? `${toCreate.length} tạo mới · ${toUpdate.length} cập nhật · ${invalid.length} dòng lỗi (bỏ qua)` : 'Chưa chọn file.'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={close} className={btnSecondary} style={btnTransition}>
              Huỷ
            </button>
            <button type="button" onClick={save} disabled={!valid.length} className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`} style={btnTransition}>
              Lưu {valid.length || ''} dòng hợp lệ
            </button>
          </div>
        </div>
      }>

      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept=".xlsx" className="sr-only" id="staff-import-file" onChange={(e) => e.target.files?.[0] && load(e.target.files[0], updateExisting)} />
          <label htmlFor="staff-import-file" className={`${btnPrimary} cursor-pointer`} style={btnTransition}>
            <UploadIcon className="h-4 w-4" aria-hidden />
            Chọn file
          </label>
          <button type="button" onClick={() => downloadStaffTemplate(units)} className={btnSecondary} style={btnTransition}>
            <DownloadIcon className="h-4 w-4" aria-hidden />
            Tải file mẫu
          </button>
          {file && <span className="truncate text-[13px] text-gray-600">{file.name}</span>}
        </div>
        <label className="flex items-start gap-2.5 text-[14px] text-gray-700">
          <input
            type="checkbox"
            className="theme-check mt-0.5"
            checked={updateExisting}
            onChange={(e) => {
              setUpdateExisting(e.target.checked);
              if (file) load(file, e.target.checked);
            }} />

          <span>
            Cập nhật nhân sự đã có (khớp theo số hiệu)
            <span className="block text-[12px] text-gray-500">Ô để trống giữ nguyên giá trị cũ; không tạo thêm tài khoản, không đổi mật khẩu.</span>
          </span>
        </label>

        {rows && rows.length > 0 &&
        <div className="max-h-[55vh] overflow-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[860px] border-collapse text-[14px] text-gray-700">
              <thead className="sticky top-0">
                <tr>
                  <th scope="col" className={`${th} w-14`}>Dòng</th>
                  <th scope="col" className={th}>Số hiệu → tài khoản</th>
                  <th scope="col" className={th}>Họ tên</th>
                  <th scope="col" className={th}>Cấp bậc · Chức vụ</th>
                  <th scope="col" className={th}>Cương vị</th>
                  <th scope="col" className={th}>Đơn vị</th>
                  <th scope="col" className={th}>Kiểm tra</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) =>
              <tr key={r.line} className={r.errors.length ? 'bg-brand-50/50' : ''}>
                    <td className={`${td} tabular-nums text-gray-500`}>{r.line}</td>
                    <td className={`${td} font-mono text-[13px]`}>
                      {r.member.code || '—'}
                      {r.member.code && <span className="block text-gray-500">{usernameOfCode(r.member.code)}</span>}
                    </td>
                    <td className={td}>{r.member.name || '—'}</td>
                    <td className={td}>{[r.member.rank, r.member.position].filter(Boolean).join(' · ')}</td>
                    <td className={td}>
                      {memberRoleLabels[r.member.role]}
                      {r.roleInferred && <span className="block text-[12px] text-warning-700">Suy ra từ chức vụ — kiểm tra</span>}
                    </td>
                    <td className={td}>{findUnit(r.member.unitId)?.name ?? r.unitText}</td>
                    <td className={td}>
                      {r.errors.length ?
                  <ul className="space-y-0.5 text-[13px] text-brand-700">
                          {r.errors.map((e) =>
                    <li key={e} className="flex gap-1.5">
                              <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                              {e}
                            </li>
                    )}
                        </ul> :
                  r.existingId ?
                  <span className="flex items-center gap-1.5 text-[13px] text-gray-700">
                          <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden />
                          Cập nhật
                        </span> :

                  <span className="flex items-center gap-1.5 text-[13px] text-success-700">
                          <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden />
                          Tạo mới
                        </span>
                  }
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>
    </Modal>);

}
