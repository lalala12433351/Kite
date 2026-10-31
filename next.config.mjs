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
      { source: '/database/site-seo.json', destination: '/api/content/site-seo' },
      { source: '/database/site-settings.json', destination: '/api/content/site-settings' },
      { source: '/database/home.json', destination: '/api/content/home' },
      { source: '/database/about.json', destination: '/api/content/about' },
      { source: '/database/courses.json', destination: '/api/content/courses' },
      { source: '/database/team.json', destination: '/api/content/team' },
      { source: '/database/placement.json', destination: '/api/content/placement' },
      { source: '/database/contact.json', destination: '/api/content/contact' },
      { source: '/database/student-hub.json', destination: '/api/content/student-hub' },
      { source: '/database/flight-announcements.json', destination: '/api/content/flight-announcements' },
      { source: '/database/virtual-classroom.json', destination: '/api/content/virtual-classroom' },
      { source: '/database/it-department.json', destination: '/api/content/it-department' },
      { source: '/database/chrome.json', destination: '/api/content/chrome' },
      { source: '/api/album-folders.json', destination: '/api/album-folders' },
    ];
  },
};

export default nextConfig;
