import React, { ReactNode, useRef } from 'react'
import ReactSlick from 'react-slick'
import { Button } from '@mui/material'
import {
  ArrowRight,
  ArrowLeft,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import * as movininHelper from ':movinin-helper'
import * as movininTypes from ':movinin-types'
import env from '@/config/env.config'
import { strings } from '@/lang/location-carrousel'
import { strings as commonStrings } from '@/lang/common'
import Slick from '@/components/Slick'

import '@/assets/css/location-carrousel.css'

const LOCATION_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
]

interface LocationCarrouselProps {
  locations: movininTypes.Location[]
  onSelect?: (location: movininTypes.Location) => void
}

const LocationCarrousel = ({
  locations,
  onSelect,
}: LocationCarrouselProps) => {
  const slider = useRef<ReactSlick>(null)

  const sliderSettings = {
    arrows: false,
    dots: true,

    appendDots: (dots: ReactNode) => (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <Button variant="text" className="btn-slider btn-slider-prev" onClick={() => slider?.current?.slickPrev()}>
          <ArrowLeft />
          {commonStrings.BACK}
        </Button>
        <ul style={{ margin: '0px', padding: '0px' }}>
          {dots}
        </ul>
        <Button variant="text" className="btn-slider btn-slider-next" onClick={() => slider?.current?.slickNext()}>
          {commonStrings.NEXT}
          <ArrowRight />
        </Button>
      </div>
    ),
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    variableWidth: true,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: false,
        }
      }
    ]
  }

  return (
    <div className="location-caroussel">
      <Slick ref={slider} {...sliderSettings}>
        {locations.map((location, index) => (
          <div
            key={location._id}
            className="box"
            onClick={() => {
              if (onSelect) {
                onSelect(location)
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
                e.preventDefault()
                onSelect(location)
              }
            }}
          >
            <div className="location-image">
              {
                location.image ? (
                  <img alt={location.name} src={movininHelper.joinURL(env.CDN_LOCATIONS, location.image)} />
                )
                  : (
                    <div
                      className="location-placeholder"
                      style={{ background: LOCATION_GRADIENTS[index % LOCATION_GRADIENTS.length] }}
                    >
                      <LocationIcon className="location-placeholder-icon" />
                    </div>
                  )
              }
            </div>
            <div className="title">
              <h2>{location.name}</h2>
            </div>
            <Button
              variant="text"
              color="inherit"
              className="btn-location"
              tabIndex={-1}
            >
              {strings.SELECT_LOCATION}
            </Button>
          </div>
        ))}
      </Slick>
    </div>
  )
}

export default LocationCarrousel
