'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import type { BlogPost } from '@/lib/blogShared';

function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/blogs?scope=public');
        const data = await res.json().catch(() => ({}));
        if (!cancelled && Array.isArray(data.posts)) setPosts(data.posts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...posts].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
    if (!q) return list;
    return list.filter((p) =>
      [p.title, p.excerpt, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(q),
    );
  }, [posts, query]);

  return (
    <div className="content-panel blog-page">
      <div className="blog-page__hero">
        <h1>Kite Blog</h1>
        <p>Guides, career tips, and institute updates for aspiring aviation & hospitality professionals.</p>
        <input
          className="blog-page__search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
        />
      </div>

      {loading ? (
        <p className="blog-page__empty">Loading articles…</p>
      ) : filtered.length === 0 ? (
        <p className="blog-page__empty">No published posts yet.</p>
      ) : (
        <div className="blog-page__grid">
          {filtered.map((post) => (
            <article key={post.id} className="blog-page__card">
              <Link to={`/blog/${post.slug}`} className="blog-page__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImage || '/images/himg-1.jpg'} alt="" />
                {post.isPinned ? <span className="blog-page__pin">Featured</span> : null}
              </Link>
              <div className="blog-page__body">
                <span className="blog-page__meta">
                  {post.category || 'Blog'} · {post.createdAt}
                </span>
                <h2>
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt || post.metaDescription}</p>
                <Link to={`/blog/${post.slug}`} className="blog-page__more">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Blog;
