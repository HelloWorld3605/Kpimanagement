import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select } from '../../components/ui/Select';
import { useTaskCatalog } from '../../contexts/TaskCatalogContext';
import { useBreadcrumbLabel } from '../../contexts/BreadcrumbContext';
import { useUnsavedChanges } from '../../contexts/UnsavedChangesContext';
import { toast } from 'sonner';
import { forceOptions, scopeOptions } from '../../data/taskCatalog';
import { CustomField, Force, TaskCatalog } from '../../types/catalog';
import { FieldsEditor } from '../../components/catalog/FieldsEditor';
import { FormField, inputClass, inputErrorClass } from '../../components/catalog/FormField';
import { GroupBadge } from '../../components/catalog/GroupBadge';
import { CURRENT_USER, TODAY, cleanOptions, emptyField, fieldErrors, suggestCode } from '../../utils/catalog';

type Mode = 'draft' | 'apply';

export function TaskCatalogCreate() {
  const navigate = useNavigate();
  const { tasks, addTask } = useTaskCatalog();
  const [force, setForce] = useState<Force>('Tham mưu');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [scope, setScope] = useState(scopeOptions[0]);
  const [output, setOutput] = useState('');
  const [unit, setUnit] = useState('');
  const [score, setScore] = useState('');
  const [basis, setBasis] = useState('');
  const [fields, setFields] = useState<CustomField[]>([emptyField()]);
  const [attempt, setAttempt] = useState<Mode | null>(null);
  useBreadcrumbLabel('Tạo danh mục nhiệm vụ');

  const suggestion = suggestCode(tasks, force);
  const scoreNum = Number(score);
  const scoreValid = score !== '' && Number.isInteger(scoreNum) && scoreNum >= 0 && scoreNum <= 100;
  const usedFields = fields.filter((f) => f.name.trim() || f.code.trim());
  useUnsavedChanges(!!(code.trim() || name.trim() || output.trim() || unit.trim() || score || basis.trim() || usedFields.length));

  const codeError = !code.trim() ?
  'Nhập mã danh mục' :
  !/^[A-Z]{2}-\d{2,}$/.test(code) ?
  'Định dạng XX-00, ví dụ TM-05' :
  tasks.some((t) => t.code === code) ?
  'Mã đã tồn tại' :
  undefined;

  const errors = {
    code: codeError,
    name: !name.trim() ? 'Nhập tên nhiệm vụ' : undefined,
    output: attempt === 'apply' && !output.trim() ? 'Nhập sản phẩm đầu ra' : undefined,
    unit: attempt === 'apply' && !unit.trim() ? 'Nhập đơn vị tính' : undefined,
    score: (attempt === 'apply' || score !== '') && !scoreValid ? 'Điểm chuẩn từ 0 đến 100' : undefined,
    basis: attempt === 'apply' && !basis.trim() ? 'Bắt buộc khi áp dụng' : undefined
  };
  const show = (k: keyof typeof errors) => attempt ? errors[k] : undefined;

  const submit = (mode: Mode) => {
    setAttempt(mode);
    const required =
    mode === 'apply' ?
    [codeError, !name.trim(), !output.trim(), !unit.trim(), !scoreValid, !basis.trim()] :
    [codeError, !name.trim(), score !== '' && !scoreValid];
    if (required.some(Boolean) || Object.keys(fieldErrors(usedFields)).length) return;

    const task: TaskCatalog = {
      code,
      force,
      createdAt: TODAY,
      status: 'active',
      versions: [
      {
        version: 1,
        status: mode === 'apply' ? 'active' : 'draft',
        effectiveFrom: mode === 'apply' ? TODAY : undefined,
        basis: mode === 'apply' ? basis.trim() : undefined,
        createdBy: CURRENT_USER,
        createdAt: TODAY,
        name: name.trim(),
        scope,
        output: output.trim(),
        unit: unit.trim(),
        score: scoreValid ? scoreNum : 0,
        fields: usedFields.map((f) => ({ ...f, name: f.name.trim(), options: mode === 'apply' ? cleanOptions(f.options) : f.options }))
      }]

    };
    addTask(task);
    toast.success(mode === 'apply' ? `Đã tạo và áp dụng ${code}` : `Đã lưu bản nháp ${code}`);
    navigate(`/danh-muc-nhiem-vu/${code}`);
  };

  return (
    <div>
      <header className="border-b border-gray-200 px-6 py-3">
        <p className="text-[14px] text-gray-600">
          Khai báo đủ trường chung và trường riêng. Sau khi áp dụng, v1 bị khoá — muốn sửa phải tạo phiên bản mới.
        </p>
      </header>

      <div className="space-y-5 p-5">
        <section className="rounded-md border border-gray-200" aria-labelledby="general-title">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 id="general-title" className="text-[15px] font-semibold text-gray-900">Thông tin chung</h2>
            <p className="mt-0.5 text-xs text-gray-500">Luôn hiển thị ở mọi danh mục. Mã và hệ lực lượng không đổi sau khi tạo.</p>
          </div>
          <div className="grid gap-x-5 gap-y-4 p-5 md:grid-cols-6">
            <FormField label="Hệ lực lượng" htmlFor="c-force" required className="md:col-span-2">
              <Select id="c-force" value={force} onChange={(v) => setForce(v as Force)}>
                {forceOptions.map((f) =>
                <option key={f}>{f}</option>
                )}
              </Select>
            </FormField>
            <FormField
              label="Mã danh mục"
              htmlFor="c-code"
              required
              error={show('code')}
              hint={`Gợi ý mã tiếp theo: ${suggestion}`}
              className="md:col-span-2">
              
              <div className="flex gap-2">
                <input
                  id="c-code"
                  value={code}
                  placeholder={suggestion}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={`${inputClass} font-medium tracking-wide ${show('code') ? inputErrorClass : ''}`} />
                
                <button
                  type="button"
                  onClick={() => setCode(suggestion)}
                  className="h-10 shrink-0 rounded-md px-3 text-[14px] font-medium text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  
                  Dùng
                </button>
              </div>
            </FormField>
            <FormField label="Tên nhiệm vụ" htmlFor="c-name" required error={show('name')} className="md:col-span-2">
              <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Soạn thảo văn bản tham mưu" className={`${inputClass} ${show('name') ? inputErrorClass : ''}`} />
            </FormField>
            <FormField label="Phạm vi áp dụng" htmlFor="c-scope" required className="md:col-span-2">
              <Select id="c-scope" value={scope} onChange={setScope}>
                {scopeOptions.map((s) =>
                <option key={s}>{s}</option>
                )}
              </Select>
            </FormField>
            <FormField label="Sản phẩm đầu ra" htmlFor="c-output" required error={show('output')} className="md:col-span-2">
              <input id="c-output" value={output} onChange={(e) => setOutput(e.target.value)} placeholder="Văn bản được ban hành, kết luận điều tra…" className={`${inputClass} ${show('output') ? inputErrorClass : ''}`} />
            </FormField>
            <FormField label="Đơn vị tính" htmlFor="c-unit" required error={show('unit')} className="md:col-span-2">
              <input id="c-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Văn bản, vụ án, hồ sơ…" className={`${inputClass} ${show('unit') ? inputErrorClass : ''}`} />
            </FormField>
            <FormField label="Điểm chuẩn (thang 100)" htmlFor="c-score" required error={show('score')} className="md:col-span-2">
              <input id="c-score" type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} placeholder="0 – 100" className={`${inputClass} ${show('score') ? inputErrorClass : ''}`} />
            </FormField>
            <div className="md:col-span-1">
              <span className="mb-1.5 block text-[13px] font-medium text-gray-600">Nhóm điểm</span>
              <div className="flex h-10 items-center">
                {scoreValid ? <GroupBadge score={scoreNum} /> : <span className="text-[14px] text-gray-500">Tự xác định theo điểm chuẩn</span>}
              </div>
            </div>
            <FormField
              label="Căn cứ áp dụng"
              htmlFor="c-basis"
              error={show('basis')}
              hint="Bắt buộc khi áp dụng; có thể bỏ trống nếu lưu nháp."
              className="md:col-span-3">
              
              <input id="c-basis" value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Số quyết định ban hành…" className={`${inputClass} ${show('basis') ? inputErrorClass : ''}`} />
            </FormField>
          </div>
        </section>

        <section className="rounded-md border border-gray-200" aria-labelledby="fields-title">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 id="fields-title" className="text-[15px] font-semibold text-gray-900">
              Trường riêng <span className="font-normal text-gray-500">· {usedFields.length}</span>
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Công việc chọn danh mục này phải điền các trường dưới đây, ngoài số lượng và thời hạn. Có thể bỏ trống nếu chỉ dùng trường chung.
            </p>
          </div>
          <div className="p-5">
            <FieldsEditor fields={fields} onChange={setFields} showErrors={attempt !== null} />
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-2 rounded-b-lg border-t border-gray-200 bg-white px-5 py-4">
        <button
          type="button"
          onClick={() => navigate('/danh-muc-nhiem-vu')}
          className="h-10 rounded-md px-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100"
          style={{ transition: 'background-color 150ms ease-out' }}>
          
          Huỷ
        </button>
        <button
          type="button"
          onClick={() => submit('draft')}
          className="h-10 rounded-md border border-gray-300 bg-white px-4 text-[14px] font-medium text-gray-800 hover:bg-gray-50 active:scale-[0.98]"
          style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
          
          Lưu bản nháp
        </button>
        <button
          type="button"
          onClick={() => submit('apply')}
          className="h-10 rounded-md bg-brand-600 px-4 text-[14px] font-medium text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
          
          Tạo và áp dụng v1
        </button>
      </div>
    </div>);

}