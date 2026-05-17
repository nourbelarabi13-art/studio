
import { MetadataRoute } from 'next';

/**
 * خريطة الموقع لمساعدة غوغل على فهرسة الصفحات بسرعة.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rosaline-bela.netlify.app';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/library/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community/`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vault/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
