import React, { useState, useEffect, useCallback } from 'react'
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material'
import {
  Sync as SyncIcon,
  SyncProblem as SyncProblemIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/channex-dashboard'
import * as ChannexService from '@/services/ChannexService'
import * as helper from '@/utils/helper'

import '@/assets/css/channex-dashboard.css'

const ChannexDashboard = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ChannexService.ChannexStatus | null>(null)
  const [webhookLogs, setWebhookLogs] = useState<ChannexService.ChannexWebhookLogEntry[]>([])
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingProperty, setSyncingProperty] = useState<string | null>(null)

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statusData, logsData] = await Promise.all([
        ChannexService.getStatus(),
        ChannexService.getWebhookLogs(20),
      ])
      setStatus(statusData)
      setWebhookLogs(logsData)
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

  const handleSyncAll = async () => {
    setSyncingAll(true)
    try {
      const result = await ChannexService.syncAll()
      toast(`${strings.SYNC_ALL_SUCCESS}: ${result.synced} synced, ${result.failed} failed`, {
        type: result.failed > 0 ? 'warning' : 'success',
      })
      await fetchData()
    } catch (err) {
      toast(strings.SYNC_FAILED, { type: 'error' })
      helper.error(err)
    } finally {
      setSyncingAll(false)
    }
  }

  const getStatusDot = () => {
    if (!status) {
      return 'disabled'
    }
    if (!status.enabled) {
      return 'disabled'
    }
    return status.connected ? 'connected' : 'disconnected'
  }

  const getStatusLabel = () => {
    if (!status) {
      return strings.LOADING
    }
    if (!status.enabled) {
      return strings.DISABLED
    }
    return status.connected ? strings.CONNECTED : strings.DISCONNECTED
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) {
      return strings.NEVER
    }
    return new Date(dateStr).toLocaleString()
  }

  return (
    <Layout strict admin onLoad={onLoad}>
      <div className="channex-dashboard">
        <Typography variant="h4" className="page-title">
          {strings.TITLE}
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {/* Status Cards */}
            <div className="status-cards">
              <Paper className="status-card" elevation={1}>
                <div className="status-label">{strings.CONNECTION_STATUS}</div>
                <div className="status-value">
                  <span className="status-indicator">
                    <span className={`status-dot ${getStatusDot()}`} />
                    {getStatusLabel()}
                  </span>
                </div>
              </Paper>

              <Paper className="status-card" elevation={1}>
                <div className="status-label">{strings.PROPERTIES}</div>
                <div className="status-value">
                  {status?.syncedCount || 0} {strings.SYNCED} {strings.OF} {status?.propertyCount || 0}
                </div>
              </Paper>

              <Paper className="status-card" elevation={1}>
                <div className="status-label">{strings.LAST_WEBHOOK}</div>
                <div className="status-value">
                  {formatDate(status?.lastWebhookAt)}
                </div>
              </Paper>
            </div>

            {/* Sync All Button */}
            <div className="section-header">
              <Typography variant="h6">{strings.PROPERTIES}</Typography>
              <Button
                variant="contained"
                startIcon={syncingAll ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                onClick={handleSyncAll}
                disabled={syncingAll || !status?.enabled}
              >
                {syncingAll ? strings.SYNCING : strings.SYNC_ALL}
              </Button>
            </div>

            {/* Webhook Logs */}
            <div className="section-header">
              <Typography variant="h6">{strings.WEBHOOK_LOGS}</Typography>
            </div>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{strings.EVENT_TYPE}</TableCell>
                    <TableCell>{strings.BOOKING_ID}</TableCell>
                    <TableCell>{strings.PROCESSED}</TableCell>
                    <TableCell>{strings.DATE}</TableCell>
                    <TableCell>{strings.ERROR}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {webhookLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {strings.NO_LOGS}
                      </TableCell>
                    </TableRow>
                  ) : (
                    webhookLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>
                          <span className="webhook-event-type">{log.eventType}</span>
                        </TableCell>
                        <TableCell>
                          <span className="channex-id-cell">{log.channexBookingId || '—'}</span>
                        </TableCell>
                        <TableCell>
                          {log.processed ? strings.YES : strings.NO}
                        </TableCell>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell>
                          {log.error ? (
                            <span className="error-text" title={log.error}>{log.error}</span>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </div>
    </Layout>
  )
}

export default ChannexDashboard
