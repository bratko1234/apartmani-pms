import React from 'react'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/properties'
import { strings as cpStrings } from '@/lang/property'

import '@/assets/css/room-type-selector.css'

interface RoomTypeSelectorProps {
  roomTypes: movininTypes.Property[]
  selectedId?: string
  onSelect: (roomType: movininTypes.Property) => void
  language: string
}

const RoomTypeSelector = ({ roomTypes, selectedId, onSelect, language }: RoomTypeSelectorProps) => (
  <div className="room-type-selector">
    <h2 className="room-type-selector-title">{cpStrings.SELECT_ROOM}</h2>
    {roomTypes.map((room) => (
      <div
        key={room._id}
        className={`room-type-item${selectedId === room._id ? ' selected' : ''}`}
        onClick={() => onSelect(room)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(room)
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="room-type-info">
          <span className="room-type-name">{room.name}</span>
          <span className="room-type-details">
            {room.bedrooms > 0 && `${room.bedrooms} ${cpStrings.BEDROOMS}`}
            {room.bathrooms > 0 && ` · ${room.bathrooms} ${cpStrings.BATHROOMS}`}
          </span>
          {room.countOfRooms && room.countOfRooms > 1 && (
            <span className="room-type-availability">
              {room.countOfRooms} {cpStrings.ROOMS_AVAILABLE}
            </span>
          )}
        </div>
        <div className="room-type-price">
          <span className="room-type-price-amount">
            {movininHelper.formatPrice(room.price, commonStrings.CURRENCY, language)}
          </span>
          <span className="room-type-price-unit">{strings.PER_NIGHT}</span>
        </div>
      </div>
    ))}
  </div>
)

export default RoomTypeSelector
