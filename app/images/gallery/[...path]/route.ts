import { galleryFilesDir, serveStoredFile } from '@/lib/persistentStore';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const response = serveStoredFile(galleryFilesDir, Array.isArray(parts) ? parts : []);
  return response || new Response('Not found', { status: 404 });
}
