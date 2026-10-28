export type BlogBlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'list'
  | 'image'
  | 'quote'
  | 'youtube';

export type BlogBlock = {
  id: string;
  type: BlogBlockType;
  content: string;
  mediaUrl?: string;
  align?: 'left' | 'center' | 'right';
};

export type BlogComment = {
  id: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
  adminReplies?: { id: string; adminName: string; content: string; createdAt: string }[];
};

export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  coverImage: string;
  blocks: BlogBlock[];
  createdAt: string;
  isPublished: boolean;
  excerpt?: string;
  status: BlogStatus;
  scheduledPublishDate?: string;
  authorName?: string;
  authorBio?: string;
  category?: string;
  categories: string[];
  tags: string[];
  isPinned?: boolean;
  focusKeyword?: string;
  views: number;
  likes: number;
  shares: number;
  comments?: BlogComment[];
};

export const BLOG_CATEGORIES = [
  'Aviation Training',
  'Hospitality',
  'Career Guidance',
  'Campus Life',
  'Industry News',
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function slugify(input: string) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function createEmptyBlock(type: BlogBlockType = 'paragraph'): BlogBlock {
  return {
    id: uid('block'),
    type,
    content:
      type === 'h2'
        ? 'Heading'
        : type === 'list'
          ? '- First point\n- Second point'
          : type === 'image'
            ? ''
            : type === 'youtube'
              ? 'https://www.youtube.com/watch?v='
              : type === 'quote'
                ? 'Quote text'
                : '',
    mediaUrl: type === 'image' ? '/images/himg-1.jpg' : undefined,
    align: 'left',
  };
}

export function createEmptyPost(): BlogPost {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: uid('blog'),
    slug: 'new-post',
    title: 'Untitled Post',
    metaTitle: '',
    metaDescription: '',
    coverImage: '',
    blocks: [createEmptyBlock('paragraph')],
    createdAt: today,
    isPublished: false,
    excerpt: '',
    status: 'draft',
    authorName: 'Kite Institute',
    authorBio: '',
    category: BLOG_CATEGORIES[0],
    categories: [BLOG_CATEGORIES[0]],
    tags: [],
    isPinned: false,
    focusKeyword: '',
    views: 0,
    likes: 0,
    shares: 0,
    comments: [],
  };
}

export function calcSeoScore(post: BlogPost): number {
  let score = 0;
  const keyword = String(post.focusKeyword || '')
    .trim()
    .toLowerCase();
  const title = String(post.title || '').toLowerCase();
  const slug = String(post.slug || '').toLowerCase();
  const metaTitle = String(post.metaTitle || '');
  const metaDesc = String(post.metaDescription || '');

  if (keyword) {
    score += 20;
    if (title.includes(keyword)) score += 20;
    if (slug.includes(keyword.replace(/\s+/g, '-'))) score += 15;
    if (metaDesc.toLowerCase().includes(keyword)) score += 15;
  }
  if (metaTitle.length >= 45 && metaTitle.length <= 60) score += 10;
  if (metaDesc.length >= 120 && metaDesc.length <= 160) score += 10;

  const imageBlocks = (post.blocks || []).filter((b) => b.type === 'image');
  if (imageBlocks.length > 0 && imageBlocks.every((b) => String(b.content || '').trim())) {
    score += 10;
  }

  return Math.min(100, score);
}

export function calcListSeoScore(post: BlogPost): number {
  const keyword = String(post.focusKeyword || '')
    .trim()
    .toLowerCase();
  if (!keyword) return 50;
  let score = 20;
  if (String(post.title || '')
    .toLowerCase()
    .includes(keyword))
    score += 20;
  if (
    String(post.slug || '')
      .toLowerCase()
      .includes(keyword.replace(/\s+/g, '-'))
  )
    score += 20;
  if (
    String(post.metaDescription || '')
      .toLowerCase()
      .includes(keyword)
  )
    score += 20;
  const len = String(post.metaDescription || '').length;
  if (len >= 120 && len <= 160) score += 20;
  return Math.min(100, score);
}

export function blocksToClassic(blocks: BlogBlock[]): string {
  return (blocks || [])
    .map((b) => {
      if (b.type === 'h1') return `# ${b.content}`;
      if (b.type === 'h2') return `## ${b.content}`;
      if (b.type === 'h3') return `### ${b.content}`;
      if (b.type === 'image') return b.mediaUrl ? `<img src="${b.mediaUrl}" alt="${b.content || ''}" />` : '';
      if (b.type === 'list') return b.content;
      if (b.type === 'quote') return `> ${b.content}`;
      if (b.type === 'youtube') return b.content;
      return b.content;
    })
    .filter(Boolean)
    .join('\n\n');
}

export function classicToBlocks(text: string): BlogBlock[] {
  const parts = String(text || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return [createEmptyBlock('paragraph')];
  return parts.map((part) => {
    if (part.startsWith('### ')) return { ...createEmptyBlock('h3'), content: part.slice(4) };
    if (part.startsWith('## ')) return { ...createEmptyBlock('h2'), content: part.slice(3) };
    if (part.startsWith('# ')) return { ...createEmptyBlock('h1'), content: part.slice(2) };
    if (part.startsWith('> ')) return { ...createEmptyBlock('quote'), content: part.slice(2) };
    if (/^-\s/m.test(part)) return { ...createEmptyBlock('list'), content: part };
    const img = part.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (img) {
      const alt = part.match(/alt=["']([^"']*)["']/i)?.[1] || '';
      return { ...createEmptyBlock('image'), mediaUrl: img[1], content: alt };
    }
    return { ...createEmptyBlock('paragraph'), content: part };
  });
}

export function wordStats(blocks: BlogBlock[]) {
  const text = (blocks || [])
    .map((b) => b.content || '')
    .join(' ')
    .replace(/<[^>]+>/g, ' ');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    words,
    blocks: blocks?.length || 0,
    minutes: Math.max(1, Math.ceil(words / 200)),
  };
}

export function isPostPublic(post: BlogPost, today = new Date().toISOString().slice(0, 10)) {
  if (post.status === 'published' || post.isPublished) return true;
  if (post.status === 'scheduled' && post.scheduledPublishDate && post.scheduledPublishDate <= today) {
    return true;
  }
  return false;
}
