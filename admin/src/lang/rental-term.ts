import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    MONTHLY: 'Mensuel',
    WEEKLY: 'Hebdomadaire',
    DAILY: 'Journalier',
    YEARLY: 'Annuel',
    MONTH: 'mois',
    WEEK: 'semaine',
    DAY: 'jour',
    YEAR: 'an',
  },
  en: {
    MONTHLY: 'Monthly',
    WEEKLY: 'Weekly',
    DAILY: 'Daily',
    YEARLY: 'Yearly',
    MONTH: 'month',
    WEEK: 'week',
    DAY: 'day',
    YEAR: 'year',
  },
  sr: {
    MONTHLY: 'Mjesečno',
    WEEKLY: 'Sedmično',
    DAILY: 'Dnevno',
    YEARLY: 'Godišnje',
    MONTH: 'mjesec',
    WEEK: 'sedmica',
    DAY: 'dan',
    YEAR: 'godina',
  },
})

langHelper.setLanguage(strings)
export { strings }
