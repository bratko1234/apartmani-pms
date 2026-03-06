import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Intégration du Widget',
    SELECT_BUILDING: 'Sélectionner un bâtiment',
    NO_BUILDINGS: 'Aucun bâtiment trouvé. Créez d\'abord un bâtiment.',
    LANGUAGE: 'Langue',
    PRIMARY_COLOR: 'Couleur principale',
    CURRENCY: 'Devise',
    WIDTH: 'Largeur',
    HEIGHT: 'Hauteur',
    EMBED_CODE: 'Code d\'intégration',
    COPY: 'Copier',
    COPIED: 'Copié !',
    PREVIEW: 'Aperçu',
    SHOW_PREVIEW: 'Afficher l\'aperçu',
    HIDE_PREVIEW: 'Masquer l\'aperçu',
  },
  en: {
    TITLE: 'Widget Embed',
    SELECT_BUILDING: 'Select Building',
    NO_BUILDINGS: 'No buildings found. Create a building first.',
    LANGUAGE: 'Language',
    PRIMARY_COLOR: 'Primary Color',
    CURRENCY: 'Currency',
    WIDTH: 'Width',
    HEIGHT: 'Height',
    EMBED_CODE: 'Embed Code',
    COPY: 'Copy',
    COPIED: 'Copied!',
    PREVIEW: 'Preview',
    SHOW_PREVIEW: 'Show Preview',
    HIDE_PREVIEW: 'Hide Preview',
  },
  sr: {
    TITLE: 'Ugradnja Widgeta',
    SELECT_BUILDING: 'Izaberite zgradu',
    NO_BUILDINGS: 'Nema zgrada. Prvo kreirajte zgradu.',
    LANGUAGE: 'Jezik',
    PRIMARY_COLOR: 'Primarna boja',
    CURRENCY: 'Valuta',
    WIDTH: 'Širina',
    HEIGHT: 'Visina',
    EMBED_CODE: 'Kod za ugradnju',
    COPY: 'Kopiraj',
    COPIED: 'Kopirano!',
    PREVIEW: 'Pregled',
    SHOW_PREVIEW: 'Prikaži pregled',
    HIDE_PREVIEW: 'Sakrij pregled',
  },
})

langHelper.setLanguage(strings)
export { strings }
