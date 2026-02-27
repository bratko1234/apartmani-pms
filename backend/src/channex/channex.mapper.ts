import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'

/**
 * Map internal property to Channex property format.
 */
export const propertyToChannex = (property: env.Property, locationName?: string): Record<string, unknown> => ({
  title: property.name,
  description: property.description,
  currency: 'EUR',
  address: property.address || '',
  city: locationName || '',
  latitude: property.latitude,
  longitude: property.longitude,
  property_type: mapPropertyType(property.type),
  group_id: env.CHANNEX_PROPERTY_GROUP_ID || undefined,
  content: {
    description: property.description,
    photos: property.images?.map((img, idx) => ({
      url: `${env.CDN_PROPERTIES}/${img}`,
      position: idx,
    })) || [],
  },
  facilities: buildFacilities(property),
})

/**
 * Map Channex booking webhook payload to internal booking data.
 */
export const channexBookingToInternal = (
  channexBooking: Record<string, unknown>,
): {
  from: Date
  to: Date
  source: movininTypes.BookingSource
  channexBookingId: string
  channexReservationId?: string
  externalGuestName?: string
  price: number
  status: movininTypes.BookingStatus
} => {
  const attributes = (channexBooking.attributes || channexBooking) as Record<string, unknown>
  const arrival = attributes.arrival_date as string
  const departure = attributes.departure_date as string
  const otaName = (attributes.ota_name || attributes.source || '') as string

  return {
    from: new Date(arrival),
    to: new Date(departure),
    source: mapOtaSource(otaName),
    channexBookingId: (channexBooking.id || attributes.id || '') as string,
    channexReservationId: (attributes.reservation_id || '') as string,
    externalGuestName: extractGuestName(attributes),
    price: Number(attributes.total_price || attributes.amount || 0),
    status: mapChannexStatus(attributes.status as string),
  }
}

/**
 * Map internal rates to Channex rate format.
 */
export const ratesToChannex = (
  ratePlanId: string,
  dates: { date: string; rate: number; minStay?: number }[],
): Record<string, unknown>[] =>
  dates.map((d) => ({
    rate_plan_id: ratePlanId,
    date: d.date,
    rate: d.rate,
    min_stay_arrival: d.minStay || 1,
  }))

const mapPropertyType = (type: movininTypes.PropertyType): string => {
  const typeMap: Record<string, string> = {
    [movininTypes.PropertyType.Apartment]: 'apartment',
    [movininTypes.PropertyType.House]: 'house',
    [movininTypes.PropertyType.Townhouse]: 'townhouse',
    [movininTypes.PropertyType.Commercial]: 'commercial',
    [movininTypes.PropertyType.Farm]: 'farm',
    [movininTypes.PropertyType.Industrial]: 'industrial',
    [movininTypes.PropertyType.Plot]: 'plot',
  }
  return typeMap[type] || 'apartment'
}

const mapOtaSource = (otaName: string): movininTypes.BookingSource => {
  const lower = otaName.toLowerCase()
  if (lower.includes('airbnb')) {
    return movininTypes.BookingSource.Airbnb
  }
  if (lower.includes('booking.com') || lower.includes('bookingcom')) {
    return movininTypes.BookingSource.BookingCom
  }
  if (lower.includes('expedia')) {
    return movininTypes.BookingSource.Expedia
  }
  if (lower.includes('direct') || lower === '') {
    return movininTypes.BookingSource.Direct
  }
  return movininTypes.BookingSource.Other
}

const mapChannexStatus = (status: string): movininTypes.BookingStatus => {
  const statusMap: Record<string, movininTypes.BookingStatus> = {
    new: movininTypes.BookingStatus.Pending,
    confirmed: movininTypes.BookingStatus.Reserved,
    modified: movininTypes.BookingStatus.Reserved,
    cancelled: movininTypes.BookingStatus.Cancelled,
  }
  return statusMap[status?.toLowerCase()] || movininTypes.BookingStatus.Pending
}

const extractGuestName = (attributes: Record<string, unknown>): string => {
  const guest = attributes.guest as Record<string, unknown> | undefined
  if (guest) {
    const first = (guest.first_name || '') as string
    const last = (guest.last_name || '') as string
    return `${first} ${last}`.trim()
  }
  return (attributes.guest_name || '') as string
}

const buildFacilities = (property: env.Property): Record<string, unknown>[] => {
  const facilities: Record<string, unknown>[] = []

  if (property.bedrooms) {
    facilities.push({ type: 'bedroom', count: property.bedrooms })
  }
  if (property.bathrooms) {
    facilities.push({ type: 'bathroom', count: property.bathrooms })
  }
  if (property.kitchens) {
    facilities.push({ type: 'kitchen', count: property.kitchens })
  }
  if (property.parkingSpaces) {
    facilities.push({ type: 'parking', count: property.parkingSpaces })
  }
  if (property.aircon) {
    facilities.push({ type: 'air_conditioning', count: 1 })
  }
  if (property.petsAllowed) {
    facilities.push({ type: 'pets_allowed', count: 1 })
  }

  return facilities
}
