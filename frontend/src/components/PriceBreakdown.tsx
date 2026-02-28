import React, { useEffect, useState } from 'react'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import * as PaymentService from '@/services/PaymentService'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/price-breakdown'

import '@/assets/css/price-breakdown.css'

interface PriceBreakdownProps {
  property: movininTypes.Property
  from: Date
  to: Date
  language: string
}

const PriceBreakdown = ({
  property,
  from,
  to,
  language,
}: PriceBreakdownProps) => {
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(true)

  const days = movininHelper.days(from, to)

  useEffect(() => {
    const fetchPrice = async () => {
      const _totalPrice = await PaymentService.convertPrice(
        movininHelper.calculateTotalPrice(property, from, to)
      )
      setTotalPrice(_totalPrice)
      setLoading(false)
    }

    fetchPrice()
  }, [property, from, to])

  if (loading || !days || !totalPrice) {
    return null
  }

  const pricePerNight = totalPrice / days

  return (
    <div className="price-breakdown">
      <div className="price-breakdown-line">
        <span className="price-breakdown-label">
          {`${movininHelper.formatPrice(pricePerNight, commonStrings.CURRENCY, language)} × ${days} ${strings.NIGHTS}`}
        </span>
        <span className="price-breakdown-value">
          {movininHelper.formatPrice(totalPrice, commonStrings.CURRENCY, language)}
        </span>
      </div>
      <div className="price-breakdown-total">
        <span className="price-breakdown-total-label">{strings.TOTAL}</span>
        <span className="price-breakdown-total-value">
          {movininHelper.formatPrice(totalPrice, commonStrings.CURRENCY, language)}
        </span>
      </div>
    </div>
  )
}

export default PriceBreakdown
