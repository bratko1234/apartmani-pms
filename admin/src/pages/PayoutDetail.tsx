import React, { useState, useEffect } from 'react'
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/payout-detail'
import * as PayoutService from '@/services/PayoutService'
import * as helper from '@/utils/helper'

import '@/assets/css/payout-detail.css'

const PayoutDetail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const payoutId = searchParams.get('id') || ''
  const [user, setUser] = useState<movininTypes.User>()
  const [payout, setPayout] = useState<movininTypes.OwnerPayout | null>(null)
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
  }

  useEffect(() => {
    if (!user || !payoutId) {
      return
    }

    const fetchPayout = async () => {
      setLoading(true)
      try {
        const data = await PayoutService.detail(payoutId)
        setPayout(data)
      } catch (err) {
        helper.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayout()
  }, [user, payoutId])

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

  const getStatusBadge = (status: movininTypes.PayoutStatus) => {
    const statusLabels: Record<string, string> = {
      [movininTypes.PayoutStatus.Draft]: strings.DRAFT,
      [movininTypes.PayoutStatus.Approved]: strings.APPROVED,
      [movininTypes.PayoutStatus.Paid]: strings.PAID,
    }
    const statusClasses: Record<string, string> = {
      [movininTypes.PayoutStatus.Draft]: 'payout-status-draft',
      [movininTypes.PayoutStatus.Approved]: 'payout-status-approved',
      [movininTypes.PayoutStatus.Paid]: 'payout-status-paid',
    }
    return (
      <span className={`payout-status-badge ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    )
  }

  const getMonthName = (m: number): string => {
    const date = new Date(2000, m - 1, 1)
    return date.toLocaleString('default', { month: 'long' })
  }

  const getOwnerName = (p: movininTypes.OwnerPayout): string => {
    if (typeof p.ownerId === 'string') {
      return p.ownerId
    }
    return (p.ownerId as movininTypes.User).fullName || ''
  }

  const formatCurrency = (amount: number): string =>
    `\u20AC${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleApprove = async () => {
    if (!payout?._id) {
      return
    }
    try {
      await PayoutService.approve([payout._id])
      const updated = await PayoutService.detail(payout._id)
      setPayout(updated)
    } catch (err) {
      helper.error(err)
    }
  }

  const handleMarkPaid = async () => {
    if (!payout?._id) {
      return
    }
    try {
      await PayoutService.markPaid([payout._id])
      const updated = await PayoutService.detail(payout._id)
      setPayout(updated)
    } catch (err) {
      helper.error(err)
    }
  }

  const isAdmin = user?.type === movininTypes.RecordType.Admin

  return (
    <Layout strict onLoad={onLoad}>
      <div className="payout-detail">
        <Typography variant="h4" className="payout-detail-title">
          {strings.TITLE}
        </Typography>

        {!loading && payout && (
          <>
            <div className="payout-detail-header">
              <div className="payout-detail-header-item">
                <label>{strings.OWNER}</label>
                <span>{getOwnerName(payout)}</span>
              </div>
              <div className="payout-detail-header-item">
                <label>{strings.PERIOD}</label>
                <span>{getMonthName(payout.period.month)} {payout.period.year}</span>
              </div>
              <div className="payout-detail-header-item">
                <label>{strings.STATUS}</label>
                <span>{getStatusBadge(payout.status)}</span>
              </div>
              <div className="payout-detail-header-item">
                <label>{strings.TOTAL_PAYOUT}</label>
                <span>{formatCurrency(payout.totalPayout)}</span>
              </div>
              {payout.paidAt && (
                <div className="payout-detail-header-item">
                  <label>{strings.PAID_AT}</label>
                  <span>{new Date(payout.paidAt).toLocaleDateString()}</span>
                </div>
              )}
              {payout.paymentMethod && (
                <div className="payout-detail-header-item">
                  <label>{strings.PAYMENT_METHOD}</label>
                  <span>{payout.paymentMethod}</span>
                </div>
              )}
              {payout.notes && (
                <div className="payout-detail-header-item">
                  <label>{strings.NOTES}</label>
                  <span>{payout.notes}</span>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="payout-detail-actions">
                <Button variant="outlined" onClick={() => navigate('/payouts')}>
                  {strings.BACK}
                </Button>
                {payout.status === movininTypes.PayoutStatus.Draft && (
                  <Button variant="contained" color="primary" onClick={handleApprove}>
                    {strings.APPROVE}
                  </Button>
                )}
                {payout.status === movininTypes.PayoutStatus.Approved && (
                  <Button variant="contained" color="success" onClick={handleMarkPaid}>
                    {strings.MARK_PAID}
                  </Button>
                )}
              </div>
            )}

            {payout.properties.length > 0 ? (
              payout.properties.map((prop) => (
                <div key={prop.propertyId} className="payout-detail-property">
                  <Typography variant="h6" className="payout-detail-property-title">
                    {prop.propertyName}
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{strings.GUEST}</TableCell>
                          <TableCell>{strings.SOURCE}</TableCell>
                          <TableCell>{strings.CHECK_IN}</TableCell>
                          <TableCell>{strings.CHECK_OUT}</TableCell>
                          <TableCell align="right">{strings.NIGHTS}</TableCell>
                          <TableCell align="right">{strings.GROSS}</TableCell>
                          <TableCell align="right">{strings.OTA_COMMISSION}</TableCell>
                          <TableCell align="right">{strings.MANAGEMENT_FEE}</TableCell>
                          <TableCell align="right">{strings.CLEANING_FEE}</TableCell>
                          <TableCell align="right">{strings.NET_TO_OWNER}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prop.bookings.map((booking, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{booking.guestName}</TableCell>
                            <TableCell>{formatSource(booking.source)}</TableCell>
                            <TableCell>{booking.checkIn}</TableCell>
                            <TableCell>{booking.checkOut}</TableCell>
                            <TableCell align="right">{booking.nights}</TableCell>
                            <TableCell align="right">{formatCurrency(booking.grossRevenue)}</TableCell>
                            <TableCell align="right">{formatCurrency(booking.otaCommission)}</TableCell>
                            <TableCell align="right">{formatCurrency(booking.managementFee)}</TableCell>
                            <TableCell align="right">{formatCurrency(booking.cleaningFee)}</TableCell>
                            <TableCell align="right">{formatCurrency(booking.netToOwner)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="payout-detail-property-totals">
                          <TableCell colSpan={4}>
                            <strong>{strings.PROPERTY_TOTAL}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{prop.bookings.reduce((s, b) => s + b.nights, 0)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(prop.totalGross)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(prop.totalOtaCommission)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(prop.totalManagementFee)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(prop.totalCleaningFee)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(prop.totalNetToOwner)}</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              ))
            ) : (
              <Typography className="payout-detail-empty">{strings.NO_PROPERTIES}</Typography>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default PayoutDetail
