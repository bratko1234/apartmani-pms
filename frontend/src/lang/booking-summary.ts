import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    BOOK_NOW: 'Réserver maintenant',
  },
  en: {
    BOOK_NOW: 'Book Now',
  },
  sr: {
    BOOK_NOW: 'Rezerviši odmah',
  },
})

langHelper.setLanguage(strings)

export { strings }
