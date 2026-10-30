import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
      return Response.json({ success: false, error: 'Media file is required' }, { status: 400 });
    }

    const upload = file as File;
    const original = String(upload.name || 'blog-media');
    const ext = path.extname(original).toLowerCase() || '.jpg';
    const isImage = /\.(jpe?g|png|webp|gif)$/i.test(ext);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(ext);
    if (!isImage && !isVideo) {
      return Response.json(
        { success: false, error: 'Upload a JPG, PNG, WEBP, GIF, MP4, WEBM, or OGG file' },
        { status: 400 },
      );
    }

    const dir = path.join(process.cwd(), 'public', 'uploads', 'blog');
    fs.mkdirSync(dir, { recursive: true });
    const filename = `blog-${Date.now()}${ext}`;
    const buffer = Buffer.from(await upload.arrayBuffer());
    fs.writeFileSync(path.join(dir, filename), buffer);

    return Response.json({ success: true, url: `/uploads/blog/${filename}`, kind: isVideo ? 'video' : 'image' });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    );
  }
}
