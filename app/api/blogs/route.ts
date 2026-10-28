import { getPublicBlogs, readBlogs, writeBlogs, type BlogPost } from '@/lib/blogs';
import { requireAdmin } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope');
  if (scope === 'public') {
    return Response.json({ success: true, posts: getPublicBlogs() });
  }
  // Public default for front-end list; admin editor also uses this after auth cookie is set
  const unauthorized = await requireAdmin();
  if (unauthorized) {
    return Response.json({ success: true, posts: getPublicBlogs() });
  }
  return Response.json({ success: true, posts: readBlogs() });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const posts = (Array.isArray(body?.posts) ? body.posts : Array.isArray(body) ? body : []) as BlogPost[];
    const saved = writeBlogs(posts);
    return Response.json({ success: true, message: 'Blog posts saved', posts: saved });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Save failed' },
      { status: 400 },
    );
  }
}
