export type BlogBlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'list'
  | 'image'
  | 'quote'
  | 'video'
  | 'youtube'
  | 'separator'
  | 'html';

export type BlogBlock = {
  id: string;
  type: BlogBlockType;
  content: string;
  mediaUrl?: string;
  align?: 'left' | 'center' | 'right' | 'wide' | 'full';
};

export const BLOG_BLOCK_CATALOG: {
  type: BlogBlockType;
  label: string;
  description: string;
  category: 'text' | 'media' | 'design' | 'embed';
  icon: string;
}[] = [
  { type: 'paragraph', label: 'Paragraph', description: 'Start with the building block of all narrative.', category: 'text', icon: '¶' },
  { type: 'h1', label: 'Heading 1', description: 'Big section heading.', category: 'text', icon: 'H1' },
  { type: 'h2', label: 'Heading 2', description: 'Medium section heading.', category: 'text', icon: 'H2' },
  { type: 'h3', label: 'Heading 3', description: 'Small section heading.', category: 'text', icon: 'H3' },
  { type: 'h4', label: 'Heading 4', description: 'Subsection heading.', category: 'text', icon: 'H4' },
  { type: 'list', label: 'List', description: 'Create a bulleted list.', category: 'text', icon: '≡' },
  { type: 'quote', label: 'Quote', description: 'Give quoted text visual emphasis.', category: 'text', icon: '❝' },
  { type: 'image', label: 'Image', description: 'Insert an image.', category: 'media', icon: '▣' },
  { type: 'video', label: 'Video', description: 'Upload or embed a video file.', category: 'media', icon: '▶' },
  { type: 'youtube', label: 'YouTube', description: 'Embed a YouTube video.', category: 'embed', icon: '▶' },
  { type: 'separator', label: 'Separator', description: 'Create a break between sections.', category: 'design', icon: '—' },
  { type: 'html', label: 'Custom HTML', description: 'Add custom HTML code.', category: 'design', icon: '</>' },
];

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

export type BlogSchemaType = 'BlogPosting' | 'NewsArticle' | 'Article';

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
  /** Social / Open Graph overrides */
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** Advanced SEO */
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  schemaType?: BlogSchemaType;
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

export const NEWS_CATEGORIES = [
  'Industry News',
  'Campus Updates',
  'Student Achievements',
  'Aviation',
  'Hospitality',
  'Press',
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
  const contentByType: Partial<Record<BlogBlockType, string>> = {
    paragraph: '',
    h1: 'Heading',
    h2: 'Heading',
    h3: 'Heading',
    h4: 'Heading',
    list: '- First point\n- Second point',
    quote: 'Write quote…',
    image: '',
    video: '',
    youtube: 'https://www.youtube.com/watch?v=',
    separator: '',
    html: '<!-- custom html -->',
  };
  return {
    id: uid('block'),
    type,
    content: contentByType[type] ?? '',
    mediaUrl: undefined,
    align: 'left',
  };
}

export function createEmptyPost(kind: 'blog' | 'news' = 'blog'): BlogPost {
  const today = new Date().toISOString().slice(0, 10);
  const categories = kind === 'news' ? NEWS_CATEGORIES : BLOG_CATEGORIES;
  return {
    id: uid(kind === 'news' ? 'news' : 'blog'),
    slug: 'new-post',
    title: kind === 'news' ? 'Untitled News' : 'Untitled Post',
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
    category: categories[0],
    categories: [categories[0]],
    tags: [],
    isPinned: false,
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: '',
    robotsIndex: true,
    robotsFollow: true,
    schemaType: kind === 'news' ? 'NewsArticle' : 'BlogPosting',
    views: 0,
    likes: 0,
    shares: 0,
    comments: [],
  };
}

export function blocksToClassic(blocks: BlogBlock[]): string {
  return (blocks || [])
    .map((b) => {
      if (b.type === 'h1') return `# ${b.content}`;
      if (b.type === 'h2') return `## ${b.content}`;
      if (b.type === 'h3') return `### ${b.content}`;
      if (b.type === 'h4') return `#### ${b.content}`;
      if (b.type === 'image') return b.mediaUrl ? `<img src="${b.mediaUrl}" alt="${b.content || ''}" />` : '';
      if (b.type === 'video') return b.mediaUrl ? `<video src="${b.mediaUrl}"></video>` : b.content;
      if (b.type === 'list') return b.content;
      if (b.type === 'quote') return `> ${b.content}`;
      if (b.type === 'separator') return '---';
      if (b.type === 'html') return b.content;
      if (b.type === 'youtube') return b.content;
      return b.content;
    })
    .filter((part) => part !== undefined && part !== null)
    .join('\n\n');
}

export function classicToBlocks(text: string): BlogBlock[] {
  const parts = String(text || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return [createEmptyBlock('paragraph')];
  return parts.map((part) => {
    if (part === '---') return createEmptyBlock('separator');
    if (part.startsWith('#### ')) return { ...createEmptyBlock('h4'), content: part.slice(5) };
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
    const video = part.match(/<video[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (video) return { ...createEmptyBlock('video'), mediaUrl: video[1] };
    if (/youtu\.?be|youtube\.com/i.test(part)) {
      return { ...createEmptyBlock('youtube'), content: part };
    }
    if (/^</.test(part)) return { ...createEmptyBlock('html'), content: part };
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
