import React, { useRef } from 'react'
import ReactSlick from 'react-slick'
import { IconButton } from '@mui/material'
import {
  ArrowBackIosNew,
  ArrowForwardIos,
} from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import Slick from '@/components/Slick'
import Property from '@/components/Property'

import '@/assets/css/property-carousel.css'

interface PropertyCarouselProps {
  title: string
  properties: movininTypes.Property[]
}

const PropertyCarousel = ({
  title,
  properties,
}: PropertyCarouselProps) => {
  const slider = useRef<ReactSlick>(null)

  const sliderSettings = {
    arrows: false,
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 5,
    slidesToScroll: 5,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  return (
    <section className="property-carousel">
      <div className="property-carousel-header">
        <h2>{title}</h2>
        <div className="property-carousel-nav">
          <IconButton
            className="property-carousel-arrow"
            onClick={() => slider.current?.slickPrev()}
            size="small"
          >
            <ArrowBackIosNew fontSize="small" />
          </IconButton>
          <IconButton
            className="property-carousel-arrow"
            onClick={() => slider.current?.slickNext()}
            size="small"
          >
            <ArrowForwardIos fontSize="small" />
          </IconButton>
        </div>
      </div>
      <div className="property-carousel-track">
        <Slick ref={slider} {...sliderSettings}>
          {properties.map((property) => (
            <div key={property._id} className="property-carousel-slide">
              <Property property={property} compact />
            </div>
          ))}
        </Slick>
      </div>
    </section>
  )
}

export default PropertyCarousel
