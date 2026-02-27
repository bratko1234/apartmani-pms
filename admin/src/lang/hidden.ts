import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
    fr: {
        HIDDEN: 'Cachée',
        HIDDEN_INFO: 'Cette propriété est cachée.',
    },
    en: {
        HIDDEN: 'Hidden',
        HIDDEN_INFO: 'This property is hidden.',
    },
    sr: {
        HIDDEN: 'Skriveno',
        HIDDEN_INFO: 'Ova nekretnina je skrivena.',
    },
})

langHelper.setLanguage(strings)
export { strings }
