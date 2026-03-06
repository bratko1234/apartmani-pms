import React, { useEffect, useState } from 'react'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Visibility as PreviewIcon,
  VisibilityOff as HidePreviewIcon,
} from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/widget-embed'
import { strings as commonStrings } from '@/lang/common'
import * as PropertyService from '@/services/PropertyService'
import * as helper from '@/utils/helper'

const WIDGET_HOST = import.meta.env.VITE_MI_WIDGET_HOST || 'http://localhost:3010'

const WidgetEmbed = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [buildings, setBuildings] = useState<{ _id: string; name: string }[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [language, setLanguage] = useState('sr')
  const [primaryColor, setPrimaryColor] = useState('#1976d2')
  const [currency, setCurrency] = useState('EUR')
  const [width, setWidth] = useState('100%')
  const [height, setHeight] = useState('600px')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const embedCode = selectedBuilding
    ? `<div id="apartmani-widget"></div>
<script src="${WIDGET_HOST}/widget.js"></script>
<script>
  ApartmaniWidget.init({
    container: '#apartmani-widget',
    buildingId: '${selectedBuilding}',
    language: '${language}',
    primaryColor: '${primaryColor}',
    currency: '${currency}',
    width: '${width}',
    height: '${height}'
  });
</script>`
    : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      helper.error(err)
    }
  }

  const onLoad = async (_user?: movininTypes.User) => {
    if (_user && _user.verified) {
      setUser(_user)
      try {
        const _buildings = await PropertyService.getBuildings()
        setBuildings(_buildings)
        if (_buildings.length > 0) {
          setSelectedBuilding(_buildings[0]._id)
        }
      } catch (err) {
        helper.error(err)
      }
    }
  }

  return (
    <Layout onLoad={onLoad} strict>
      <div className="create-property" style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        <Paper className="property-form property-form-wrapper" elevation={10}>
          <Typography variant="h4" gutterBottom>
            {strings.TITLE}
          </Typography>

          {buildings.length === 0 ? (
            <Typography color="textSecondary">{strings.NO_BUILDINGS}</Typography>
          ) : (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>{strings.SELECT_BUILDING}</InputLabel>
                <Select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  variant="standard"
                  label={strings.SELECT_BUILDING}
                >
                  {buildings.map((b) => (
                    <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>{strings.LANGUAGE}</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  variant="standard"
                  label={strings.LANGUAGE}
                >
                  <MenuItem value="sr">Srpski</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={strings.PRIMARY_COLOR}
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  variant="standard"
                  slotProps={{
                    htmlInput: { style: { height: 40, cursor: 'pointer' } }
                  }}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>{strings.CURRENCY}</InputLabel>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  variant="standard"
                  label={strings.CURRENCY}
                >
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="BAM">BAM (KM)</MenuItem>
                </Select>
              </FormControl>

              <div style={{ display: 'flex', gap: 16 }}>
                <FormControl fullWidth margin="dense">
                  <TextField
                    label={strings.WIDTH}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    variant="standard"
                  />
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <TextField
                    label={strings.HEIGHT}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    variant="standard"
                  />
                </FormControl>
              </div>

              {selectedBuilding && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    {strings.EMBED_CODE}
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      position: 'relative',
                    }}
                  >
                    {embedCode}
                  </Paper>

                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button
                      variant="contained"
                      className="btn-primary"
                      startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                      onClick={handleCopy}
                      size="small"
                    >
                      {copied ? strings.COPIED : strings.COPY}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={showPreview ? <HidePreviewIcon /> : <PreviewIcon />}
                      onClick={() => setShowPreview(!showPreview)}
                      size="small"
                    >
                      {showPreview ? strings.HIDE_PREVIEW : strings.SHOW_PREVIEW}
                    </Button>
                  </div>

                  {showPreview && (
                    <Paper variant="outlined" sx={{ mt: 2, overflow: 'hidden' }}>
                      <Typography variant="subtitle2" sx={{ p: 1, backgroundColor: '#e0e0e0' }}>
                        {strings.PREVIEW}
                      </Typography>
                      <iframe
                        src={`${WIDGET_HOST}?buildingId=${selectedBuilding}&language=${language}&primaryColor=${encodeURIComponent(primaryColor)}&currency=${currency}`}
                        style={{
                          width: '100%',
                          height: '500px',
                          border: 'none',
                        }}
                        title="Widget Preview"
                      />
                    </Paper>
                  )}
                </>
              )}
            </>
          )}
        </Paper>
      </div>
    </Layout>
  )
}

export default WidgetEmbed
