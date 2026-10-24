import React from 'react';
import { Select } from '../ui/Select';
import { directMembers, findUnit } from '../../utils/org';

type AssigneeSelectProps = {
  id: string;
  /** 'u:<unitId>' | 'm:<memberId>' */
  value: string;
  onChange: (key: string) => void;
  unitIds: string[];
  /** Cho phép giao cho đơn vị (việc KPI) */
  allowUnits: boolean;
  excludeMemberIds?: string[];
  placeholder?: string;
  invalid?: boolean;
  /** Chỉ hiện đơn vị hoặc chỉ hiện cá nhân (khi đã chọn hình thức phân công) */
  only?: 'unit' | 'member';
};

/** Chọn người chủ trì trong phạm vi đơn vị — phòng/đội được lấy theo người được chọn */
export function AssigneeSelect({ id, value, onChange, unitIds, allowUnits, excludeMemberIds = [], placeholder = 'Chọn người chủ trì', invalid, only }: AssigneeSelectProps) {
  const showUnits = only ? only === 'unit' : allowUnits;
  const showMembers = only !== 'unit';
  const groups = (showMembers ? unitIds : []).
  map((uid) => ({ unit: findUnit(uid), members: directMembers(uid).filter((m) => !excludeMemberIds.includes(m.id)) })).
  filter((g) => g.unit && g.members.length > 0);

  return (
    <Select id={id} value={value} onChange={onChange} invalid={invalid} placeholder={placeholder}>
        {showUnits && (
      only === 'unit' ?
      unitIds.map((uid) =>
      <option key={uid} value={`u:${uid}`} className="text-gray-800">
                {findUnit(uid)?.name}
              </option>
      ) :

      <optgroup label="Giao cho đơn vị (tính KPI tập thể)">
              {unitIds.map((uid) =>
        <option key={uid} value={`u:${uid}`} className="text-gray-800">
                  {findUnit(uid)?.name}
                </option>
        )}
            </optgroup>)
      }
        {groups.map((g) =>
      <optgroup key={g.unit!.id} label={allowUnits && !only ? `Cá nhân · ${g.unit!.name}` : g.unit!.name}>
            {g.members.map((m) =>
        <option key={m.id} value={`m:${m.id}`} className="text-gray-800">
                {m.name} — {m.position}
              </option>
        )}
          </optgroup>
      )}
    </Select>);

}