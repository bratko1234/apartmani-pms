import React, { useState } from 'react'
import { Dialog, DialogContent } from '@mui/material'
import * as movininTypes from ':movinin-types'
import env from '@/config/env.config'
import { strings } from '@/lang/home'
import * as CountryService from '@/services/CountryService'
import * as PropertyService from '@/services/PropertyService'
import Layout from '@/components/Layout'
import SearchForm from '@/components/SearchForm'
import LocationCarrousel from '@/components/LocationCarrousel'
import PropertyCarousel from '@/components/PropertyCarousel'
import Footer from '@/components/Footer'

import '@/assets/css/home.css'

interface LocationWithProperties {
  location: movininTypes.Location
  properties: movininTypes.Property[]
}

const Home = () => {
  const [countries, setCountries] = useState<movininTypes.CountryInfo[]>([])
  const [featuredProperties, setFeaturedProperties] = useState<movininTypes.Property[]>([])
  const [locationProperties, setLocationProperties] = useState<LocationWithProperties[]>([])
  const [openLocationSearchFormDialog, setOpenLocationSearchFormDialog] = useState(false)
  const [location, setLocation] = useState('')

  const onLoad = async () => {
    try {
      const _countries = await CountryService.getCountriesWithLocations('', false, 1)
      setCountries(_countries)

      // Fetch featured properties (first 8, no filters required)
      const CAROUSEL_SIZE = 8
      const featuredResult = await PropertyService.getFeaturedProperties(1, CAROUSEL_SIZE)
      if (featuredResult && featuredResult.length > 0) {
        setFeaturedProperties(featuredResult[0].resultData)
      }

      // Fetch per-location properties for up to 3 locations
      const allLocations = _countries.flatMap((c) => c.locations ?? [])
      const topLocations = allLocations.slice(0, 5)

      const locResults = (
        await Promise.all(
          topLocations.map(async (loc): Promise<LocationWithProperties | null> => {
            try {
              const result = await PropertyService.getFeaturedProperties(1, CAROUSEL_SIZE, loc._id)
              if (result && result.length > 0 && result[0].resultData.length > 0) {
                return { location: loc, properties: result[0].resultData }
              }
            } catch {
              // Skip locations that fail to load
            }
            return null
          })
        )
      ).filter((r): r is LocationWithProperties => r !== null)

      setLocationProperties(locResults)
    } catch {
      // Countries/featured fetch failed — page renders with empty sections
    }
  }

  return (
    <Layout onLoad={onLoad} strict={false}>
      <div className="home">

        {/* Search Hero */}
        <div className="home-search">
          <h1 className="home-search-title">{strings.HERO_TITLE}</h1>
          <div className="home-search-form">
            <SearchForm />
          </div>
        </div>

        {/* Featured Properties Carousel */}
        {featuredProperties.length > 0 && (
          <PropertyCarousel
            title={strings.FEATURED_TITLE}
            properties={featuredProperties}
          />
        )}

        {/* Destinations */}
        {countries.length > 0 && (
          <div className="destinations">
            <div className="section-header">
              <h2>{strings.DESTINATIONS_TITLE}</h2>
            </div>
            <div className="destinations-carousel">
              {countries.map((country) => (
                <LocationCarrousel
                  key={country._id}
                  locations={country.locations ?? []}
                  onSelect={(_location) => {
                    setLocation(_location._id)
                    setOpenLocationSearchFormDialog(true)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Per-Location Property Carousels */}
        {locationProperties.map(({ location: loc, properties }) => (
          <PropertyCarousel
            key={loc._id}
            title={`${strings.STAY_IN} ${loc.name}`}
            properties={properties}
          />
        ))}

        <Footer />
      </div>

      <Dialog
        fullWidth={env.isMobile}
        maxWidth={false}
        open={openLocationSearchFormDialog}
        onClose={() => {
          setOpenLocationSearchFormDialog(false)
        }}
      >
        <DialogContent className="search-dialog-content">
          <SearchForm
            location={location}
          />
        </DialogContent>
      </Dialog>

    </Layout>
  )
}

export default Home
