import React from 'react'
import { AccountCircle } from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import env from '@/config/env.config'

import '@/assets/css/agency-badge.css'

interface AgencyBadgeProps {
  agency: movininTypes.User
}

const AgencyBadge = ({ agency }: AgencyBadgeProps) => (agency
    ? (
      <div className="agency-badge">
        <span className="agency-badge-logo">
          {agency.avatar
            ? <img src={movininHelper.joinURL(env.CDN_USERS, agency.avatar)} alt={agency.fullName} />
            : <AccountCircle className="avatar-medium" color="disabled" />}
        </span>
        <span className="agency-badge-text">{agency.fullName}</span>
      </div>
    )
    : <></>)

export default AgencyBadge
