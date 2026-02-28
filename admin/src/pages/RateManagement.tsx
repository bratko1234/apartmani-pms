import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Typography,
  Alert,
  Snackbar,
  Autocomplete,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/rate-management'
import * as RateService from '@/services/RateService'
import * as PropertyService from '@/services/PropertyService'
import * as AgencyService from '@/services/AgencyService'
import * as movininHelper from ':movinin-helper'
import * as helper from '@/utils/helper'
import Backdrop from '@/components/SimpleBackdrop'

import '@/assets/css/rate-management.css'

const EMPTY_SEASON: movininTypes.CreateRateSeasonPayload = {
  property: '',
  name: '',
  startDate: '',
  endDate: '',
  nightlyRate: 0,
  minStay: 1,
  maxStay: undefined,
  channel: movininTypes.RateChannel.All,
  active: true,
}

const EMPTY_DISCOUNT: movininTypes.CreateRateDiscountPayload = {
  property: '',
  type: movininTypes.DiscountType.LastMinute,
  discountPercent: 10,
  daysBeforeCheckin: 7,
  minNights: undefined,
  channelRestriction: movininTypes.DiscountChannel.All,
  active: true,
}

const channelLabel = (channel: string): string => {
  const labels: Record<string, string> = {
    [movininTypes.RateChannel.All]: strings.CHANNEL_ALL,
    [movininTypes.RateChannel.Direct]: strings.CHANNEL_DIRECT,
    [movininTypes.RateChannel.Ota]: strings.CHANNEL_OTA,
  }
  return labels[channel] || channel
}

const discountTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    [movininTypes.DiscountType.LastMinute]: strings.TYPE_LAST_MINUTE,
    [movininTypes.DiscountType.LongStayWeekly]: strings.TYPE_LONG_STAY_WEEKLY,
    [movininTypes.DiscountType.LongStayMonthly]: strings.TYPE_LONG_STAY_MONTHLY,
    [movininTypes.DiscountType.Member]: strings.TYPE_MEMBER,
  }
  return labels[type] || type
}

