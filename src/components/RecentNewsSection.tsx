'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import sampleNews from '../data/sampleNews';
import { normalizeNewsItems } from '../utils/newsUtils';

const getBaseUrl = () => '/';

const truncateContent = (text, length = 140) => {
  if (!text) return '';
  const normalized = text.replace(/<\/?[^>]+(>|$)/g, '').trim();
  if (normalized.length <= length) {
    return normalized;
  }
  return `${normalized.substring(0, length).trim()}…`;
};

function RecentNewsSection({ limit = 3, layout = 'full', title = 'Latest News', showViewAll = true }) {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNews() {
      setLoading(true);
      setError('');
      try {
        const baseUrl = getBaseUrl();
        const url = `${baseUrl}database/news-posts.json?timestamp=${Date.now()}`;
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const normalized = normalizeNewsItems(data);
        setNewsItems(normalized.slice(0, limit));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Unable to fetch latest news. Showing sample stories.');
        }
        const fallback = normalizeNewsItems(sampleNews);
        setNewsItems(fallback.slice(0, limit));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => controller.abort();
  }, [limit]);

  const sectionClassName = useMemo(() => {
    if (layout === 'embedded') {
      return 'news-section news-section--embedded';
    }
    return 'content-box news-section';
  }, [layout]);

  const viewAllHref = '/news';

  return (
    <div className={sectionClassName}>
      <div className="news-section__header">
        <div className="news-section__title-group">
          <span className="news-section__eyebrow">Updates & Highlights</span>
          <h2 className="news-section__title">{title}</h2>
        </div>
        {showViewAll && (
          <Link className="news-section__view-all" to={viewAllHref}>
            View All News
          </Link>
        )}
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
                  <div className="skeleton-line skeleton-line--medium" />
                </div>
              </article>
            );
          }

          let imageUrl = null;
          if (item.image) {
            imageUrl = /^https?:/i.test(item.image)
              ? item.image
              : `${getBaseUrl()}${item.image.replace(/^\/+/, '')}`;
          }

          return (
            <article key={item.id} className="news-card">
              <Link className="news-card__link" to={`/news/${item.id}`}>
                {imageUrl && (
                  <div className="news-card__image">
                    <img src={imageUrl} alt={item.title} loading="lazy" />
                  </div>
                )}
                <div className="news-card__body">
                  <h3 className="news-card__title">{item.title}</h3>
                  {(item.tag || item.created_at) && (
                    <div className="news-card__meta">
                      <time className="news-card__date" dateTime={item.created_at}>
                        {item.formatted_date || item.created_at}
                      </time>
                      
                    </div>
                  )}
                  <p className="news-card__excerpt">{truncateContent(item.content)}</p>
                  <span className="news-card__read-more">
                    Read Story
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {!loading && error && (
        <p className="news-section__fallback">{error}</p>
      )}
    </div>
  );
}

export default RecentNewsSection;

