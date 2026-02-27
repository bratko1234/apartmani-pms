import React, { useState, useEffect } from 'react'
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
} from '@mui/material'
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
} from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import Layout from '@/components/Layout'
import { strings } from '@/lang/owner-calendar'
import * as OwnerService from '@/services/OwnerService'
import * as PropertyService from '@/services/PropertyService'

import '@/assets/css/owner-calendar.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const OwnerCalendar = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [properties, setProperties] = useState<movininTypes.Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [calendarDays, setCalendarDays] = useState<movininTypes.OwnerCalendarDay[]>([])

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
  }

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchProperties = async () => {
      try {
        const payload: movininTypes.GetPropertiesPayload = {
          agencies: [user._id as string],
        }
        const data = await PropertyService.getProperties(payload, 1, 100)
        if (data?.resultData) {
          setProperties(data.resultData)
          if (data.resultData.length > 0) {
            setSelectedProperty(data.resultData[0]._id)
          }
        }
      } catch (err) {
        movininHelper.error(err)
      }
    }

    fetchProperties()
  }, [user])

  useEffect(() => {
    if (!selectedProperty) {
      return
    }

    const fetchCalendar = async () => {
      try {
        const days = await OwnerService.getCalendar(selectedProperty, year, month)
        setCalendarDays(days)
      } catch (err) {
        movininHelper.error(err)
      }
    }

    fetchCalendar()
  }, [selectedProperty, year, month])

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const getMonthName = (m: number): string => {
    const date = new Date(2000, m - 1, 1)
    return date.toLocaleString('default', { month: 'long' })
  }

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  return (
    <Layout strict onLoad={onLoad}>
      <div className="owner-calendar">
        <Typography variant="h4" className="owner-calendar-title">
          {strings.TITLE}
        </Typography>

        {properties.length > 0 ? (
          <>
            <FormControl className="owner-calendar-property-select">
              <InputLabel>{strings.SELECT_PROPERTY}</InputLabel>
              <Select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                label={strings.SELECT_PROPERTY}
              >
                {properties.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="owner-calendar-nav">
              <IconButton onClick={handlePrevMonth} title={strings.PREVIOUS_MONTH}>
                <PrevIcon />
              </IconButton>
              <Typography variant="h5">
                {getMonthName(month)} {year}
              </Typography>
              <IconButton onClick={handleNextMonth} title={strings.NEXT_MONTH}>
                <NextIcon />
              </IconButton>
            </div>

            <Paper className="owner-calendar-grid">
              <div className="owner-calendar-weekdays">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="owner-calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>
              <div className="owner-calendar-days">
                {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="owner-calendar-day empty" />
                ))}
                {calendarDays.map((day) => {
                  const dayNum = new Date(day.date).getDate()
                  const isBooked = !!day.bookingId
                  return (
                    <div
                      key={day.date}
                      className={`owner-calendar-day ${isBooked ? 'booked' : 'available'}`}
                      title={isBooked ? `${day.guestName} (${day.source})` : strings.AVAILABLE}
                    >
                      <span className="day-number">{dayNum}</span>
                      {isBooked && (
                        <span className="day-guest">{day.guestName}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Paper>

            <div className="owner-calendar-legend">
              <span className="legend-item available">{strings.AVAILABLE}</span>
              <span className="legend-item booked">{strings.BOOKED}</span>
            </div>
          </>
        ) : (
          <Typography>{strings.NO_PROPERTIES}</Typography>
        )}
      </div>
    </Layout>
  )
}

export default OwnerCalendar
