import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'

/**
 * Build photo array for Channex content.
 * Requires MI_PUBLIC_BACKEND_URL to be set — Channex needs publicly accessible URLs.
 */
const buildPhotos = (property: env.Property): Record<string, unknown>[] => {
  if (!env.PUBLIC_BACKEND_URL) {
    return []
  }

  const baseUrl = env.PUBLIC_BACKEND_URL.replace(/\/$/, '')
  const allImages = [property.image, ...(property.images || [])].filter(Boolean)

  return allImages.map((img, idx) => ({
    url: `${baseUrl}/cdn/movinin/properties/${img}`,
    position: idx,
    kind: 'photo',
  }))
}

/**
 * Map internal property to Channex property format.
 * See: https://docs.channex.io/api-v.1-documentation/hotels-collection
 */
export const propertyToChannex = (property: env.Property, locationName?: string): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    title: property.name,
    currency: 'EUR',
    email: 'info@apartmani.ba',
    phone: '+38759123456',
    country: 'BA',
    state: 'Republika Srpska',
    city: locationName || 'Trebinje',
    address: property.address || '',
    zip_code: '89101',
    timezone: 'Europe/Sarajevo',
    latitude: property.latitude != null ? String(property.latitude) : undefined,
    longitude: property.longitude != null ? String(property.longitude) : undefined,
    property_type: mapPropertyType(property.type),
    facilities: [],
    content: {
      description: property.description || '',
      photos: buildPhotos(property),
    },
    settings: {
      allow_availability_autoupdate_on_confirmation: true,
      allow_availability_autoupdate_on_modification: false,
      allow_availability_autoupdate_on_cancellation: false,
    },
  }

  if (env.CHANNEX_PROPERTY_GROUP_ID) {
    payload.group_id = env.CHANNEX_PROPERTY_GROUP_ID
  }

  return payload
}

/**
 * Map PMS property to Channex room type format.
 * 1 property = 1 room type (1 apartment = 1 room).
 */
export const propertyToRoomType = (
  property: env.Property,
  channexPropertyId: string,
): Record<string, unknown> => {
  const defaultOccupancy = property.bedrooms ? property.bedrooms * 2 : 2

  return {
    property_id: channexPropertyId,
    title: property.name,
    count_of_rooms: 1,
    occ_adults: defaultOccupancy,
    occ_children: property.bedrooms || 1,
    occ_infants: 1,
    default_occupancy: defaultOccupancy,
    room_kind: 'room',
    content: {
      description: property.description || '',
      photos: buildPhotos(property),
    },
  }
}

/**
 * Map PMS property to Channex rate plan format.
 * per_room, manual mode, single primary option.
 */
export const propertyToRatePlan = (
  property: env.Property,
  channexPropertyId: string,
  channexRoomTypeId: string,
): Record<string, unknown> => {
  const defaultOccupancy = property.bedrooms ? property.bedrooms * 2 : 2

  return {
    title: `${property.name} - Standard`,
    property_id: channexPropertyId,
    room_type_id: channexRoomTypeId,
    currency: 'EUR',
    sell_mode: 'per_room',
    rate_mode: 'manual',
    options: [{
      occupancy: defaultOccupancy,
      is_primary: true,
      rate: Math.round(property.price * 100),
    }],
  }
}

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
 * Map internal rates to Channex ARI restrictions format.
 * Requires property_id and rate_plan_id per entry.
 */
export const ratesToChannex = (
  channexPropertyId: string,
  channexRatePlanId: string,
  dates: { date: string; rate: number; minStay?: number }[],
): Record<string, unknown>[] =>
  dates.map((d) => ({
    property_id: channexPropertyId,
    rate_plan_id: channexRatePlanId,
    date: d.date,
    rate: Math.round(d.rate * 100),
    min_stay_arrival: d.minStay || 1,
  }))

/**
 * Build availability entries in Channex format.
 * Requires property_id and room_type_id per entry.
 */
export const availabilityToChannex = (
  channexPropertyId: string,
  channexRoomTypeId: string,
  dates: { date: string; availability: number }[],
): Record<string, unknown>[] =>
  dates.map((d) => ({
    property_id: channexPropertyId,
    room_type_id: channexRoomTypeId,
    date: d.date,
    availability: d.availability,
  }))

/**
 * Map PMS property type to valid Channex property_type.
 * Valid Channex types: apart_hotel, apartment, boat, camping, capsule_hotel,
 * chalet, country_house, farm_stay, guest_house, holiday_home, holiday_park,
 * homestay, hostel, hotel, inn, lodge, motel, resort, riad, ryokan, tent, villa
 */
const mapPropertyType = (type: movininTypes.PropertyType): string => {
  const typeMap: Record<string, string> = {
    [movininTypes.PropertyType.Apartment]: 'apartment',
    [movininTypes.PropertyType.House]: 'holiday_home',
    [movininTypes.PropertyType.Townhouse]: 'holiday_home',
    [movininTypes.PropertyType.Commercial]: 'apart_hotel',
    [movininTypes.PropertyType.Farm]: 'farm_stay',
    [movininTypes.PropertyType.Industrial]: 'apart_hotel',
    [movininTypes.PropertyType.Plot]: 'holiday_home',
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
    new: movininTypes.BookingStatus.Reserved,
    confirmed: movininTypes.BookingStatus.Reserved,
    modified: movininTypes.BookingStatus.Reserved,
    cancelled: movininTypes.BookingStatus.Cancelled,
  }
  return statusMap[status?.toLowerCase()] || movininTypes.BookingStatus.Reserved
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

