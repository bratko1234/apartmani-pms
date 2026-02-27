import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    RESET_PASSWORD_HEADING: 'Réinitialisation du mot de passe',
    RESET_PASSWORD: 'Veuillez saisir votre adresse e-mail afin de vous envoyer un e-mail pour réinitialiser votre mot de passe.',
    EMAIL_ERROR: 'Adresse e-mail non enregistrée',
    RESET: 'Réinitialiser',
    EMAIL_SENT: 'E-mail de réinitialisation du mot de passe envoyé.',
  },
  en: {
    RESET_PASSWORD_HEADING: 'Password Reset',
    RESET_PASSWORD: 'Please enter your email address so we can send you an email to reset your password.',
    EMAIL_ERROR: 'Email address not registered',
    RESET: 'Reset',
    EMAIL_SENT: 'Password reset email sent.',
  },
  sr: {
    RESET_PASSWORD_HEADING: 'Resetovanje lozinke',
    RESET_PASSWORD: 'Molimo unesite vašu email adresu kako bismo vam poslali email za resetovanje lozinke.',
    EMAIL_ERROR: 'Email adresa nije registrovana',
    RESET: 'Resetuj',
    EMAIL_SENT: 'Email za resetovanje lozinke je poslan.',
  },
})

langHelper.setLanguage(strings)
export { strings }
