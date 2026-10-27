import { requireAdmin } from '@/lib/session';
import { handlePostAction } from '@/lib/content';

async function handle(kind, request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const result = await handlePostAction(kind, request);
    return Response.json(result);
  } catch (error) {
    return Response.json({ status: 'error', message: error.message || 'Request failed' }, { status: 400 });
  }
}

export async function POST(request) {
  return handle('news', request);
}
