'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link } from '@/lib/router';
import type { BlogPost } from '@/lib/blogShared';
import { formatNewsDate } from '../utils/newsUtils';

const truncate = (text: string, length = 240) => {
  if (!text) return '';
  const normalized = text.replace(/<\/?[^>]+(>|$)/g, '').trim();
  if (normalized.length <= length) return normalized;
  return `${normalized.substring(0, length).trim()}…`;
};

function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPosts() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/blogs?scope=public&t=${Date.now()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        const data = await response.json();
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Articles will appear here as soon as they are published.');
        setPosts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchPosts();
    return () => controller.abort();
  }, []);

  const ordered = useMemo(() => {
    return [...posts].sort((a, b) => {
      const pin = Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
      if (pin !== 0) return pin;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts]);

  const hasPosts = ordered.length > 0;
  const recent = ordered.slice(0, 2);

  const openChat = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent('openChatbot'));
  };

  const renderCard = (post: BlogPost, featured = false) => {
    const imageUrl = post.coverImage || '/images/himg-1.jpg';
    const tag = post.category || post.tags?.[0] || '';
    return (
      <article key={post.id} className={`news-card ${featured ? 'news-card--featured' : ''}`}>
        <Link className="news-card__link" to={`/blog/${post.slug}`}>
          <div className="news-card__image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={post.title} loading="lazy" />
            {featured ? <span className="news-card__featured-badge">Featured</span> : null}
          </div>
          <div className="news-card__body">
            <h2 className="news-card__title">{post.title}</h2>
            <div className="news-card__meta">
              <time className="news-card__date" dateTime={post.createdAt}>
                {formatNewsDate(post.createdAt)}
              </time>
              {tag ? <span className="news-card__tag">{tag}</span> : null}
            </div>
            <p className="news-card__excerpt">
              {truncate(post.excerpt || post.metaDescription || '', featured ? 400 : 240)}
            </p>
            <span className="news-card__read-more">View Story</span>
          </div>
        </Link>
      </article>
    );
  };

  return (
    <div className="content gallery news-gallery" id="blog">
      <div className="content-block">
        <div className="lt">
          <div className="news-gallery__main">
            <section className="news-gallery__primary">
              <header className="news-page__hero">
                <span className="news-page__eyebrow">Blog</span>
                <h1 className="news-page__title">Kite Blog</h1>
                <p className="news-page__subtitle">
                  Guides, career tips, and institute updates for aspiring aviation & hospitality professionals.
                </p>
              </header>

              {loading ? (
                <div className="gallery-images-holder news-gallery__holder news-gallery__holder--loading">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <article key={`blog-skeleton-${index}`} className="news-card news-card--skeleton" aria-hidden="true">
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
              ) : null}

              {!loading && !hasPosts ? (
                <div className="news-page__state">
                  <p>{error || 'Articles will appear here as soon as they are published.'}</p>
                  <Link className="news-page__cta" to="/contact">
                    Contact Us
                  </Link>
                </div>
              ) : null}

              {!loading && hasPosts ? (
                <div className="gallery-images-holder news-gallery__holder">
                  {ordered.map((post, index) => renderCard(post, index === 0))}
                </div>
              ) : null}
            </section>

            <article className="news-gallery__footer news-page__footer">
              <p>Looking for something specific? Reach out to our admissions team for personalised guidance.</p>
              <a className="news-page__cta" href="#" onClick={openChat} style={{ cursor: 'pointer' }}>
                Talk to Us
              </a>
            </article>
          </div>
        </div>

        <div className="rt">
          <aside className="sidebar news-gallery__sidebar">
            {recent.length > 0 ? (
              <section className="sidebar-section">
                <div className="news-section news-section--embedded">
                  <div className="news-section__header">
                    <div className="news-section__title-group">
                      <span className="news-section__eyebrow">Updates & Highlights</span>
                      <h2 className="news-section__title">Latest Articles</h2>
                    </div>
                  </div>
                  <div className="news-section__grid">
                    {recent.map((post) => {
                      const imageUrl = post.coverImage || '';
                      const excerpt = truncate(post.excerpt || post.metaDescription || '', 140);
                      return (
                        <article key={`recent-${post.id}`} className="news-card">
                          <Link className="news-card__link" to={`/blog/${post.slug}`}>
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
                                  {formatNewsDate(post.createdAt)}
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
                </div>
              </section>
            ) : null}

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

export default Blog;
