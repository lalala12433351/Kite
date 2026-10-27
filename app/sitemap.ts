import fs from 'fs';
import path from 'path';
import { courses } from '@/src/data/coursesData';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiteaviation.in';

const PATHS = [
  '/',
  '/about',
  '/courses',
  '/placement',
  '/team',
  '/gallery',
  '/news',
  '/student-hub',
  '/flight-announcements',
  '/virtual-classroom-login',
  '/careers',
  '/aviation-careers',
  '/contact',
  '/sitemap',
  '/it-department',
];

export default function sitemap() {
  const now = new Date();
  const entries = [
    ...PATHS.map((pathname) => ({
      url: `${BASE}${pathname === '/' ? '' : pathname}`,
      lastModified: now,
    })),
    ...courses.map((course) => ({
      url: `${BASE}/courses/${course.id}`,
      lastModified: now,
    })),
  ];

  try {
    const file = path.join(process.cwd(), 'data', 'news-posts.json');
    const posts = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const post of posts) {
      entries.push({
        url: `${BASE}/news/${post.id}`,
        lastModified: post.created_at ? new Date(post.created_at) : now,
      });
    }
  } catch {
    /* news file is connected at the end of the migration */
  }

  return entries;
}
