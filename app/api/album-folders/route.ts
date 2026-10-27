import { buildAlbumFolders } from '@/lib/albums';

export async function GET() {
  return Response.json(buildAlbumFolders());
}
