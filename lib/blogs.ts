import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';
import {
  BLOG_CATEGORIES,
  createEmptyPost,
  isPostPublic,
  slugify,
  type BlogPost,
  type BlogStatus,
} from '@/lib/blogShared';
import { assertNotEmptyOverwrite, atomicWriteJson, mergeById } from '@/lib/safeJsonStore';

export * from '@/lib/blogShared';

const FILE = path.join(dataDir, 'blogs.json');

export const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: 'blog-kite-1',
    slug: '5-tips-to-start-your-aviation-career',
    title: '5 Practical Tips to Start Your Aviation Career',
    metaTitle: '5 Tips to Start Your Aviation Career | Kite Institute',
    metaDescription:
      'Planning a career in aviation or hospitality? These five practical tips from Kite Institute help you prepare for airline and airport roles in Bangalore.',
    coverImage: '/images/himg-1.jpg',
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        content:
          'Breaking into aviation takes clarity, grooming, and the right training pathway. Here are five practical tips from Kite Institute mentors.',
        align: 'left',
      },
      {
        id: 'b2',
        type: 'h2',
        content: '1. Choose an industry-aligned course',
        align: 'left',
      },
      {
        id: 'b3',
        type: 'paragraph',
        content:
          'Pick programmes that map to real airport, airline, and hospitality hiring needs — not generic soft-skill packages alone.',
        align: 'left',
      },
      {
        id: 'b4',
        type: 'h2',
        content: '2. Build interview confidence early',
        align: 'left',
      },
      {
        id: 'b5',
        type: 'paragraph',
        content:
          'Practice mock interviews, group discussions, and professional grooming so you walk into selection rounds prepared.',
        align: 'left',
      },
    ],
    createdAt: '2026-07-22',
    isPublished: true,
    excerpt: 'Five mentor-backed tips to prepare for airline, airport, and hospitality careers.',
    status: 'published',
    authorName: 'Kite Institute',
    authorBio: 'India’s trusted aviation & hospitality training institute in Bangalore.',
    category: 'Career Guidance',
    categories: ['Career Guidance'],
    tags: ['aviation career', 'cabin crew', 'airport jobs'],
    isPinned: true,
    focusKeyword: 'aviation career',
    views: 128,
    likes: 14,
    shares: 6,
    comments: [],
  },
];

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, `${JSON.stringify(DEFAULT_BLOGS, null, 2)}\n`, 'utf8');
  }
}

function normalizePost(raw: Record<string, unknown>, index = 0): BlogPost {
  const empty = createEmptyPost();
  const statusRaw = raw.status as BlogStatus | undefined;
  const status = (['draft', 'scheduled', 'published', 'archived'] as BlogStatus[]).includes(statusRaw as BlogStatus)
    ? (statusRaw as BlogStatus)
    : raw.isPublished
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
      : [];

  const blocks = Array.isArray(raw.blocks)
    ? (raw.blocks as BlogPost['blocks'])
    : empty.blocks;

  return {
    ...empty,
    id: String(raw.id || `blog-${index + 1}`),
    slug: slugify(String(raw.slug || raw.title || `post-${index + 1}`)) || `post-${index + 1}`,
    title: String(raw.title || 'Untitled Post'),
    metaTitle: String(raw.metaTitle || ''),
    metaDescription: String(raw.metaDescription || ''),
    coverImage: String(raw.coverImage || ''),
    // Keep an explicit empty blocks array; only fall back when blocks is missing
    blocks: blocks.length ? blocks : Array.isArray(raw.blocks) ? blocks : empty.blocks,
    createdAt: String(raw.createdAt || empty.createdAt),
    isPublished: status === 'published',
    excerpt: String(raw.excerpt || ''),
    status,
    scheduledPublishDate: raw.scheduledPublishDate ? String(raw.scheduledPublishDate) : undefined,
    authorName: String(raw.authorName || 'Kite Institute'),
    authorBio: String(raw.authorBio || ''),
    category: String(raw.category || BLOG_CATEGORIES[0]),
    categories: Array.isArray(raw.categories) ? raw.categories.map(String) : [],
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
      raw.schemaType === 'NewsArticle' || raw.schemaType === 'Article' || raw.schemaType === 'BlogPosting'
        ? raw.schemaType
        : 'BlogPosting',
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

export function readBlogs(): BlogPost[] {
  ensureFile();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_BLOGS.map((p, i) => normalizePost(p, i));
    return raw.map((item, index) => normalizePost(item, index));
  } catch {
    return DEFAULT_BLOGS.map((p, i) => normalizePost(p, i));
  }
}

export function writeBlogs(posts: BlogPost[]) {
  ensureFile();
  const incoming = Array.isArray(posts) ? posts : [];
  assertNotEmptyOverwrite(FILE, incoming.length, 'blog');

  const existing = readExistingPosts();
  const existingById = new Map(existing.map((p) => [p.id, p]));

  // Merge each incoming post onto its stored version so omitted SEO/content
  // fields cannot wipe previously saved data (views, comments, blocks, etc.).
  const mergedIncoming = incoming.map((item, index) => {
    const prev = existingById.get(String(item?.id || ''));
    const combined = prev ? { ...prev, ...item, id: prev.id } : item;
    // Never replace non-empty stored blocks with an accidental empty array
    if (
      prev &&
      Array.isArray(prev.blocks) &&
      prev.blocks.length > 0 &&
      Array.isArray(item?.blocks) &&
      item.blocks.length === 0
    ) {
      combined.blocks = prev.blocks;
    }
    // Preserve engagement counters if client sends zeros while server has values
    // only when the client omitted them entirely (undefined), not intentional reset.
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

export function getPublicBlogs() {
  return readBlogs()
    .filter((p) => isPostPublic(p) && p.status !== 'archived')
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function getBlogBySlug(slug: string) {
  const key = slugify(slug);
  return readBlogs().find((p) => p.slug === key) || null;
}
