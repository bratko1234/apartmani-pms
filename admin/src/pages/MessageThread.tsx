import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import * as movininTypes from ':movinin-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/messages'
import * as MessageService from '@/services/MessageService'
import * as helper from '@/utils/helper'

import '@/assets/css/message-thread.css'

const MessageThread: React.FC = () => {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('b') || ''

  const [user, setUser] = useState<movininTypes.User>()
  const [messages, setMessages] = useState<movininTypes.Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const onLoad = (_user?: movininTypes.User) => {
    setUser(_user)
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchMessages = useCallback(async () => {
    if (!bookingId) {
      setLoading(false)
      return
    }

    try {
      const data = await MessageService.getThread(bookingId)
      setMessages(data)
    } catch (err) {
      helper.error(err, strings.LOAD_ERROR)
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    if (!user) {
      return
    }
    fetchMessages()
  }, [user, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!user || messages.length === 0) {
      return
    }

    const unreadIds = messages
      .filter((m) => !m.readByOwner && m.sender !== 'owner')
      .map((m) => m._id)
      .filter((id): id is string => !!id)

    if (unreadIds.length > 0) {
      MessageService.markAsRead(unreadIds, 'owner').catch((err) => {
        helper.error(err)
      })
    }
  }, [user, messages])

  const handleSend = async () => {
    if (!replyContent.trim() || !bookingId) {
      return
    }

    setSending(true)
    try {
      const newMessage = await MessageService.sendReply(bookingId, replyContent.trim())
      setMessages((prev) => [...prev, newMessage])
      setReplyContent('')
    } catch (err) {
      helper.error(err, strings.SEND_ERROR)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr?: Date | string): string => {
    if (!dateStr) {
      return ''
    }
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSourceLabel = (source: movininTypes.BookingSource): string => {
    const labels: Record<string, string> = {
      [movininTypes.BookingSource.Direct]: strings.SOURCE_DIRECT,
      [movininTypes.BookingSource.Airbnb]: strings.SOURCE_AIRBNB,
      [movininTypes.BookingSource.BookingCom]: strings.SOURCE_BOOKING_COM,
      [movininTypes.BookingSource.Expedia]: strings.SOURCE_EXPEDIA,
      [movininTypes.BookingSource.Other]: strings.SOURCE_OTHER,
    }
    return labels[source] || source
  }

  const getSenderLabel = (sender: movininTypes.MessageSender): string => {
    const labels: Record<string, string> = {
      guest: strings.FROM_GUEST,
      owner: strings.FROM_OWNER,
      system: strings.FROM_SYSTEM,
    }
    return labels[sender] || sender
  }

  const getBubbleClass = (sender: movininTypes.MessageSender): string => {
    const classes: Record<string, string> = {
      guest: 'message-bubble message-bubble-guest',
      owner: 'message-bubble message-bubble-owner',
      system: 'message-bubble message-bubble-system',
    }
    return classes[sender] || 'message-bubble message-bubble-guest'
  }

  return (
    <Layout strict onLoad={onLoad}>
      <div className="message-thread">
        <Typography variant="h5" className="message-thread-title">
          {strings.GUEST_MESSAGES}
        </Typography>
        <Typography variant="body2" className="message-thread-subtitle">
          {strings.BOOKING_INFO}: {bookingId}
        </Typography>

        {loading && (
          <div className="message-thread-loading">
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {strings.LOADING}
            </Typography>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <Typography className="message-thread-empty">
            {strings.NO_MESSAGES}
          </Typography>
        )}

        {!loading && messages.length > 0 && (
          <div className="message-thread-messages">
            {messages.map((msg) => (
              <div key={msg._id} className={getBubbleClass(msg.sender)}>
                <div className="message-bubble-header">
                  <span className="message-sender-name">
                    {msg.senderName} ({getSenderLabel(msg.sender)})
                  </span>
                  <span className="message-time">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <div className="message-content">{msg.content}</div>
                {msg.sender === 'guest' && (
                  <span className="message-source-badge">
                    {getSourceLabel(msg.source)}
                  </span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {!loading && (
          <div className="message-reply-area">
            <TextField
              multiline
              maxRows={4}
              placeholder={strings.TYPE_MESSAGE}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSend}
              disabled={sending || !replyContent.trim()}
            >
              {strings.SEND}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MessageThread
