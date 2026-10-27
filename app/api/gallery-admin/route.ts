import { requireAdmin } from '@/lib/session';
import { runGalleryAdmin } from '@/lib/galleryAdminCore';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const runtime = 'nodejs';

async function fieldsFromRequest(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('multipart/form-data')) {
    const form = await request.formData();
    const fields: Record<string, string> = {};
    let file: File | null = null;
    for (const [key, value] of form.entries()) {
      if (typeof value === 'string') fields[key] = value;
      else file = value;
    }
    const files: { image?: { filepath: string; originalFilename: string; mimetype: string; size: number } } = {};
    if (file && typeof file.arrayBuffer === 'function') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const tmp = path.join(os.tmpdir(), `kite-upload-${Date.now()}-${path.basename(file.name || 'image.jpg')}`);
      fs.writeFileSync(tmp, buffer);
      files.image = {
        filepath: tmp,
        originalFilename: file.name || 'image.jpg',
        mimetype: file.type || 'image/jpeg',
        size: buffer.length,
      };
    }
    return { fields, files };
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  const fields: Record<string, string> = {};
  for (const [key, value] of params) fields[key] = value;
  return { fields, files: {} };
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { fields, files } = await fieldsFromRequest(request);
  const result = await runGalleryAdmin(fields, files);
  return new Response(result.body, {
    status: result.status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
