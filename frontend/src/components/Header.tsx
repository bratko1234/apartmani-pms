import React, { useState, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  MenuItem,
  Menu,
  Button,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  More as MoreIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { CircleFlag } from 'react-circle-flags'
import * as movininTypes from ':movinin-types'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings as suStrings } from '@/lang/sign-up'
import { strings } from '@/lang/header'
import * as UserService from '@/services/UserService'
import * as PaymentService from '@/services/PaymentService'
import Avatar from './Avatar'
import * as langHelper from '@/utils/langHelper'
import * as helper from '@/utils/helper'
import { useNotificationContext, NotificationContextType } from '@/context/NotificationContext'
import { useUserContext, UserContextType } from '@/context/UserContext'

import '@/assets/css/header.css'

const flagHeight = 28

interface HeaderProps {
  hidden?: boolean
  hideSignin?: boolean
}

const Header = ({
  hidden,
  hideSignin,
}: HeaderProps) => {
  const navigate = useNavigate()

  const { user } = useUserContext() as UserContextType
  const { notificationCount } = useNotificationContext() as NotificationContextType

  const [currentUser, setCurrentUser] = useState<movininTypes.User>()

  const [lang, setLang] = useState(helper.getLanguage(env.DEFAULT_LANGUAGE))
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [langAnchorEl, setLangAnchorEl] = useState<HTMLElement | null>(null)
  const [currencyAnchorEl, setCurrencyAnchorEl] = useState<HTMLElement | null>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
  const isLangMenuOpen = Boolean(langAnchorEl)
  const isCurrencyMenuOpen = Boolean(currencyAnchorEl)

  useEffect(() => {
    const language = langHelper.getLanguage()
    setLang(helper.getLanguage(language))
    langHelper.setLanguage(strings, language)
  }, [])

  useEffect(() => {
    if (user) {
      setCurrentUser(user)
      setIsSignedIn(true)
    } else {
      setCurrentUser(undefined)
      setIsSignedIn(false)
    }
    setIsLoaded(true)
  }, [user])

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMobileMoreAnchorEl(null)
  }

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget)
  }

  const handleCurrencyMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCurrencyAnchorEl(event.currentTarget)
  }

  const refreshPage = () => {
    navigate(0)
  }

  const handleLangMenuClose = async (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(null)

    const { code } = event.currentTarget.dataset
    if (code) {
      setLang(helper.getLanguage(code))
      const currentLang = UserService.getLanguage()
      if (isSignedIn && user) {
        const data: movininTypes.UpdateLanguagePayload = {
          id: user._id as string,
          language: code,
        }
        const status = await UserService.updateLanguage(data)
        if (status === 200) {
          UserService.setLanguage(code)
          if (code && code !== currentLang) {
            refreshPage()
          }
        } else {
          toast(commonStrings.CHANGE_LANGUAGE_ERROR, { type: 'error' })
        }
      } else {
        UserService.setLanguage(code)
        if (code && code !== currentLang) {
          refreshPage()
        }
      }
    }
  }

  const handleCurrencyMenuClose = async (event: React.MouseEvent<HTMLElement>) => {
    setCurrencyAnchorEl(null)

    const { code } = event.currentTarget.dataset
    if (code) {
      const currentCurrency = PaymentService.getCurrency()
      if (code && code !== currentCurrency) {
        PaymentService.setCurrency(code)
        refreshPage()
      }
    }
  }

  const handleSettingsClick = () => {
    handleMenuClose()
    navigate('/settings')
  }

  const handleSignout = async () => {
    await UserService.signout(true, false)
    handleMenuClose()
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const handleNotificationsClick = () => {
    navigate('/notifications')
  }

  const menuId = 'user-menu'
  const renderUserMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      className="menu"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
            minWidth: 240,
            mt: 1,
          }
        }
      }}
    >
      {!isSignedIn && !hideSignin && [
        <MenuItem
          key="signin"
          onClick={() => { handleMenuClose(); navigate('/sign-in') }}
          sx={{ fontWeight: 500, py: 1.5 }}
        >
          {strings.SIGN_IN}
        </MenuItem>,
        <MenuItem
          key="signup"
          onClick={() => { handleMenuClose(); navigate('/sign-up') }}
          sx={{ py: 1.5 }}
        >
          {suStrings.SIGN_UP}
        </MenuItem>,
        <Divider key="divider-auth" />,
      ]}
      {isSignedIn && [
        <MenuItem
          key="bookings"
          onClick={() => { handleMenuClose(); navigate('/bookings') }}
          sx={{ py: 1.5 }}
        >
          {strings.BOOKINGS}
        </MenuItem>,
        <MenuItem
          key="notifications"
          onClick={() => { handleMenuClose(); navigate('/notifications') }}
          sx={{ py: 1.5 }}
        >
          {strings.NOTIFICATIONS}
          {notificationCount > 0 && (
            <Badge badgeContent={notificationCount} color="error" sx={{ ml: 2 }} />
          )}
        </MenuItem>,
        <Divider key="divider-user" />,
        <MenuItem key="settings" onClick={handleSettingsClick} sx={{ py: 1.5 }}>
          {strings.SETTINGS}
        </MenuItem>,
      ]}
      <MenuItem
        onClick={() => { handleMenuClose(); navigate('/about') }}
        sx={{ py: 1.5 }}
      >
        {strings.ABOUT}
      </MenuItem>
      <MenuItem
        onClick={() => { handleMenuClose(); navigate('/contact') }}
        sx={{ py: 1.5 }}
      >
        {strings.CONTACT}
      </MenuItem>
      {isSignedIn && [
        <Divider key="divider-signout" />,
        <MenuItem key="signout" onClick={handleSignout} sx={{ py: 1.5 }}>
          {strings.SIGN_OUT}
        </MenuItem>,
      ]}
    </Menu>
  )

  const mobileMenuId = 'mobile-menu'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={() => setMobileMoreAnchorEl(null)}
      className="menu"
    >
      <MenuItem onClick={handleSettingsClick}>
        {strings.SETTINGS}
      </MenuItem>
      <MenuItem onClick={handleLangMenuOpen}>
        {strings.LANGUAGE}
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        {strings.SIGN_OUT}
      </MenuItem>
    </Menu>
  )

  const languageMenuId = 'language-menu'
  const renderLanguageMenu = (
    <Menu
      anchorEl={langAnchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={languageMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isLangMenuOpen}
      onClose={handleLangMenuClose}
      className="menu"
      slotProps={{
        paper: {
          sx: { borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.12)', mt: 1 }
        }
      }}
    >
      {
        env._LANGUAGES.map((language) => (
          <MenuItem onClick={handleLangMenuClose} data-code={language.code} key={language.code}>
            <div className="language">
              <CircleFlag countryCode={language.countryCode as string} height={flagHeight} className="flag" title={language.label} />
              <span>{language.label}</span>
            </div>
          </MenuItem>
        ))
      }
    </Menu>
  )

  const currencyMenuId = 'currency-menu'
  const renderCurrencyMenu = (
    <Menu
      anchorEl={currencyAnchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={currencyMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isCurrencyMenuOpen}
      onClose={handleCurrencyMenuClose}
      className="menu"
      slotProps={{
        paper: {
          sx: { borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.12)', mt: 1 }
        }
      }}
    >
      {
        env.CURRENCIES.map((_currency) => (
          <MenuItem onClick={handleCurrencyMenuClose} data-code={_currency.code} key={_currency.code}>
            {_currency.code}
          </MenuItem>
        ))
      }
    </Menu>
  )

  return (
    (!hidden && (
      <div className="header">
        <AppBar position="relative" sx={{ bgcolor: '#fff', boxShadow: 'none' }}>
          <Toolbar className="toolbar">
            {/* Left: Logo */}
            {isLoaded && (
              <Button onClick={() => navigate('/')} className="logo">
                <img src="/logo.png" alt={env.WEBSITE_NAME} className="logo-img" />
              </Button>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Right: Controls */}
            <div className="header-desktop">
              {isLoaded && (
                <Button onClick={handleCurrencyMenuOpen} disableElevation className="btn bold">
                  {PaymentService.getCurrency()}
                </Button>
              )}
              {isLoaded && (
                <IconButton onClick={handleLangMenuOpen} className="btn" aria-label="language">
                  <LanguageIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}

              {isSignedIn && (
                <IconButton onClick={handleNotificationsClick} className="btn" aria-label="notifications">
                  <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                    <NotificationsIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              )}

              {/* Airbnb-style user menu button */}
              {isLoaded && (
                <Button
                  onClick={handleUserMenuOpen}
                  className="btn btn-user-menu"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  disableElevation
                >
                  <MenuIcon sx={{ fontSize: 18, color: '#222' }} />
                  {isSignedIn && currentUser ? (
                    <Avatar loggedUser={currentUser} user={currentUser} size="small" readonly />
                  ) : (
                    <div className="user-avatar-placeholder">
                      <PersonIcon />
                    </div>
                  )}
                </Button>
              )}
            </div>

            {/* Mobile controls */}
            <div className="header-mobile">
              <Button onClick={handleCurrencyMenuOpen} disableElevation className="btn bold">
                {PaymentService.getCurrency()}
              </Button>
              {!isSignedIn && (
                <IconButton onClick={handleLangMenuOpen} className="btn" aria-label="language">
                  <LanguageIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              {isSignedIn && (
                <IconButton color="inherit" onClick={handleNotificationsClick} className="btn">
                  <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                    <NotificationsIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              )}
              {isSignedIn && (
                <IconButton aria-label="show more" aria-controls={mobileMenuId} aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit" className="btn">
                  <MoreIcon />
                </IconButton>
              )}
              {!isSignedIn && isLoaded && (
                <Button
                  onClick={handleUserMenuOpen}
                  className="btn btn-user-menu"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  disableElevation
                >
                  <MenuIcon sx={{ fontSize: 16, color: '#222' }} />
                  <div className="user-avatar-placeholder">
                    <PersonIcon />
                  </div>
                </Button>
              )}
            </div>
          </Toolbar>
        </AppBar>

        {renderMobileMenu}
        {renderUserMenu}
        {renderLanguageMenu}
        {renderCurrencyMenu}
      </div>
    )) || <></>
  )
}

export default memo(Header)
