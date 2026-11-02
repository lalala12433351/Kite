'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from '@/lib/router';
import type { BlogBlock, BlogPost } from '@/lib/blogShared';
import { formatNewsDate } from '@/src/utils/newsUtils';

function plainText(value: string) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="news-detail__body">
      {(blocks || []).map((block) => {
        if (block.type === 'h1' || block.type === 'h2') {
          return <h2 key={block.id}>{block.content}</h2>;
        }
        if (block.type === 'h3' || block.type === 'h4') {
          return <h3 key={block.id}>{block.content}</h3>;
        }
        if (block.type === 'list') {
          const items = String(block.content || '')
            .split('\n')
            .map((line) => line.replace(/^[-*•]\s*/, '').trim())
            .filter(Boolean);
          return (
            <ul key={block.id}>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'quote') {
          return <blockquote key={block.id}>{block.content}</blockquote>;
        }
        if (block.type === 'image' && block.mediaUrl) {
          return (
            <figure key={block.id} className="news-detail__image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.mediaUrl} alt={block.content || ''} />
            </figure>
          );
        }
        if (block.type === 'video' && block.mediaUrl) {
          return (
            <video key={block.id} src={block.mediaUrl} controls playsInline preload="metadata" />
          );
        }
        if (block.type === 'youtube') {
          const match = String(block.content || '').match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
          if (!match) return null;
          return (
            <div key={block.id} className="blog-blocks__embed">
              <iframe title="YouTube video" src={`https://www.youtube.com/embed/${match[1]}`} allowFullScreen />
            </div>
          );
        }
        if (block.type === 'separator') return <hr key={block.id} />;
        if (block.type === 'html') {
          return <div key={block.id} dangerouslySetInnerHTML={{ __html: block.content || '' }} />;
        }
        if (!block.content) return null;
        return <p key={block.id}>{block.content}</p>;
      })}
    </div>
  );
}

