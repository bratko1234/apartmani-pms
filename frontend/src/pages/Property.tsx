import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Button,
  FormControl,
} from '@mui/material'
import {
  SingleBed as BedroomsIcon,
  Shower as BathroomsIcon,
  AcUnit as AirconIcon,
  Countertops as KitchensIcon,
  DirectionsCar as ParkingSpacesIcon,
  Chair as FurnishedIcon,
  Pets as PetsAllowedIcon,
  PhotoSizeSelectSmall as SizeIcon,
} from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import Layout from '@/components/Layout'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/properties'
import { strings as cpStrings } from '@/lang/property'
import * as helper from '@/utils/helper'
import * as PropertyService from '@/services/PropertyService'
import * as UserService from '@/services/UserService'
import * as PaymentService from '@/services/PaymentService'
import NoMatch from './NoMatch'
import ImageViewer from '@/components/ImageViewer'
import DatePicker from '@/components/DatePicker'
import PriceBreakdown from '@/components/PriceBreakdown'
import Footer from '@/components/Footer'
import Progress from '@/components/Progress'

import '@/assets/css/property.css'

const Property = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const _minDate = new Date()
  _minDate.setDate(_minDate.getDate() + 1)

  const [loading, setLoading] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [property, setProperty] = useState<movininTypes.Property>()
  const [image, setImage] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [minDate, setMinDate] = useState<Date>()
  const [maxDate, setMaxDate] = useState<Date>()
  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [nightlyPrice, setNightlyPrice] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    const src = (_image: string) => movininHelper.joinURL(env.CDN_PROPERTIES, _image)

    if (property) {
      const _image = src(property.image)
      setImage(_image)
      const _images = property.images ? property.images.map(src) : []
      const __images = [_image, ..._images]
      setImages(__images)
    }
  }, [property])

  useEffect(() => {
    if (openImageDialog) {
      document.body.classList.add('stop-scrolling')
    } else {
      document.body.classList.remove('stop-scrolling')
    }
  }, [openImageDialog])

  const onLoad = async () => {
    const { state } = location
    if (!state) {
      setNoMatch(true)
      return
    }
    const { propertyId } = state
    const { from: _from } = state
    const { to: _to } = state

    if (!propertyId) {
      setNoMatch(true)
      return
    }

    setLoading(true)
    const _language = UserService.getLanguage()
    setLanguage(_language)
    setFrom(_from || undefined)
    setTo(_to || undefined)
    setMinDate(_from || undefined)
    if (_to) {
      const _maxDate = new Date(_to)
      _maxDate.setDate(_maxDate.getDate() - 1)
      setMaxDate(_maxDate)
    }

    try {
      const _property = await PropertyService.getProperty(propertyId)

      if (_property) {
        setProperty(_property)
        if (_property.price) {
          const _nightlyPrice = await PaymentService.convertPrice(_property.price)
          setNightlyPrice(_nightlyPrice)
        }
      } else {
        setNoMatch(true)
      }
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
    }
  }

  const locationName = property?.location && typeof property.location === 'object' && property.location.name
    ? property.location.name
    : undefined

  const amenities: Array<{ icon: React.ReactNode; label: string }> = []
  if (property) {
    if (property.bedrooms > 0) {
      amenities.push({ icon: <BedroomsIcon />, label: `${property.bedrooms} ${cpStrings.BEDROOMS}` })
    }
    if (property.bathrooms > 0) {
      amenities.push({ icon: <BathroomsIcon />, label: `${property.bathrooms} ${cpStrings.BATHROOMS}` })
    }
    if (property.kitchens > 0) {
      amenities.push({ icon: <KitchensIcon />, label: `${property.kitchens} ${cpStrings.KITCHENS}` })
    }
    if (property.parkingSpaces > 0) {
      amenities.push({ icon: <ParkingSpacesIcon />, label: `${property.parkingSpaces} ${cpStrings.PARKING_SPACES}` })
    }
    if (property.size) {
      amenities.push({ icon: <SizeIcon />, label: `${movininHelper.formatNumber(property.size, language)} ${env.SIZE_UNIT}` })
    }
    if (property.aircon) {
      amenities.push({ icon: <AirconIcon />, label: cpStrings.AIRCON })
    }
    if (property.furnished) {
      amenities.push({ icon: <FurnishedIcon />, label: cpStrings.FURNISHED })
    }
    if (property.petsAllowed) {
      amenities.push({ icon: <PetsAllowedIcon />, label: cpStrings.PETS_ALLOWED })
    }
  }

  const descriptionHtml = property?.description || ''
  const isLongDescription = descriptionHtml.length > 300

  return (
    <Layout onLoad={onLoad}>
      {
        !loading && property && image
        && (
          <>
            <div className="main-page">
              <div className="property-detail">

                {/* Image Gallery Grid */}
                <div className="gallery">
                  <div
                    className="gallery-main"
                    onClick={() => {
                      setCurrentIndex(0)
                      setOpenImageDialog(true)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setCurrentIndex(0)
                        setOpenImageDialog(true)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="View gallery"
                  >
                    <img alt={property.name} src={image} />
                  </div>
                  {images.length > 1 && (
                    <div className="gallery-thumbs">
                      {images.slice(1, 5).map((_image, index) => (
                        <div
                          key={_image}
                          className="gallery-thumb"
                          onClick={() => {
                            setCurrentIndex(index + 1)
                            setOpenImageDialog(true)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setCurrentIndex(index + 1)
                              setOpenImageDialog(true)
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label="View image"
                        >
                          <img alt="" src={_image} />
                          {index === 3 && images.length > 5 && (
                            <div className="gallery-thumb-more">
                              +{images.length - 5}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Two-column content */}
                <div className="property-content">
                  <div className="property-main">
                    <h1 className="property-name">{property.name}</h1>

                    {/* Location summary line: "Entire apartment in Trebinje" */}
                    <div className="property-summary">
                      {locationName && (
                        <span>
                          {`${strings.ENTIRE_PLACE} · ${locationName}`}
                        </span>
                      )}
                    </div>

                    {/* Quick stats: 2 bedrooms · 1 bath · 65 m² */}
                    <div className="property-quick-stats">
                      {property.bedrooms > 0 && (
                        <span>{`${property.bedrooms} ${cpStrings.BEDROOMS}`}</span>
                      )}
                      {property.bathrooms > 0 && (
                        <span>{`${property.bathrooms} ${cpStrings.BATHROOMS}`}</span>
                      )}
                      {property.size && (
                        <span>{`${movininHelper.formatNumber(property.size, language)} ${env.SIZE_UNIT}`}</span>
                      )}
                    </div>

                    {/* Description */}
                    {descriptionHtml && (
                      <div className="property-description">
                        <div
                          className={`property-description-text${!descExpanded && isLongDescription ? ' collapsed' : ''}`}
                          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                        />
                        {isLongDescription && (
                          <button
                            type="button"
                            className="property-show-more"
                            onClick={() => setDescExpanded(!descExpanded)}
                          >
                            {descExpanded ? strings.SHOW_LESS : strings.SHOW_MORE}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Amenities grid */}
                    {amenities.length > 0 && (
                      <div className="property-amenities">
                        <h2 className="property-section-title">{strings.WHAT_THIS_PLACE_OFFERS}</h2>
                        <div className="amenities-grid">
                          {amenities.map((amenity) => (
                            <div key={amenity.label} className="amenity-item">
                              {amenity.icon}
                              <span>{amenity.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking sidebar widget */}
                  <div className="property-sidebar">
                    <div className="property-booking-form">
                      {/* Price per night header */}
                      {nightlyPrice > 0 && (
                        <div className="booking-widget-price">
                          <span className="booking-widget-price-amount">
                            {movininHelper.formatPrice(nightlyPrice, commonStrings.CURRENCY, language)}
                          </span>
                          <span className="booking-widget-price-unit">{strings.PER_NIGHT}</span>
                        </div>
                      )}

                      <form
                        className="booking-form"
                        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                          e.preventDefault()

                          navigate('/checkout', {
                            state: {
                              propertyId: property._id,
                              locationId: property.location._id,
                              from,
                              to
                            }
                          })
                        }}
                      >
                        <div className="booking-form-dates">
                          <FormControl className="booking-form-field">
                            <DatePicker
                              label={commonStrings.FROM}
                              value={from}
                              minDate={new Date()}
                              maxDate={maxDate}
                              variant="outlined"
                              required
                              onChange={(date) => {
                                if (date) {
                                  if (to && to.getTime() <= date.getTime()) {
                                    setTo(undefined)
                                  }

                                  const __minDate = new Date(date)
                                  __minDate.setDate(date.getDate() + 1)
                                  setMinDate(__minDate)
                                } else {
                                  setMinDate(_minDate)
                                }

                                setFrom(date || undefined)
                              }}
                              language={UserService.getLanguage()}
                            />
                          </FormControl>
                          <FormControl className="booking-form-field">
                            <DatePicker
                              label={commonStrings.TO}
                              value={to}
                              minDate={minDate}
                              variant="outlined"
                              required
                              onChange={(date) => {
                                if (date) {
                                  setTo(date)
                                  const _maxDate = new Date(date)
                                  _maxDate.setDate(_maxDate.getDate() - 1)
                                  setMaxDate(_maxDate)
                                } else {
                                  setTo(undefined)
                                  setMaxDate(undefined)
                                }
                              }}
                              language={UserService.getLanguage()}
                            />
                          </FormControl>
                        </div>

                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          className="booking-form-btn"
                        >
                          {strings.BOOK}
                        </Button>
                      </form>

                      {/* Price breakdown (shown when dates selected) */}
                      {from && to && (
                        <PriceBreakdown
                          property={property}
                          from={from}
                          to={to}
                          language={language}
                        />
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {
                openImageDialog
                && (
                  <ImageViewer
                    src={images}
                    currentIndex={currentIndex}
                    closeOnClickOutside
                    title={property.name}
                    onClose={() => {
                      setOpenImageDialog(false)
                    }}
                  />
                )
              }
            </div>

            <Footer />
          </>
        )
      }

      {loading && <Progress />}
      {noMatch && <NoMatch hideHeader />}
    </Layout>
  )
}

export default Property
