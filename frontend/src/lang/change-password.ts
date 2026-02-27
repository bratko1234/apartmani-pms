import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    CHANGE_PASSWORD_HEADING: 'Modification du mot de passe',
    CURRENT_PASSWORD: 'Mot de passe actuel',
    CURRENT_PASSWORD_ERROR: 'Mauvais mot de passe',
    NEW_PASSWORD: 'Nouveau mot de passe',
    NEW_PASSWORD_ERROR: 'Veuillez choisir un nouveau mot de passe',
    PASSWORD_UPDATE_ERROR: "Une erreur s'est produite lors de la modification du mot de passe.",
    PASSWORD_UPDATE: 'Le mot de passe a été mofifié avec succès.',
  },
  en: {
    CHANGE_PASSWORD_HEADING: 'Password Modification',
    CURRENT_PASSWORD: 'Current Password',
    CURRENT_PASSWORD_ERROR: 'Wrong password',
    NEW_PASSWORD: 'New Password',
    NEW_PASSWORD_ERROR: 'Please choose a new password',
    PASSWORD_UPDATE_ERROR: 'An error occurred while updating password.',
    PASSWORD_UPDATE: 'Password changed successfully.',
  },
  sr: {
    CHANGE_PASSWORD_HEADING: 'Promjena lozinke',
    CURRENT_PASSWORD: 'Trenutna lozinka',
    CURRENT_PASSWORD_ERROR: 'Pogrešna lozinka',
    NEW_PASSWORD: 'Nova lozinka',
    NEW_PASSWORD_ERROR: 'Molimo izaberite novu lozinku',
    PASSWORD_UPDATE_ERROR: 'Došlo je do greške prilikom promjene lozinke.',
    PASSWORD_UPDATE: 'Lozinka je uspješno promijenjena.',
  },
})

langHelper.setLanguage(strings)
export { strings }
