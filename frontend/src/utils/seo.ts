/**
 * SEO utility functions for generating URL-friendly slugs
 * and structured data for search engines.
 */

/**
 * Generates a URL-friendly slug from a property name.
 * Transliterates Serbian Latin diacritics to ASCII equivalents.
 *
 * @param name - The display name to convert
 * @returns A lowercase, hyphen-separated slug safe for URLs
 *
 * @example
 * generateSlug('Apartman Šumarice Čair') // 'apartman-sumarice-cair'
 * generateSlug('Kuća na Đurđevdan') // 'kuca-na-djurdjevdan'
 */
export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[šś]/g, 's')
    .replace(/[žź]/g, 'z')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Truncates a string to the given max length, appending ellipsis if needed.
 * Breaks at the last word boundary before the limit.
 *
 * @param text - The source string
 * @param maxLength - Maximum character count (default 160 for meta descriptions)
 * @returns The truncated string
 */
export const truncateDescription = (text: string, maxLength = 160): string => {
  const stripped = text.replace(/<[^>]*>/g, '').trim()

  if (stripped.length <= maxLength) {
    return stripped
  }

  const truncated = stripped.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0
    ? `${truncated.slice(0, lastSpace)}...`
    : `${truncated}...`
}

/**
 * Builds the canonical URL for a property detail page.
 *
 * @param baseUrl - The frontend origin (e.g. https://apartmani.ba)
 * @param propertyId - The MongoDB ObjectId
 * @param propertyName - The display name used to generate the slug
 * @returns Full canonical URL
 */
export const buildPropertyUrl = (
  baseUrl: string,
  propertyId: string,
  propertyName: string,
): string => `${baseUrl}/property/${propertyId}/${generateSlug(propertyName)}`
