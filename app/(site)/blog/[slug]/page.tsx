import type { Metadata } from 'next';
import PageComponent from '@/src/views/BlogDetail';
import { getBlogBySlug, isPostPublic } from '@/lib/blogs';
import {
  buildBlogPostingJsonLd,
  getOgDescription,
  getOgImage,
  getOgTitle,
  getSeoDescription,
  getSeoTitle,
} from '@/lib/blogSeo';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://kiteaviation.in').replace(/\/$/, '');
}

function absoluteUrl(pathOrUrl: string) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl()}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const post = getBlogBySlug(resolved.slug);
  if (!post || !isPostPublic(post)) {
    return toNextMetadata('blogDetail');
  }

  const title = getSeoTitle(post) || post.title;
  const description = getSeoDescription(post);
  const canonical = post.canonicalUrl || `${siteUrl()}/blog/${post.slug}`;
  const ogImage = absoluteUrl(getOgImage(post));
  const index = post.robotsIndex !== false && isPostPublic(post);
  const follow = post.robotsFollow !== false;

  return {
    title: { absolute: title },
    description: description || undefined,
    alternates: { canonical },
    robots: {
      index,
      follow,
      googleBot: { index, follow },
    },
    openGraph: {
      type: 'article',
      title: getOgTitle(post) || title,
      description: getOgDescription(post) || description,
      url: canonical,
      siteName: 'Kite Institute of Aviation & Hospitality',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: getOgTitle(post) || title,
      description: getOgDescription(post) || description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    keywords: [post.focusKeyword, ...(post.tags || [])].filter(Boolean) as string[],
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const resolved = await params;
  const post = getBlogBySlug(resolved.slug);
  const jsonLd =
    post && isPostPublic(post) ? buildBlogPostingJsonLd(post, siteUrl()) : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <PageComponent />
    </>
  );
}
