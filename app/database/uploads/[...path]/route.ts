import fs from 'fs';
import { contentTypeFor, resolveUploadPath } from '@/lib/uploads';

export async function GET(_request, { params }) {
  const { path: parts } = await params;
  const segments = Array.isArray(parts) ? parts : [];
  const resolved = resolveUploadPath(segments);
  if (!resolved || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return new Response('Not found', { status: 404 });
  }
  const body = fs.readFileSync(resolved);
  return new Response(body, {
    headers: {
      'Content-Type': contentTypeFor(resolved),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
