import type { BlogBlock, BlogPost } from '@/lib/blogShared';

export type SeoSeverity = 'ok' | 'warning' | 'error';

export type SeoCheck = {
  id: string;
  group: 'basic' | 'additional' | 'title' | 'content';
  label: string;
  pass: boolean;
  severity: SeoSeverity;
  hint?: string;
};

export type SeoRating = 'poor' | 'good' | 'great';

const SITE_NAME = 'Kite Institute';
const SEP = '|';

export function plainTextFromBlocks(blocks: BlogBlock[] = []) {
  return blocks
    .map((b) => {
      if (b.type === 'image') return '';
      if (b.type === 'youtube') return '';
      return b.content || '';
    })
    .join(' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function applySeoTemplate(template: string, post: BlogPost) {
  return String(template || '')
    .replace(/%title%/gi, post.title || '')
    .replace(/%sitename%/gi, SITE_NAME)
    .replace(/%sep%/gi, SEP)
    .replace(/%focuskw%/gi, post.focusKeyword || '')
    .replace(/%excerpt%/gi, post.excerpt || '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSeoTitle(post: BlogPost) {
  const raw = String(post.metaTitle || '').trim();
  if (raw) return applySeoTemplate(raw, post);
  return String(post.title || '').trim();
}

export function getSeoDescription(post: BlogPost) {
  const raw = String(post.metaDescription || '').trim();
  if (raw) return applySeoTemplate(raw, post);
  return String(post.excerpt || '').trim();
}

export function getOgTitle(post: BlogPost) {
  return String(post.ogTitle || getSeoTitle(post) || '').trim();
}

export function getOgDescription(post: BlogPost) {
  return String(post.ogDescription || getSeoDescription(post) || '').trim();
}

export function getOgImage(post: BlogPost) {
  return String(post.ogImage || post.coverImage || '').trim();
}

function countSyllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const matched = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g);
  return matched ? matched.length : 1;
}

export function fleschReadingEase(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return 0;
  const sentences = Math.max(1, (clean.match(/[.!?]+/g) || []).length);
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return Math.round(206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount));
}

