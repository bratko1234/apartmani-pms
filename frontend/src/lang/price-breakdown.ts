import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    NIGHTS: 'nuits',
    TOTAL: 'Total',
  },
  en: {
    NIGHTS: 'nights',
    TOTAL: 'Total',
  },
  sr: {
    NIGHTS: 'noći',
    TOTAL: 'Ukupno',
  },
})

langHelper.setLanguage(strings)

export { strings }
