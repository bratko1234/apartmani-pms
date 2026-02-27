import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    NEW_LOCATION_HEADING: 'Nouveau lieu',
    LOCATION_NAME: 'Lieu',
    INVALID_LOCATION: 'Ce lieu existe déjà.',
    LOCATION_CREATED: 'Lieu créé avec succès.',
    COUNTRY: 'Pays',
    PARENT_LOCATION: 'Lieu Parent',
  },
  en: {
    NEW_LOCATION_HEADING: 'New location',
    LOCATION_NAME: 'Location',
    INVALID_LOCATION: 'This location already exists.',
    LOCATION_CREATED: 'Location created successfully.',
    COUNTRY: 'Country',
    PARENT_LOCATION: 'Parent Location',
  },
  sr: {
    NEW_LOCATION_HEADING: 'Nova lokacija',
    LOCATION_NAME: 'Lokacija',
    INVALID_LOCATION: 'Ova lokacija već postoji.',
    LOCATION_CREATED: 'Lokacija je uspješno kreirana.',
    COUNTRY: 'Država',
    PARENT_LOCATION: 'Nadređena lokacija',
  },
})

langHelper.setLanguage(strings)
export { strings }
