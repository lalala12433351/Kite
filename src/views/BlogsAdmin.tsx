'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  BLOG_CATEGORIES,
  NEWS_CATEGORIES,
  blocksToClassic,
  classicToBlocks,
  createEmptyPost,
  slugify,
  wordStats,
  type BlogBlock,
  type BlogPost,
  type BlogStatus,
} from '@/lib/blogShared';
import { calcRankMathScore } from '@/lib/blogSeo';
import BlogBlockEditor from '@/src/components/BlogBlockEditor';
import BlogSeoPanel from '@/src/components/BlogSeoPanel';

type SubTab = 'posts' | 'comments' | 'stats';
export type ContentKind = 'blog' | 'news';

const KIND_CONFIG = {
  blog: {
    label: 'Blog',
    api: '/api/blogs',
    upload: '/api/blogs/upload',
    pathPrefix: '/blog' as const,
    categories: BLOG_CATEGORIES,
    emptyMessage: 'Loading blog posts…',
    feedTitle: 'Articles Feed',
    feedHelp: 'Manage blog posts, configure URLs, and write SEO content to rank on search engines.',
    pinLabel: 'Pin to top of blog feed',
  },
  news: {
    label: 'News',
    api: '/api/news',
    upload: '/api/news/upload',
    pathPrefix: '/news' as const,
    categories: NEWS_CATEGORIES,
    emptyMessage: 'Loading news posts…',
    feedTitle: 'News Feed',
    feedHelp: 'Manage news stories, configure URLs, and write SEO content to rank on search engines.',
    pinLabel: 'Pin to top of news feed',
  },
};

function seoBarClass(score: number) {
  if (score >= 80) return 'is-good';
  if (score >= 50) return 'is-mid';
  return 'is-low';
}

