import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';
import { assertNotEmptyOverwrite, atomicWriteJson } from '@/lib/safeJsonStore';

export type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  btn1Text?: string;
  btn1Url?: string;
  btn2Text?: string;
  btn2Url?: string;
};

const FILE = path.join(dataDir, 'hero-slides.json');

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    badge: 'Kite Institute of Aviation & Hospitality',
    title: "India's Most Trusted\nAviation Training Institute",
    subtitle:
      'Bangalore’s leading aviation and hospitality institute — industry-focused training, placement support, and globally recognized certifications.',
    imageUrl: '/images/himg-1.jpg',
    btn1Text: 'Explore Courses',
    btn1Url: '/courses',
    btn2Text: 'About Kite',
    btn2Url: '/about',
  },
];

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, `${JSON.stringify(DEFAULT_HERO_SLIDES, null, 2)}\n`, 'utf8');
  }
}

export function readHeroSlides(): HeroSlide[] {
  ensureFile();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HERO_SLIDES;
    return raw.map((item, index) => ({
      id: String(item.id || `hero-${index + 1}`),
      badge: String(item.badge || ''),
      title: String(item.title || ''),
      subtitle: String(item.subtitle || ''),
      imageUrl: String(item.imageUrl || '/images/himg-1.jpg'),
      btn1Text: item.btn1Text ? String(item.btn1Text) : '',
      btn1Url: item.btn1Url ? String(item.btn1Url) : '',
      btn2Text: item.btn2Text ? String(item.btn2Text) : '',
      btn2Url: item.btn2Url ? String(item.btn2Url) : '',
    }));
  } catch {
    return DEFAULT_HERO_SLIDES;
  }
}

export function writeHeroSlides(slides: HeroSlide[]) {
  ensureFile();
  const incoming = Array.isArray(slides) ? slides : [];
  assertNotEmptyOverwrite(FILE, incoming.length, 'hero slides');

  const cleaned = incoming.map((item, index) => ({
    id: String(item.id || `hero-${index + 1}`).trim() || `hero-${index + 1}`,
    badge: String(item.badge || '').trim(),
    title: String(item.title || '').trim(),
    subtitle: String(item.subtitle || '').trim(),
    imageUrl: String(item.imageUrl || '').trim() || '/images/himg-1.jpg',
    btn1Text: String(item.btn1Text || '').trim(),
    btn1Url: String(item.btn1Url || '').trim(),
    btn2Text: String(item.btn2Text || '').trim(),
    btn2Url: String(item.btn2Url || '').trim(),
  }));
  atomicWriteJson(FILE, cleaned);
  return cleaned;
}
