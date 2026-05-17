import { MetadataRoute } from 'next';

/**
 * Static Sitemap Manifest
 * Standardized for output: 'export' compatibility.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rosaline-bela.netlify.app';
  
  return [
    {
      url: baseUrl,
      lastModified: '2024-01-01T00:00:00.000Z',
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: '2024-01-01T00:00:00.000Z',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vault`,
      lastModified: '2024-01-01T00:00:00.000Z',
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ];
}
