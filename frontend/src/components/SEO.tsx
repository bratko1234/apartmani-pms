import React from 'react'
import { Helmet } from 'react-helmet-async'
import env from '@/config/env.config'

interface SEOProps {
  /** Page title. Will be suffixed with the site name. */
  title: string
  /** Meta description (max ~160 chars recommended). */
  description: string
  /** Open Graph image URL (absolute). */
  image?: string
  /** Canonical URL for this page (absolute). */
  url?: string
  /** Open Graph type. Defaults to "website". */
  type?: string
  /** JSON-LD structured data object. Serialized into a script tag. */
  jsonLd?: Record<string, unknown>
  /** When true, adds noindex/nofollow robots directive. */
  noindex?: boolean
}

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd,
  noindex = false,
}: SEOProps) => {
  const siteName = env.WEBSITE_NAME
  const fullTitle = `${title} | ${siteName}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Canonical */}
      {url && <link rel="canonical" href={url} />}

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}

export default SEO
