import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { frFR as corefrFR, enUS as coreenUS } from '@mui/material/locale'
import { frFR, enUS } from '@mui/x-date-pickers/locales'
import { frFR as dataGridfrFR, enUS as dataGridenUS } from '@mui/x-data-grid/locales'
import { disableDevTools } from ':disable-react-devtools'
import * as helper from '@/utils/helper'
import * as UserService from '@/services/UserService'
import * as IpInfoService from '@/services/IpInfoService'
import env from '@/config/env.config'
import App from '@/App'

import { strings as activateStrings } from '@/lang/activate'
import { strings as bookingStrings } from '@/lang/booking'
import { strings as bookingFilterStrings } from '@/lang/booking-filter'
import { strings as bookingListStrings } from '@/lang/booking-list'
import { strings as bookingPropertyListStrings } from '@/lang/booking-property-list'
import { strings as bookingsStrings } from '@/lang/bookings'
import { strings as changePasswordStrings } from '@/lang/change-password'
import { strings as checkoutStrings } from '@/lang/checkout'
import { strings as commonStrings } from '@/lang/common'
import { strings as contactFormStrings } from '@/lang/contact-form'
import { strings as footerStrings } from '@/lang/footer'
import { strings as headerStrings } from '@/lang/header'
import { strings as homeStrings } from '@/lang/home'
import { strings as locationCarrouselStrings } from '@/lang/location-carrousel'
import { strings as mapStrings } from '@/lang/map'
import { strings as masterStrings } from '@/lang/master'
import { strings as noMatchStrings } from '@/lang/no-match'
import { strings as notificationsStrings } from '@/lang/notifications'
import { strings as propertiesStrings } from '@/lang/properties'
import { strings as propertyStrings } from '@/lang/property'
import { strings as rentalTermStrings } from '@/lang/rental-term'
import { strings as resetPasswordStrings } from '@/lang/reset-password'
import { strings as searchStrings } from '@/lang/search'
import { strings as settingsStrings } from '@/lang/settings'
import { strings as signInStrings } from '@/lang/sign-in'
import { strings as signUpStrings } from '@/lang/sign-up'
import { strings as soldOutStrings } from '@/lang/sold-out'
import { strings as tosStrings } from '@/lang/tos'
import { strings as trustBadgesStrings } from '@/lang/trust-badges'
import { strings as priceBreakdownStrings } from '@/lang/price-breakdown'
import { strings as bookingSummaryStrings } from '@/lang/booking-summary'

// import 'github-fork-ribbon-css/gh-fork-ribbon.css'

import '@/assets/css/common.css'
import '@/assets/css/index.css'

if (env.isProduction) {
  disableDevTools()
}

let language = env.DEFAULT_LANGUAGE
const user = JSON.parse(localStorage.getItem('mi-fe-user') ?? 'null')
let lang = UserService.getQueryLanguage()

if (lang) {
  if (!env.LANGUAGES.includes(lang)) {
    lang = localStorage.getItem('mi-fe-language')

    if (lang && !env.LANGUAGES.includes(lang)) {
      lang = env.DEFAULT_LANGUAGE
    }
  }

  try {
    if (user) {
      language = user.language
      if (lang && lang.length === 2 && user.language !== lang) {
        const data = {
          id: user.id,
          language: lang,
        }

        const status = await UserService.validateAccessToken()

        if (status === 200) {
          const _status = await UserService.updateLanguage(data)
          if (_status !== 200) {
            helper.error(null, commonStrings.CHANGE_LANGUAGE_ERROR)
          }
        }

        language = lang
      }
    } else if (lang) {
      language = lang
    }
    UserService.setLanguage(language)
    commonStrings.setLanguage(language)
  } catch (err) {
    helper.error(err, commonStrings.CHANGE_LANGUAGE_ERROR)
  }
} else {
  //
  // If language not set, set language by IP
  //
  let storedLang

  if (user && user.language) {
    storedLang = user.language
  } else {
    const slang = localStorage.getItem('mi-fe-language')
    if (slang && slang.length === 2) {
      storedLang = slang
    }
  }

  const updateLang = (_lang: string) => {
    UserService.setLanguage(_lang)

    activateStrings.setLanguage(_lang)
    bookingStrings.setLanguage(_lang)
    bookingFilterStrings.setLanguage(_lang)
    bookingListStrings.setLanguage(_lang)
    bookingPropertyListStrings.setLanguage(_lang)
    bookingsStrings.setLanguage(_lang)
    changePasswordStrings.setLanguage(_lang)
    checkoutStrings.setLanguage(_lang)
    commonStrings.setLanguage(_lang)
    contactFormStrings.setLanguage(_lang)
    footerStrings.setLanguage(_lang)
    headerStrings.setLanguage(_lang)
    homeStrings.setLanguage(_lang)
    locationCarrouselStrings.setLanguage(_lang)
    mapStrings.setLanguage(_lang)
    masterStrings.setLanguage(_lang)
    noMatchStrings.setLanguage(_lang)
    notificationsStrings.setLanguage(_lang)
    propertiesStrings.setLanguage(_lang)
    propertyStrings.setLanguage(_lang)
    rentalTermStrings.setLanguage(_lang)
    resetPasswordStrings.setLanguage(_lang)
    searchStrings.setLanguage(_lang)
    settingsStrings.setLanguage(_lang)
    signInStrings.setLanguage(_lang)
    signUpStrings.setLanguage(_lang)
    soldOutStrings.setLanguage(_lang)
    tosStrings.setLanguage(_lang)
    trustBadgesStrings.setLanguage(_lang)
    priceBreakdownStrings.setLanguage(_lang)
    bookingSummaryStrings.setLanguage(_lang)
  }

  if (env.SET_LANGUAGE_FROM_IP && !storedLang) {
    const country = await IpInfoService.getCountryCode()

    if (['FR', 'MA'].includes(country)) {
      updateLang('fr')
    } else if (['US', 'GB', 'AU'].includes(country)) {
      updateLang('en')
    } else {
      updateLang(env.DEFAULT_LANGUAGE)
    }
  }
}

