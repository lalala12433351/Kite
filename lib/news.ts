import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';
import {
  NEWS_CATEGORIES,
  createEmptyBlock,
  createEmptyPost,
  isPostPublic,
  slugify,
  type BlogPost,
  type BlogStatus,
} from '@/lib/blogShared';
import { assertNotEmptyOverwrite, atomicWriteJson, mergeById } from '@/lib/safeJsonStore';

export * from '@/lib/blogShared';

const FILE = path.join(dataDir, 'news-posts.json');

function coverFromLegacy(image: unknown) {
  const raw = String(image || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  return `/${raw.replace(/^\/+/, '')}`;
}

function legacyHtmlToBlocks(html: string): BlogPost['blocks'] {
  const content = String(html || '').trim();
  if (!content) return [createEmptyBlock('paragraph')];
  return [{ ...createEmptyBlock('html'), content }];
}

export const DEFAULT_NEWS: BlogPost[] = [
  {
    id: 'news-1',
    slug: 'top-7-aviation-careers-taking-off-in-2025',
    title: 'Top 7 aviation careers taking off in 2025',
    metaTitle: 'Top 7 Aviation Careers in 2025 | Kite Institute',
    metaDescription:
      'Explore key airport industry roles, growth drivers, and career paths shaping aviation jobs in India in 2025.',
    coverImage: '/images/news/news-1.jpg',
    blocks: legacyHtmlToBlocks(
      '<p>With India’s aviation market still getting bigger, there will be numerous career options in the airport sector in 2025.</p>',
    ),
    createdAt: '2025-01-01',
    isPublished: true,
    excerpt:
      'Explore key roles, emerging trends, and factors driving growth in India’s airport industry as it expands in 2025',
    status: 'published',
    authorName: 'Naresh Sharma, CEO of IRHPL',
    authorBio: '',
    category: 'Aviation',
    categories: ['Aviation'],
    tags: ['aviation careers', 'airport jobs'],
    isPinned: true,
    focusKeyword: 'aviation careers',
    schemaType: 'NewsArticle',
    views: 0,
    likes: 0,
    shares: 0,
    comments: [],
  },
];

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, `${JSON.stringify(DEFAULT_NEWS, null, 2)}\n`, 'utf8');
  }
}

function normalizePost(raw: Record<string, unknown>, index = 0): BlogPost {
  const empty = createEmptyPost('news');
  const statusRaw = raw.status as BlogStatus | undefined;
  const status = (['draft', 'scheduled', 'published', 'archived'] as BlogStatus[]).includes(
    statusRaw as BlogStatus,
  )
    ? (statusRaw as BlogStatus)
    : raw.isPublished || raw.content || raw.blocks
      ? 'published'
      : 'draft';

  const tagsRaw = raw.tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.map(String)
    : typeof tagsRaw === 'string'
      ? tagsRaw
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : raw.tag
        ? [String(raw.tag)]
        : [];

  let blocks: BlogPost['blocks'];
  if (Array.isArray(raw.blocks) && raw.blocks.length) {
    blocks = raw.blocks as BlogPost['blocks'];
  } else if (typeof raw.content === 'string' && raw.content.trim()) {
    blocks = legacyHtmlToBlocks(raw.content);
  } else {
    blocks = empty.blocks;
  }

  const createdRaw = String(raw.createdAt || raw.created_at || empty.createdAt);
  const createdAt = createdRaw.slice(0, 10);

  const category =
    String(raw.category || raw.tag || NEWS_CATEGORIES[0]) || NEWS_CATEGORIES[0];

  return {
    ...empty,
    id: String(raw.id || `news-${index + 1}`),
    slug:
      slugify(String(raw.slug || raw.title || `news-${index + 1}`)) || `news-${index + 1}`,
    title: String(raw.title || 'Untitled News'),
    metaTitle: String(raw.metaTitle || ''),
    metaDescription: String(raw.metaDescription || raw.subtitle || ''),
    coverImage: coverFromLegacy(raw.coverImage || raw.image),
    blocks,
    createdAt,
    isPublished: status === 'published',
    excerpt: String(raw.excerpt || raw.subtitle || ''),
    status,
    scheduledPublishDate: raw.scheduledPublishDate ? String(raw.scheduledPublishDate) : undefined,
    authorName: String(raw.authorName || raw.source || 'Kite Institute'),
    authorBio: String(raw.authorBio || ''),
    category,
    categories: Array.isArray(raw.categories)
      ? raw.categories.map(String)
      : category
        ? [category]
        : [],
    tags,
    isPinned: Boolean(raw.isPinned),
    focusKeyword: String(raw.focusKeyword || ''),
    ogTitle: String(raw.ogTitle || ''),
    ogDescription: String(raw.ogDescription || ''),
    ogImage: String(raw.ogImage || ''),
    canonicalUrl: String(raw.canonicalUrl || ''),
    robotsIndex: raw.robotsIndex === undefined ? true : Boolean(raw.robotsIndex),
    robotsFollow: raw.robotsFollow === undefined ? true : Boolean(raw.robotsFollow),
    schemaType:
      raw.schemaType === 'BlogPosting' || raw.schemaType === 'Article' || raw.schemaType === 'NewsArticle'
        ? raw.schemaType
        : 'NewsArticle',
    views: Number(raw.views || 0),
    likes: Number(raw.likes || 0),
    shares: Number(raw.shares || 0),
    comments: Array.isArray(raw.comments) ? (raw.comments as BlogPost['comments']) : [],
  };
}