function BlogDetail({
  initialPost = null,
  related = [],
  canonicalUrl = '',
}: {
  initialPost?: BlogPost | null;
  related?: BlogPost[];
  canonicalUrl?: string;
}) {
  const { slug } = useParams() as { slug?: string };
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [others, setOthers] = useState<BlogPost[]>(related);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      if (!initialPost) setLoading(true);
      setError('');
      try {
        const [articleRes, listRes] = await Promise.all([
          fetch(`/api/blogs/${encodeURIComponent(slug)}`),
          fetch(`/api/blogs?scope=public`),
        ]);
        const article = await articleRes.json().catch(() => ({}));
        const list = await listRes.json().catch(() => ({}));
        if (!articleRes.ok || !article.success) {
          if (!cancelled) {
            setError(article.error || 'Post not found');
            setPost(null);
          }
          return;
        }
        if (!cancelled) {
          setPost(article.post);
          const posts = Array.isArray(list.posts) ? (list.posts as BlogPost[]) : [];
          setOthers(posts.filter((item) => item.slug !== article.post?.slug));
        }
      } catch {
        if (!cancelled) setError('Failed to load post');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, initialPost]);

  const categories = useMemo(() => {
    const names = others.map((item) => item.category).filter(Boolean);
    return ['All', ...Array.from(new Set(names))];
  }, [others]);

  const visibleStories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return others.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (!needle) return true;
      const haystack = `${item.title} ${item.excerpt} ${item.metaDescription}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [others, query, category]);

  const shareUrl = () => {
    if (canonicalUrl) return canonicalUrl;
    if (typeof window === 'undefined') return `/blog/${slug || ''}`;
    return window.location.href;
  };

  const share = async (kind: 'device' | 'copy') => {
    const url = shareUrl();
    const title = post?.title || 'Kite Blog';
    if (kind === 'device' && navigator.share) {
      try {
        await navigator.share({ title, text: post?.excerpt || title, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="content-box news-detail inside-page">
        <div className="content-block">
          <p className="news-detail__subtitle">Loading article…</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="content-box news-detail inside-page">
        <div className="content-block">
          <p>{error || 'Post not found'}</p>
          <Link to="/blog">View all articles</Link>
        </div>
      </div>
    );
  }

  const dateValue = post.createdAt || '';
  const excerpt = post.excerpt || post.metaDescription || '';
  const pageUrl = shareUrl();
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <div className="content-box news-detail inside-page">
      <div className="content-block">
        <div className="lt">
          <div className="news-detail__main">
            <article className="news-detail__article">
              <h1 className="news-detail__title">{post.title}</h1>
              {excerpt ? <p className="news-detail__subtitle">{excerpt}</p> : null}
              <div className="news-detail__meta">
                <div className="news-detail__dateline">
                  <time className="news-detail__date" dateTime={dateValue}>
                    {formatNewsDate(dateValue)}
                  </time>
                  <span className="news-detail__dot" aria-hidden="true">
                    •
                  </span>
                  <span className="news-detail__source">{post.authorName || 'Kite Institute'}</span>
                </div>
                {post.category ? (
                  <div className="news-detail__labels">
                    <span className="news-detail__tag">{post.category}</span>
                  </div>
                ) : null}
              </div>
              {post.coverImage ? (
                <div className="news-detail__image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.coverImage} alt={post.title} />
                </div>
              ) : null}
              <ArticleBody blocks={post.blocks} />
              <div className="news-share">
                <span className="news-share__title">Share this story</span>
                <div className="news-share__icons">
                  <button type="button" className="news-share__icon share tooltip-btn" aria-label="Share via device" onClick={() => share('device')}>
                    <span className="tooltip-txt">Share via device</span>
                  </button>
                  <button type="button" className="news-share__icon copy tooltip-btn" aria-label="Copy link" onClick={() => share('copy')}>
                    <span className="tooltip-txt">{copied ? 'Link copied' : 'Copy link'}</span>
                  </button>
                  <a className="news-share__icon linkedin tooltip-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                    <span className="tooltip-txt">Share on LinkedIn</span>
                  </a>
                  <a className="news-share__icon facebook tooltip-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                    <span className="tooltip-txt">Share on Facebook</span>
                  </a>
                  <a className="news-share__icon twitter tooltip-btn" href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
                    <span className="tooltip-txt">Share on X</span>
                  </a>
                  <a className="news-share__icon whatsapp tooltip-btn" href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
                    <span className="tooltip-txt">Share on WhatsApp</span>
                  </a>
                </div>
                {copied ? <p className="news-share__message">Link copied</p> : null}
              </div>
              <div className="news-detail__actions">
                <button type="button" className="news-page__retry" onClick={() => navigate(-1)}>
                  Back
                </button>
                <Link className="news-page__cta" to="/blog">
                  View All Articles
                </Link>
                <Link className="news-page__cta news-page__cta--outline" to="/contact">
                  Connect With Us
                </Link>
              </div>
            </article>
          </div>
        </div>
        <div className="rt">
          <aside className="sidebar news-detail__sidebar">
            <section className="sidebar-section">
              <section className="news-explore">
                <div className="news-explore__header">
                  <div>
                    <span className="news-page__eyebrow">Explore More Stories</span>
                    <h2 className="news-explore__title">Discover what’s new at Kite</h2>
                  </div>
                  <div className="news-explore__search">
                    <input
                      type="search"
                      placeholder="Search stories by keyword..."
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      aria-label="Search stories"
                    />
                  </div>
                </div>
                <div className="news-explore__filters">
                  {categories.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`news-filter-pill${category === name ? ' active' : ''}`}
                      onClick={() => setCategory(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <div className="news-explore__grid">
                  {visibleStories.map((item) => (
                    <article key={item.id} className="news-mini-card">
                      <Link className="news-mini-card__link" to={`/blog/${item.slug}`}>
                        {item.coverImage ? (
                          <div className="news-mini-card__image">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.coverImage} alt={item.title} loading="lazy" />
                          </div>
                        ) : null}
                        <div className="news-mini-card__body">
                          <h3 className="news-mini-card__title">{item.title}</h3>
                          <div className="news-mini-card__meta">
                            <time className="news-card__date" dateTime={item.createdAt}>
                              {formatNewsDate(item.createdAt)}
                            </time>
                          </div>
                          <p className="news-mini-card__excerpt">
                            {plainText(item.excerpt || item.metaDescription || '').slice(0, 140)}
                            {(item.excerpt || item.metaDescription || '').length > 140 ? '…' : ''}
                          </p>
                          <span className="news-mini-card__cta">Read Story</span>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;
