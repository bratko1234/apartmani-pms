import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Bâtiments',
    EMPTY_LIST: 'Aucun bâtiment trouvé.',
    TOTAL_ROOMS: 'Total des chambres',
    OCCUPIED: 'Occupées',
    FREE: 'Libres',
    ROOM_TYPES: 'Types de chambres',
    ROOMS: 'Chambres',
    PRICE_PER_NIGHT: 'Prix/nuit',
    OWNER: 'Propriétaire',
    LOCATION: 'Emplacement',
    EDIT_BUILDING: 'Modifier le bâtiment',
    EDIT_ROOM_TYPE: 'Modifier le type',
  },
  en: {
    TITLE: 'Buildings',
    EMPTY_LIST: 'No buildings found.',
    TOTAL_ROOMS: 'Total Rooms',
    OCCUPIED: 'Occupied',
    FREE: 'Free',
    ROOM_TYPES: 'Room Types',
    ROOMS: 'Rooms',
    PRICE_PER_NIGHT: 'Price/night',
    OWNER: 'Owner',
    LOCATION: 'Location',
    EDIT_BUILDING: 'Edit Building',
    EDIT_ROOM_TYPE: 'Edit Room Type',
  },
  sr: {
    TITLE: 'Zgrade',
    EMPTY_LIST: 'Nema zgrada.',
    TOTAL_ROOMS: 'Ukupno soba',
    OCCUPIED: 'Zauzeto',
    FREE: 'Slobodno',
    ROOM_TYPES: 'Tipovi soba',
    ROOMS: 'Sobe',
    PRICE_PER_NIGHT: 'Cijena/noć',
    OWNER: 'Vlasnik',
    LOCATION: 'Lokacija',
    EDIT_BUILDING: 'Uredi zgradu',
    EDIT_ROOM_TYPE: 'Uredi tip sobe',
  },
})

langHelper.setLanguage(strings)
export { strings }
