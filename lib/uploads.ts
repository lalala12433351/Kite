import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';

const ALLOWED_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
  '.pdf',
]);

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
};

export function uploadsRoot() {
  return path.join(dataDir, 'uploads');
}

export function sanitizeSection(section) {
  const value = String(section || 'misc')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return value || 'misc';
}

export function sanitizeFilename(name) {
  const base = path.basename(String(name || 'file'));
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  return cleaned || 'file';
}

export function publicUploadUrl(section, filename) {
  return `/database/uploads/${sanitizeSection(section)}/${sanitizeFilename(filename)}`;
}

export async function saveUpload(file, sectionInput) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('No file uploaded');
  }
  const original = sanitizeFilename(file.name || 'upload.bin');
  const ext = path.extname(original).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error(`File type not allowed: ${ext || '(none)'}`);
  }
  const section = sanitizeSection(sectionInput);
  const stamp = Date.now();
  const filename = `${stamp}-${original}`;
  const dir = path.join(uploadsRoot(), section);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!buffer.length) throw new Error('Empty file');
  if (buffer.length > 25 * 1024 * 1024) throw new Error('File too large (max 25MB)');
  fs.writeFileSync(dest, buffer);
  return {
    url: publicUploadUrl(section, filename),
    section,
    filename,
    size: buffer.length,
    contentType: MIME[ext] || file.type || 'application/octet-stream',
  };
}

export function resolveUploadPath(segments) {
  if (!segments?.length || segments.some((part) => part === '..' || part.includes('\\') || part.includes('/'))) {
    return null;
  }
  const root = path.resolve(uploadsRoot());
  const resolved = path.resolve(path.join(root, ...segments));
  if (!resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

export function contentTypeFor(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}
