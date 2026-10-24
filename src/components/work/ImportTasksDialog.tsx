import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftIcon, PlusIcon, SaveIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { Modal, btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';
import { Select } from '../ui/Select';
import { TaskNameCombo } from './TaskNameCombo';
import { KpiTask } from '../../types/work';
import { TaskCatalog } from '../../types/catalog';
import {
  IMPORT_TEMPLATES,
  ImportRow,
  ImportStatus,
  downloadImportTemplate,
  emptyRow,
  importStatusLabel,
  isBlank,
  productOptions,
  readImportFile,
  rowErrors } from
'../../utils/importTasks';
import { TODAY_ISO } from '../../utils/work';

type ImportTasksDialogProps = {
  open: boolean;
  tasks: KpiTask[];
  catalogs: TaskCatalog[];
  onClose: () => void;
  onSave: (rows: ImportRow[]) => void;
};

const START_ROWS = 5;
const th = 'border-b border-r border-gray-200 bg-gray-50 px-2 py-2 text-center text-[13px] font-semibold text-gray-700 last:border-r-0';
const td = 'border-b border-r border-gray-100 px-1.5 py-1.5 align-top last:border-r-0';
const cellInput = 'h-10 w-full rounded border bg-white px-2 text-[14px] text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const err = (bad?: string) => bad ? 'border-brand-500' : 'border-gray-300';

/** "Nạp dữ liệu": nhập nhiều nhiệm vụ trong bảng hoặc nạp từ file Excel theo mẫu, kiểm tra từng ô rồi lưu */
export function ImportTasksDialog({ open, tasks, catalogs, onClose, onSave }: ImportTasksDialogProps) {
  const [template, setTemplate] = useState<string>(IMPORT_TEMPLATES[0].id);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileNote, setFileNote] = useState<{ok: boolean;text: string;} | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const options = useMemo(() => productOptions(catalogs), [catalogs]);

  useEffect(() => {
    if (!open) return;
    setRows(Array.from({ length: START_ROWS }, () => emptyRow()));
    setTried(false);
    setFileNote(null);
  }, [open]);

  const filled = rows.filter((r) => !isBlank(r));
  const errors = rows.map((r) => isBlank(r) ? {} : rowErrors(r, tasks));
  const badCount = errors.filter((e) => Object.keys(e).length).length;
  const setRow = (key: string, patch: Partial<ImportRow>) => setRows((rs) => rs.map((r) => r.key === key ? { ...r, ...patch } : r));

  const pickFile = async (file: File) => {
    setBusy(true);
    try {
      const read = await readImportFile(file, tasks, options);
      if (!read.length) setFileNote({ ok: false, text: `${file.name}: không có dòng dữ liệu nào.` });else
      {
        setRows((rs) => [...rs.filter((r) => !isBlank(r)), ...read]);
        setFileNote({ ok: true, text: `${file.name}: đã đưa ${read.length} dòng vào bảng — kiểm tra rồi bấm Lưu.` });
      }
    } catch {
      setFileNote({ ok: false, text: 'Không đọc được file. Dùng đúng mẫu .xlsx đã tải về.' });
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    setTried(true);
    if (!filled.length || badCount) return;
    onSave(filled);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title="Nạp dữ liệu"
      description="Nhập nhiệm vụ trực tiếp trong bảng hoặc chọn file Excel theo mẫu. Gõ tên để ghép vào nhiệm vụ đã có — không chọn thì tạo nhiệm vụ mới."
      footer={
      <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-[13px] ${tried && badCount ? 'font-medium text-brand-600' : 'text-gray-600'}`} role={tried && badCount ? 'alert' : undefined}>
            {tried && badCount ? `${badCount} dòng còn lỗi — sửa các ô viền đỏ trước khi lưu` : `${filled.length} dòng có dữ liệu`}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnSecondary} style={btnTransition}>
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
              Quay lại
            </button>
            <button type="button" onClick={save} disabled={!filled.length} className={btnPrimary} style={btnTransition}>
              <SaveIcon className="h-4 w-4" aria-hidden />
              Lưu
            </button>
          </div>
        </div>
      }>
      
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <label htmlFor="imp-template" className="text-[14px] text-gray-700">
            Chọn mẫu <span className="text-brand-600">*</span>
          </label>
          <Select id="imp-template" value={template} onChange={setTemplate} wrapperClassName="w-48">
            {IMPORT_TEMPLATES.map((t) =>
            <option key={t.id} value={t.id}>
                {t.label}
              </option>
            )}
          </Select>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pickFile(f);
            e.target.value = '';
          }} />
        
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-success-600 px-3.5 text-[14px] font-medium text-white hover:bg-success-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-600 focus-visible:ring-offset-2"
          style={btnTransition}>
          
          <UploadIcon className="h-4 w-4" aria-hidden />
          {busy ? 'Đang đọc…' : 'Chọn file'}
        </button>
        <p className="text-[14px] text-gray-600">
          Tải file mẫu{' '}
          <button type="button" onClick={() => downloadImportTemplate(tasks, options)} className="font-medium text-brand-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            tại đây
          </button>
        </p>
        {fileNote && <p className={`basis-full text-[13px] ${fileNote.ok ? 'text-success-700' : 'font-medium text-brand-600'}`} role="status">{fileNote.text}</p>}
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full min-w-[1180px] border-collapse text-[14px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th scope="col" className={`${th} w-11`}>
                  <span className="sr-only">Xoá / STT</span>
                </th>
                <th scope="col" className={th}>Tên nhiệm vụ</th>
                <th scope="col" className={`${th} w-56`}>Sản phẩm/công việc</th>
                <th scope="col" className={`${th} w-36`}>Ngày bắt đầu</th>
                <th scope="col" className={`${th} w-36`}>Hạn hoàn thành</th>
                <th scope="col" className={`${th} w-36`}>Ngày hoàn thành</th>
                <th scope="col" className={`${th} w-20`}>Số lượng</th>
                <th scope="col" className={`${th} w-20`}>SL trả lại</th>
                <th scope="col" className={`${th} w-40`}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const e = tried ? errors[i] : {};
                const linked = tasks.find((t) => t.id === r.taskId);
                return (
                  <tr key={r.key} className="group">
                    <td className={`${td} text-center`}>
                      <span className="flex h-10 items-center justify-center text-[13px] tabular-nums text-gray-500 group-hover:hidden group-focus-within:hidden">{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setRows((rs) => rs.length > 1 ? rs.filter((x) => x.key !== r.key) : [emptyRow()])}
                        aria-label={`Xoá dòng ${i + 1}`}
                        className="mx-auto hidden h-10 w-8 items-center justify-center rounded bg-brand-600 text-white hover:bg-brand-700 focus-visible:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 group-hover:flex group-focus-within:flex"
                        style={btnTransition}>
                        
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </td>
                    <td className={td}>
                      <TaskNameCombo
                        id={`imp-name-${r.key}`}
                        value={r.name}
                        linkedTask={linked}
                        tasks={tasks}
                        invalid={Boolean(e.name)}
                        onType={(name) => setRow(r.key, { name, taskId: undefined })}
                        onPick={(t) => setRow(r.key, { name: t.name, taskId: t.id, productKey: t.source === 'adhoc' ? '' : t.code.split('.')[0], deadline: t.deadline })} />
                      
                    </td>
                    <td className={td}>
                      <Select
                        aria-label={`Sản phẩm/công việc dòng ${i + 1}`}
                        value={r.productKey}
                        onChange={(v) => setRow(r.key, { productKey: v })}
                        disabled={Boolean(linked)}
                        searchThreshold={8}>
                        
                        {options.map((o) =>
                        <option key={o.key || 'adhoc'} value={o.key}>
                            {o.label}
                          </option>
                        )}
                      </Select>
                    </td>
                    <td className={td}>
                      <input type="date" aria-label={`Ngày bắt đầu dòng ${i + 1}`} value={r.start} onChange={(ev) => setRow(r.key, { start: ev.target.value })} className={`${cellInput} ${err(e.start)}`} />
                    </td>
                    <td className={td}>
                      <input type="date" aria-label={`Hạn hoàn thành dòng ${i + 1}`} min={r.start} value={r.deadline} onChange={(ev) => setRow(r.key, { deadline: ev.target.value })} className={`${cellInput} ${err(e.deadline)}`} />
                      {e.deadline && <p className="mt-0.5 text-[11px] text-brand-600">{e.deadline}</p>}
                    </td>
                    <td className={td}>
                      <input type="date" aria-label={`Ngày hoàn thành dòng ${i + 1}`} max={TODAY_ISO} value={r.doneAt} onChange={(ev) => setRow(r.key, { doneAt: ev.target.value })} className={`${cellInput} ${err(e.doneAt)}`} />
                      {e.doneAt && <p className="mt-0.5 text-[11px] text-brand-600">{e.doneAt}</p>}
                    </td>
                    <td className={td}>
                      <input type="number" min={1} aria-label={`Số lượng dòng ${i + 1}`} value={r.qty} onChange={(ev) => setRow(r.key, { qty: ev.target.value })} className={`${cellInput} text-center tabular-nums ${err(e.qty)}`} />
                      {e.qty && <p className="mt-0.5 text-center text-[11px] text-brand-600">{e.qty}</p>}
                    </td>
                    <td className={td}>
                      <input type="number" min={0} aria-label={`Số lượng trả lại dòng ${i + 1}`} value={r.returned} onChange={(ev) => setRow(r.key, { returned: ev.target.value })} className={`${cellInput} text-center tabular-nums ${err(e.returned)}`} />
                      {e.returned && <p className="mt-0.5 text-center text-[11px] text-brand-600">{e.returned}</p>}
                    </td>
                    <td className={td}>
                      <Select aria-label={`Trạng thái dòng ${i + 1}`} value={r.status} onChange={(v) => setRow(r.key, { status: v as ImportStatus })}>
                        {(Object.keys(importStatusLabel) as ImportStatus[]).map((s) =>
                        <option key={s} value={s}>
                            {importStatusLabel[s]}
                          </option>
                        )}
                      </Select>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, emptyRow()])}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand-600 px-3 text-[14px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            style={btnTransition}>
            
            <PlusIcon className="h-4 w-4" aria-hidden />
            Thêm dòng
          </button>
          <p className="text-[14px] tabular-nums text-gray-700">Tổng số dòng: {rows.length}</p>
        </div>
      </div>
    </Modal>);

}