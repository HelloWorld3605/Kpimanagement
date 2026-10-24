import React, { useMemo, useRef, useState } from 'react';
import { DownloadIcon, FileSpreadsheetIcon, Loader2Icon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DraftRow, ParsedRow, guessLevel, levelShort, parseOutline } from '../../utils/orgEditor';
import { downloadOrgTemplate, readOrgFile } from '../../utils/orgEditorXlsx';
import { btnPrimary, btnSecondary, btnTransition } from '../ui/Modal';

type OrgBulkPanelProps = {
  rows: DraftRow[];
  numbers: string[];
  activeKey?: string;
  onApply: (parsed: ParsedRow[], targetKey: string, mode: 'append' | 'replace') => void;
};

const EXAMPLE = `Phòng Tham mưu
  Đội Tổng hợp
  Đội Kế hoạch
Tiểu đoàn 1
  Đại đội 11
    Trung đội 1
    Trung đội 2
  Đại đội 12`;

/** Nhập nhiều đơn vị một lần: dán danh sách thụt lề / đánh số, hoặc nạp file Excel theo mẫu */
export function OrgBulkPanel({ rows, numbers, activeKey, onApply }: OrgBulkPanelProps) {
  const [text, setText] = useState('');
  const [fromFile, setFromFile] = useState<{name: string;rows: ParsedRow[];} | null>(null);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [target, setTarget] = useState<string>();
  const [busy, setBusy] = useState<'file' | 'template' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const targetKey = target && rows.some((r) => r.key === target) ? target : activeKey ?? rows[0]?.key ?? '';
  const parsed = useMemo(() => fromFile ? fromFile.rows : parseOutline(text), [fromFile, text]);
  const depthMax = parsed.reduce((m, r) => Math.max(m, r.depth), 0);

  const apply = () => {
    if (!parsed.length) return;
    onApply(parsed, targetKey, mode);
    toast.success(`Đã đưa ${parsed.length} đơn vị vào cây — kiểm tra rồi bấm Lưu thay đổi`);
    setText('');
    setFromFile(null);
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy('file');
    try {
      const list = await readOrgFile(file);
      if (!list.length) toast.error('Không đọc được dòng nào — kiểm tra file có đúng mẫu không');
      setFromFile({ name: file.name, rows: list });
    } catch {
      toast.error('Không mở được file. Hãy dùng file .xlsx theo mẫu.');
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-0 flex-col">
      <div className="space-y-3 border-b border-gray-200 p-4">
        <div>
          <h3 className="text-[14px] font-semibold text-gray-900">Nhập hàng loạt</h3>
          <p className="mt-0.5 text-[12px] leading-5 text-gray-500">
            Mỗi dòng một đơn vị. Thụt lề (Tab hoặc 2 dấu cách), đánh số 1 / 1.1 / 1.1.1 hoặc gạch đầu dòng - / -- để thể hiện cấp. Dán thẳng từ Word, Excel đều được.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              setBusy('template');
              await downloadOrgTemplate(rows).finally(() => setBusy(null));
            }}
            className={`${btnSecondary} h-9 px-3 text-[13px]`}
            style={btnTransition}>
            
            {busy === 'template' ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" aria-hidden />}
            Tải file mẫu
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={`${btnSecondary} h-9 px-3 text-[13px]`} style={btnTransition}>
            {busy === 'file' ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <UploadIcon className="h-4 w-4" aria-hidden />}
            Chọn file Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx" className="sr-only" tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        <p className="text-[12px] text-gray-500">File mẫu có sẵn cơ cấu hiện tại — sửa trong Excel rồi nạp lại với “Thay toàn bộ”.</p>

        {fromFile ?
        <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-[13px] text-gray-700">
              <FileSpreadsheetIcon className="h-4 w-4 shrink-0 text-success-600" aria-hidden />
              <span className="truncate">{fromFile.name}</span>
            </span>
            <button type="button" onClick={() => setFromFile(null)} className="shrink-0 rounded text-[13px] font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Bỏ file
            </button>
          </div> :

        <label className="block">
            <span className="sr-only">Danh sách đơn vị</span>
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Tab trong ô dán = thụt lề, không chuyển ô
              if (e.key !== 'Tab') return;
              e.preventDefault();
              const el = e.currentTarget;
              const { selectionStart: s, selectionEnd: en } = el;
              const next = `${text.slice(0, s)}\t${text.slice(en)}`;
              setText(next);
              requestAnimationFrame(() => el.setSelectionRange(s + 1, s + 1));
            }}
            rows={9}
            placeholder={EXAMPLE}
            spellCheck={false}
            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-[13px] leading-5 text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          
          </label>
        }

        <fieldset className="space-y-1.5">
          <legend className="mb-1 text-[13px] font-medium text-gray-700">Đưa vào</legend>
          <label className="flex items-start gap-2 text-[13px] text-gray-700">
            <input type="radio" name="bulk-mode" checked={mode === 'append'} onChange={() => setMode('append')} className="mt-0.5 h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500" />
            <span className="min-w-0 flex-1">
              Thêm làm trực thuộc của
              <select
                value={targetKey}
                onChange={(e) => setTarget(e.target.value)}
                disabled={mode !== 'append'}
                aria-label="Đơn vị cha"
                className="mt-1 block h-8 w-full rounded border border-gray-300 bg-white px-2 text-[13px] text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50">
                
                {rows.map((r, i) =>
                <option key={r.key} value={r.key}>
                    {'\u00A0'.repeat(r.depth * 3)}
                    {numbers[i] ? `${numbers[i]} ` : ''}
                    {r.name || '(chưa đặt tên)'}
                  </option>
                )}
              </select>
            </span>
          </label>
          <label className="flex items-start gap-2 text-[13px] text-gray-700">
            <input type="radio" name="bulk-mode" checked={mode === 'replace'} onChange={() => setMode('replace')} className="mt-0.5 h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500" />
            <span>
              Thay toàn bộ cơ cấu dưới đơn vị gốc
              <span className="block text-[12px] text-gray-500">Đơn vị trùng tên và vị trí giữ nguyên mã, cán bộ không bị ảnh hưởng.</span>
            </span>
          </label>
        </fieldset>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <p className="text-[13px] font-medium text-gray-700">
          Xem trước{' '}
          <span className="font-normal tabular-nums text-gray-500">
            {parsed.length ? `· ${parsed.length} đơn vị · ${depthMax} cấp` : '· chưa có dòng nào'}
          </span>
        </p>
        {parsed.length > 0 &&
        <ul className="mt-2 space-y-0.5 text-[13px]">
            {parsed.slice(0, 200).map((r, i) =>
          <li key={i} className="flex items-baseline gap-2" style={{ paddingLeft: (r.depth - 1) * 16 }}>
                <span className="min-w-0 truncate text-gray-900">{r.name}</span>
                <span className="shrink-0 text-[11px] text-gray-400">{r.level ? levelShort(r.level) : guessLevel(r.name) ? levelShort(guessLevel(r.name)!) : 'theo cấp cha'}</span>
              </li>
          )}
          </ul>
        }
      </div>

      <div className="border-t border-gray-200 p-4">
        <button type="button" onClick={apply} disabled={!parsed.length} className={`${btnPrimary} h-9 w-full text-[13px]`} style={btnTransition}>
          {mode === 'replace' ? `Thay cơ cấu bằng ${parsed.length || ''} đơn vị` : `Thêm ${parsed.length || ''} đơn vị vào cây`}
        </button>
      </div>
    </div>);

}