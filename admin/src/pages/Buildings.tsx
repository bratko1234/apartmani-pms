import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import * as helper from '@/utils/helper'
import * as PropertyService from '@/services/PropertyService'
import env from '@/config/env.config'
import { strings } from '@/lang/buildings'

import '@/assets/css/buildings.css'

const Buildings = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<movininTypes.User>()
  const [buildings, setBuildings] = useState<movininTypes.BuildingWithOccupancy[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const fetchBuildings = useCallback(async (_user?: movininTypes.User) => {
    setLoading(true)
    try {
      const isAdmin = helper.admin(_user)
      const agencyId = isAdmin ? undefined : _user?._id
      const data = await PropertyService.getBuildingsWithOccupancy(agencyId)
      setBuildings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
    fetchBuildings(_user)
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <Layout onLoad={onLoad} strict>
      <div className="buildings-list">
        <Typography variant="h4" gutterBottom>
          {strings.TITLE}
        </Typography>

        {!loading && buildings.length === 0 && (
          <Card>
            <CardContent>
              <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
            </CardContent>
          </Card>
        )}

        {buildings.map((building) => {
          const expanded = expandedIds.has(building._id)
          const imageUrl = building.image
            ? `${env.CDN_PROPERTIES}/${building.image}`
            : undefined

          return (
            <Card key={building._id} className="building-card">
              <CardContent>
                <div className="building-header">
                  {imageUrl ? (
                    <img src={imageUrl} alt={building.name} />
                  ) : (
                    <div className="building-initial">
                      {building.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="building-info">
                    <Typography variant="h6">{building.name}</Typography>
                    <Typography variant="body2" className="building-meta">
                      {strings.OWNER}: {building.agency?.fullName}
                      {building.location?.name && ` | ${strings.LOCATION}: ${building.location.name}`}
                    </Typography>
                  </div>
                  <IconButton
                    size="small"
                    title={strings.EDIT_BUILDING}
                    onClick={() => navigate(`/update-property?p=${building._id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                </div>

                <div className="building-stats">
                  <Chip
                    label={`${strings.TOTAL_ROOMS}: ${building.totalRooms}`}
                    variant="outlined"
                  />
                  <Chip
                    label={`${strings.OCCUPIED}: ${building.occupiedRooms}`}
                    color="error"
                    variant={building.occupiedRooms > 0 ? 'filled' : 'outlined'}
                  />
                  <Chip
                    label={`${strings.FREE}: ${building.freeRooms}`}
                    color="success"
                    variant={building.freeRooms > 0 ? 'filled' : 'outlined'}
                  />
                </div>

                <IconButton size="small" onClick={() => toggleExpand(building._id)}>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {strings.ROOM_TYPES} ({building.roomTypes.length})
                  </Typography>
                </IconButton>

                <Collapse in={expanded}>
                  <Table size="small" className="room-types-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>{strings.ROOM_TYPES}</TableCell>
                        <TableCell align="right">{strings.ROOMS}</TableCell>
                        <TableCell align="right">{strings.PRICE_PER_NIGHT}</TableCell>
                        <TableCell align="right">{strings.OCCUPIED}</TableCell>
                        <TableCell align="right">{strings.FREE}</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {building.roomTypes.map((rt) => (
                        <TableRow key={rt._id}>
                          <TableCell>{rt.name}</TableCell>
                          <TableCell align="right">{rt.countOfRooms}</TableCell>
                          <TableCell align="right">{rt.price}</TableCell>
                          <TableCell align="right">{rt.occupiedRooms}</TableCell>
                          <TableCell align="right">{rt.freeRooms}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              title={strings.EDIT_ROOM_TYPE}
                              onClick={() => navigate(`/update-property?p=${rt._id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Collapse>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </Layout>
  )
}

export default Buildings
