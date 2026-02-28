import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    MEMBER_DISCOUNT: 'Remise membre',
    MEMBERS_SAVE: 'Les membres economisent {0}%',
    SIGN_IN_TO_SAVE: 'Connectez-vous et economisez {0}%',
    MEMBER_PRICE: 'Prix membre',
    REGULAR_PRICE: 'Prix normal',
    MEMBER_BADGE: 'Membre',
    CREATE_ACCOUNT_TO_SAVE: 'Creez un compte et economisez {0}%',
  },
  en: {
    MEMBER_DISCOUNT: 'Member discount',
    MEMBERS_SAVE: 'Members save {0}%',
    SIGN_IN_TO_SAVE: 'Sign in and save {0}%',
    MEMBER_PRICE: 'Member price',
    REGULAR_PRICE: 'Regular price',
    MEMBER_BADGE: 'Member',
    CREATE_ACCOUNT_TO_SAVE: 'Create an account and save {0}%',
  },
  sr: {
    MEMBER_DISCOUNT: 'Popust za clanove',
    MEMBERS_SAVE: 'Clanovi ustede {0}%',
    SIGN_IN_TO_SAVE: 'Prijavite se i ustedite {0}%',
    MEMBER_PRICE: 'Cijena za clanove',
    REGULAR_PRICE: 'Redovna cijena',
    MEMBER_BADGE: 'Clan',
    CREATE_ACCOUNT_TO_SAVE: 'Kreirajte nalog i ustedite {0}%',
  },
})

langHelper.setLanguage(strings)

export { strings }
