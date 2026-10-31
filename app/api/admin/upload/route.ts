import { requireAdmin } from '@/lib/session';
import { saveUpload } from '@/lib/uploads';

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get('file');
    const section = String(form.get('section') || 'misc');
    if (!file || typeof file === 'string') {
      return Response.json({ status: 'error', message: 'No file uploaded' }, { status: 400 });
    }
    const result = await saveUpload(file, section);
    return Response.json({ status: 'success', message: 'Uploaded', ...result });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
