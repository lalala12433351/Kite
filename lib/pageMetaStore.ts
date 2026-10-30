import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';
import {
  DEFAULT_PAGE_META,
  type PageMetaEntry,
  type PageMetaKey,
} from '@/lib/pageMetaDefaults';
import { atomicWriteJson } from '@/lib/safeJsonStore';

const FILE = path.join(dataDir, 'page-meta.json');

export type PageMetaOverrides = Partial<Record<PageMetaKey, Partial<PageMetaEntry>>>;

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, '{}\n', 'utf8');
  }
}

export function readPageMetaOverrides(): PageMetaOverrides {
  ensureFile();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

export function writePageMetaOverrides(overrides: PageMetaOverrides) {
  ensureFile();
  const cleaned: PageMetaOverrides = {};
  for (const [key, value] of Object.entries(overrides || {})) {
    if (!value || typeof value !== 'object') continue;
    if (!(key in DEFAULT_PAGE_META)) continue;
    const title = String(value.title || '').trim();
    const description = String(value.description || '').trim();
    const keywords = String(value.keywords || '').trim();
    if (!title && !description && !keywords) continue;
    cleaned[key as PageMetaKey] = {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(keywords ? { keywords } : {}),
    };
  }
  atomicWriteJson(FILE, cleaned);
  return cleaned;
}

export function getMergedPageMeta(): Record<PageMetaKey, PageMetaEntry> {
  const overrides = readPageMetaOverrides();
  const merged = { ...DEFAULT_PAGE_META } as Record<PageMetaKey, PageMetaEntry>;
  for (const key of Object.keys(DEFAULT_PAGE_META) as PageMetaKey[]) {
    const o = overrides[key];
    if (!o) continue;
    merged[key] = {
      ...merged[key],
      ...(o.title ? { title: o.title } : {}),
      ...(o.description ? { description: o.description } : {}),
      ...(o.keywords !== undefined ? { keywords: o.keywords } : {}),
    };
  }
  return merged;
}

export function getPageMeta(key: PageMetaKey): PageMetaEntry {
  return getMergedPageMeta()[key] || DEFAULT_PAGE_META[key];
}

/** Next.js Metadata object for a page key */
export function toNextMetadata(key: PageMetaKey, opts?: { absoluteTitle?: boolean }) {
  const entry = getPageMeta(key);
  const meta: Record<string, unknown> = {
    title: opts?.absoluteTitle ? { absolute: entry.title } : entry.title,
    description: entry.description,
  };
  if (entry.keywords) {
    meta.keywords = entry.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }
  if (entry.robots) meta.robots = entry.robots;
  return meta;
}
