'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from '@/lib/router';
import sampleNews from '../data/sampleNews';
import { normalizeNewsItems } from '../utils/newsUtils';

const getBaseUrl = () => '/';

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allNews, setAllNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [shareLink, setShareLink] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadNews() {
      if (!id) {
        setError('Invalid news article.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

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
        setAllNews(normalized);

        const current = normalized.find((item) => String(item.id) === String(id));

        if (current) {
          setPost(current);
          setError('');
        } else {
          setPost(null);
          setError('We could not find that news story.');
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }

        console.error('News detail fetch failed, using sample data:', err);
        const fallback = normalizeNewsItems(sampleNews);
        setAllNews(fallback);

        const current = fallback.find((item) => String(item.id) === String(id));
        if (current) {
          setPost(current);
          setError('');
        } else {
          setPost(null);
          setError('We could not find that news story.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareLink(window.location.href);
    }
  }, [id]);

  const renderContent = () => {
    if (!post || !post.content) {
      return '';
    }
    return post.content;
  };

  let imageUrl = null;
  if (post?.image) {
    imageUrl = /^https?:/i.test(post.image)
      ? post.image
      : `${getBaseUrl()}${post.image.replace(/^\/+/, '')}`;
  }

  const effectiveShareUrl = useMemo(() => {
    if (shareLink) {
      return shareLink;
    }
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  }, [shareLink]);

  const encodedShareUrl = useMemo(() => encodeURIComponent(effectiveShareUrl || ''), [effectiveShareUrl]);
  const shareTitle = post?.title ?? 'Kite Aviation News';

  const shareTargets = useMemo(() => {
    if (!effectiveShareUrl) {
      return [];
    }
    const baseMessage = `${shareTitle}`;
    return [
      {
        id: 'linkedin',
        label: 'LinkedIn',
        tooltip: 'Share on LinkedIn',
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
        iconClass: 'linkedin',
      },
      {
        id: 'facebook',
        label: 'Facebook',
        tooltip: 'Share on Facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
        iconClass: 'facebook',
      },
      {
        id: 'twitter',
        label: 'X',
        tooltip: 'Share on X',
        href: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodeURIComponent(baseMessage)}`,
        iconClass: 'twitter',
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        tooltip: 'Share on WhatsApp',
        href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${baseMessage} ${effectiveShareUrl}`)}`,
        iconClass: 'whatsapp',
      },
    ];
  }, [encodedShareUrl, effectiveShareUrl, shareTitle]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    allNews.forEach((item) => {
      if (item.tag) {
        tags.add(item.tag);
      }
    });
    return ['All', ...Array.from(tags)];
  }, [allNews]);

  const filteredNews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allNews
      .filter((item) => String(item.id) !== String(id))
      .filter((item) => {
        if (selectedTag !== 'All' && (item.tag || '').toLowerCase() !== selectedTag.toLowerCase()) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${item.title || ''} ${item.content || ''}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });
  }, [allNews, id, searchTerm, selectedTag]);

  const showToast = (message) => {
    setShareStatus(message);
    if (message && typeof window !== 'undefined') {
      window.clearTimeout((showToast as { timeoutId?: number }).timeoutId);
      (showToast as { timeoutId?: number }).timeoutId = window.setTimeout(() => {
        setShareStatus('');
      }, 3000);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(effectiveShareUrl);
      showToast('Link copied to clipboard');
    } catch (clipboardError) {
      console.error('Failed to copy link:', clipboardError);
      showToast('Copy not supported on this device');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share && effectiveShareUrl) {
      try {
        await navigator.share({
          title: shareTitle,
          text: post?.tag ? `${post.tag} · ${shareTitle}` : shareTitle,
          url: effectiveShareUrl,
        });
        showToast('Thanks for sharing!');
      } catch (shareError) {
        if (shareError.name !== 'AbortError') {
          console.error('Native share failed:', shareError);
          showToast('Share was cancelled');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/news');
    }
  };

  const showRelatedStories = !loading && !error;

  return (
    <div className="content-box news-detail inside-page">
      <div className="content-block">
        <div className="lt">
          <div className="news-detail__main">
            {loading && (
              <div className="news-page__state">
                <span className="news-section__loader" aria-label="Loading news article" />
                <p>Loading article…</p>
              </div>
            )}

            {!loading && error && (
              <div className="news-page__state news-page__state--error">
                <p>{error}</p>
                <div className="news-detail__actions">
                  <button type="button" className="news-page__retry" onClick={handleBack}>
                    Go Back
                  </button>
                  <Link className="news-page__cta" to="/news">
                    View All News
                  </Link>
                </div>
              </div>
            )}

            {!loading && !error && post && (
              <article className="news-detail__article">
                <h1 className="news-detail__title">{post.title}</h1>
                {post.subtitle && (
                  <p className="news-detail__subtitle">{post.subtitle}</p>
                )}
                <div className="news-detail__meta">
                  <div className="news-detail__dateline">
                    <time className="news-detail__date" dateTime={post.created_at}>
                      {post.formatted_date || post.created_at}
                    </time>
                    {post?.source && (
                      <>
                        <span className="news-detail__dot" aria-hidden="true">•</span>
                        {post.source_url ? (
                          <a className="news-detail__source" href={post.source_url} target="_blank" rel="noopener noreferrer">
                            {post.source}
                          </a>
                        ) : (
                          <span className="news-detail__source">{post.source}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="news-detail__labels">
                    {post.tag && <span className="news-detail__tag">{post.tag}</span>}
                    {/* {post.external_url && (
                      <a
                        className="news-detail__external"
                        href={post.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read full story
                      </a>
                    )} */}
                  </div>
                </div>

                {imageUrl && (
                  <div className="news-detail__image">
                    <img src={imageUrl} alt={post.title} loading="lazy" />
                  </div>
                )}

                <div
                  className="news-detail__body"
                  dangerouslySetInnerHTML={{ __html: renderContent() }}
                />

                {(shareTargets.length > 0 || effectiveShareUrl) && (
                  <div className="news-share">
                    <span className="news-share__title">Share this story</span>
                    <div className="news-share__icons">
                      <button
                        type="button"
                        className="news-share__icon share tooltip-btn"
                        onClick={handleNativeShare}
                        aria-label="Share via device"
                      >
                        <span className="tooltip-txt">Share via device</span>
                      </button>
                      <button
                        type="button"
                        className="news-share__icon copy tooltip-btn"
                        onClick={handleCopyLink}
                        aria-label="Copy link"
                      >
                        <span className="tooltip-txt">Copy link</span>
                      </button>
                      {shareTargets.map((network) => (
                        <a
                          key={network.id}
                          className={`news-share__icon ${network.iconClass} tooltip-btn`}
                          href={network.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={network.tooltip}
                        >
                          <span className="tooltip-txt">{network.tooltip}</span>
                        </a>
                      ))}
                    </div>
                    {shareStatus && <p className="news-share__message">{shareStatus}</p>}
                  </div>
                )}

                <div className="news-detail__actions">
                  <button type="button" className="news-page__retry" onClick={handleBack}>
                    Back
                  </button>
                  <Link className="news-page__cta" to="/news">
                    View All News
                  </Link>
                  <Link className="news-page__cta news-page__cta--outline" to="/contact">
                    Connect With Us
                  </Link>
                </div>
              </article>
            )}
          </div>
        </div>

        {showRelatedStories && (
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
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="news-explore__filters">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`news-filter-pill ${selectedTag === tag ? 'active' : ''}`}
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {filteredNews.length === 0 ? (
                    <div className="news-page__state news-page__state--compact">
                      <p>No matching stories found. Try a different keyword or filter.</p>
                      <button
                        type="button"
                        className="news-page__retry news-page__retry--ghost"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedTag('All');
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="news-explore__grid">
                      {filteredNews.map((item) => {
                        const thumbUrl = item.image
                          ? `${getBaseUrl()}${item.image.replace(/^\/+/, '')}`
                          : null;
                        const plainContent = (item.content || '').replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
                        const preview =
                          plainContent.length > 120
                            ? `${plainContent.slice(0, 120).trim()}…`
                            : plainContent;

                        return (
                          <article key={item.id} className="news-mini-card">
                            <Link to={`/news/${item.id}`} className="news-mini-card__link">
                              {thumbUrl && (
                                <div className="news-mini-card__image">
                                  <img src={thumbUrl} alt={item.title} loading="lazy" />
                                </div>
                              )}
                              <div className="news-mini-card__body">
                                <h3 className="news-mini-card__title">{item.title}</h3>
                                <div className="news-mini-card__meta">
                                  <time className="news-card__date" dateTime={item.created_at}>
                                    {item.formatted_date || item.created_at}
                                  </time>
                                  {/*{item.tag && <span className="news-mini-card__tag">{item.tag}</span>}*/}
                                </div>
                                {preview && <p className="news-mini-card__excerpt">{preview}</p>}
                                <span className="news-mini-card__cta">
                                  Read Story
                                </span>
                              </div>
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsDetail;

