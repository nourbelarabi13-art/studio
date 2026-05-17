import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Enable static export for Netlify manifestation
  output: 'export',
  // Ensure paths end with / for consistent static routing
  trailingSlash: true,
  // Optimization: Skip heavy checks for faster static builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Disable automatic optimization as static export requires local processing
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
