import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Abonnez-vous',
    SUB_TITLE: 'Abonnez-vous à notre liste de diffusion pour recevoir les dernières mises à jour !',
    SUBSCRIBE: "S'abonner",
    SUCCESS: 'Inscription réussie !',
  },
  en: {
    TITLE: 'Subscribe',
    SUB_TITLE: 'Subscribe to our mailing list for the latest updates!',
    SUBSCRIBE: 'Subscribe',
    SUCCESS: 'Subscription successful!',
  },
  sr: {
    TITLE: 'Pretplatite se',
    SUB_TITLE: 'Pretplatite se na naš bilten za najnovije informacije!',
    SUBSCRIBE: 'Pretplati se',
    SUCCESS: 'Pretplata uspješna!',
  },
})

langHelper.setLanguage(strings)
export { strings }
