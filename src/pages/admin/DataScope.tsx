import { DataTable } from '../../components/ui/DataTable';
import React, { useState } from 'react';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { useAccess } from '../../contexts/AccessContext';
import { globalBlocks, resourceFeature, resourceLabels, roles, scopeLabels, selfResources } from '../../data/roles';
import { members } from '../../data/orgMembers';
import { HorizontalSwipe } from '../../components/ui/HorizontalSwipe';
import { Select } from '../../components/ui/Select';
import { Action, ResourceId, ScopeKind } from '../../types/access';
import { decide } from '../../utils/access';
import { findMember } from '../../utils/org';

const resources = Object.keys(resourceLabels) as ResourceId[];
const kinds = Object.keys(scopeLabels) as ScopeKind[];
const field = 'h-9 rounded-md border border-gray-300 bg-white px-2 text-[13px] focus:border-brand-500 focus:outline-none';

export function DataScope() {
  const { accounts, features, scopes, setScope } = useAccess();
  const policy = { features, scopes };
  const [username, setUsername] = useState(accounts[1]?.username ?? '');
  const [memberId, setMemberId] = useState('m39');
  const [resource, setResource] = useState<ResourceId>('review');
  const [action, setAction] = useState<Action>('view');

  const account = accounts.find((a) => a.username === username);
  const target = findMember(memberId);
  const view = account && target ? decide(policy, account, resource, 'view', { unitId: target.unitId, memberId: target.id, reviewStatus: 'submitted' }) : undefined;
  const result =
  account && target ? decide(policy, account, resource, action, { unitId: target.unitId, memberId: target.id, reviewStatus: 'submitted' }) : undefined;

  return (
    <div className="space-y-6 bg-white px-4 py-4">
      <p className="text-[13px] text-gray-500">Phạm vi cộng dồn theo vai trò. Ô vàng: vai trò có chức năng nhưng chưa khai phạm vi.</p>

      <section aria-labelledby="coverage" className="overflow-hidden rounded-md border border-gray-200">
        <h2 id="coverage" className="sr-only">Ma trận phủ</h2>
        <HorizontalSwipe containerProps={{ 'aria-label': 'Ma trận phạm vi' }}>
          <DataTable className="w-full min-w-[1100px] border-collapse text-[13px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 px-3 py-3 text-left font-semibold text-gray-700">Vai trò</th>
                {resources.map((r) =>
                <th key={r} className="border-b border-l border-gray-200 px-2 py-3 text-left font-semibold text-gray-700">
                    {resourceLabels[r].split(' (')[0]}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) =>
              <tr key={role.id} className="border-b border-gray-200 last:border-b-0">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900">{role.label}</td>
                  {resources.map((r) => {
                  const hasFeature = features[role.id]?.[resourceFeature[r]]?.includes('view');
                  const kind = scopes[role.id]?.[r];
                  if (!hasFeature) return <td key={r} className="border-l border-gray-200 px-2 py-2 text-gray-300">Không có chức năng</td>;
                  const gap = !kind;
                  return (
                    <td key={r} className={`border-l border-gray-200 px-2 py-2 ${gap ? 'bg-warning-50' : 'bg-success-50/40'}`}>
                        <Select
                        aria-label={`${role.label} · ${resourceLabels[r]}`}
                        value={kind ?? ''}
                        disabled={role.id === 'sieu-quan-tri'}
                        onChange={(v) => setScope(role.id, r, (v || null) as ScopeKind | null)}
                        className={`${field} w-full ${gap ? 'text-warning-700' : 'text-gray-800'}`}>
                        
                          <option value="">{selfResources.includes(r) ? 'Chưa khai · chỉ bản thân' : 'Chưa khai'}</option>
                          {kinds.map((k) =>
                        <option key={k} value={k}>
                              {scopeLabels[k]}
                            </option>
                        )}
                        </Select>
                      </td>);

                })}
                </tr>
              )}
            </tbody>
          </DataTable>
        </HorizontalSwipe>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section aria-labelledby="blocks">
          <h2 id="blocks" className="text-[15px] font-semibold text-gray-900">Chặn toàn cục</h2>
          <ul className="mt-2 divide-y divide-gray-100">
            {globalBlocks.map((b) =>
            <li key={b.id} className="py-2.5">
                <p className="text-[14px] font-medium text-gray-900">{b.label}</p>
                <p className="text-[13px] text-gray-500">{b.description}</p>
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="why" className="rounded-md border border-gray-200 p-4">
          <h2 id="why" className="text-[15px] font-semibold text-gray-900">Vì sao?</h2>
          <p className="text-[13px] text-gray-500">Chọn tài khoản và bản ghi (phiếu giả định đã gửi) để xem có thấy / sửa được không.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Select aria-label="Tài khoản" value={username} onChange={setUsername} className={`${field} w-full text-gray-800`}>
              {accounts.map((a) =>
              <option key={a.username} value={a.username}>
                  {a.username} · {findMember(a.memberId)?.name}
                </option>
              )}
            </Select>
            <Select aria-label="Cán bộ của bản ghi" value={memberId} onChange={setMemberId} className={`${field} w-full text-gray-800`}>
              {members.map((m) =>
              <option key={m.id} value={m.id}>
                  {m.name} · {m.position}
                </option>
              )}
            </Select>
            <Select aria-label="Loại bản ghi" value={resource} onChange={(v) => setResource(v as ResourceId)} className={`${field} w-full text-gray-800`}>
              {resources.map((r) =>
              <option key={r} value={r}>
                  {resourceLabels[r]}
                </option>
              )}
            </Select>
            <Select aria-label="Thao tác" value={action} onChange={(v) => setAction(v as Action)} className={`${field} w-full text-gray-800`}>
              <option value="view">Xem</option>
              <option value="write">Sửa</option>
            </Select>
          </div>
          {result && view &&
          <ul className="mt-3 space-y-1.5 text-[13px]">
              {[{ label: 'Thấy', d: view }, ...(action === 'write' ? [{ label: 'Sửa', d: result }] : [])].map(({ label, d }) =>
            <li key={label} className={`flex items-start gap-2 rounded-md px-3 py-2 ${d.allowed ? 'bg-success-50 text-success-700' : 'bg-brand-50 text-brand-700'}`}>
                  {d.allowed ? <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>
                    <b>{d.allowed ? label : `Không ${label.toLowerCase()}`}</b> · {d.reason}
                  </span>
                </li>
            )}
            </ul>
          }
        </section>
      </div>
    </div>);

}