export function keywordStats(post: BlogPost) {
  const keyword = String(post.focusKeyword || '')
    .trim()
    .toLowerCase();
  const body = plainTextFromBlocks(post.blocks).toLowerCase();
  const words = body ? body.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  if (!keyword || !wordCount) {
    return { keyword, wordCount, occurrences: 0, density: 0 };
  }
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}\\b`, 'gi');
  const occurrences = (body.match(re) || []).length;
  const density = Math.round((occurrences / wordCount) * 1000) / 10;
  return { keyword, wordCount, occurrences, density };
}

function check(
  id: string,
  group: SeoCheck['group'],
  label: string,
  pass: boolean,
  hint?: string,
  severity: SeoSeverity = pass ? 'ok' : 'error',
): SeoCheck {
  return { id, group, label, pass, hint, severity: pass ? 'ok' : severity };
}

export function analyzeBlogSeo(post: BlogPost): SeoCheck[] {
  const keyword = String(post.focusKeyword || '')
    .trim()
    .toLowerCase();
  const title = String(post.title || '').toLowerCase();
  const slug = String(post.slug || '').toLowerCase();
  const metaTitle = getSeoTitle(post);
  const metaDesc = getSeoDescription(post);
  const body = plainTextFromBlocks(post.blocks);
  const bodyLower = body.toLowerCase();
  const keywordSlug = keyword.replace(/\s+/g, '-');
  const imageBlocks = (post.blocks || []).filter((b) => b.type === 'image');
  const headings = (post.blocks || []).filter((b) => b.type === 'h2' || b.type === 'h3');
  const firstPara = (post.blocks || []).find((b) => b.type === 'paragraph');
  const stats = keywordStats(post);
  const flesch = fleschReadingEase(body);
  const hasInternalLink = /\/(blog|courses|about|contact|placement)/i.test(
    (post.blocks || []).map((b) => b.content || '').join(' '),
  );
  const hasExternalLink = /https?:\/\//i.test((post.blocks || []).map((b) => b.content || '').join(' '));
  const titleStartsWithKw = Boolean(keyword && title.trim().startsWith(keyword));
  const paragraphCount = (post.blocks || []).filter((b) => b.type === 'paragraph' && String(b.content || '').trim()).length;

  return [
    check('focus', 'basic', 'Focus keyword is set', Boolean(keyword), 'Add a primary keyphrase you want to rank for.'),
    check(
      'kw-title',
      'basic',
      'Focus keyword in the SEO title',
      Boolean(keyword && metaTitle.toLowerCase().includes(keyword)),
      'Include the keyphrase in the SEO title.',
    ),
    check(
      'kw-slug',
      'basic',
      'Focus keyword in the URL',
      Boolean(keyword && slug.includes(keywordSlug)),
      'Use a short slug that contains the keyphrase.',
    ),
    check(
      'kw-meta',
      'basic',
      'Focus keyword in meta description',
      Boolean(keyword && metaDesc.toLowerCase().includes(keyword)),
      'Mention the keyphrase naturally in the meta description.',
    ),
    check(
      'kw-content',
      'basic',
      'Focus keyword in content',
      Boolean(keyword && bodyLower.includes(keyword)),
      'Use the keyphrase in the article body.',
    ),
    check(
      'kw-intro',
      'basic',
      'Focus keyword at the beginning of content',
      Boolean(keyword && String(firstPara?.content || '').toLowerCase().includes(keyword)),
      'Try using the keyphrase in the first paragraph.',
      'warning',
    ),
    check(
      'density',
      'basic',
      'Keyword density is 0.5%–2.5%',
      Boolean(keyword && stats.density >= 0.5 && stats.density <= 2.5),
      keyword
        ? `Current density: ${stats.density}% (${stats.occurrences} times in ${stats.wordCount} words).`
        : 'Set a focus keyword first.',
      'warning',
    ),
    check(
      'meta-title-len',
      'basic',
      'SEO title length is ideal (50–60 chars)',
      metaTitle.length >= 50 && metaTitle.length <= 60,
      `Current: ${metaTitle.length} chars.`,
      metaTitle.length >= 40 && metaTitle.length <= 70 ? 'warning' : 'error',
    ),
    check(
      'meta-desc-len',
      'basic',
      'Meta description length is ideal (120–160 chars)',
      metaDesc.length >= 120 && metaDesc.length <= 160,
      `Current: ${metaDesc.length} chars.`,
      metaDesc.length >= 70 && metaDesc.length <= 180 ? 'warning' : 'error',
    ),

    check('cover', 'additional', 'Featured image is set', Boolean(String(post.coverImage || '').trim()), 'Add a featured image.'),
    check(
      'img-alt',
      'additional',
      'Images have alt attributes',
      imageBlocks.length === 0 || imageBlocks.every((b) => String(b.content || '').trim().length > 0),
      'Write alt text for every image block.',
      'warning',
    ),
    check(
      'og',
      'additional',
      'Social / Open Graph data is ready',
      Boolean(getOgTitle(post) && getOgDescription(post) && getOgImage(post)),
      'Set social title, description, and image.',
      'warning',
    ),
    check(
      'internal-link',
      'additional',
      'Has internal links',
      hasInternalLink,
      'Link to other Kite pages (courses, about, blog…).',
      'warning',
    ),
    check(
      'external-link',
      'additional',
      'Has outbound links',
      hasExternalLink,
      'Link to a trusted external resource where relevant.',
      'warning',
    ),

    check(
      'title-kw-start',
      'title',
      'Focus keyword at beginning of SEO title',
      titleStartsWithKw || Boolean(keyword && metaTitle.toLowerCase().trim().startsWith(keyword)),
      'Put the keyphrase near the start of the SEO title.',
      'warning',
    ),
    check(
      'title-has-number',
      'title',
      'SEO title has a number / power word (optional)',
      /\d|best|guide|tips|ultimate|proven|complete|how/i.test(metaTitle),
      'Numbers and power words can improve CTR.',
      'warning',
    ),
    check(
      'title-brand',
      'title',
      'SEO title includes brand or separator',
      /kite|institute|\|/i.test(metaTitle),
      `Example: “Your Topic ${SEP} ${SITE_NAME}”.`,
      'warning',
    ),

    check(
      'length',
      'content',
      'Content length is 600+ words',
      stats.wordCount >= 600,
      `Current: ${stats.wordCount} words. Aim for 600+ for competitive topics.`,
      stats.wordCount >= 300 ? 'warning' : 'error',
    ),
    check(
      'headings',
      'content',
      'Uses H2/H3 subheadings',
      headings.length >= 2,
      'Break content with at least two H2/H3 headings.',
      'warning',
    ),
    check(
      'short-paras',
      'content',
      'Uses short paragraphs',
      paragraphCount >= 3,
      'Keep paragraphs short for mobile readability.',
      'warning',
    ),
    check(
      'readability',
      'content',
      'Readability is good (Flesch 60+)',
      flesch >= 60,
      `Flesch score: ${flesch}. Aim for 60+ (easier to read).`,
      flesch >= 50 ? 'warning' : 'error',
    ),
  ];
}

export function calcRankMathScore(post: BlogPost): number {
  const checks = analyzeBlogSeo(post);
  if (!checks.length) return 0;
  let points = 0;
  let total = 0;
  for (const c of checks) {
    const weight = c.group === 'basic' ? 3 : c.group === 'content' ? 2 : 1;
    total += weight;
    if (c.pass) points += weight;
    else if (c.severity === 'warning') points += weight * 0.35;
  }
  return Math.round((points / total) * 100);
}

export function getSeoRating(score: number): SeoRating {
  if (score >= 81) return 'great';
  if (score >= 51) return 'good';
  return 'poor';
}

export function buildBlogPostingJsonLd(
  post: BlogPost,
  siteUrl: string,
  pathPrefix: '/blog' | '/news' = '/blog',
) {
  const base = siteUrl.replace(/\/$/, '');
  const url = `${base}${pathPrefix}/${post.slug}`;
  const image = getOgImage(post);
  return {
    '@context': 'https://schema.org',
    '@type':
      post.schemaType === 'NewsArticle'
        ? 'NewsArticle'
        : post.schemaType === 'Article'
          ? 'Article'
          : 'BlogPosting',
    headline: post.title,
    description: getSeoDescription(post),
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    author: {
      '@type': 'Person',
      name: post.authorName || 'Kite Institute',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kite Institute of Aviation & Hospitality',
      logo: {
        '@type': 'ImageObject',
        url: `${base}/icons/logo-lt.svg`,
      },
    },
    mainEntityOfPage: url,
    url,
    ...(image
      ? {
          image: image.startsWith('http') ? image : `${base}${image}`,
        }
      : {}),
    keywords: [...(post.tags || []), post.focusKeyword || ''].filter(Boolean).join(', '),
  };
}
