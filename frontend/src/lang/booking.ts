import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TOTAL: 'Total :',
  },
  en: {
    TOTAL: 'Total:',
  },
  sr: {
    TOTAL: 'Ukupno:',
  },
})

langHelper.setLanguage(strings)
export { strings }
