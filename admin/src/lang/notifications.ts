import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    EMPTY_LIST: 'Pas de notifications',
    VIEW: 'Consulter',
    MARK_AS_READ: 'Marquer comme lu',
    MARK_AS_UNREAD: 'Marquer comme non lu',
    MARK_ALL_AS_READ: 'Tout marquer comme lu',
    MARK_ALL_AS_UNREAD: 'Tout marquer comme non lu',
    DELETE_ALL: 'Tout supprimer',
    DELETE_NOTIFICATION: 'Êtes-vous sûr de vouloir supprimer cette notification ?',
    DELETE_NOTIFICATIONS: 'Êtes-vous sûr de vouloir supprimer ces notifications ?',
  },
  en: {
    EMPTY_LIST: 'No notifications',
    VIEW: 'View',
    MARK_AS_READ: 'Mark as read',
    MARK_AS_UNREAD: 'Mark as unread',
    MARK_ALL_AS_READ: 'Mark all as read',
    MARK_ALL_AS_UNREAD: 'Mark all as unread',
    DELETE_ALL: 'Delete all',
    DELETE_NOTIFICATION: 'Are you sure you want to delete this notification?',
    DELETE_NOTIFICATIONS: 'Are you sure you want to delete these notifications?',
  },
  sr: {
    EMPTY_LIST: 'Nema obavještenja',
    VIEW: 'Pogledaj',
    MARK_AS_READ: 'Označi kao pročitano',
    MARK_AS_UNREAD: 'Označi kao nepročitano',
    MARK_ALL_AS_READ: 'Označi sve kao pročitano',
    MARK_ALL_AS_UNREAD: 'Označi sve kao nepročitano',
    DELETE_ALL: 'Obriši sve',
    DELETE_NOTIFICATION: 'Da li ste sigurni da želite obrisati ovo obavještenje?',
    DELETE_NOTIFICATIONS: 'Da li ste sigurni da želite obrisati ova obavještenja?',
  },
})

langHelper.setLanguage(strings)
export { strings }
