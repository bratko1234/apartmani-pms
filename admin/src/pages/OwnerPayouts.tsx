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
  Button,
} from '@mui/material'
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/owner-payouts'
import * as PayoutService from '@/services/PayoutService'
import * as helper from '@/utils/helper'

import '@/assets/css/owner-payouts.css'

const OwnerPayouts = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [year, setYear] = useState(new Date().getFullYear())
  const [payouts, setPayouts] = useState<movininTypes.OwnerPayout[]>([])
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
  }

  useEffect(() => {
    if (!user?._id) {
      return
    }

    const fetchPayouts = async () => {
      setLoading(true)
      try {
        const data = await PayoutService.listByOwner(user._id!, { year })
        setPayouts(data)
      } catch (err) {
        helper.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayouts()
  }, [user, year])

  const handlePrevYear = () => {
    setYear(year - 1)
  }

  const handleNextYear = () => {
    setYear(year + 1)
  }

  const getMonthName = (m: number): string => {
    const date = new Date(2000, m - 1, 1)
    return date.toLocaleString('default', { month: 'long' })
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

  const formatCurrency = (amount: number): string =>
    `\u20AC${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <Layout strict onLoad={onLoad}>
      <div className="owner-payouts">
        <Typography variant="h4" className="owner-payouts-title">
          {strings.TITLE}
        </Typography>

        <div className="owner-payouts-nav">
          <IconButton onClick={handlePrevYear} title={strings.PREVIOUS_YEAR}>
            <PrevIcon />
          </IconButton>
          <Typography variant="h5">{year}</Typography>
          <IconButton onClick={handleNextYear} title={strings.NEXT_YEAR}>
            <NextIcon />
          </IconButton>
        </div>

        {!loading && payouts.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{strings.PERIOD}</TableCell>
                  <TableCell align="right">{strings.TOTAL_PAYOUT}</TableCell>
                  <TableCell>{strings.STATUS}</TableCell>
                  <TableCell>{strings.PAID_AT}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout._id}>
                    <TableCell>
                      {getMonthName(payout.period.month)} {payout.period.year}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(payout.totalPayout)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell>
                      {payout.paidAt ? new Date(payout.paidAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => navigate(`/payout-detail?id=${payout._id}`)}
                      >
                        {strings.VIEW_DETAIL}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          !loading && <Typography className="owner-payouts-empty">{strings.NO_DATA}</Typography>
        )}
      </div>
    </Layout>
  )
}

export default OwnerPayouts
