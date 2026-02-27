import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    LOCATION: 'Lieu',
  },
  en: {
    LOCATION: 'location',
  },
  sr: {
    LOCATION: 'lokacija',
  },
})

langHelper.setLanguage(strings)
export { strings }
