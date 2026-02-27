import React, { useState, useEffect } from 'react'
import {
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
} from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/owner-revenue'
import * as OwnerService from '@/services/OwnerService'
import * as helper from '@/utils/helper'

import '@/assets/css/owner-revenue.css'

const OwnerRevenue = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [rows, setRows] = useState<movininTypes.OwnerRevenueRow[]>([])
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
  }

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchRevenue = async () => {
      setLoading(true)
      try {
        const data = await OwnerService.getRevenue(year, month)
        setRows(data)
      } catch (err) {
        helper.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()
  }, [user, year, month])

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

  const formatSource = (source: movininTypes.BookingSource): string => {
    const sourceLabels: Record<string, string> = {
      [movininTypes.BookingSource.Direct]: 'Direct',
      [movininTypes.BookingSource.Airbnb]: 'Airbnb',
      [movininTypes.BookingSource.BookingCom]: 'Booking.com',
      [movininTypes.BookingSource.Expedia]: 'Expedia',
      [movininTypes.BookingSource.Other]: 'Other',
    }
    return sourceLabels[source] || source
  }

  const totalBookings = rows.reduce((sum, r) => sum + r.bookings, 0)
  const totalNights = rows.reduce((sum, r) => sum + r.nights, 0)
  const totalRevenue = rows.reduce((sum, r) => sum + r.grossRevenue, 0)

  return (
    <Layout strict onLoad={onLoad}>
      <div className="owner-revenue">
        <Typography variant="h4" className="owner-revenue-title">
          {strings.TITLE}
        </Typography>

        <div className="owner-revenue-nav">
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

        {!loading && rows.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{strings.PROPERTY}</TableCell>
                  <TableCell>{strings.SOURCE}</TableCell>
                  <TableCell align="right">{strings.BOOKINGS}</TableCell>
                  <TableCell align="right">{strings.NIGHTS}</TableCell>
                  <TableCell align="right">{strings.GROSS_REVENUE}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.propertyName}</TableCell>
                    <TableCell>{formatSource(row.source)}</TableCell>
                    <TableCell align="right">{row.bookings}</TableCell>
                    <TableCell align="right">{row.nights}</TableCell>
                    <TableCell align="right">&euro;{row.grossRevenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="owner-revenue-total-row">
                  <TableCell colSpan={2}><strong>{strings.TOTAL}</strong></TableCell>
                  <TableCell align="right"><strong>{totalBookings}</strong></TableCell>
                  <TableCell align="right"><strong>{totalNights}</strong></TableCell>
                  <TableCell align="right"><strong>&euro;{totalRevenue.toLocaleString()}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          !loading && <Typography className="owner-revenue-empty">{strings.NO_DATA}</Typography>
        )}
      </div>
    </Layout>
  )
}

export default OwnerRevenue
