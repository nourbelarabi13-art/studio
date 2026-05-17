
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // تفعيل التصدير الثابت لضمان العمل على Netlify بدون خادم Node.js
  output: 'export',
  // ضمان أن الروابط تنتهي بـ / لسهولة الأرشفة والتنقل في المواقع الثابتة
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // تعطيل تحسين الصور التلقائي لأن التصدير الثابت لا يدعمه بدون خادم
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
