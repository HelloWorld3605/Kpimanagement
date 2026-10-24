import React from 'react';
import { CheckIcon, StarIcon, XIcon } from 'lucide-react';
import { Rank } from '../../types/selfReview';
import { rankShort } from '../../utils/selfReview';
import { StatusPill } from '../catalog/StatusPill';

export function RankBadge({ rank }: {rank: Rank;}) {
  if (rank === 'excellent')
  return (
    <StatusPill tone="success">
        <StarIcon className="h-3 w-3" aria-hidden />
        {rankShort(rank)}
      </StatusPill>);

  if (rank === 'fail')
  return (
    <StatusPill tone="brand">
        <XIcon className="h-3 w-3" aria-hidden />
        {rankShort(rank)}
      </StatusPill>);

  return (
    <StatusPill tone="neutral">
      <CheckIcon className="h-3 w-3" aria-hidden />
      {rankShort(rank)}
    </StatusPill>);

}