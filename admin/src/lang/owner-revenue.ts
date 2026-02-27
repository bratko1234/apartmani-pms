import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Revenu',
    PROPERTY: 'Propriété',
    SOURCE: 'Source',
    BOOKINGS: 'Réservations',
    NIGHTS: 'Nuits',
    GROSS_REVENUE: 'Revenu brut',
    MONTH: 'Mois',
    YEAR: 'Année',
    NO_DATA: 'Aucune donnée pour cette période',
    TOTAL: 'Total',
    PREVIOUS_MONTH: 'Mois précédent',
    NEXT_MONTH: 'Mois suivant',
  },
  en: {
    TITLE: 'Revenue',
    PROPERTY: 'Property',
    SOURCE: 'Source',
    BOOKINGS: 'Bookings',
    NIGHTS: 'Nights',
    GROSS_REVENUE: 'Gross Revenue',
    MONTH: 'Month',
    YEAR: 'Year',
    NO_DATA: 'No data for this period',
    TOTAL: 'Total',
    PREVIOUS_MONTH: 'Previous Month',
    NEXT_MONTH: 'Next Month',
  },
  sr: {
    TITLE: 'Prihod',
    PROPERTY: 'Nekretnina',
    SOURCE: 'Izvor',
    BOOKINGS: 'Rezervacije',
    NIGHTS: 'Noći',
    GROSS_REVENUE: 'Bruto prihod',
    MONTH: 'Mjesec',
    YEAR: 'Godina',
    NO_DATA: 'Nema podataka za ovaj period',
    TOTAL: 'Ukupno',
    PREVIOUS_MONTH: 'Prethodni mjesec',
    NEXT_MONTH: 'Sljedeći mjesec',
  },
})

langHelper.setLanguage(strings)
export { strings }