function readExistingPosts(): BlogPost[] {
  if (!fs.existsSync(FILE)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!Array.isArray(raw)) return [];
    return raw.map((item, index) => normalizePost(item, index));
  } catch {
    return [];
  }
}

export function readNews(): BlogPost[] {
  ensureFile();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_NEWS.map((p, i) => normalizePost(p, i));
    return raw.map((item, index) => normalizePost(item, index));
  } catch {
    return DEFAULT_NEWS.map((p, i) => normalizePost(p, i));
  }
}

export function writeNews(posts: BlogPost[]) {
  ensureFile();
  const incoming = Array.isArray(posts) ? posts : [];
  assertNotEmptyOverwrite(FILE, incoming.length, 'news');

  const existing = readExistingPosts();
  const existingById = new Map(existing.map((p) => [p.id, p]));

  const mergedIncoming = incoming.map((item, index) => {
    const prev = existingById.get(String(item?.id || ''));
    const combined = prev ? { ...prev, ...item, id: prev.id } : item;
    if (
      prev &&
      Array.isArray(prev.blocks) &&
      prev.blocks.length > 0 &&
      Array.isArray(item?.blocks) &&
      item.blocks.length === 0
    ) {
      combined.blocks = prev.blocks;
    }
    if (prev) {
      if (item.views === undefined) combined.views = prev.views;
      if (item.likes === undefined) combined.likes = prev.likes;
      if (item.shares === undefined) combined.shares = prev.shares;
      if (item.comments === undefined) combined.comments = prev.comments;
    }
    return normalizePost(combined as unknown as Record<string, unknown>, index);
  });

  const cleaned = mergeById(existing, mergedIncoming, { allowDelete: true });
  atomicWriteJson(FILE, cleaned);
  return cleaned;
}

export function getPublicNews() {
  return readNews()
    .filter((p) => isPostPublic(p) && p.status !== 'archived')
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function getNewsBySlug(slug: string) {
  const key = String(slug || '').trim();
  const all = readNews();
  const bySlug = all.find((p) => p.slug === slugify(key));
  if (bySlug) return bySlug;
  return (
    all.find(
      (p) =>
        p.id === key ||
        String(p.id) === key ||
        p.id === `news-${key}` ||
        String(p.id).replace(/^news-/, '') === key,
    ) || null
  );
}
