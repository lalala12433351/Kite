import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';
import { assertNotEmptyOverwrite, atomicWriteJson, mergeById } from '@/lib/safeJsonStore';

export type HiringPartner = {
  id: string;
  /** CSS logo slug, e.g. airindia / emirates / taj */
  name: string;
  /** Admin display label */
  label: string;
  url: string;
  /** Optional style variant: hotel | travel | auto */
  className?: string;
  /** Optional uploaded/custom logo; when set, overrides CSS background */
  imageUrl?: string;
  /** Optional card background color, e.g. #c5342d */
  bgColor?: string;
};

const FILE = path.join(dataDir, 'hiring-partners.json');

export const DEFAULT_HIRING_PARTNERS: HiringPartner[] = [
  { id: 'p-airindia', name: 'airindia', label: 'Air India', url: 'https://www.airindia.com/' },
  { id: 'p-emirates', name: 'emirates', label: 'Emirates', url: 'https://www.emirates.com/ie/english/', bgColor: '#c5342d' },
  { id: 'p-etihad', name: 'etihad', label: 'Etihad', url: 'https://www.etihad.com/' },
  { id: 'p-qatar', name: 'qatar', label: 'Qatar Airways', url: 'https://www.qatarairways.com/', bgColor: '#3e1032' },
  { id: 'p-kuwait', name: 'kuwait', label: 'Kuwait Airways', url: 'https://www.kuwaitairways.com/en' },
  { id: 'p-indigo', name: 'indigo', label: 'IndiGo', url: 'https://www.goindigo.in/', bgColor: '#3c4597' },
  { id: 'p-spice', name: 'spice', label: 'SpiceJet', url: 'https://www.spicejet.com/', bgColor: '#b32b35' },
  { id: 'p-airasia', name: 'airasia', label: 'AirAsia', url: 'https://www.airasia.com/', bgColor: '#cd3631' },
  { id: 'p-akasaair', name: 'akasaair', label: 'Akasa Air', url: 'https://www.akasaair.com/' },
  { id: 'p-starair', name: 'starair', label: 'Star Air', url: 'https://www.starair.in/' },
  { id: 'p-vistara', name: 'vistara', label: 'Vistara', url: 'https://www.airvistara.com/' },
  { id: 'p-airindiaexpress', name: 'airindiaexpress', label: 'Air India Express', url: 'https://www.airindiaexpress.com/' },
  { id: 'p-celebi', name: 'celebi', label: 'Çelebi', url: 'https://www.celebiaviation.com/' },
  { id: 'p-airarabia', name: 'airarabia', label: 'Air Arabia', url: 'https://www.airarabia.com/', bgColor: '#cd3631' },
  { id: 'p-american', name: 'american', label: 'American Airlines', url: 'https://www.aa.com/homePage.do?locale=en_US' },
  { id: 'p-airindiasats', name: 'airindiasats', label: 'Air India SATS', url: 'https://www.aisats.in/' },
  { id: 'p-bwfs', name: 'bwfs', label: 'BWFS', url: 'https://www.bird.in/businessverticals/aviation-services.html' },
  { id: 'p-gaar', name: 'gaar', label: 'GMR', url: 'https://www.gmrgroup.in/airports/' },
  { id: 'p-itc', name: 'itc', label: 'ITC', url: 'https://www.itcportal.com/' },
  { id: 'p-harley', name: 'harley', label: 'Harley-Davidson', url: 'https://www.harley-davidson.com/', className: 'auto' },
  { id: 'p-easymytrip', name: 'easymytrip', label: 'EaseMyTrip', url: 'https://www.easemytrip.ae/', className: 'travel' },
  { id: 'p-vfs', name: 'vfs', label: 'VFS Global', url: 'https://www.vfsglobal.com/en/individuals/index.html', className: 'travel' },
  { id: 'p-parkhyat', name: 'parkhyat', label: 'Park Hyatt', url: 'https://www.hyatt.com/', className: 'hotel' },
  { id: 'p-theleela', name: 'theleela', label: 'The Leela', url: 'https://www.theleela.com/', className: 'hotel' },
  { id: 'p-obroi', name: 'obroi', label: 'Oberoi', url: 'https://www.oberoihotels.com/', className: 'hotel' },
  { id: 'p-taj', name: 'taj', label: 'Taj', url: 'https://www.tajhotels.com/en-in', className: 'hotel' },
  { id: 'p-jw', name: 'jw', label: 'JW Marriott', url: 'https://www.jw-marriott.marriott.com/', className: 'hotel' },
  { id: 'p-radisson', name: 'radisson', label: 'Radisson', url: 'https://www.radissonhotels.com/', className: 'hotel' },
  { id: 'p-westin', name: 'westin', label: 'Westin', url: 'https://www.westin.marriott.com/', className: 'hotel' },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 40);
}

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, `${JSON.stringify(DEFAULT_HIRING_PARTNERS, null, 2)}\n`, 'utf8');
  }
}

function normalizePartner(item: Partial<HiringPartner>, index: number): HiringPartner {
  const label = String(item.label || item.name || `Partner ${index + 1}`).trim();
  const name = slugify(String(item.name || label)) || `partner${index + 1}`;
  return {
    id: String(item.id || `p-${name}-${index + 1}`),
    name,
    label,
    url: String(item.url || '#').trim() || '#',
    className: item.className ? String(item.className).trim() : '',
    imageUrl: item.imageUrl ? String(item.imageUrl).trim() : '',
    bgColor: item.bgColor ? String(item.bgColor).trim() : '',
  };
}

export function readHiringPartners(): HiringPartner[] {
  ensureFile();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HIRING_PARTNERS;
    return raw.map((item, index) => normalizePartner(item, index));
  } catch {
    return DEFAULT_HIRING_PARTNERS;
  }
}

export function writeHiringPartners(partners: HiringPartner[]) {
  ensureFile();
  const incoming = Array.isArray(partners) ? partners : [];
  assertNotEmptyOverwrite(FILE, incoming.length, 'hiring partners');

  let existing: HiringPartner[] = [];
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (Array.isArray(raw)) existing = raw.map((item, index) => normalizePartner(item, index));
  } catch {
    existing = [];
  }

  const mergedIncoming = incoming.map((item, index) => {
    const prev = existing.find((p) => p.id === item.id);
    return normalizePartner(prev ? { ...prev, ...item, id: prev.id } : item, index);
  });
  const cleaned = mergeById(existing, mergedIncoming, { allowDelete: true });
  atomicWriteJson(FILE, cleaned);
  return cleaned;
}
