import { readContent } from '@/lib/content';
import { pageMeta as fallbackMeta } from '@/lib/pageMeta';

const PAGE_META_KEY_MAP = {
  home: 'home',
  about: 'about',
  courses: 'courses',
  course: 'course',
  placement: 'placement',
  team: 'team',
  gallery: 'gallery',
  news: 'news',
  newsDetail: 'newsDetail',
  studentHub: 'studentHub',
  flightAnnouncements: 'flightAnnouncements',
  virtualClassroomLogin: 'virtualClassroomLogin',
  virtualClassroom: 'virtualClassroom',
  careers: 'careers',
  aviationCareers: 'aviationCareers',
  contact: 'contact',
  sitemap: 'sitemap',
  itDepartment: 'itDepartment',
  admin: 'admin',
};

function assetPath(value) {
  if (!value) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) return raw;
  return `/${raw.replace(/^\.\//, '')}`;
}

export function getSiteContent(kind) {
  try {
    return readContent(kind) || {};
  } catch {
    return {};
  }
}

export function getSeoDocument() {
  const doc = getSiteContent('site-seo');
  return {
    defaults: doc?.defaults || {},
    pages: doc?.pages || {},
  };
}

/** Build Next.js Metadata for a page key (matches pageMeta keys). */
export function resolvePageMetadata(pageKey) {
  const fallback = fallbackMeta[pageKey] || fallbackMeta.home;
  if (pageKey === 'admin') {
    return {
      title: fallback.title || 'Admin',
      robots: { index: false, follow: false },
    };
  }

  const { defaults, pages } = getSeoDocument();
  const page = pages[pageKey] || pages[PAGE_META_KEY_MAP[pageKey]] || {};
  const title = page.title || defaults.title || fallback.title;
  const description = page.description || defaults.description || fallback.description;
  const ogTitle = page.ogTitle || title;
  const ogDescription = page.ogDescription || description;
  const ogImage = assetPath(page.ogImage || defaults.ogImage);

  const meta = {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };

  return {
    ...meta,
    ...(fallback.robots ? { robots: fallback.robots } : {}),
  };
}

export function getCoursesList() {
  const doc = getSiteContent('courses');
  return Array.isArray(doc?.courses) ? doc.courses : [];
}

export function getCourseById(id) {
  const numId = parseInt(id, 10);
  const list = getCoursesList();
  if (!Number.isNaN(numId)) {
    const found = list.find((c) => Number(c.id) === numId);
    if (found) return found;
  }
  return list.find((c) => String(c.id) === String(id)) || null;
}

export { PAGE_META_KEY_MAP };
