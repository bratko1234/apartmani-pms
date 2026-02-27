import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    ACTIVATE_HEADING: 'Activation du compte',
    TOKEN_EXPIRED: "Votre lien d'activation du compte a expiré.",
    ACTIVATE: 'Activer',
  },
  en: {
    ACTIVATE_HEADING: 'Account Activation',
    TOKEN_EXPIRED: 'Your account activation link expired.',
    ACTIVATE: 'Activate',
  },
  sr: {
    ACTIVATE_HEADING: 'Aktivacija naloga',
    TOKEN_EXPIRED: 'Vaš link za aktivaciju naloga je istekao.',
    ACTIVATE: 'Aktiviraj',
  },
})

langHelper.setLanguage(strings)
export { strings }
