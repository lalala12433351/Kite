/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.alias['@'] = root;
    return config;
  },
  async redirects() {
    return [
      { source: '/careers-admin', destination: '/admin', permanent: false },
      { source: '/aviation-careers-admin', destination: '/admin', permanent: false },
      { source: '/news-admin', destination: '/admin', permanent: false },
      { source: '/gallery-admin', destination: '/admin?module=gallery', permanent: false },
      { source: '/certificate/admin', destination: '/superadmin?tab=certificates', permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: '/database/news-posts.json', destination: '/api/content/news' },
      { source: '/database/careers-posts.json', destination: '/api/content/careers' },
      { source: '/database/aviation-careers-posts.json', destination: '/api/content/aviation-careers' },
      { source: '/database/gallery-albums.json', destination: '/api/content/gallery-albums' },
      { source: '/database/gallery-images.json', destination: '/api/content/gallery-images' },
      { source: '/database/gallery-settings.json', destination: '/api/content/gallery-settings' },
      { source: '/api/album-folders.json', destination: '/api/album-folders' },
    ];
  },
};

export default nextConfig;
