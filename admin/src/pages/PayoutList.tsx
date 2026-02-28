import React, { useState, useEffect, useCallback } from 'react'
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
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/payout-list'
import * as PayoutService from '@/services/PayoutService'
import * as helper from '@/utils/helper'

import '@/assets/css/payout-list.css'

const PayoutList = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [payouts, setPayouts] = useState<movininTypes.OwnerPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [generating, setGenerating] = useState(false)

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
  }

  const fetchPayouts = useCallback(async () => {
    setLoading(true)
    try {
      const query: movininTypes.GetPayoutsQuery = { year, month }
      if (statusFilter) {
        query.status = statusFilter as movininTypes.PayoutStatus
      }
      const data = await PayoutService.list(query)
      setPayouts(data)
      setSelectedIds([])
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
    }
  }, [year, month, statusFilter])

  useEffect(() => {
    if (!user) {
      return
    }
    fetchPayouts()
  }, [user, fetchPayouts])

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

  const handleGenerateAll = async () => {
    setGenerating(true)
    try {
      await PayoutService.generateAll(year, month)
      helper.info(strings.GENERATE_SUCCESS)
      await fetchPayouts()
    } catch (err) {
      helper.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async () => {
    if (selectedIds.length === 0) {
      return
    }
    try {
      await PayoutService.approve(selectedIds)
      helper.info(strings.APPROVE_SUCCESS)
      await fetchPayouts()
    } catch (err) {
      helper.error(err)
    }
  }

  const handleMarkPaid = async () => {
    if (selectedIds.length === 0) {
      return
    }
    try {
      await PayoutService.markPaid(selectedIds)
      helper.info(strings.MARK_PAID_SUCCESS)
      await fetchPayouts()
    } catch (err) {
      helper.error(err)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(payouts.map((p) => p._id!))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    }
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

  const getOwnerName = (payout: movininTypes.OwnerPayout): string => {
    if (typeof payout.ownerId === 'string') {
      return payout.ownerId
    }
    return (payout.ownerId as movininTypes.User).fullName || ''
  }

  const isAdmin = user?.type === movininTypes.RecordType.Admin

  const hasDraftSelected = selectedIds.some((id) => {
    const p = payouts.find((payout) => payout._id === id)
    return p?.status === movininTypes.PayoutStatus.Draft
  })

  const hasApprovedSelected = selectedIds.some((id) => {
    const p = payouts.find((payout) => payout._id === id)
    return p?.status === movininTypes.PayoutStatus.Approved
  })

  return (
    <Layout strict onLoad={onLoad}>
      <div className="payout-list">
        <Typography variant="h4" className="payout-list-title">
          {strings.TITLE}
        </Typography>

        <div className="payout-list-nav">
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

        {isAdmin && (
          <div className="payout-list-toolbar">
            <Button
              variant="contained"
              onClick={handleGenerateAll}
              disabled={generating}
            >
              {generating ? strings.GENERATING : strings.GENERATE_ALL}
            </Button>

            {hasDraftSelected && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleApprove}
              >
                {strings.APPROVE_SELECTED}
              </Button>
            )}

            {hasApprovedSelected && (
              <Button
                variant="outlined"
                color="success"
                onClick={handleMarkPaid}
              >
                {strings.MARK_PAID_SELECTED}
              </Button>
            )}

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{strings.STATUS}</InputLabel>
              <Select
                value={statusFilter}
                label={strings.STATUS}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">{strings.FILTER_ALL}</MenuItem>
                <MenuItem value={movininTypes.PayoutStatus.Draft}>{strings.DRAFT}</MenuItem>
                <MenuItem value={movininTypes.PayoutStatus.Approved}>{strings.APPROVED}</MenuItem>
                <MenuItem value={movininTypes.PayoutStatus.Paid}>{strings.PAID}</MenuItem>
              </Select>
            </FormControl>
          </div>
        )}

        {!loading && payouts.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {isAdmin && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.length === payouts.length && payouts.length > 0}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < payouts.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{strings.OWNER}</TableCell>
                  <TableCell>{strings.PERIOD}</TableCell>
                  <TableCell align="right">{strings.TOTAL_PAYOUT}</TableCell>
                  <TableCell>{strings.STATUS}</TableCell>
                  <TableCell>{strings.ACTIONS}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout._id}>
                    {isAdmin && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(payout._id!)}
                          onChange={(e) => handleSelectOne(payout._id!, e.target.checked)}
                        />
                      </TableCell>
                    )}
                    <TableCell>{getOwnerName(payout)}</TableCell>
                    <TableCell>
                      {getMonthName(payout.period.month)} {payout.period.year}
                    </TableCell>
                    <TableCell align="right">
                      &euro;{payout.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
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
          !loading && <Typography className="payout-list-empty">{strings.NO_DATA}</Typography>
        )}
      </div>
    </Layout>
  )
}

export default PayoutList
