import React, { useEffect, useState } from 'react'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import * as PaymentService from '@/services/PaymentService'
import * as DiscountService from '@/services/DiscountService'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/price-breakdown'
import { strings as memberStrings } from '@/lang/member-pricing'

import '@/assets/css/price-breakdown.css'
import '@/assets/css/member-badge.css'

interface PriceBreakdownProps {
  property: movininTypes.Property
  from: Date
  to: Date
  language: string
  user?: movininTypes.User
}

const PriceBreakdown = ({
  property,
  from,
  to,
  language,
  user,
}: PriceBreakdownProps) => {
  const [totalPrice, setTotalPrice] = useState(0)
  const [discount, setDiscount] = useState<movininTypes.DiscountResult | null>(null)
  const [loading, setLoading] = useState(true)

  const days = movininHelper.days(from, to)

  useEffect(() => {
    const fetchPrice = async () => {
      const _totalPrice = await PaymentService.convertPrice(
        movininHelper.calculateTotalPrice(property, from, to)
      )
      setTotalPrice(_totalPrice)

      // Fetch discount if user is a member
      if (user?.isMember && user._id) {
        try {
          const discountResult = await DiscountService.calculateDiscount(
            property._id,
            from,
            to,
            user._id,
          )

          if (discountResult.discountPercent > 0) {
            // Convert discount amounts to display currency
            const convertedOriginal = await PaymentService.convertPrice(discountResult.originalPrice)
            const convertedDiscount = await PaymentService.convertPrice(discountResult.discountAmount)
            const convertedFinal = await PaymentService.convertPrice(discountResult.finalPrice)

            setDiscount({
              ...discountResult,
              originalPrice: convertedOriginal,
              discountAmount: convertedDiscount,
              finalPrice: convertedFinal,
            })
          }
        } catch {
          // Discount service unavailable is non-fatal
        }
      } else {
        setDiscount(null)
      }

      setLoading(false)
    }

    fetchPrice()
  }, [property, from, to, user])

  if (loading || !days || !totalPrice) {
    return null
  }

  const hasDiscount = discount && discount.discountPercent > 0
  const displayTotal = hasDiscount ? discount.finalPrice : totalPrice
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

      {hasDiscount && (
        <div className="price-breakdown-discount">
          <span className="price-breakdown-discount-label">
            {`${memberStrings.MEMBER_DISCOUNT} (-${discount.discountPercent}%)`}
          </span>
          <span className="price-breakdown-discount-value">
            {`-${movininHelper.formatPrice(discount.discountAmount, commonStrings.CURRENCY, language)}`}
          </span>
        </div>
      )}

      <div className="price-breakdown-total">
        <span className="price-breakdown-total-label">{strings.TOTAL}</span>
        <span className="price-breakdown-total-value">
          {movininHelper.formatPrice(displayTotal, commonStrings.CURRENCY, language)}
        </span>
      </div>
    </div>
  )
}

export default PriceBreakdown
