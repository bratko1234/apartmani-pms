import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Calendrier',
    SELECT_PROPERTY: 'Sélectionner une propriété',
    PREVIOUS_MONTH: 'Mois précédent',
    NEXT_MONTH: 'Mois suivant',
    AVAILABLE: 'Disponible',
    BOOKED: 'Réservé',
    NO_PROPERTIES: 'Aucune propriété trouvée',
  },
  en: {
    TITLE: 'Calendar',
    SELECT_PROPERTY: 'Select Property',
    PREVIOUS_MONTH: 'Previous Month',
    NEXT_MONTH: 'Next Month',
    AVAILABLE: 'Available',
    BOOKED: 'Booked',
    NO_PROPERTIES: 'No properties found',
  },
  sr: {
    TITLE: 'Kalendar',
    SELECT_PROPERTY: 'Izaberite nekretninu',
    PREVIOUS_MONTH: 'Prethodni mjesec',
    NEXT_MONTH: 'Sljedeći mjesec',
    AVAILABLE: 'Dostupno',
    BOOKED: 'Rezervisano',
    NO_PROPERTIES: 'Nema pronađenih nekretnina',
  },
})

langHelper.setLanguage(strings)
export { strings }
