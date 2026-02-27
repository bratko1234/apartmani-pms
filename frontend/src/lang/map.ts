import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    SELECT_LOCATION: 'Choisir cette destination',
  },
  en: {
    SELECT_LOCATION: 'Select Destination',
  },
  sr: {
    SELECT_LOCATION: 'Izaberi destinaciju',
  },
})

langHelper.setLanguage(strings)
export { strings }
