import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
    fr: {
        SOLD_OUT: 'Rupture',
        SOLD_OUT_INFO: 'Cette propriété est en rupture.',
    },
    en: {
        SOLD_OUT: 'Sold out',
        SOLD_OUT_INFO: 'This property is sold out.',
    },
    sr: {
        SOLD_OUT: 'Rasprodato',
        SOLD_OUT_INFO: 'Ova nekretnina je rasprodana.',
    },
})

langHelper.setLanguage(strings)
export { strings }
