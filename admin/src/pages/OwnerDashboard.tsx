import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/owner-dashboard'
import * as OwnerService from '@/services/OwnerService'
import * as helper from '@/utils/helper'

import '@/assets/css/owner-dashboard.css'

const OwnerDashboard = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [dashboard, setDashboard] = useState<movininTypes.OwnerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
  }

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchDashboard = async () => {
      try {
        const data = await OwnerService.getDashboard()
        setDashboard(data)
      } catch (err) {
        helper.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user])

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

  return (
    <Layout strict onLoad={onLoad}>
      {!loading && dashboard && (
        <div className="owner-dashboard">
          <Typography variant="h4" className="owner-dashboard-title">
            {strings.TITLE}
          </Typography>

          <div className="owner-dashboard-cards">
            <Card className="owner-dashboard-card">
              <CardContent>
                <Typography variant="h6">{strings.TOTAL_BOOKINGS}</Typography>
                <Typography variant="h3">{dashboard.totalBookings}</Typography>
              </CardContent>
            </Card>

            <Card className="owner-dashboard-card">
              <CardContent>
                <Typography variant="h6">{strings.UPCOMING_BOOKINGS}</Typography>
                <Typography variant="h3">{dashboard.upcomingBookings}</Typography>
              </CardContent>
            </Card>

            <Card className="owner-dashboard-card">
              <CardContent>
                <Typography variant="h6">{strings.OCCUPANCY_RATE}</Typography>
                <Typography variant="h3">{dashboard.occupancyRate}%</Typography>
              </CardContent>
            </Card>

            <Card className="owner-dashboard-card">
              <CardContent>
                <Typography variant="h6">{strings.TOTAL_REVENUE}</Typography>
                <Typography variant="h3">&euro;{dashboard.totalRevenue.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </div>

          {dashboard.revenueBySource.length > 0 && (
            <div className="owner-dashboard-section">
              <Typography variant="h5">{strings.REVENUE_BY_SOURCE}</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{strings.SOURCE}</TableCell>
                      <TableCell align="right">{strings.BOOKINGS}</TableCell>
                      <TableCell align="right">{strings.NIGHTS}</TableCell>
                      <TableCell align="right">{strings.REVENUE}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.revenueBySource.map((row) => (
                      <TableRow key={row.source}>
                        <TableCell>{formatSource(row.source)}</TableCell>
                        <TableCell align="right">{row.bookings}</TableCell>
                        <TableCell align="right">{row.nights}</TableCell>
                        <TableCell align="right">&euro;{row.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {dashboard.upcomingBookingsList.length > 0 && (
            <div className="owner-dashboard-section">
              <Typography variant="h5">{strings.UPCOMING_BOOKINGS_LIST}</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{strings.PROPERTY}</TableCell>
                      <TableCell>{strings.GUEST}</TableCell>
                      <TableCell>{strings.CHECK_IN}</TableCell>
                      <TableCell>{strings.CHECK_OUT}</TableCell>
                      <TableCell>{strings.STATUS}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.upcomingBookingsList.map((booking) => {
                      const property = booking.property as movininTypes.Property
                      const renter = booking.renter as movininTypes.User
                      return (
                        <TableRow key={booking._id}>
                          <TableCell>{property?.name || '-'}</TableCell>
                          <TableCell>{renter?.fullName || booking.externalGuestName || '-'}</TableCell>
                          <TableCell>{new Date(booking.from).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(booking.to).toLocaleDateString()}</TableCell>
                          <TableCell>{booking.status}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {!dashboard.upcomingBookingsList.length && !dashboard.revenueBySource.length && (
            <Typography className="owner-dashboard-empty">{strings.NO_DATA}</Typography>
          )}
        </div>
      )}
    </Layout>
  )
}

export default OwnerDashboard
