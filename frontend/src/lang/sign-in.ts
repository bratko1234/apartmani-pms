import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    SIGN_IN_HEADING: 'Connexion',
    SIGN_IN: 'Se connecter',
    SIGN_UP: "S'inscrire",
    ERROR_IN_SIGN_IN: 'E-mail ou mot de passe incorrect.',
    IS_BLACKLISTED: 'Votre compte est suspendu.',
    RESET_PASSWORD: 'Mot de passe oublié ?',
    STAY_CONNECTED: 'Rester connecté',
  },
  en: {
    SIGN_IN_HEADING: 'Sign in',
    SIGN_IN: 'Sign in',
    SIGN_UP: 'Sign up',
    ERROR_IN_SIGN_IN: 'Incorrect email or password.',
    IS_BLACKLISTED: 'Your account is suspended.',
    RESET_PASSWORD: 'Forgot password?',
    STAY_CONNECTED: 'Stay connected',
  },
  sr: {
    SIGN_IN_HEADING: 'Prijava',
    SIGN_IN: 'Prijavi se',
    SIGN_UP: 'Registruj se',
    ERROR_IN_SIGN_IN: 'Pogrešan email ili lozinka.',
    IS_BLACKLISTED: 'Vaš nalog je suspendovan.',
    RESET_PASSWORD: 'Zaboravljena lozinka?',
    STAY_CONNECTED: 'Ostani prijavljen',
  },
})

langHelper.setLanguage(strings)
export { strings }
