
import { MetadataRoute } from 'next';

/**
 * ملف robots.txt البرمجي لإرشاد محركات البحث.
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
