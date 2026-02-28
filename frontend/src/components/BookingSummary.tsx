import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import { LocationOn as LocationIcon } from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import env from '@/config/env.config'
import { strings } from '@/lang/booking-summary'
import { strings as commonStrings } from '@/lang/common'
import PriceBreakdown from '@/components/PriceBreakdown'

import '@/assets/css/booking-summary.css'

interface BookingSummaryProps {
  property: movininTypes.Property
  location?: string
  from: Date
  to: Date
  language: string
  hideBookButton?: boolean
}

const BookingSummary = ({
  property,
  location,
  from,
  to,
  language,
  hideBookButton,
}: BookingSummaryProps) => {
  const navigate = useNavigate()

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
    return date.toLocaleDateString(language === 'sr' ? 'sr-Latn' : language, options)
  }

  return (
    <div className="booking-summary">
      <div className="booking-summary-image">
        <img
          src={movininHelper.joinURL(env.CDN_PROPERTIES, property.image)}
          alt={property.name}
        />
      </div>
      <div className="booking-summary-content">
        <h3 className="booking-summary-name">{property.name}</h3>
        {property.location?.name && (
          <div className="booking-summary-location">
            <LocationIcon />
            <span>{property.location.name}</span>
          </div>
        )}
        <div className="booking-summary-dates">
          <div className="booking-summary-date">
            <span className="booking-summary-date-label">{commonStrings.FROM}</span>
            <span className="booking-summary-date-value">{formatDate(from)}</span>
          </div>
          <div className="booking-summary-date">
            <span className="booking-summary-date-label">{commonStrings.TO}</span>
            <span className="booking-summary-date-value">{formatDate(to)}</span>
          </div>
        </div>
        <PriceBreakdown
          property={property}
          from={from}
          to={to}
          language={language}
        />
        {!hideBookButton && (
          <Button
            variant="contained"
            fullWidth
            className="booking-summary-btn"
            onClick={() => {
              navigate('/checkout', {
                state: {
                  propertyId: property._id,
                  locationId: location || property.location?._id,
                  from,
                  to,
                },
              })
            }}
          >
            {strings.BOOK_NOW}
          </Button>
        )}
      </div>
    </div>
  )
}

export default BookingSummary
