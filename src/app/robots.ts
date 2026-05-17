import { MetadataRoute } from 'next';

/**
 * Static Robots Manifest
 * Ensures search engines can crawl the Archive safely.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/settings/', '/profile/edit/'],
    },
    sitemap: 'https://rosaline-bela.netlify.app/sitemap.xml',
  };
}
