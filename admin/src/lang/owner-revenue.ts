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
    OTA_COMMISSION: 'Commission OTA',
    MANAGEMENT_FEE: 'Frais de gestion',
    NET_TO_OWNER: 'Net au propriétaire',
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
    OTA_COMMISSION: 'OTA Commission',
    MANAGEMENT_FEE: 'Management Fee',
    NET_TO_OWNER: 'Net to Owner',
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
    OTA_COMMISSION: 'OTA provizija',
    MANAGEMENT_FEE: 'Provizija za upravljanje',
    NET_TO_OWNER: 'Neto vlasniku',
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
