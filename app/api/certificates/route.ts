import {
  addCertificate,
  deleteCertificate,
  readCertificates,
  updateCertificate,
} from '@/lib/certificates';
import { requireAdmin } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const certificates = readCertificates().sort((a, b) => Number(b.id) - Number(a.id));
  return Response.json({ success: true, certificates });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const contentType = request.headers.get('content-type') || '';
    let action = 'list';
    let certificateId = 0;
    let certificateData: Record<string, unknown> = {};

    if (contentType.includes('application/json')) {
      const body = await request.json();
      action = String(body?.action || 'list');
      certificateId = Number(body?.certificateId || body?.id || 0);
      certificateData = (body?.certificateData || body || {}) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      action = String(form.get('action') || 'list');
      certificateId = Number(form.get('certificateId') || form.get('id') || 0);
      const raw = form.get('certificateData');
      if (raw) certificateData = JSON.parse(String(raw));
      else {
        certificateData = {
          certificateNumber: form.get('certificateNumber'),
          studentName: form.get('studentName'),
          course: form.get('course'),
          issueDate: form.get('issueDate'),
          expiryDate: form.get('expiryDate'),
          status: form.get('status'),
        };
      }
    }

    if (action === 'list') {
      return Response.json({ success: true, certificates: readCertificates().sort((a, b) => Number(b.id) - Number(a.id)) });
    }

    if (action === 'add') {
      const certificate = addCertificate(certificateData);
      return Response.json({ success: true, message: 'Certificate added', certificate });
    }

    if (action === 'update') {
      if (!certificateId) throw new Error('Certificate id is required');
      const certificate = updateCertificate(certificateId, certificateData);
      return Response.json({ success: true, message: 'Certificate updated', certificate });
    }

    if (action === 'delete') {
      if (!certificateId) throw new Error('Certificate id is required');
      deleteCertificate(certificateId);
      return Response.json({ success: true, message: 'Certificate deleted' });
    }

    return Response.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Request failed' },
      { status: 400 },
    );
  }
}
