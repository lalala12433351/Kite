import { getBlogBySlug, isPostPublic, readBlogs, writeBlogs } from '@/lib/blogs';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const post = getBlogBySlug(slug);
  if (!post || !isPostPublic(post) || post.status === 'archived') {
    return Response.json({ success: false, error: 'Post not found' }, { status: 404 });
  }

  // Increment views
  const all = readBlogs();
  const idx = all.findIndex((p) => p.id === post.id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], views: Number(all[idx].views || 0) + 1 };
    writeBlogs(all);
  }

  return Response.json({ success: true, post: { ...post, views: Number(post.views || 0) + 1 } });
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const post = getBlogBySlug(slug);
  if (!post || !isPostPublic(post)) {
    return Response.json({ success: false, error: 'Post not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const action = String(body?.action || '');

    if (action === 'comment') {
      const authorName = String(body?.authorName || '').trim();
      const content = String(body?.content || '').trim();
      const authorEmail = String(body?.authorEmail || '').trim();
      if (!authorName || !content) {
        return Response.json({ success: false, error: 'Name and comment are required' }, { status: 400 });
      }
      const all = readBlogs();
      const idx = all.findIndex((p) => p.id === post.id);
      if (idx < 0) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });
      const comment = {
        id: `c-${Date.now()}`,
        authorName,
        authorEmail,
        content,
        createdAt: new Date().toISOString(),
        isApproved: false,
      };
      all[idx] = {
        ...all[idx],
        comments: [...(all[idx].comments || []), comment],
      };
      writeBlogs(all);
      return Response.json({ success: true, message: 'Comment submitted for moderation' });
    }

    if (action === 'like') {
      const all = readBlogs();
      const idx = all.findIndex((p) => p.id === post.id);
      if (idx < 0) return Response.json({ success: false, error: 'Post not found' }, { status: 404 });
      all[idx] = { ...all[idx], likes: Number(all[idx].likes || 0) + 1 };
      writeBlogs(all);
      return Response.json({ success: true, likes: all[idx].likes });
    }

    return Response.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Request failed' },
      { status: 400 },
    );
  }
}
