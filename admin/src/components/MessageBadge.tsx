import React, { useState, useEffect, useCallback } from 'react'
import { Badge, IconButton, Tooltip } from '@mui/material'
import MailIcon from '@mui/icons-material/Mail'
import * as MessageService from '@/services/MessageService'
import { strings } from '@/lang/messages'
import * as helper from '@/utils/helper'

interface MessageBadgeProps {
  onClick?: () => void
}

const POLL_INTERVAL_MS = 60000

const MessageBadge: React.FC<MessageBadgeProps> = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await MessageService.getUnreadCount()
      setUnreadCount(result.total)
    } catch (err) {
      helper.error(err)
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()

    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return (
    <Tooltip title={strings.UNREAD_MESSAGES}>
      <IconButton color="inherit" onClick={onClick}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <MailIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}

export default MessageBadge
