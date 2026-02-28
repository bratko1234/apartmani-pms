import React from 'react'
import { Loyalty as LoyaltyIcon } from '@mui/icons-material'
import { strings } from '@/lang/member-pricing'

import '@/assets/css/member-badge.css'

interface MemberBadgeProps {
  discountPercent: number
}

const MemberBadge = ({ discountPercent }: MemberBadgeProps) => (
  <span className="member-badge">
    <LoyaltyIcon className="member-badge-icon" />
    <span>{strings.formatString(strings.MEMBERS_SAVE, String(discountPercent))}</span>
  </span>
)

export default MemberBadge
