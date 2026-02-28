import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FavoriteBorder } from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import env from '@/config/env.config'
import * as UserService from '@/services/UserService'
import * as PaymentService from '@/services/PaymentService'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/properties'
import PropertyInfo from '@/components/PropertyInfo'

import '@/assets/css/property-component.css'

interface PropertyProps {
  property: movininTypes.Property
  location?: string
  from?: Date
  to?: Date
  sizeAuto?: boolean
  hideAgency?: boolean
  hidePrice?: boolean
  hideActions?: boolean
  compact?: boolean
}

const Property = ({
  property,
  from,
  to,
  hidePrice,
  compact,
}: PropertyProps) => {
  const navigate = useNavigate()

  const [language, setLanguage] = useState('')
  const [days, setDays] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [nightlyPrice, setNightlyPrice] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLanguage(UserService.getLanguage())
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchPrice = async () => {
      try {
        if (from && to) {
          const _totalPrice = await PaymentService.convertPrice(movininHelper.calculateTotalPrice(property, from as Date, to as Date))
          if (!cancelled) {
            setTotalPrice(_totalPrice)
            setDays(movininHelper.days(from, to))
          }
        } else if (!hidePrice && property.price) {
          const _nightlyPrice = await PaymentService.convertPrice(property.price)
          if (!cancelled) {
            setNightlyPrice(_nightlyPrice)
          }
        }
      } catch {
        // Price conversion failed — card renders without price
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPrice()
    return () => { cancelled = true }
  }, [from, to, hidePrice, property.price]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !language || (!hidePrice && from && to && (!days || !totalPrice))) {
    return null
  }

  const handleClick = () => {
    navigate('/property', {
      state: {
        propertyId: property._id,
        from,
        to
      }
    })
  }

  const locationName = typeof property.location === 'object' && property.location?.name
    ? property.location.name
    : undefined

  return (
    <article
      key={property._id}
      className="property"
      onClick={handleClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick() }}
    >
      <div className="left-panel">
        <img
          src={movininHelper.joinURL(env.CDN_PROPERTIES, property.image)}
          alt={property.name}
          className="property-img"
        />
        <button
          type="button"
          className="property-heart"
          onClick={(e) => { e.stopPropagation() }}
          aria-label="Save"
        >
          <FavoriteBorder />
        </button>
      </div>

      <div className="middle-panel">
        <div className="name">
          <h2>{property.name}</h2>
        </div>
        {locationName && (
          <span className="property-location-text">{locationName}</span>
        )}
        {!compact && (
          <PropertyInfo
            property={property}
            className="property-info"
            language={language}
          />
        )}
      </div>

      <div className="right-panel">
        {!hidePrice && from && to && totalPrice > 0 && (
          <div className="price">
            <span className="price-main">
              {movininHelper.formatPrice(totalPrice, commonStrings.CURRENCY, language)}
            </span>
            <span className="price-day">
              {`${strings.PRICE_PER_DAY} ${movininHelper.formatPrice(totalPrice / days, commonStrings.CURRENCY, language)}`}
            </span>
          </div>
        )}
        {!hidePrice && !from && !to && nightlyPrice > 0 && (
          <div className="price">
            <span className="price-main">
              {movininHelper.formatPrice(nightlyPrice, commonStrings.CURRENCY, language)}
            </span>
            <span className="price-day">
              {strings.PER_NIGHT}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}

export default Property
