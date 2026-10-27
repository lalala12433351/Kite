import fs from 'fs';
import path from 'path';
import { albumsDir } from '@/lib/albums';

const TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

export async function GET(_request, { params }) {
  const { path: parts } = await params;
  const segments = Array.isArray(parts) ? parts : [];
  if (!segments.length || segments.some((part) => part === '..' || part.includes('\\') || part.includes('/'))) {
    return new Response('Not found', { status: 404 });
  }
  const file = path.join(albumsDir(), ...segments);
  const root = path.resolve(albumsDir());
  const resolved = path.resolve(file);
  if (!resolved.startsWith(root + path.sep)) {
    return new Response('Not found', { status: 404 });
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return new Response('Not found', { status: 404 });
  }
  const type = TYPES[path.extname(resolved).toLowerCase()] || 'application/octet-stream';
  const body = fs.readFileSync(resolved);
  return new Response(body, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
