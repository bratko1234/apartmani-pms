import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    DELETE_USER: 'Êtes-vous sûr de vouloir supprimer cet utilisateur et toutes ses données ?',
    DELETE_USERS: 'Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés et toutes leurs données ?',
    DELETE_SELECTION: 'Supprimer les utilisateurs sélectionnés',
    BLACKLIST: 'Ajouter à la liste noire',
  },
  en: {
    DELETE_USER: 'Are you sure you want to delete this user and all his data?',
    DELETE_USERS: 'Are you sure you want to delete the selected users and all their data?',
    DELETE_SELECTION: 'Delete selectied users',
    BLACKLIST: 'Add to the blacklist',
  },
  sr: {
    DELETE_USER: 'Da li ste sigurni da želite obrisati ovog korisnika i sve njegove podatke?',
    DELETE_USERS: 'Da li ste sigurni da želite obrisati odabrane korisnike i sve njihove podatke?',
    DELETE_SELECTION: 'Obriši odabrane korisnike',
    BLACKLIST: 'Dodaj na crnu listu',
  },
})

langHelper.setLanguage(strings)
export { strings }
