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
      return Response.json({ success: false, error: 'Image file is required' }, { status: 400 });
    }

    const upload = file as File;
    const original = String(upload.name || 'logo.png');
    const ext = path.extname(original).toLowerCase() || '.png';
    if (!/\.(jpe?g|png|webp|gif|svg)$/i.test(ext)) {
      return Response.json(
        { success: false, error: 'Upload a JPG, PNG, WEBP, GIF, or SVG image' },
        { status: 400 },
      );
    }

    const dir = path.join(process.cwd(), 'public', 'uploads', 'partners');
    fs.mkdirSync(dir, { recursive: true });
    const filename = `partner-${Date.now()}${ext}`;
    const buffer = Buffer.from(await upload.arrayBuffer());
    fs.writeFileSync(path.join(dir, filename), buffer);

    return Response.json({ success: true, url: `/uploads/partners/${filename}` });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    );
  }
}
