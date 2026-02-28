import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Mes paiements',
    PERIOD: 'Période',
    TOTAL_PAYOUT: 'Paiement total',
    STATUS: 'Statut',
    PAID_AT: 'Payé le',
    DRAFT: 'Brouillon',
    APPROVED: 'Approuvé',
    PAID: 'Payé',
    NO_DATA: 'Aucun paiement trouvé',
    VIEW_DETAIL: 'Voir le détail',
    PREVIOUS_YEAR: 'Année précédente',
    NEXT_YEAR: 'Année suivante',
  },
  en: {
    TITLE: 'My Payouts',
    PERIOD: 'Period',
    TOTAL_PAYOUT: 'Total Payout',
    STATUS: 'Status',
    PAID_AT: 'Paid At',
    DRAFT: 'Draft',
    APPROVED: 'Approved',
    PAID: 'Paid',
    NO_DATA: 'No payouts found',
    VIEW_DETAIL: 'View Detail',
    PREVIOUS_YEAR: 'Previous Year',
    NEXT_YEAR: 'Next Year',
  },
  sr: {
    TITLE: 'Moje isplate',
    PERIOD: 'Period',
    TOTAL_PAYOUT: 'Ukupna isplata',
    STATUS: 'Status',
    PAID_AT: 'Plaćeno',
    DRAFT: 'Nacrt',
    APPROVED: 'Odobreno',
    PAID: 'Plaćeno',
    NO_DATA: 'Nema isplata',
    VIEW_DETAIL: 'Pogledaj detalje',
    PREVIOUS_YEAR: 'Prethodna godina',
    NEXT_YEAR: 'Sljedeća godina',
  },
})

langHelper.setLanguage(strings)
export { strings }
