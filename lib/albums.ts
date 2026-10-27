import fs from 'fs';
import path from 'path';
import { dataDir, readContent } from './content';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

export function albumsDir() {
  return path.join(dataDir, 'albums');
}

export function buildAlbumFolders() {
  const meta = readContent('gallery-albums');
  const albumsMeta = Array.isArray(meta) ? meta : [];
  const root = albumsDir();
  const albums = [];

  const slugs = new Set(albumsMeta.map((album) => String(album.slug || '')).filter(Boolean));
  if (fs.existsSync(root)) {
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory()) slugs.add(entry.name);
    }
  }

  for (const slug of slugs) {
    if (!slug || slug.includes('..') || slug.includes('/') || slug.includes('\\')) continue;
    const metaAlbum = albumsMeta.find((album) => String(album.slug) === slug);
    const folder = path.join(root, slug);
    const images = [];
    if (fs.existsSync(folder)) {
      for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        if (!IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) continue;
        let mtimeMs = 0;
        try {
          mtimeMs = fs.statSync(path.join(folder, entry.name)).mtimeMs;
        } catch {
          mtimeMs = 0;
        }
        images.push({
          filename: entry.name,
          url: `database/albums/${slug}/${entry.name}`,
          mtimeMs,
        });
      }
    }
    images.sort((a, b) => b.mtimeMs - a.mtimeMs);
    const name = metaAlbum?.name === 'Management' ? 'Mentors' : (metaAlbum?.name || slug);
    albums.push({
      slug,
      name,
      description: metaAlbum?.description || '',
      images,
      updatedAt: metaAlbum?.updatedAt || null,
    });
  }

  albums.sort((a, b) => {
    const aTime = Math.max(a.images[0]?.mtimeMs || 0, Date.parse(a.updatedAt) || 0);
    const bTime = Math.max(b.images[0]?.mtimeMs || 0, Date.parse(b.updatedAt) || 0);
    return bTime - aTime;
  });

  return { albums };
}
