import { readContent } from '@/lib/content';

const KINDS = new Set(['news', 'careers', 'aviation-careers', 'gallery-albums', 'gallery-images', 'gallery-settings']);

export async function GET(_request, { params }) {
  const { kind } = await params;
  if (!KINDS.has(kind)) {
    return Response.json({ status: 'error', message: 'Not found' }, { status: 404 });
  }
  return Response.json(readContent(kind));
}
