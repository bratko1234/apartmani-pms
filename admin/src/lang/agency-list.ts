import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    EMPTY_LIST: 'Aucune agence.',
    VIEW_AGENCY: 'Voir le profil de cette agence',
    DELETE_AGENCY: 'Êtes-vous sûr de vouloir supprimer cette agence et toutes ses données ?',
  },
  en: {
    EMPTY_LIST: 'No agencies.',
    VIEW_AGENCY: 'View agency profile',
    DELETE_AGENCY: 'Are you sure you want to delete this agency and all its data?',
  },
  sr: {
    EMPTY_LIST: 'Nema agencija.',
    VIEW_AGENCY: 'Pogledaj profil agencije',
    DELETE_AGENCY: 'Da li ste sigurni da želite obrisati ovu agenciju i sve njene podatke?',
  },
})

langHelper.setLanguage(strings)
export { strings }