function BlogsAdmin({
  onToast,
  kind = 'blog',
}: {
  onToast?: (type: 'success' | 'error', text: string) => void;
  kind?: ContentKind;
}) {
  const cfg = KIND_CONFIG[kind];
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subTab, setSubTab] = useState<SubTab>('posts');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [classicMode, setClassicMode] = useState(false);
  const [classicText, setClassicText] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'page' | 'block'>('page');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const notify = (type: 'success' | 'error', text: string) => onToast?.(type, text);

  const editing = useMemo(
    () => posts.find((p) => p.id === editingId) || null,
    [posts, editingId],
  );

  const pendingComments = useMemo(() => {
    const rows: {
      postId: string;
      postTitle: string;
      comment: NonNullable<BlogPost['comments']>[number];
    }[] = [];
    posts.forEach((post) => {
      (post.comments || []).forEach((comment) => {
        if (!comment.isApproved) rows.push({ postId: post.id, postTitle: post.title, comment });
      });
    });
    return rows;
  }, [posts]);

  const stats = useMemo(() => {
    const views = posts.reduce((n, p) => n + Number(p.views || 0), 0);
    const likes = posts.reduce((n, p) => n + Number(p.likes || 0), 0);
    const published = posts.filter((p) => p.status === 'published').length;
    const top = [...posts].sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).slice(0, 5);
    return { views, likes, published, top };
  }, [posts]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(cfg.api, { credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        notify('error', data.error || `Failed to load ${cfg.label.toLowerCase()}`);
        setPosts([]);
        return;
      }
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch {
      notify('error', `Failed to load ${cfg.label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const persist = async (next: BlogPost[], message = `${cfg.label} posts saved`) => {
    if (!Array.isArray(next) || next.length === 0) {
      notify('error', 'Save blocked — post list is empty. Reload before saving to avoid data loss.');
      return false;
    }
    setSaving(true);
    try {
      const res = await fetch(cfg.api, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        notify('error', data.error || 'Save failed');
        return false;
      }
      setPosts(Array.isArray(data.posts) ? data.posts : next);
      notify('success', data.message || message);
      return true;
    } catch {
      notify('error', 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updatePost = (id: string, patch: Partial<BlogPost>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const updateEditing = (patch: Partial<BlogPost>) => {
    if (!editingId) return;
    updatePost(editingId, patch);
  };

  const updateBlock = (blockId: string, patch: Partial<BlogBlock>) => {
    if (!editing) return;
    updateEditing({
      blocks: editing.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
    });
  };

  const addPost = () => {
    const post = createEmptyPost(kind);
    setPosts((prev) => [post, ...prev]);
    setEditingId(post.id);
    setClassicMode(false);
    setSubTab('posts');
  };

  const openEditor = (id: string) => {
    const post = posts.find((p) => p.id === id);
    setEditingId(id);
    setClassicMode(false);
    setClassicText(post ? blocksToClassic(post.blocks) : '');
    setSidebarTab('page');
  };

  const trashPost = (id: string) => {
    updatePost(id, { status: 'archived', isPublished: false });
    if (editingId === id) setEditingId(null);
  };

  const toggleClassic = () => {
    if (!editing) return;
    if (!classicMode) {
      setClassicText(blocksToClassic(editing.blocks));
      setClassicMode(true);
    } else {
      updateEditing({ blocks: classicToBlocks(classicText) });
      setClassicMode(false);
    }
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(cfg.upload, {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.url) {
        notify('error', data.error || 'Upload failed');
        return null;
      }
      return data.url as string;
    } catch {
      notify('error', 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onFeaturedUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editing) return;
    const url = await uploadMedia(file);
    if (url) updateEditing({ coverImage: url });
  };

  const onBlockMediaUpload = async (file: File, blockId: string, kind: 'image' | 'video') => {
    const url = await uploadMedia(file);
    if (!url || !editing) return;
    updateEditing({
      blocks: editing.blocks.map((b) =>
        b.id === blockId ? { ...b, mediaUrl: url, type: kind === 'video' ? 'video' : b.type } : b,
      ),
    });
  };

  const approveComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              comments: (p.comments || []).map((c) =>
                c.id === commentId ? { ...c, isApproved: true } : c,
              ),
            },
      ),
    );
  };

  const deleteComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : { ...p, comments: (p.comments || []).filter((c) => c.id !== commentId) },
      ),
    );
  };

  const saveDraft = () => {
    if (!editing) return;
    updateEditing({ status: 'draft', isPublished: false });
    const next = posts.map((p) =>
      p.id === editing.id ? { ...p, status: 'draft' as BlogStatus, isPublished: false } : p,
    );
    persist(next, 'Draft saved');
  };

  const publishUpdate = () => {
    if (!editing) return;
    let nextBlocks = editing.blocks;
    if (classicMode) nextBlocks = classicToBlocks(classicText);
    const next = posts.map((p) =>
      p.id === editing.id
        ? {
            ...p,
            blocks: nextBlocks,
            status: (p.status === 'archived' ? 'draft' : p.status) as BlogStatus,
            isPublished: p.status === 'published' || p.status === 'scheduled',
            slug: slugify(p.slug || p.title),
          }
        : p,
    );
    persist(next, 'Post updated');
  };

  const setStatus = (status: BlogStatus) => {
    updateEditing({
      status,
      isPublished: status === 'published',
    });
  };

  if (loading) return <p className="superadmin-empty">{cfg.emptyMessage}</p>;

  /* —— EDITOR —— */
  if (editing) {
    const statsBar = wordStats(classicMode ? classicToBlocks(classicText) : editing.blocks);

    return (
      <div className="wp-blog">
        <div className="wp-blog__editor-top">
          <div className="wp-blog__crumbs">
            <button type="button" className="superadmin-back" onClick={() => setEditingId(null)}>
              ← Posts
            </button>
            <span>
              {cfg.label} / <strong>{editing.title || `Untitled ${cfg.label}`}</strong>
            </span>
          </div>
          <div className="wp-blog__editor-top-actions">
            {editing.slug ? (
              <a
                className="wp-blog__preview-link"
                href={`${cfg.pathPrefix}/${editing.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Preview
              </a>
            ) : null}
            <button
              type="button"
              className="superadmin-btn superadmin-btn--ghost"
              onClick={saveDraft}
              disabled={saving}
            >
              Save draft
            </button>
            <button
              type="button"
              className="superadmin-btn superadmin-btn--primary"
              onClick={publishUpdate}
              disabled={saving}
            >
              {saving
                ? 'Saving…'
                : editing.status === 'published'
                  ? 'Update'
                  : 'Publish'}
            </button>
          </div>
        </div>

        <div className="wp-blog__editor-grid">
          <div className="wp-blog__canvas">
            <input
              className="wp-blog__title-input"
              value={editing.title}
              onChange={(e) => {
                const title = e.target.value;
                const patch: Partial<BlogPost> = { title };
                if (!editing.slug || editing.slug === slugify(editing.title) || editing.slug === 'new-post') {
                  patch.slug = slugify(title) || 'new-post';
                }
                if (!editing.metaTitle) patch.metaTitle = title.slice(0, 60);
                updateEditing(patch);
              }}
              placeholder="Add title"
            />

            <div className="wp-blog__permalink">
              <span>Permalink:</span>
              <span className="wp-blog__permalink-base">{cfg.pathPrefix}/</span>
              <input
                value={editing.slug}
                onChange={(e) => updateEditing({ slug: slugify(e.target.value) })}
              />
            </div>

            {classicMode ? (
              <div className="wp-blog__classic">
                <div className="wp-blog__classic-bar">
                  <span>Classic editor</span>
                  <button type="button" className="wp-blog__text-btn" onClick={toggleClassic}>
                    Switch to block editor
                  </button>
                </div>
                <textarea
                  className="wp-blog__classic-area"
                  rows={18}
                  value={classicText}
                  onChange={(e) => setClassicText(e.target.value)}
                />
              </div>
            ) : (
              <BlogBlockEditor
                blocks={editing.blocks}
                activeBlockId={activeBlockId}
                uploading={uploading}
                onChangeBlocks={(blocks) => updateEditing({ blocks })}
                onActiveBlockId={setActiveBlockId}
                onUploadMedia={onBlockMediaUpload}
              />
            )}

            <div className="wp-blog__stats-bar">
              <div className="wp-blog__stats-bar-left">
                <span>{statsBar.words} words</span>
                <span>{statsBar.blocks} block{statsBar.blocks === 1 ? '' : 's'}</span>
                <span>{statsBar.minutes} min read</span>
              </div>
              <button type="button" className="wp-blog__text-btn" onClick={toggleClassic}>
                {classicMode ? 'Block editor' : 'Code editor'}
              </button>
            </div>
          </div>

          <aside className="wp-blog__sidebar">
            <div className="wp-blog__side-tabs">
              <button
                type="button"
                className={sidebarTab === 'page' ? 'is-active' : ''}
                onClick={() => setSidebarTab('page')}
              >
                Post
              </button>
              <button
                type="button"
                className={sidebarTab === 'block' ? 'is-active' : ''}
                onClick={() => setSidebarTab('block')}
              >
                Block
              </button>
            </div>

            {sidebarTab === 'page' ? (
              <>
                <div className="wp-blog__card">
                  <h4>Status & visibility</h4>
                  <label>
                    <span>Status</span>
                    <select
                      value={editing.status}
                      onChange={(e) => setStatus(e.target.value as BlogStatus)}
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                  <p className="wp-blog__meta-line">
                    Visibility: <strong>Public</strong>
                  </p>
                  <label>
                    <span>Publish date</span>
                    <input
                      type="date"
                      value={editing.createdAt?.slice(0, 10) || ''}
                      onChange={(e) => updateEditing({ createdAt: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Excerpt</span>
                    <textarea
                      rows={3}
                      value={editing.excerpt || ''}
                      placeholder="Write an excerpt (optional)"
                      onChange={(e) => updateEditing({ excerpt: e.target.value })}
                    />
                  </label>
                  <button
                    type="button"
                    className="wp-blog__trash"
                    onClick={() => trashPost(editing.id)}
                  >
                    Move to trash
                  </button>
                </div>

                <div className="wp-blog__card">
                  <h4>Featured Image</h4>
                  <p className="wp-blog__help">Select a high-quality featured image.</p>
                  {editing.coverImage ? (
                    <div className="wp-blog__featured">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editing.coverImage} alt="" />
                      <button type="button" onClick={() => updateEditing({ coverImage: '' })}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="wp-blog__drop">
                      <input type="file" accept="image/*" onChange={onFeaturedUpload} hidden />
                      Set Featured Image
                    </label>
                  )}
                </div>

                <BlogSeoPanel
                  post={editing}
                  pathPrefix={cfg.pathPrefix}
                  siteOrigin={
                    typeof window !== 'undefined'
                      ? window.location.origin
                      : 'https://kiteaviation.in'
                  }
                  onChange={updateEditing}
                  uploadingOg={uploading}
                  onUploadOgImage={async (file) => {
                    const url = await uploadMedia(file);
                    if (url) updateEditing({ ogImage: url });
                  }}
                />

                <div className="wp-blog__card">
                  <h4>Categories & Tags</h4>
                  <label>
                    <span>Category</span>
                    <select
                      value={editing.category || ''}
                      onChange={(e) =>
                        updateEditing({
                          category: e.target.value,
                          categories: e.target.value ? [e.target.value] : [],
                        })
                      }
                    >
                      {cfg.categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Tags (comma separated)</span>
                    <input
                      value={(editing.tags || []).join(', ')}
                      onChange={(e) =>
                        updateEditing({
                          tags: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Author</span>
                    <input
                      value={editing.authorName || ''}
                      onChange={(e) => updateEditing({ authorName: e.target.value })}
                    />
                  </label>
                  <label className="wp-blog__check">
                    <input
                      type="checkbox"
                      checked={Boolean(editing.isPinned)}
                      onChange={(e) => updateEditing({ isPinned: e.target.checked })}
                    />
                    {cfg.pinLabel}
                  </label>
                </div>
              </>
            ) : (
              <div className="wp-blog__card">
                <h4>Block settings</h4>
                {activeBlockId ? (
                  <>
                    <p className="wp-blog__help">
                      Active: {editing.blocks.find((b) => b.id === activeBlockId)?.type || '—'}
                    </p>
                    <label>
                      <span>Alignment</span>
                      <select
                        value={
                          editing.blocks.find((b) => b.id === activeBlockId)?.align || 'left'
                        }
                        onChange={(e) =>
                          updateBlock(activeBlockId, {
                            align: e.target.value as BlogBlock['align'],
                          })
                        }
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                  </>
                ) : (
                  <p className="wp-blog__help">Select a block to edit its settings.</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  /* —— LIST / COMMENTS / STATS —— */
  return (
    <div className="wp-blog">
      <div className="wp-blog__subnav">
        <button
          type="button"
          className={subTab === 'posts' ? 'is-active' : ''}
          onClick={() => setSubTab('posts')}
        >
          All Posts ({posts.filter((p) => p.status !== 'archived').length})
        </button>
        <button
          type="button"
          className={subTab === 'comments' ? 'is-active' : ''}
          onClick={() => setSubTab('comments')}
        >
          Comments Queue ({pendingComments.length} Pending)
        </button>
        <button
          type="button"
          className={subTab === 'stats' ? 'is-active' : ''}
          onClick={() => setSubTab('stats')}
        >
          Traffic & Conversion Stats
        </button>
      </div>

      {subTab === 'posts' && (
        <>
          <div className="wp-blog__feed-head">
            <div>
              <div className="wp-blog__feed-title-row">
                <h2>{cfg.feedTitle}</h2>
                <button type="button" className="superadmin-btn superadmin-btn--ghost" onClick={addPost}>
                  + Add New Post
                </button>
              </div>
              <p>{cfg.feedHelp}</p>
            </div>
            <button
              type="button"
              className="superadmin-btn superadmin-btn--primary"
              disabled={saving}
              onClick={() => persist(posts)}
            >
              {saving ? 'Saving…' : 'Save All Changes'}
            </button>
          </div>

          {posts.filter((p) => p.status !== 'archived').length === 0 ? (
            <div className="wp-blog__empty">
              <p>No posts yet.</p>
              <button type="button" className="superadmin-btn superadmin-btn--primary" onClick={addPost}>
                Create First Post
              </button>
            </div>
          ) : (
            <div className="superadmin-table-wrap">
              <table className="superadmin-table wp-blog__table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>SEO Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts
                    .filter((p) => p.status !== 'archived')
                    .map((post) => {
                      const score = calcRankMathScore(post);
                      return (
                        <tr key={post.id}>
                          <td>
                            {post.isPinned ? <span className="wp-blog__pin">PIN</span> : null}
                            {post.title}
                          </td>
                          <td>
                            <code>
                              {cfg.pathPrefix}/{post.slug}
                            </code>
                          </td>
                          <td>{post.createdAt}</td>
                          <td>
                            <span className={`wp-blog__status wp-blog__status--${post.status}`}>
                              {post.status}
                            </span>
                          </td>
                          <td>
                            <div className="wp-blog__mini-seo">
                              <div className="wp-blog__seo-meter">
                                <i style={{ width: `${score}%` }} className={seoBarClass(score)} />
                              </div>
                              <span>
                                {score}/100
                              </span>
                            </div>
                          </td>
                          <td className="superadmin-table__actions">
                            <button type="button" onClick={() => openEditor(post.id)}>
                              Edit Post
                            </button>
                            <button type="button" className="is-danger" onClick={() => trashPost(post.id)}>
                              Trash
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {subTab === 'comments' && (
        <div className="wp-blog__comments">
          <h2>Comments Queue</h2>
          {pendingComments.length === 0 ? (
            <p className="superadmin-empty">No pending comments.</p>
          ) : (
            pendingComments.map(({ postId, postTitle, comment }) => (
              <div key={comment.id} className="wp-blog__comment-card">
                <strong>{comment.authorName}</strong> on <em>{postTitle}</em>
                <p>{comment.content}</p>
                <div className="wp-blog__comment-actions">
                  <button
                    type="button"
                    className="superadmin-btn superadmin-btn--primary"
                    onClick={() => approveComment(postId, comment.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="superadmin-btn superadmin-btn--danger"
                    onClick={() => deleteComment(postId, comment.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
          <button
            type="button"
            className="superadmin-btn superadmin-btn--primary"
            disabled={saving}
            onClick={() => persist(posts, 'Comments updated')}
          >
            Save comment changes
          </button>
        </div>
      )}

      {subTab === 'stats' && (
        <div className="wp-blog__stats">
          <h2>Traffic & Conversion Stats</h2>
          <div className="wp-blog__stat-grid">
            <div className="wp-blog__stat-card">
              <strong>{stats.views}</strong>
              <span>Total views</span>
            </div>
            <div className="wp-blog__stat-card">
              <strong>{stats.likes}</strong>
              <span>Total likes</span>
            </div>
            <div className="wp-blog__stat-card">
              <strong>{stats.published}</strong>
              <span>Published posts</span>
            </div>
          </div>
          <h3>Top posts</h3>
          <ul>
            {stats.top.map((p) => (
              <li key={p.id}>
                {p.title} — {p.views || 0} views
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BlogsAdmin;
