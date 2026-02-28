import React from 'react'
import {
  VerifiedUser as BestPriceIcon,
  EventAvailable as FreeCancelIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material'
import { strings } from '@/lang/trust-badges'

import '@/assets/css/trust-badges.css'

const TrustBadges = () => (
  <div className="trust-badges">
    <div className="trust-badge">
      <div className="trust-badge-icon">
        <BestPriceIcon />
      </div>
      <div className="trust-badge-text">
        <span className="trust-badge-title">{strings.BEST_PRICE_TITLE}</span>
        <span className="trust-badge-subtitle">{strings.BEST_PRICE_SUBTITLE}</span>
      </div>
    </div>
    <div className="trust-badge">
      <div className="trust-badge-icon">
        <FreeCancelIcon />
      </div>
      <div className="trust-badge-text">
        <span className="trust-badge-title">{strings.FREE_CANCEL_TITLE}</span>
        <span className="trust-badge-subtitle">{strings.FREE_CANCEL_SUBTITLE}</span>
      </div>
    </div>
    <div className="trust-badge">
      <div className="trust-badge-icon">
        <SupportIcon />
      </div>
      <div className="trust-badge-text">
        <span className="trust-badge-title">{strings.SUPPORT_TITLE}</span>
        <span className="trust-badge-subtitle">{strings.SUPPORT_SUBTITLE}</span>
      </div>
    </div>
  </div>
)

export default TrustBadges
