import { requireAdmin } from '@/lib/session';
import { handlePostAction } from '@/lib/content';

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return Response.json(await handlePostAction('careers', request));
  } catch (error) {
    return Response.json({ status: 'error', message: error.message || 'Request failed' }, { status: 400 });
  }
}
