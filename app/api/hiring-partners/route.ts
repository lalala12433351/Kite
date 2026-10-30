import { readHiringPartners, writeHiringPartners, type HiringPartner } from '@/lib/hiringPartners';
import { requireAdmin } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ success: true, partners: readHiringPartners() });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const partners = (Array.isArray(body?.partners) ? body.partners : []) as HiringPartner[];
    const saved = writeHiringPartners(partners);
    return Response.json({ success: true, message: 'Hiring partners saved', partners: saved });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Save failed' },
      { status: 400 },
    );
  }
}
