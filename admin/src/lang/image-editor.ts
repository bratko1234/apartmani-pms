import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
    fr: {
        ADD_IMAGE: 'Ajouter une image principale',
        ADD_IMAGES: 'Ajouter des images supplémentaires',
        UPDATE_IMAGE: "Modifier l'image principale",
        DELETE_IMAGE: 'Êtes-vous sûr de vouloir supprimer cette image ?',
    },
    en: {
        ADD_IMAGE: 'Add main image',
        ADD_IMAGES: 'Add additional images',
        UPDATE_IMAGE: 'Update main image',
        DELETE_IMAGE: 'Are you sure you want to delete this image?',
    },
    sr: {
        ADD_IMAGE: 'Dodaj glavnu sliku',
        ADD_IMAGES: 'Dodaj dodatne slike',
        UPDATE_IMAGE: 'Izmijeni glavnu sliku',
        DELETE_IMAGE: 'Da li ste sigurni da želite obrisati ovu sliku?',
    },
})

langHelper.setLanguage(strings)
export { strings }
