import { requireAdmin } from '@/lib/session';
import { isCmsKind, readContent, validateCmsPayload, writeContent } from '@/lib/content';

export async function GET(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { kind } = await params;
  if (!isCmsKind(kind)) {
    return Response.json({ status: 'error', message: 'Unknown CMS kind' }, { status: 404 });
  }
  return Response.json({ status: 'success', kind, data: readContent(kind) });
}

export async function PUT(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { kind } = await params;
  if (!isCmsKind(kind)) {
    return Response.json({ status: 'error', message: 'Unknown CMS kind' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = validateCmsPayload(kind, body?.data ?? body);
    const saved = writeContent(kind, data);
    return Response.json({ status: 'success', message: 'Saved', kind, data: saved });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Failed to save' },
      { status: 400 }
    );
  }
}
