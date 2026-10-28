import { readHeroSlides, writeHeroSlides, type HeroSlide } from '@/lib/heroSlides';
import { requireAdmin } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ success: true, slides: readHeroSlides() });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const slides = (Array.isArray(body?.slides) ? body.slides : []) as HeroSlide[];
    const saved = writeHeroSlides(slides);
    return Response.json({ success: true, message: 'Hero slides saved', slides: saved });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Save failed' },
      { status: 400 },
    );
  }
}