const discountChannelLabel = (channel: string): string => {
  const labels: Record<string, string> = {
    [movininTypes.DiscountChannel.All]: strings.CHANNEL_ALL,
    [movininTypes.DiscountChannel.Direct]: strings.CHANNEL_DIRECT,
  }
  return labels[channel] || channel
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

const RateManagement = () => {
  const [searchParams] = useSearchParams()
  const propertyIdFromUrl = searchParams.get('p') || ''

  const [user, setUser] = useState<movininTypes.User>()
  const [loading, setLoading] = useState(false)
  const [propertyId, setPropertyId] = useState(propertyIdFromUrl)
  const [property, setProperty] = useState<movininTypes.Property | null>(null)

  const [seasons, setSeasons] = useState<movininTypes.RateSeason[]>([])
  const [discounts, setDiscounts] = useState<movininTypes.RateDiscount[]>([])

  // Season dialog state
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false)
  const [editingSeason, setEditingSeason] = useState<movininTypes.RateSeason | null>(null)
  const [seasonForm, setSeasonForm] = useState<movininTypes.CreateRateSeasonPayload>({ ...EMPTY_SEASON })

  // Discount dialog state
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<movininTypes.RateDiscount | null>(null)
  const [discountForm, setDiscountForm] = useState<movininTypes.CreateRateDiscountPayload>({ ...EMPTY_DISCOUNT })

  // Delete confirm dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: 'season' | 'discount'
    id: string
    name: string
  }>({ open: false, type: 'season', id: '', name: '' })

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  // Property search
  const [propertyOptions, setPropertyOptions] = useState<movininTypes.Property[]>([])
  const [propertySearchInput, setPropertySearchInput] = useState('')
  const [agencies, setAgencies] = useState<string[]>([])

  const onLoad = async (_user?: movininTypes.User) => {
    setUser(_user)
    if (_user) {
      if (helper.admin(_user)) {
        const allAgencies = await AgencyService.getAllAgencies()
        setAgencies(movininHelper.flattenAgencies(allAgencies))
      } else if (_user._id) {
        setAgencies([_user._id])
      }
    }
  }

  const fetchData = useCallback(async (pid: string) => {
    if (!pid) {
      return
    }

    setLoading(true)
    try {
      const [propertyData, seasonsData, discountsData] = await Promise.all([
        PropertyService.getProperty(pid),
        RateService.getSeasons(pid),
        RateService.getDiscounts(pid),
      ])
      setProperty(propertyData)
      setSeasons(seasonsData)
      setDiscounts(discountsData)
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user && propertyId) {
      fetchData(propertyId)
    }
  }, [user, propertyId, fetchData])

  // Search properties for autocomplete
  useEffect(() => {
    if (!user || agencies.length === 0 || propertySearchInput.length < 2) {
      return
    }

    const searchTimeout = setTimeout(async () => {
      try {
        const payload: movininTypes.GetPropertiesPayload = {
          agencies,
        }
        const result = await PropertyService.getProperties(propertySearchInput, payload, 1, 20)
        if (result && result.length > 0 && result[0]?.resultData) {
          setPropertyOptions(result[0]?.resultData ?? [])
        }
      } catch (err) {
        helper.error(err)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [propertySearchInput, user, agencies])

  // ------- Season handlers -------

  const handleOpenSeasonDialog = (season?: movininTypes.RateSeason) => {
    if (season) {
      setEditingSeason(season)
      setSeasonForm({
        property: propertyId,
        name: season.name,
        startDate: formatDate(season.startDate),
        endDate: formatDate(season.endDate),
        nightlyRate: season.nightlyRate,
        minStay: season.minStay,
        maxStay: season.maxStay,
        channel: season.channel,
        active: season.active,
      })
    } else {
      setEditingSeason(null)
      setSeasonForm({ ...EMPTY_SEASON, property: propertyId })
    }
    setSeasonDialogOpen(true)
  }

  const handleCloseSeasonDialog = () => {
    setSeasonDialogOpen(false)
    setEditingSeason(null)
    setSeasonForm({ ...EMPTY_SEASON })
  }

  const handleSaveSeason = async () => {
    try {
      if (editingSeason && editingSeason._id) {
        await RateService.updateSeason(editingSeason._id, {
          ...seasonForm,
          _id: editingSeason._id,
        })
      } else {
        await RateService.createSeason(seasonForm)
      }
      setSnackbar({ open: true, message: strings.SAVE_SUCCESS, severity: 'success' })
      handleCloseSeasonDialog()
      fetchData(propertyId)
    } catch (err) {
      const message = err instanceof Error ? err.message : strings.SAVE_ERROR
      setSnackbar({ open: true, message, severity: 'error' })
    }
  }

  // ------- Discount handlers -------

  const handleOpenDiscountDialog = (discount?: movininTypes.RateDiscount) => {
    if (discount) {
      setEditingDiscount(discount)
      setDiscountForm({
        property: propertyId,
        type: discount.type,
        discountPercent: discount.discountPercent,
        daysBeforeCheckin: discount.daysBeforeCheckin,
        minNights: discount.minNights,
        channelRestriction: discount.channelRestriction,
        active: discount.active,
      })
    } else {
      setEditingDiscount(null)
      setDiscountForm({ ...EMPTY_DISCOUNT, property: propertyId })
    }
    setDiscountDialogOpen(true)
  }

  const handleCloseDiscountDialog = () => {
    setDiscountDialogOpen(false)
    setEditingDiscount(null)
    setDiscountForm({ ...EMPTY_DISCOUNT })
  }

  const handleSaveDiscount = async () => {
    try {
      if (editingDiscount && editingDiscount._id) {
        await RateService.updateDiscount(editingDiscount._id, {
          ...discountForm,
          _id: editingDiscount._id,
        })
      } else {
        await RateService.createDiscount(discountForm)
      }
      setSnackbar({ open: true, message: strings.SAVE_SUCCESS, severity: 'success' })
      handleCloseDiscountDialog()
      fetchData(propertyId)
    } catch (err) {
      const message = err instanceof Error ? err.message : strings.SAVE_ERROR
      setSnackbar({ open: true, message, severity: 'error' })
    }
  }

  // ------- Delete handlers -------

  const handleDeleteConfirm = async () => {
    try {
      if (deleteDialog.type === 'season') {
        await RateService.deleteSeason(deleteDialog.id)
      } else {
        await RateService.deleteDiscount(deleteDialog.id)
      }
      setSnackbar({ open: true, message: strings.DELETE_SUCCESS, severity: 'success' })
      setDeleteDialog({ open: false, type: 'season', id: '', name: '' })
      fetchData(propertyId)
    } catch (err) {
      setSnackbar({ open: true, message: strings.DELETE_ERROR, severity: 'error' })
    }
  }

  // ------- Channex sync -------

  const handleSyncToChannex = async () => {
    try {
      setLoading(true)
      await RateService.syncRatesToChannex(propertyId)
      setSnackbar({ open: true, message: strings.PUSH_SUCCESS, severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: strings.PUSH_ERROR, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout onLoad={onLoad} strict>
      <div className="rate-management">
        <Typography variant="h4" gutterBottom>
          {strings.TITLE}
        </Typography>

        {/* Property Selector */}
        <div className="property-selector">
          <Autocomplete
            options={propertyOptions}
            getOptionLabel={(option) => option.name || ''}
            value={property}
            inputValue={propertySearchInput}
            onInputChange={(_e, value) => setPropertySearchInput(value)}
            onChange={(_e, value) => {
              if (value && value._id) {
                setPropertyId(value._id)
                setProperty(value)
              } else {
                setPropertyId('')
                setProperty(null)
                setSeasons([])
                setDiscounts([])
              }
            }}
            renderInput={(params) => (
              <TextField {...params} label={strings.SELECT_PROPERTY} variant="outlined" size="small" />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />
        </div>

        {property && (
          <>
            {/* Base Price Info */}
            <div className="base-price-info">
              <span className="label">{strings.BASE_PRICE}:</span>
              <span className="value">{env.CURRENCY}{property.price}</span>
            </div>

            {/* Rate Seasons Section */}
            <div className="section-header">
              <h2>{strings.SEASONS}</h2>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenSeasonDialog()}
              >
                {strings.ADD_SEASON}
              </Button>
            </div>

            {seasons.length === 0 ? (
              <Paper className="no-data">
                <Typography>{strings.NO_SEASONS}</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{strings.SEASON_NAME}</TableCell>
                      <TableCell>{strings.START_DATE}</TableCell>
                      <TableCell>{strings.END_DATE}</TableCell>
                      <TableCell align="right">{strings.NIGHTLY_RATE}</TableCell>
                      <TableCell align="center">{strings.MIN_STAY}</TableCell>
                      <TableCell align="center">{strings.MAX_STAY}</TableCell>
                      <TableCell>{strings.CHANNEL}</TableCell>
                      <TableCell align="center">{strings.ACTIVE}</TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seasons.map((season) => (
                      <TableRow key={season._id}>
                        <TableCell>{season.name}</TableCell>
                        <TableCell>{formatDate(season.startDate)}</TableCell>
                        <TableCell>{formatDate(season.endDate)}</TableCell>
                        <TableCell align="right">
                          {env.CURRENCY}{season.nightlyRate}
                        </TableCell>
                        <TableCell align="center">{season.minStay}</TableCell>
                        <TableCell align="center">{season.maxStay || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={channelLabel(season.channel)}
                            size="small"
                            className="channel-chip"
                            color={season.channel === movininTypes.RateChannel.Direct ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {season.active ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenSeasonDialog(season)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: 'season',
                                id: season._id || '',
                                name: season.name,
                              })
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Discounts Section */}
            <div className="section-header">
              <h2>{strings.DISCOUNTS}</h2>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDiscountDialog()}
              >
                {strings.ADD_DISCOUNT}
              </Button>
            </div>

            {discounts.length === 0 ? (
              <Paper className="no-data">
                <Typography>{strings.NO_DISCOUNTS}</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{strings.DISCOUNT_TYPE}</TableCell>
                      <TableCell align="right">{strings.DISCOUNT_PERCENT}</TableCell>
                      <TableCell align="center">{strings.DAYS_BEFORE_CHECKIN}</TableCell>
                      <TableCell align="center">{strings.MIN_NIGHTS}</TableCell>
                      <TableCell>{strings.CHANNEL_RESTRICTION}</TableCell>
                      <TableCell align="center">{strings.ACTIVE}</TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {discounts.map((discount) => (
                      <TableRow key={discount._id}>
                        <TableCell>{discountTypeLabel(discount.type)}</TableCell>
                        <TableCell align="right">{discount.discountPercent}%</TableCell>
                        <TableCell align="center">{discount.daysBeforeCheckin || '-'}</TableCell>
                        <TableCell align="center">{discount.minNights || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={discountChannelLabel(discount.channelRestriction)}
                            size="small"
                            className="channel-chip"
                            color={discount.channelRestriction === movininTypes.DiscountChannel.Direct ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {discount.active ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenDiscountDialog(discount)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: 'discount',
                                id: discount._id || '',
                                name: discountTypeLabel(discount.type),
                              })
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Push to Channex */}
            <div className="channex-actions">
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleSyncToChannex}
              >
                {strings.PUSH_TO_CHANNEX}
              </Button>
            </div>
          </>
        )}

        {/* Season Dialog */}
        <Dialog open={seasonDialogOpen} onClose={handleCloseSeasonDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingSeason ? strings.EDIT_SEASON : strings.ADD_SEASON}
          </DialogTitle>
          <DialogContent>
            <div className="dialog-form">
              <TextField
                fullWidth
                margin="dense"
                label={strings.SEASON_NAME}
                value={seasonForm.name}
                onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                margin="dense"
                label={strings.START_DATE}
                type="date"
                value={seasonForm.startDate}
                onChange={(e) => setSeasonForm({ ...seasonForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                margin="dense"
                label={strings.END_DATE}
                type="date"
                value={seasonForm.endDate}
                onChange={(e) => setSeasonForm({ ...seasonForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                margin="dense"
                label={strings.NIGHTLY_RATE}
                type="number"
                value={seasonForm.nightlyRate}
                onChange={(e) =>
                  setSeasonForm({ ...seasonForm, nightlyRate: Number(e.target.value) })
                }
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
              <TextField
                fullWidth
                margin="dense"
                label={strings.MIN_STAY}
                type="number"
                value={seasonForm.minStay ?? 1}
                onChange={(e) =>
                  setSeasonForm({ ...seasonForm, minStay: Number(e.target.value) })
                }
                inputProps={{ min: 1 }}
              />
              <TextField
                fullWidth
                margin="dense"
                label={strings.MAX_STAY}
                type="number"
                value={seasonForm.maxStay ?? ''}
                onChange={(e) =>
                  setSeasonForm({
                    ...seasonForm,
                    maxStay: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                inputProps={{ min: 1 }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>{strings.CHANNEL}</InputLabel>
                <Select
                  value={seasonForm.channel || movininTypes.RateChannel.All}
                  label={strings.CHANNEL}
                  onChange={(e) =>
                    setSeasonForm({
                      ...seasonForm,
                      channel: e.target.value as movininTypes.RateChannel,
                    })
                  }
                >
                  <MenuItem value={movininTypes.RateChannel.All}>{strings.CHANNEL_ALL}</MenuItem>
                  <MenuItem value={movininTypes.RateChannel.Direct}>{strings.CHANNEL_DIRECT}</MenuItem>
                  <MenuItem value={movininTypes.RateChannel.Ota}>{strings.CHANNEL_OTA}</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={seasonForm.active ?? true}
                    onChange={(e) => setSeasonForm({ ...seasonForm, active: e.target.checked })}
                  />
                }
                label={strings.ACTIVE}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSeasonDialog}>{commonStrings.CANCEL}</Button>
            <Button
              variant="contained"
              onClick={handleSaveSeason}
              disabled={!seasonForm.name || !seasonForm.startDate || !seasonForm.endDate || !seasonForm.nightlyRate}
            >
              {commonStrings.SAVE}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Discount Dialog */}
        <Dialog open={discountDialogOpen} onClose={handleCloseDiscountDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingDiscount ? strings.EDIT_DISCOUNT : strings.ADD_DISCOUNT}
          </DialogTitle>
          <DialogContent>
            <div className="dialog-form">
              <FormControl fullWidth margin="dense">
                <InputLabel>{strings.DISCOUNT_TYPE}</InputLabel>
                <Select
                  value={discountForm.type}
                  label={strings.DISCOUNT_TYPE}
                  onChange={(e) =>
                    setDiscountForm({
                      ...discountForm,
                      type: e.target.value as movininTypes.DiscountType,
                    })
                  }
                >
                  <MenuItem value={movininTypes.DiscountType.LastMinute}>
                    {strings.TYPE_LAST_MINUTE}
                  </MenuItem>
                  <MenuItem value={movininTypes.DiscountType.LongStayWeekly}>
                    {strings.TYPE_LONG_STAY_WEEKLY}
                  </MenuItem>
                  <MenuItem value={movininTypes.DiscountType.LongStayMonthly}>
                    {strings.TYPE_LONG_STAY_MONTHLY}
                  </MenuItem>
                  <MenuItem value={movininTypes.DiscountType.Member}>
                    {strings.TYPE_MEMBER}
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="dense"
                label={strings.DISCOUNT_PERCENT}
                type="number"
                value={discountForm.discountPercent}
                onChange={(e) =>
                  setDiscountForm({
                    ...discountForm,
                    discountPercent: Number(e.target.value),
                  })
                }
                inputProps={{ min: 1, max: 100 }}
                required
              />
              {discountForm.type === movininTypes.DiscountType.LastMinute && (
                <TextField
                  fullWidth
                  margin="dense"
                  label={strings.DAYS_BEFORE_CHECKIN}
                  type="number"
                  value={discountForm.daysBeforeCheckin ?? ''}
                  onChange={(e) =>
                    setDiscountForm({
                      ...discountForm,
                      daysBeforeCheckin: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              )}
              {(discountForm.type === movininTypes.DiscountType.LongStayWeekly ||
                discountForm.type === movininTypes.DiscountType.LongStayMonthly) && (
                <TextField
                  fullWidth
                  margin="dense"
                  label={strings.MIN_NIGHTS}
                  type="number"
                  value={discountForm.minNights ?? ''}
                  onChange={(e) =>
                    setDiscountForm({
                      ...discountForm,
                      minNights: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              )}
              <FormControl fullWidth margin="dense">
                <InputLabel>{strings.CHANNEL_RESTRICTION}</InputLabel>
                <Select
                  value={discountForm.channelRestriction || movininTypes.DiscountChannel.All}
                  label={strings.CHANNEL_RESTRICTION}
                  onChange={(e) =>
                    setDiscountForm({
                      ...discountForm,
                      channelRestriction: e.target.value as movininTypes.DiscountChannel,
                    })
                  }
                >
                  <MenuItem value={movininTypes.DiscountChannel.All}>{strings.CHANNEL_ALL}</MenuItem>
                  <MenuItem value={movininTypes.DiscountChannel.Direct}>{strings.CHANNEL_DIRECT}</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={discountForm.active ?? true}
                    onChange={(e) =>
                      setDiscountForm({ ...discountForm, active: e.target.checked })
                    }
                  />
                }
                label={strings.ACTIVE}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDiscountDialog}>{commonStrings.CANCEL}</Button>
            <Button
              variant="contained"
              onClick={handleSaveDiscount}
              disabled={!discountForm.discountPercent}
            >
              {commonStrings.SAVE}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, type: 'season', id: '', name: '' })}
        >
          <DialogTitle>{commonStrings.CONFIRM_TITLE}</DialogTitle>
          <DialogContent>
            <Typography>
              {deleteDialog.type === 'season'
                ? strings.DELETE_SEASON_CONFIRM
                : strings.DELETE_DISCOUNT_CONFIRM}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDeleteDialog({ open: false, type: 'season', id: '', name: '' })
              }
            >
              {commonStrings.CANCEL}
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
              {commonStrings.DELETE}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      </div>
    </Layout>
  )
}

export default RateManagement
