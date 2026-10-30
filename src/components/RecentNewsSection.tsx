'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import type { BlogPost } from '@/lib/blogShared';

const truncate = (text: string, length = 140) => {
  if (!text) return '';
  const normalized = text.replace(/<\/?[^>]+(>|$)/g, '').trim();
  if (normalized.length <= length) return normalized;
  return `${normalized.substring(0, length).trim()}…`;
};

function RecentNewsSection({
  limit = 3,
  layout = 'full',
  title = 'Latest News',
  showViewAll = true,
}: {
  limit?: number;
  layout?: 'full' | 'embedded';
  title?: string;
  showViewAll?: boolean;
}) {
  const [newsItems, setNewsItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNews() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/news?scope=public&t=${Date.now()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        const data = await response.json();
        const posts = Array.isArray(data.posts) ? data.posts : [];
        setNewsItems(posts.slice(0, limit));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Unable to fetch latest news.');
        }
        setNewsItems([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchNews();
    return () => controller.abort();
  }, [limit]);

  const sectionClassName = useMemo(() => {
    if (layout === 'embedded') return 'news-section news-section--embedded';
    return 'content-box news-section';
  }, [layout]);

  return (
    <div className={sectionClassName}>
      <div className="news-section__header">
        <div className="news-section__title-group">
          <span className="news-section__eyebrow">Updates & Highlights</span>
          <h2 className="news-section__title">{title}</h2>
        </div>
        {showViewAll ? (
          <Link className="news-section__view-all" to="/news">
            View All News
          </Link>
        ) : null}
      </div>

      <div className="news-section__grid">
        {(loading ? Array.from({ length: limit }) : newsItems).map((item, index) => {
          if (loading) {
            return (
              <article key={`news-skeleton-${index}`} className="news-card news-card--skeleton" aria-hidden="true">
                <div className="news-card__image skeleton-block" />
                <div className="news-card__body">
                  <div className="skeleton-line skeleton-line--short" />
                  <div className="skeleton-line skeleton-line--medium" />
                  <div className="skeleton-line skeleton-line--long" />
                </div>
              </article>
            );
          }

          const post = item as BlogPost;
          const imageUrl = post.coverImage || '';
          const excerpt = truncate(post.excerpt || post.metaDescription || '');

          return (
            <article key={post.id} className="news-card">
              <Link className="news-card__link" to={`/news/${post.slug}`}>
                {imageUrl ? (
                  <div className="news-card__image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={post.title} loading="lazy" />
                  </div>
                ) : null}
                <div className="news-card__body">
                  <h3 className="news-card__title">{post.title}</h3>
                  <div className="news-card__meta">
                    <time className="news-card__date" dateTime={post.createdAt}>
                      {post.createdAt}
                    </time>
                  </div>
                  {excerpt ? <p className="news-card__excerpt">{excerpt}</p> : null}
                  <span className="news-card__read-more">Read Story</span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {!loading && error ? <p className="news-section__fallback">{error}</p> : null}
    </div>
  );
}

export default RecentNewsSection;
