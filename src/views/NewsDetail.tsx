'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from '@/lib/router';
import BlogBlockRenderer from '@/src/components/BlogBlockRenderer';
import type { BlogPost } from '@/lib/blogShared';

function NewsDetail() {
  const params = useParams() as { slug?: string; id?: string };
  const slug = params.slug || params.id;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [commentMsg, setCommentMsg] = useState('');
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/news/${encodeURIComponent(slug)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          if (!cancelled) {
            setError(data.error || 'Post not found');
            setPost(null);
          }
          return;
        }
        if (!cancelled) {
          setPost(data.post);
          setLikes(Number(data.post?.likes || 0));
          if (data.post?.metaTitle) document.title = data.post.metaTitle;
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
  }, [slug]);

  const onLike = async () => {
    if (!slug) return;
    const res = await fetch(`/api/news/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'like' }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.success) setLikes(Number(data.likes || likes + 1));
  };

  const onComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setCommentMsg('');
    const res = await fetch(`/api/news/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'comment', authorName: name, authorEmail: email, content: comment }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      setCommentMsg(data.error || 'Could not submit comment');
      return;
    }
    setCommentMsg('Thanks — your comment is awaiting moderation.');
    setName('');
    setEmail('');
    setComment('');
  };

  if (loading) {
    return (
      <div className="content-panel blog-detail">
        <p>Loading…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="content-panel blog-detail">
        <p>{error || 'Post not found'}</p>
        <Link to="/news">← Back to news</Link>
      </div>
    );
  }

  const approved = (post.comments || []).filter((c) => c.isApproved);

  return (
    <div className="content-panel blog-detail">
      <Link to="/news" className="blog-detail__back">
        ← All news
      </Link>
      <article className="blog-detail__article">
        {post.coverImage ? (
          <div className="blog-detail__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} />
          </div>
        ) : null}
        <header className="blog-detail__header">
          <span className="blog-detail__meta">
            {post.category || 'News'} · {post.createdAt} · {post.authorName || 'Kite Institute'}
          </span>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="blog-detail__excerpt">{post.excerpt}</p> : null}
        </header>
        <BlogBlockRenderer blocks={post.blocks} />
        <div className="blog-detail__engage">
          <button type="button" onClick={onLike}>
            ♥ {likes}
          </button>
          <span>{post.views || 0} views</span>
        </div>
      </article>

      <section className="blog-detail__comments">
        <h2>Comments</h2>
        {approved.length === 0 ? <p>No comments yet. Be the first.</p> : null}
        {approved.map((c) => (
          <div key={c.id} className="blog-detail__comment">
            <strong>{c.authorName}</strong>
            <p>{c.content}</p>
          </div>
        ))}
        <form onSubmit={onComment} className="blog-detail__form">
          <h3>Leave a comment</h3>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
          />
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment…"
          />
          <button type="submit">Post comment</button>
          {commentMsg ? <p className="blog-detail__msg">{commentMsg}</p> : null}
        </form>
      </section>
    </div>
  );
}

export default NewsDetail;
