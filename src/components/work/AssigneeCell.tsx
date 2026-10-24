import React from 'react';
import { UsersIcon } from 'lucide-react';
import { Assignee } from '../../types/work';
import { assigneeLabel } from '../../utils/work';
import { MemberAvatar } from '../org/MemberAvatar';

/** Người / đơn vị chủ trì — đơn vị có biểu tượng nhóm để phân biệt với cá nhân */
export function AssigneeCell({ assignee }: {assignee: Assignee;}) {
  const l = assigneeLabel(assignee);
  return (
    <span className="flex min-w-0 items-center gap-2">
      {l.isUnit ?
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600" aria-hidden>
          <UsersIcon className="h-3.5 w-3.5" />
        </span> :

      <MemberAvatar name={l.primary} size="sm" />
      }
      <span className="min-w-0">
        <span className="block truncate text-gray-900">{l.primary}</span>
        <span className="block truncate text-xs text-gray-500">{l.secondary}</span>
      </span>
    </span>);

}