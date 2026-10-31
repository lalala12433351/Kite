import { DEFAULT_PAGE_META, PAGE_META_ADMIN_ROWS } from '@/lib/pageMetaDefaults';
import { getMergedPageMeta, writePageMetaOverrides, type PageMetaOverrides } from '@/lib/pageMetaStore';
import { requireAdmin } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  return Response.json({
    success: true,
    pages: getMergedPageMeta(),
    defaults: DEFAULT_PAGE_META,
    rows: PAGE_META_ADMIN_ROWS,
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const pages = (body?.pages || {}) as PageMetaOverrides;
    // Only persist differences from defaults (or explicit values for admin rows)
    const overrides: PageMetaOverrides = {};
    for (const row of PAGE_META_ADMIN_ROWS) {
      const incoming = pages[row.key];
      if (!incoming) continue;
      const def = DEFAULT_PAGE_META[row.key];
      const title = String(incoming.title || '').trim();
      const description = String(incoming.description || '').trim();
      const keywords = String(incoming.keywords || '').trim();
      const next: { title?: string; description?: string; keywords?: string } = {};
      if (title && title !== def.title) next.title = title;
      if (description && description !== def.description) next.description = description;
      if (keywords) next.keywords = keywords;
      // Always store when user filled fields even if equal — simpler: store all admin values
      overrides[row.key] = {
        title: title || def.title,
        description: description || def.description,
        ...(keywords ? { keywords } : {}),
      };
    }
    const saved = writePageMetaOverrides(overrides);
    return Response.json({
      success: true,
      message: 'Page meta tags saved',
      pages: getMergedPageMeta(),
      overrides: saved,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Save failed' },
      { status: 400 },
    );
  }
}
