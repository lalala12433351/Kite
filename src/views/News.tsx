'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import sampleNews from '../data/sampleNews';
import { normalizeNewsItems } from '../utils/newsUtils';
import RecentNewsSection from '../components/RecentNewsSection';

const getBaseUrl = () => '/';

const truncateContent = (text, length = 240) => {
  if (!text) return '';
  const normalized = text.replace(/<\/?[^>]+(>|$)/g, '').trim();
  if (normalized.length <= length) {
    return normalized;
  }
  return `${normalized.substring(0, length).trim()}…`;
};

function News() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNews() {
      setLoading(true);
      try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}database/news-posts.json?timestamp=${Date.now()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const normalized = normalizeNewsItems(data);
        setNewsItems(normalized);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('News feed fetch failed, using sample data:', err);
        }
        const fallback = normalizeNewsItems(sampleNews);
        setNewsItems(fallback);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => controller.abort();
  }, []);

  const hasNews = useMemo(() => newsItems.length > 0, [newsItems]);

  return (
    <div className="content gallery news-gallery" id="news">
      <div className="content-block">
        <div className="lt">
          <div className="news-gallery__main">
            <section className="news-gallery__primary">
            <header className="news-page__hero">
              <span className="news-page__eyebrow">News & Updates</span>
              <h1 className="news-page__title">Kite Updates & Aviation Insights</h1>
              <p className="news-page__subtitle">
                Stay in the loop with campus milestones, student achievements, and the stories that define Kite Institute&apos;s journey.
              </p>
            </header>

            {loading && (
              <div className="gallery-images-holder news-gallery__holder news-gallery__holder--loading">
                {Array.from({ length: 6 }).map((_, index) => (
                  <article key={`news-skeleton-${index}`} className="news-card news-card--skeleton" aria-hidden="true">
                    <div className="news-card__image skeleton-block" />
                    <div className="news-card__body">
                      <div className="skeleton-line skeleton-line--short" />
                      <div className="skeleton-line skeleton-line--medium" />
                      <div className="skeleton-line skeleton-line--long" />
                      <div className="skeleton-line skeleton-line--medium" />
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loading && !hasNews && (
              <div className="news-page__state">
                <p>News updates will appear here as soon as they are published.</p>
                <Link className="news-page__cta" to="/contact">
                  Contact Us
                </Link>
              </div>
            )}

            {!loading && hasNews && (
              <div className="gallery-images-holder news-gallery__holder">
                {newsItems.map((item, index) => {
                  let imageUrl = null;
                  if (item.image) {
                    imageUrl = /^https?:/i.test(item.image)
                      ? item.image
                      : `${getBaseUrl()}${item.image.replace(/^\/+/, '')}`;
                  }

                  const isFeatured = index === 0;

                  return (
                    <article key={item.id} className={`news-card ${isFeatured ? 'news-card--featured' : ''}`}>
                      <Link className="news-card__link" to={`/news/${item.id}`}>
                        {imageUrl && (
                          <div className="news-card__image">
                            <img src={imageUrl} alt={item.title} loading="lazy" />
                            {isFeatured && <span className="news-card__featured-badge">Featured</span>}
                          </div>
                        )}
                        <div className="news-card__body">
                          <h2 className="news-card__title">{item.title}</h2>
                          {(item.tag || item.created_at) && (
                            <div className="news-card__meta">
                              <time className="news-card__date" dateTime={item.created_at}>
                                {item.formatted_date || item.created_at}
                              </time>
                              {item.tag && <span className="news-card__tag">{item.tag}</span>}
                            </div>
                          )}
                          <p className="news-card__excerpt">
                            {truncateContent(item.content, isFeatured ? 400 : 240)}
                          </p>
                          <span className="news-card__read-more">
                            View Story
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <article className="news-gallery__footer news-page__footer">
            <p>Looking for something specific? Reach out to our admissions team for personalised guidance.</p>
            <a 
              className="news-page__cta" 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const event = new CustomEvent('openChatbot');
                window.dispatchEvent(event);
              }}
              style={{ cursor: 'pointer' }}
            >
              Talk to Us
            </a>
          </article>
          </div>
        </div>

        <div className="rt">
          <aside className="sidebar news-gallery__sidebar">
            <section className="sidebar-section">
              <RecentNewsSection limit={2} layout="embedded" showViewAll={true} />
            </section>

            <article className="news-sidebar-card">
              <h3>Media & Press Enquiries</h3>
              <p>Collaborate with our communications team for interviews, coverage, and institutional insights.</p>
              <ul className="news-sidebar-card__list">
                <li>📞 +91 98765 43210</li>
                <li>✉️ media@kiteaviation.in</li>
              </ul>
              <Link className="news-sidebar-card__btn" to="/contact">
                Contact Team
              </Link>
              <p className="news-sidebar-note">
                Prefer a quick response? Mention your publication, deadline, and story angle in the message.
              </p>
            </article>

            <article className="news-sidebar-card">
              <h3>Featured Highlights</h3>
              <p>Discover student success, innovation labs, and industry collaborations shaping the future of aviation.</p>
              <Link className="news-sidebar-card__btn" to="/gallery">
                Browse Gallery
              </Link>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default News;

