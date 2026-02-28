import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    BEST_PRICE_TITLE: 'Meilleur prix garanti',
    BEST_PRICE_SUBTITLE: 'Réservez en direct pour le meilleur tarif',
    FREE_CANCEL_TITLE: 'Annulation gratuite',
    FREE_CANCEL_SUBTITLE: 'Annulation gratuite jusqu\'à 48h avant',
    SUPPORT_TITLE: 'Assistance 24/7',
    SUPPORT_SUBTITLE: 'Nous sommes toujours là pour vous aider',
  },
  en: {
    BEST_PRICE_TITLE: 'Best Price Guarantee',
    BEST_PRICE_SUBTITLE: 'Book direct for the best rate',
    FREE_CANCEL_TITLE: 'Free Cancellation',
    FREE_CANCEL_SUBTITLE: 'Free cancellation up to 48h before',
    SUPPORT_TITLE: '24/7 Support',
    SUPPORT_SUBTITLE: 'We are always here to help you',
  },
  sr: {
    BEST_PRICE_TITLE: 'Garantovana najbolja cijena',
    BEST_PRICE_SUBTITLE: 'Rezervišite direktno za najbolju cijenu',
    FREE_CANCEL_TITLE: 'Besplatno otkazivanje',
    FREE_CANCEL_SUBTITLE: 'Besplatno otkazivanje do 48h prije',
    SUPPORT_TITLE: 'Podrška 24/7',
    SUPPORT_SUBTITLE: 'Uvijek smo tu da vam pomognemo',
  },
})

langHelper.setLanguage(strings)

export { strings }
