import fs from 'fs';
import os from 'os';
import path from 'path';

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'kite-cms']);

function bundledDataDir() {
  return path.join(process.cwd(), 'data');
}

function bundledUploadsDir() {
  return path.join(process.cwd(), 'public', 'uploads');
}

function bundledGalleryDir() {
  return path.join(process.cwd(), 'public', 'images', 'gallery');
}

function isHostingerAccount() {
  const home = process.env.HOME || os.homedir() || '';
  const cwd = process.cwd();
  return /^\/home\/u\d+/.test(home) || cwd.includes('/hbuilds/') || cwd.includes('hostingersite.com');
}

function domainKey() {
  const match = process.cwd().match(/domains\/([^/]+)/);
  if (match) return match[1];
  const fromSite = String(process.env.NEXT_PUBLIC_SITE_URL || '')
    .replace(/^https?:\/\//, '')
    .split('/')[0];
  return fromSite || 'default';
}

function findDomainRoot(start: string) {
  let dir = start;
  for (let i = 0; i < 10; i += 1) {
    if (fs.existsSync(path.join(dir, 'hbuilds')) || fs.existsSync(path.join(dir, 'public_html'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function walkDirs(root: string, depth: number, visit: (dir: string, name: string) => void) {
  if (!root || depth > 6 || !fs.existsSync(root)) return;
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(root, entry.name);
    visit(full, entry.name);
    walkDirs(full, depth + 1, visit);
  }
}

function newestMtime(dir: string) {
  try {
    return fs.statSync(dir).mtimeMs;
  } catch {
    return 0;
  }
}

function findDirsNamed(name: string, parentName?: string) {
  const domainRoot = findDomainRoot(process.cwd());
  if (!domainRoot) return [];
  const found: string[] = [];
  walkDirs(domainRoot, 0, (dir, entryName) => {
    if (entryName !== name) return;
    if (parentName && path.basename(path.dirname(dir)) !== parentName) return;
    found.push(dir);
  });
  return found.sort((a, b) => newestMtime(b) - newestMtime(a));
}

function copyMissing(src: string, dest: string) {
  if (!src || !fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(src, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink() || entry.name === 'backups' || entry.name.startsWith('.')) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyMissing(from, to);
    } else if (entry.isFile() && !fs.existsSync(to)) {
      try {
        fs.copyFileSync(from, to);
      } catch {
        // A locked file should not stop the rest of the copy.
      }
    }
  }
}

function seedDir(dest: string, bundled: string, previous: string[]) {
  fs.mkdirSync(dest, { recursive: true });
  const current = path.resolve(bundled);
  const cwd = path.resolve(process.cwd());
  const older = previous
    .map((dir) => path.resolve(dir))
    .filter((dir) => dir !== current && dir !== path.resolve(dest) && !dir.startsWith(`${cwd}${path.sep}`))
    .map((dir) => ({
      dir,
      fromCheckout: dir.includes(`${path.sep}source${path.sep}repository${path.sep}`),
      mtime: newestMtime(dir),
    }))
    .sort((a, b) => Number(a.fromCheckout) - Number(b.fromCheckout) || b.mtime - a.mtime);
  for (const item of older) copyMissing(item.dir, dest);
  copyMissing(bundled, dest);
}

function resolveRoots() {
  if (process.env.KITE_DATA_DIR) {
    const root = process.env.KITE_DATA_DIR;
    const data = path.join(root, 'data');
    const uploads = path.join(root, 'uploads');
    const gallery = path.join(root, 'gallery');
    seedDir(data, bundledDataDir(), []);
    seedDir(uploads, bundledUploadsDir(), []);
    seedDir(gallery, bundledGalleryDir(), []);
    return { data, uploads, gallery };
  }

  if (!isHostingerAccount()) {
    return {
      data: bundledDataDir(),
      uploads: bundledUploadsDir(),
      gallery: bundledGalleryDir(),
    };
  }

  const root = path.join(process.env.HOME || os.homedir(), 'kite-cms', domainKey());
  const data = path.join(root, 'data');
  const uploads = path.join(root, 'uploads');
  const gallery = path.join(root, 'gallery');
  seedDir(data, bundledDataDir(), findDirsNamed('data'));
  seedDir(uploads, bundledUploadsDir(), findDirsNamed('uploads', 'public'));
  seedDir(gallery, bundledGalleryDir(), findDirsNamed('gallery', 'images'));
  return { data, uploads, gallery };
}

const roots = resolveRoots();

export const dataDir = roots.data;
export const uploadsDir = roots.uploads;
export const galleryFilesDir = roots.gallery;

export function uploadFolder(kind: string) {
  const dir = path.join(uploadsDir, kind);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const MEDIA_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
};

export function serveStoredFile(root: string, segments: string[]) {
  if (!segments.length || segments.some((part) => !part || part === '..' || part.includes('/') || part.includes('\\'))) {
    return null;
  }
  const base = path.resolve(root);
  const file = path.resolve(base, ...segments);
  if (file !== base && !file.startsWith(`${base}${path.sep}`)) return null;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return null;
  const type = MEDIA_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  return new Response(fs.readFileSync(file), {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
