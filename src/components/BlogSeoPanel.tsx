'use client';

import { useMemo, useState } from 'react';
import type { BlogPost } from '@/lib/blogShared';
import {
  analyzeBlogSeo,
  calcRankMathScore,
  fleschReadingEase,
  getOgDescription,
  getOgImage,
  getOgTitle,
  getSeoDescription,
  getSeoRating,
  getSeoTitle,
  keywordStats,
  plainTextFromBlocks,
  type SeoCheck,
} from '@/lib/blogSeo';

type SeoTab = 'general' | 'advanced' | 'schema' | 'social';

type Props = {
  post: BlogPost;
  siteOrigin?: string;
  pathPrefix?: '/blog' | '/news';
  onChange: (patch: Partial<BlogPost>) => void;
  onUploadOgImage?: (file: File) => void;
  uploadingOg?: boolean;
};

const TITLE_VARS = [
  { token: '%title%', label: 'Title' },
  { token: '%sep%', label: 'Sep' },
  { token: '%sitename%', label: 'Site' },
  { token: '%focuskw%', label: 'Focus KW' },
];

function insertAtEnd(current: string, token: string) {
  const next = `${current || ''} ${token}`.replace(/\s+/g, ' ').trim();
  return next;
}

function ProgressRing({ score, rating }: { score: number; rating: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className={`wp-seo__ring wp-seo__ring--${rating}`}>
      <svg viewBox="0 0 72 72" aria-hidden>
        <circle cx="36" cy="36" r={r} className="wp-seo__ring-bg" />
        <circle
          cx="36"
          cy="36"
          r={r}
          className="wp-seo__ring-fg"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="wp-seo__ring-label">
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function CheckList({ title, items }: { title: string; items: SeoCheck[] }) {
  if (!items.length) return null;
  return (
    <div className="wp-seo__checks">
      <strong>{title}</strong>
      <ul>
        {items.map((check) => (
          <li
            key={check.id}
            className={check.pass ? 'is-pass' : check.severity === 'warning' ? 'is-warn' : 'is-fail'}
          >
            <span aria-hidden>{check.pass ? '✓' : check.severity === 'warning' ? '!' : '✗'}</span>
            <div>
              <b>{check.label}</b>
              {!check.pass && check.hint ? <small>{check.hint}</small> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlogSeoPanel({
  post,
  siteOrigin = 'https://kiteaviation.in',
  pathPrefix = '/blog',
  onChange,
  onUploadOgImage,
  uploadingOg,
}: Props) {
  const [tab, setTab] = useState<SeoTab>('general');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');

  const score = calcRankMathScore(post);
  const rating = getSeoRating(score);
  const checks = useMemo(() => analyzeBlogSeo(post), [post]);
  const byGroup = useMemo(
    () => ({
      basic: checks.filter((c) => c.group === 'basic'),
      additional: checks.filter((c) => c.group === 'additional'),
      title: checks.filter((c) => c.group === 'title'),
      content: checks.filter((c) => c.group === 'content'),
    }),
    [checks],
  );

  const seoTitle = getSeoTitle(post);
  const seoDesc = getSeoDescription(post);
  const url = `${siteOrigin.replace(/\/$/, '')}${pathPrefix}/${post.slug || 'post-slug'}`;
  const ogTitle = getOgTitle(post);
  const ogDesc = getOgDescription(post);
  const ogImage = getOgImage(post);
  const stats = keywordStats(post);
  const flesch = fleschReadingEase(plainTextFromBlocks(post.blocks));
  const failed = checks.filter((c) => !c.pass).length;

  const titleLenClass =
    seoTitle.length >= 50 && seoTitle.length <= 60
      ? 'is-good'
      : seoTitle.length >= 40 && seoTitle.length <= 70
        ? 'is-mid'
        : 'is-low';
  const descLenClass =
    seoDesc.length >= 120 && seoDesc.length <= 160
      ? 'is-good'
      : seoDesc.length >= 70 && seoDesc.length <= 180
        ? 'is-mid'
        : 'is-low';

  return (
    <div className="wp-blog__card wp-seo">
      <div className="wp-seo__hero">
        <ProgressRing score={score} rating={rating} />
        <div>
          <div className="wp-seo__hero-top">
            <h4>Rank Math SEO</h4>
            <span className={`wp-seo__badge wp-seo__badge--${rating}`}>
              {rating === 'great' ? 'Great' : rating === 'good' ? 'Good' : 'Needs work'}
            </span>
          </div>
          <p className="wp-seo__summary">
            {failed === 0
              ? 'All SEO tests look solid. Keep content fresh and monitor rankings.'
              : `${failed} improvement${failed === 1 ? '' : 's'} left · density ${stats.density}% · Flesch ${flesch}`}
          </p>
        </div>
      </div>

      <div className="wp-seo__tabs" role="tablist">
        {(
          [
            ['general', 'General'],
            ['advanced', 'Advanced'],
            ['schema', 'Schema'],
            ['social', 'Social'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'is-active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="wp-seo__panel">
          <div className="wp-seo__serp">
            <div className="wp-seo__serp-toolbar">
              <span>Snippet Preview</span>
              <div className="wp-seo__device">
                <button
                  type="button"
                  className={serpDevice === 'desktop' ? 'is-active' : ''}
                  onClick={() => setSerpDevice('desktop')}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  className={serpDevice === 'mobile' ? 'is-active' : ''}
                  onClick={() => setSerpDevice('mobile')}
                >
                  Mobile
                </button>
              </div>
            </div>
            <div className={`wp-seo__serp-card is-${serpDevice}`}>
              <div className="wp-seo__serp-url">{url}</div>
              <div className="wp-seo__serp-title">{seoTitle || 'Your SEO title will appear here'}</div>
              <div className="wp-seo__serp-desc">
                {seoDesc || 'Add a meta description to control this Google snippet.'}
              </div>
            </div>
          </div>

          <label>
            <span>Focus Keyword</span>
            <input
              value={post.focusKeyword || ''}
              placeholder="e.g. aviation career"
              onChange={(e) => onChange({ focusKeyword: e.target.value })}
            />
            {stats.keyword ? (
              <small className="wp-seo__hint">
                Used <b>{stats.occurrences}</b> times · density <b>{stats.density}%</b> (ideal 0.5–2.5%)
              </small>
            ) : null}
          </label>

          <label>
            <span>
              SEO Title <em className={titleLenClass}>{seoTitle.length}/60</em>
            </span>
            <input
              value={post.metaTitle}
              placeholder="%title% %sep% %sitename%"
              onChange={(e) => onChange({ metaTitle: e.target.value })}
            />
            <div className="wp-seo__vars">
              {TITLE_VARS.map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => onChange({ metaTitle: insertAtEnd(post.metaTitle, v.token) })}
                >
                  {v.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    metaTitle: `${post.title || '%title%'} %sep% %sitename%`,
                  })
                }
              >
                Autofill
              </button>
            </div>
          </label>

          <label>
            <span>Permalink</span>
            <div className="wp-seo__slug">
              <span>{pathPrefix}/</span>
              <input
                value={post.slug}
                onChange={(e) =>
                  onChange({
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, ''),
                  })
                }
              />
            </div>
          </label>

          <label>
            <span>
              Meta Description <em className={descLenClass}>{seoDesc.length}/160</em>
            </span>
            <textarea
              rows={3}
              value={post.metaDescription}
              placeholder="Write a compelling Google snippet…"
              onChange={(e) => onChange({ metaDescription: e.target.value })}
            />
            <div className="wp-seo__vars">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    metaDescription:
                      post.excerpt ||
                      `Learn about ${post.focusKeyword || post.title || 'this topic'} at Kite Institute of Aviation & Hospitality, Bangalore.`,
                  })
                }
              >
                Autofill from excerpt
              </button>
            </div>
          </label>

          <CheckList title="Basic SEO" items={byGroup.basic} />
          <CheckList title="Additional" items={byGroup.additional} />
          <CheckList title="Title Readability" items={byGroup.title} />
          <CheckList title="Content Readability" items={byGroup.content} />
        </div>
      )}

      {tab === 'advanced' && (
        <div className="wp-seo__panel">
          <label>
            <span>Canonical URL</span>
            <input
              type="url"
              value={post.canonicalUrl || ''}
              placeholder={url}
              onChange={(e) => onChange({ canonicalUrl: e.target.value })}
            />
            <small className="wp-seo__hint">Leave blank to use the default permalink.</small>
          </label>
          <div className="wp-seo__robots">
            <label className="wp-seo__check">
              <input
                type="checkbox"
                checked={post.robotsIndex !== false}
                onChange={(e) => onChange({ robotsIndex: e.target.checked })}
              />
              <span>Index this post in search engines</span>
            </label>
            <label className="wp-seo__check">
              <input
                type="checkbox"
                checked={post.robotsFollow !== false}
                onChange={(e) => onChange({ robotsFollow: e.target.checked })}
              />
              <span>Follow links on this post</span>
            </label>
          </div>
          <div className="wp-seo__note">
            Draft / archived posts stay out of the public sitemap even when “Index” is on. Publish the
            post for Google to see it.
          </div>
        </div>
      )}

      {tab === 'schema' && (
        <div className="wp-seo__panel">
          <label>
            <span>Schema Type</span>
            <select
              value={post.schemaType || 'BlogPosting'}
              onChange={(e) =>
                onChange({
                  schemaType: e.target.value as BlogPost['schemaType'],
                })
              }
            >
              <option value="BlogPosting">BlogPosting (default)</option>
              <option value="Article">Article</option>
              <option value="NewsArticle">NewsArticle</option>
            </select>
          </label>
          <div className="wp-seo__schema-preview">
            <strong>JSON-LD preview</strong>
            <pre>{`{
  "@type": "${post.schemaType || 'BlogPosting'}",
  "headline": "${(post.title || '').replace(/"/g, '\\"')}",
  "description": "${(seoDesc || '').slice(0, 80).replace(/"/g, '\\"')}${seoDesc.length > 80 ? '…' : ''}",
  "author": "${post.authorName || 'Kite Institute'}",
  "datePublished": "${post.createdAt}",
  "url": "${url}"
}`}</pre>
          </div>
        </div>
      )}

      {tab === 'social' && (
        <div className="wp-seo__panel">
          <div className="wp-seo__og-preview wp-seo__og-preview--large">
            <div className="wp-seo__og-image">
              {ogImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ogImage} alt="" />
              ) : (
                <span>Add image</span>
              )}
            </div>
            <div>
              <small>{siteOrigin.replace(/^https?:\/\//, '')}</small>
              <strong>{ogTitle || 'Social title preview'}</strong>
              <p>{ogDesc || 'Social description preview for Facebook, LinkedIn, WhatsApp…'}</p>
            </div>
          </div>

          <label>
            <span>Facebook / OG title</span>
            <input
              value={post.ogTitle || ''}
              placeholder={seoTitle || post.title}
              onChange={(e) => onChange({ ogTitle: e.target.value })}
            />
          </label>
          <label>
            <span>Facebook / OG description</span>
            <textarea
              rows={3}
              value={post.ogDescription || ''}
              placeholder={seoDesc}
              onChange={(e) => onChange({ ogDescription: e.target.value })}
            />
          </label>
          <label className="wp-seo__upload">
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploadingOg}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file && onUploadOgImage) onUploadOgImage(file);
              }}
            />
            {uploadingOg ? 'Uploading…' : ogImage ? 'Replace social image' : 'Upload social image'}
          </label>
          {post.ogImage ? (
            <button type="button" className="wp-seo__link-btn" onClick={() => onChange({ ogImage: '' })}>
              Use featured image instead
            </button>
          ) : (
            <small className="wp-seo__hint">Falls back to the featured image when empty.</small>
          )}
        </div>
      )}
    </div>
  );
}

export default BlogSeoPanel;
