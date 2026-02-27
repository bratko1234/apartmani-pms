import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TOTAL: 'Total :',
    DELETE_BOOKING: 'Êtes-vous sûr de vouloir supprimer cette réservation ?',
  },
  en: {
    TOTAL: 'Total:',
    DELETE_BOOKING: 'Are you sure you want to delete this booking?',
  },
  sr: {
    TOTAL: 'Ukupno:',
    DELETE_BOOKING: 'Da li ste sigurni da želite obrisati ovu rezervaciju?',
  },
})

langHelper.setLanguage(strings)
export { strings }
