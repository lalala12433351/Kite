import { verifyCertificate } from '@/lib/certificates';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let code = '';
    let name = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      code = String(body?.code || body?.certificateNumber || '');
      name = String(body?.name || body?.studentName || '');
    } else {
      const form = await request.formData();
      code = String(form.get('code') || form.get('certificateNumber') || '');
      name = String(form.get('name') || form.get('studentName') || '');
    }

    if (!code.trim() || !name.trim()) {
      return Response.json({ success: false, error: 'Certificate number and student name are required' }, { status: 400 });
    }

    const result = verifyCertificate(code, name);
    if (!result.ok) {
      const status = result.reason === 'not_found' ? 404 : 400;
      return Response.json({ success: false, error: result.error, reason: result.reason }, { status });
    }

    return Response.json({
      success: true,
      message: result.message,
      certificate: result.certificate,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = String(searchParams.get('code') || searchParams.get('certificateNumber') || '');
  const name = String(searchParams.get('name') || searchParams.get('studentName') || '');
  if (!code.trim() || !name.trim()) {
    return Response.json({ success: false, error: 'Certificate number and student name are required' }, { status: 400 });
  }
  const result = verifyCertificate(code, name);
  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : 400;
    return Response.json({ success: false, error: result.error, reason: result.reason }, { status });
  }
  return Response.json({ success: true, message: result.message, certificate: result.certificate });
}