language = UserService.getLanguage()
const isFr = language === 'fr'

const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#FF385C',
        light: '#FF5A7D',
        dark: '#D70466',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#222222',
        light: '#484848',
        dark: '#000000',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#222222',
        secondary: '#6A6A6A',
      },
    },
    typography: {
      fontFamily: '"Inter", Circular, -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif',
      fontSize: 14,
      h1: {
        fontSize: '32px',
        fontWeight: 700,
        lineHeight: 1.25,
      },
      h2: {
        fontSize: '26px',
        fontWeight: 500,
        lineHeight: '30px',
      },
      h3: {
        fontSize: '22px',
        fontWeight: 500,
        lineHeight: '26px',
      },
      h4: {
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '20px',
      },
      h5: {
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '18px',
      },
      body1: {
        fontSize: '16px',
        lineHeight: '24px',
      },
      body2: {
        fontSize: '14px',
        lineHeight: '20px',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#FFFFFF',
            color: '#222222',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none' as const,
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%)',
            '&:hover': {
              background: 'linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%)',
              opacity: 0.9,
            },
          },
          outlinedPrimary: {
            borderColor: '#222222',
            color: '#222222',
            '&:hover': {
              borderColor: '#000000',
              backgroundColor: '#F7F7F7',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: 'rgba(0, 0, 0, 0.08) 0px 1px 2px, rgba(0, 0, 0, 0.05) 0px 4px 12px',
          },
          elevation2: {
            boxShadow: 'rgba(0, 0, 0, 0.12) 0px 6px 16px',
          },
          elevation3: {
            boxShadow: 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 8px 24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: 'none',
            border: '1px solid #DDDDDD',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderColor: '#DDDDDD',
              },
              '&:hover fieldset': {
                borderColor: '#222222',
              },
            },
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& .Mui-disabled': {
              color: '#333 !important',
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .Mui-checked': {
              color: '#FF385C !important',
            },
            '& .Mui-checked+.MuiSwitch-track': {
              opacity: 0.7,
              backgroundColor: '#FF385C !important',
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '& .MuiAutocomplete-inputRoot': {
              paddingRight: '20px !important',
            },
          },
          listbox: {
            '& .Mui-focused': {
              backgroundColor: '#F7F7F7 !important',
            },
          },
          option: {
            '&[aria-selected="true"]': {
              backgroundColor: '#F7F7F7 !important',
            },
          },
        },
      },
    },
  },
  isFr ? frFR : enUS,
  isFr ? dataGridfrFR : dataGridenUS,
  isFr ? corefrFR : coreenUS,
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="dark"
      />
    </CssBaseline>
    {/* <a
      className="github-fork-ribbon fixed left-bottom"
      href="https://github.com/aelassas/movinin"
      data-ribbon="Fork me on GitHub"
      title="Fork me on GitHub"
    >
      Fork me on GitHub
    </a> */}
  </ThemeProvider>,
)
