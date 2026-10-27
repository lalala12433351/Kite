/**
 * Vite plugin: handle gallery-admin API locally (upload, update, delete, init)
 * so upload and edit work with just `npm run dev` without PHP.
 */
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');
const PUBLIC_ALBUM = path.join(PUBLIC, 'album');
const DATABASE_DIR = path.join(ROOT, 'data');
const ALBUMS_DIR = path.join(DATABASE_DIR, 'albums');
const JSON_PATH = path.join(DATABASE_DIR, 'gallery-images.json');
const ALBUMS_PATH = path.join(DATABASE_DIR, 'gallery-albums.json');
const SETTINGS_PATH = path.join(DATABASE_DIR, 'gallery-settings.json');
const GALLERY_DIR = path.join(PUBLIC, 'images', 'gallery');

const DEFAULT_GALLERY_DESCRIPTION =
  'Every picture tells a story — of passion, progress, and possibilities. Browse through our gallery to relive the inspiring moments, cultural celebrations, and proud achievements that make Kite Institute a truly dynamic place to learn and grow.';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function slugToName(slug) {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function safeBasename(name) {
  const base = path.basename(String(name || 'image.jpg'));
  return base.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image.jpg';
}

function uniquePathInDir(dir, filename) {
  let candidate = filename;
  let dest = path.join(dir, candidate);
  let n = 1;
  const ext = path.extname(filename);
  const stem = path.basename(filename, ext) || 'image';
  while (fs.existsSync(dest)) {
    candidate = `${stem}-${n}${ext}`;
    dest = path.join(dir, candidate);
    n += 1;
  }
  return { dest, filename: candidate };
}

function readGallerySettings() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    return { description: DEFAULT_GALLERY_DESCRIPTION, updatedAt: null };
  }
  try {
    const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    const description = String(data?.description ?? '').trim() || DEFAULT_GALLERY_DESCRIPTION;
    return { description, updatedAt: data?.updatedAt || null };
  } catch (_) {
    return { description: DEFAULT_GALLERY_DESCRIPTION, updatedAt: null };
  }
}

function writeGallerySettings(settings) {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const payload = {
    description: String(settings?.description ?? '').trim() || DEFAULT_GALLERY_DESCRIPTION,
    updatedAt: galleryTimestamp(),
  };
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

function assignImageToAlbum(albumSlug, filename, imageId) {
  if (!albumSlug || /[\\/]/.test(albumSlug)) return;
  let albums = readAlbums();
  let idx = albums.findIndex((a) => String(a.slug) === String(albumSlug));
  if (idx === -1) {
    let maxId = 0;
    for (const a of albums) {
      const n = Number(a.id);
      if (!Number.isNaN(n) && n > maxId) maxId = n;
    }
    albums.push({
      id: maxId + 1,
      name: slugToName(albumSlug),
      slug: albumSlug,
      coverImageId: imageId != null ? String(imageId) : null,
      imageIds: imageId != null ? [String(imageId)] : [],
    });
    idx = albums.length - 1;
  } else {
    const ids = Array.isArray(albums[idx].imageIds) ? albums[idx].imageIds.map(String) : [];
    const sid = imageId != null ? String(imageId) : '';
    if (sid && !ids.includes(sid)) ids.push(sid);
    albums[idx].imageIds = ids;
    if (!albums[idx].coverImageId && sid) albums[idx].coverImageId = sid;
  }
  touchAlbumUpdatedAt(albums, albumSlug);
  writeAlbums(albums);
  const albumFolder = path.join(ALBUMS_DIR, albumSlug);
  if (!fs.existsSync(albumFolder)) fs.mkdirSync(albumFolder, { recursive: true });
  writeAlbumFoldersJson();
}

function parseUploadMs(uploadDate) {
  if (!uploadDate) return 0;
  const t = new Date(uploadDate).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function folderImageSortMs(img, slug, allImages) {
  const reg = (allImages || []).find((i) => i.filename === img.filename);
  const fromRegistry = parseUploadMs(reg?.uploadDate);
  if (fromRegistry) return fromRegistry;
  if (img.mtimeMs != null) return Number(img.mtimeMs);
  const fp = path.join(ALBUMS_DIR, slug, img.filename);
  if (fs.existsSync(fp)) {
    try {
      return fs.statSync(fp).mtimeMs;
    } catch (_) {}
  }
  return 0;
}

function sortAlbumFolderImagesNewestFirst(images, slug, allImages) {
  return [...images].sort(
    (a, b) => folderImageSortMs(b, slug, allImages) - folderImageSortMs(a, slug, allImages)
  );
}

function albumSortMs(album, albumsMeta, allImages) {
  const slug = String(album.slug || '');
  const meta = (albumsMeta || []).find((a) => String(a.slug) === slug);
  let t = Math.max(parseUploadMs(meta?.updatedAt), parseUploadMs(meta?.createdAt));
  for (const img of album.images || []) {
    t = Math.max(t, folderImageSortMs(img, slug, allImages));
  }
  if (!t && meta?.id != null) {
    const n = Number(meta.id);
    if (!Number.isNaN(n) && n > 0) t = n;
  }
  return t;
}

function sortAlbumsNewestFirst(albums, albumsMeta, allImages) {
  return [...albums].sort(
    (a, b) => albumSortMs(b, albumsMeta, allImages) - albumSortMs(a, albumsMeta, allImages)
  );
}

function galleryTimestamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function touchAlbumUpdatedAt(albums, slug) {
  const idx = albums.findIndex((a) => String(a.slug) === String(slug));
  if (idx === -1) return;
  albums[idx].updatedAt = galleryTimestamp();
}

function readAlbumFoldersFromDir(dir, urlPrefix) {
  const albums = [];
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return albums;
  const dirs = fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'));
  for (const d of dirs) {
    const slug = d.name;
    const albumDir = path.join(dir, slug);
    const entries = fs.readdirSync(albumDir, { withFileTypes: true });
    const images = [];
    for (const e of entries) {
      if (!e.isFile()) continue;
      const ext = path.extname(e.name).toLowerCase();
      if (IMAGE_EXT.has(ext)) {
        const filePath = path.join(albumDir, e.name);
        let mtimeMs = 0;
        try {
          mtimeMs = fs.statSync(filePath).mtimeMs;
        } catch (_) {}
        images.push({
          filename: e.name,
          url: `${urlPrefix}${slug}/${e.name}`,
          mtimeMs,
        });
      }
    }
    albums.push({
      slug,
      name: slugToName(slug),
      images: sortAlbumFolderImagesNewestFirst(images, slug, []),
    });
  }
  return albums;
}

function readAlbumFolders() {
  const metaAlbums = readAlbums();
  const metaBySlug = new Map();
  for (const a of metaAlbums) {
    if (a?.slug) metaBySlug.set(String(a.slug), a);
  }

  let albums = readAlbumFoldersFromDir(ALBUMS_DIR, 'database/albums/');
  if (albums.length === 0) {
    albums = readAlbumFoldersFromDir(PUBLIC_ALBUM, 'album/');
  }

  albums = albums.map((a) => {
    const meta = metaBySlug.get(String(a.slug));
    const metaName = meta?.name ? String(meta.name).trim() : '';
    const metaDesc = meta?.description != null ? String(meta.description).trim() : '';
    return {
      ...a,
      name: metaName || a.name,
      description: metaDesc || (a.description != null ? String(a.description).trim() : ''),
    };
  });

  const slugsOnDisk = new Set(albums.map((a) => String(a.slug)));
  for (const meta of metaAlbums) {
    const slug = meta?.slug ? String(meta.slug).trim() : '';
    if (!slug || slugsOnDisk.has(slug)) continue;
    albums.push({
      slug,
      name: meta.name || slugToName(slug),
      description: meta.description != null ? String(meta.description).trim() : '',
      images: [],
    });
  }

  if (albums.length === 0) {
    const staticPath = path.join(PUBLIC, 'api', 'album-folders.json');
    if (fs.existsSync(staticPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(staticPath, 'utf8'));
        if (Array.isArray(data?.albums)) {
          albums = data.albums.map((a) => {
            const meta = metaBySlug.get(String(a.slug));
            const metaName = meta?.name ? String(meta.name).trim() : '';
            const folderName = a.name === 'Management' ? 'Highlights' : a.name;
            return { ...a, name: metaName || folderName || a.slug };
          });
        }
      } catch (_) {}
    }
  }
  albums = sortAlbumsNewestFirst(albums, metaAlbums, readImages());
  return { albums };
}

function writeAlbumFoldersJson() {
  const imageExt = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
  const albumsMeta = readAlbums();
  const allImages = readImages();
  const albums = [];

  for (const album of albumsMeta) {
    const slug = album?.slug ? String(album.slug).trim() : '';
    if (!slug) continue;

    const images = [];
    const seen = new Set();

    for (const id of album.imageIds || []) {
      const img = allImages.find((i) => idMatch(i.id, id));
      if (!img?.filename || seen.has(img.filename)) continue;
      seen.add(img.filename);
      let mtimeMs = parseUploadMs(img.uploadDate);
      if (!mtimeMs) {
        const fp = path.join(ALBUMS_DIR, slug, img.filename);
        if (fs.existsSync(fp)) {
          try {
            mtimeMs = fs.statSync(fp).mtimeMs;
          } catch (_) {}
        }
      }
      images.push({
        filename: img.filename,
        url: `database/albums/${slug}/${img.filename}`,
        mtimeMs,
      });
    }

    const albumDir = path.join(ALBUMS_DIR, slug);
    if (fs.existsSync(albumDir)) {
      for (const e of fs.readdirSync(albumDir, { withFileTypes: true })) {
        if (!e.isFile()) continue;
        const ext = path.extname(e.name).toLowerCase();
        if (!IMAGE_EXT.has(ext) || seen.has(e.name)) continue;
        seen.add(e.name);
        const filePath = path.join(albumDir, e.name);
        let mtimeMs = 0;
        try {
          mtimeMs = fs.statSync(filePath).mtimeMs;
        } catch (_) {}
        images.push({
          filename: e.name,
          url: `database/albums/${slug}/${e.name}`,
          mtimeMs,
        });
      }
    }

    const sorted = sortAlbumFolderImagesNewestFirst(images, slug, allImages);
    images.length = 0;
    images.push(...sorted);
    albums.push({
      slug,
      name: album.name || slugToName(slug),
      description: album.description != null ? String(album.description).trim() : '',
      images,
    });
  }

  const sortedAlbums = sortAlbumsNewestFirst(albums, albumsMeta, allImages);
  const data = { albums: sortedAlbums };
  const dataApi = path.join(DATABASE_DIR, 'cache');
  if (!fs.existsSync(dataApi)) fs.mkdirSync(dataApi, { recursive: true });
  fs.writeFileSync(path.join(dataApi, 'album-folders.json'), JSON.stringify(data), 'utf8');
  const distApiDir = path.join(ROOT, 'dist', 'api');
  if (fs.existsSync(path.join(ROOT, 'dist'))) {
    if (!fs.existsSync(distApiDir)) fs.mkdirSync(distApiDir, { recursive: true });
    fs.writeFileSync(path.join(distApiDir, 'album-folders.json'), JSON.stringify(data), 'utf8');
  }
}

function ensureGalleryImageForFilename(images, filename) {
  for (const img of images) {
    if (img.filename === filename && img.id != null) return String(img.id);
  }
  let maxId = 0;
  for (const img of images) {
    const n = Number(img.id);
    if (!Number.isNaN(n) && n > maxId) maxId = n;
  }
  const newId = maxId + 1;
  images.push({
    id: newId,
    filename,
    categories: [],
    title: filename,
    isOldImage: true,
    uploadDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });
  return String(newId);
}

function removePhotoFromAlbumFoldersJson(albumSlug, filename) {
  if (!albumSlug || !filename) return false;
  let changed = false;
  const targets = [
    path.join(PUBLIC, 'api', 'album-folders.json'),
    path.join(ROOT, 'dist', 'api', 'album-folders.json'),
  ];
  for (const filePath of targets) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(data?.albums)) continue;
      const album = data.albums.find((a) => a.slug === albumSlug);
      if (!album || !Array.isArray(album.images)) continue;
      const next = album.images.filter((img) => img.filename !== filename);
      if (next.length === album.images.length) continue;
      album.images = next;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      changed = true;
    } catch (_) {}
  }
  return changed;
}

function deleteAlbumPhoto(albumSlug, filename, imageId) {
  let images = readImages();
  let albums = readAlbums();

  if (!imageId && filename) {
    const img = images.find((i) => i.filename === filename);
    if (img?.id != null) imageId = String(img.id);
  }
  if (!filename && imageId) {
    const img = images.find((i) => idMatch(i.id, imageId));
    if (img?.filename) filename = img.filename;
  }
  if (!filename) {
    throw new Error('Could not identify image to delete');
  }

  if (filename) {
    const filePath = path.join(ALBUMS_DIR, albumSlug, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  let updated = removePhotoFromAlbumFoldersJson(albumSlug, filename);

  let albumIdx = albums.findIndex((a) => a.slug === albumSlug);
  if (albumIdx === -1) {
    const { albums: folderAlbums } = readAlbumFolders();
    const fa = folderAlbums.find((a) => a.slug === albumSlug);
    if (!fa) {
      if (updated) {
        writeAlbumFoldersJson();
        return;
      }
      throw new Error('Album not found');
    }
    let maxId = 0;
    for (const a of albums) {
      const n = Number(a.id);
      if (!Number.isNaN(n) && n > maxId) maxId = n;
    }
    const imageIds = (fa.images || [])
      .filter((img) => img.filename !== filename)
      .map((img) => ensureGalleryImageForFilename(images, img.filename));
    writeImages(images);
    images = readImages();
    albums.push({
      id: maxId + 1,
      name: fa.name || slugToName(albumSlug),
      slug: albumSlug,
      coverImageId: imageIds[0] || null,
      imageIds,
    });
    updated = true;
  } else {
    const before = (albums[albumIdx].imageIds || []).length;
    albums[albumIdx].imageIds = (albums[albumIdx].imageIds || []).filter((id) => {
      if (imageId && idMatch(id, imageId)) return false;
      const img = images.find((im) => idMatch(im.id, id));
      return !img?.filename || img.filename !== filename;
    });
    if (albums[albumIdx].imageIds.length !== before) updated = true;
    if (imageId && idMatch(albums[albumIdx].coverImageId, imageId)) {
      albums[albumIdx].coverImageId = albums[albumIdx].imageIds[0] || null;
    }
    if (before === 0 && updated === false) {
      updated = removePhotoFromAlbumFoldersJson(albumSlug, filename) || updated;
    }
  }

  if (!updated) {
    throw new Error('Could not find image to remove from album');
  }

  writeAlbums(albums);
  writeAlbumFoldersJson();
}

function importAlbumsFromFoldersAndJson() {
  const images = readImages();
  let albums = readAlbums();
  const imageExt = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
  const slugMap: Record<string, { name: string | null; filenames: Set<string> }> = {};

  if (fs.existsSync(ALBUMS_DIR)) {
    for (const d of fs.readdirSync(ALBUMS_DIR, { withFileTypes: true })) {
      if (!d.isDirectory() || d.name.startsWith('.')) continue;
      const slug = d.name;
      slugMap[slug] = slugMap[slug] || { name: null, filenames: new Set() };
      const albumDir = path.join(ALBUMS_DIR, slug);
      for (const e of fs.readdirSync(albumDir, { withFileTypes: true })) {
        if (!e.isFile()) continue;
        if (imageExt.has(path.extname(e.name).toLowerCase())) slugMap[slug].filenames.add(e.name);
      }
    }
  }

  const { albums: jsonAlbums } = readAlbumFolders();
  for (const ja of jsonAlbums) {
    if (!ja?.slug) continue;
    slugMap[ja.slug] = slugMap[ja.slug] || { name: null, filenames: new Set() };
    if (ja.name) slugMap[ja.slug].name = ja.name;
    for (const fi of ja.images || []) {
      if (fi?.filename) slugMap[ja.slug].filenames.add(fi.filename);
    }
  }

  let maxAlbumId = 0;
  for (const a of albums) {
    const n = Number(a.id);
    if (!Number.isNaN(n) && n > maxAlbumId) maxAlbumId = n;
  }

  for (const [slug, info] of Object.entries(slugMap)) {
    const imageIds = [...info.filenames].map((f) => ensureGalleryImageForFilename(images, f));
    const idx = albums.findIndex((a) => a.slug === slug);
    const displayName = info.name || slugToName(slug);
    if (idx >= 0) {
      albums[idx].name = displayName;
      albums[idx].imageIds = imageIds;
      if (!albums[idx].coverImageId && imageIds.length) albums[idx].coverImageId = imageIds[0];
    } else {
      maxAlbumId += 1;
      albums.push({
        id: maxAlbumId,
        name: displayName,
        slug,
        coverImageId: imageIds[0] || null,
        imageIds,
      });
    }
    const albumFolder = path.join(ALBUMS_DIR, slug);
    if (!fs.existsSync(albumFolder)) fs.mkdirSync(albumFolder, { recursive: true });
  }

  writeImages(images);
  writeAlbums(albums);
  writeAlbumFoldersJson();
  return albums;
}

function readImages() {
  if (!fs.existsSync(JSON_PATH)) return [];
  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

function writeImages(images) {
  const dir = path.dirname(JSON_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(images, null, 2), 'utf8');
}

function readAlbums() {
  if (!fs.existsSync(ALBUMS_PATH)) return [];
  const raw = fs.readFileSync(ALBUMS_PATH, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

function writeAlbums(albums) {
  const dir = path.dirname(ALBUMS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ALBUMS_PATH, JSON.stringify(albums, null, 2), 'utf8');
}

function sendJson(res, obj) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(obj));
}

function sendError(res, code, message, debug = {}) {
  res.statusCode = code;
  sendJson(res, { status: 'error', message, debug });
}

function idMatch(a, b) {
  if (a == null || b == null) return false;
  const sa = String(a);
  const sb = String(b);
  if (sa === sb) return true;
  if (Number.isInteger(Number(sa)) && Number.isInteger(Number(sb))) return Number(sa) === Number(sb);
  return false;
}

function createAlbumAndDatabaseMiddleware() {
  return (req, res, next) => {
    const pathname = (req.url || '').split('?')[0];
    if (req.method !== 'GET') return next();
    const isAlbumFoldersApi = pathname === '/qa/api/album-folders.json' || pathname === '/api/album-folders.json' || pathname.endsWith('api/album-folders.json');
    if (isAlbumFoldersApi) {
      try {
        const data = readAlbumFolders();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(JSON.stringify(data));
        return;
      } catch (_) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ albums: [] }));
        return;
      }
    }
    const m1 = pathname.match(/^\/(?:qa\/)?database\/([a-z0-9_-]+\.json)$/i);
    if (m1) {
      const filename = m1[1];
      const filePath = path.join(DATABASE_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(raw);
          return;
        } catch (_) {}
      }
    }
    const mAlbumImage = pathname.match(/^\/(?:qa\/)?database\/albums\/([a-z0-9_.-]+)\/([a-z0-9_.-]+\.(?:jpg|jpeg|png|gif|webp))$/i);
    if (mAlbumImage) {
      const slug = mAlbumImage[1];
      const filename = mAlbumImage[2];
      const filePath = path.join(ALBUMS_DIR, slug, filename);
      if (fs.existsSync(filePath)) {
        try {
          const data = fs.readFileSync(filePath);
          const ext = path.extname(filename).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(data);
          return;
        } catch (_) {}
      }
    }
    const mPublicAlbumImage = pathname.match(/^\/(?:qa\/)?album\/([a-z0-9_.-]+)\/([a-z0-9_.-]+\.(?:jpg|jpeg|png|gif|webp))$/i);
    if (mPublicAlbumImage) {
      const slug = mPublicAlbumImage[1];
      const filename = mPublicAlbumImage[2];
      const filePath = path.join(PUBLIC_ALBUM, slug, filename);
      if (fs.existsSync(filePath)) {
        try {
          const data = fs.readFileSync(filePath);
          const ext = path.extname(filename).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(data);
          return;
        } catch (_) {}
      }
    }
    const m2 = pathname.match(/^\/(?:qa\/)?database\/albums\/([a-z0-9_-]+)\/images\.json$/i);
    if (m2) {
      const slug = m2[1];
      const albumDir = path.join(ALBUMS_DIR, slug);
      const imagesPath = path.join(albumDir, 'images.json');
      if (fs.existsSync(imagesPath)) {
        try {
          const raw = fs.readFileSync(imagesPath, 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(raw);
          return;
        } catch (_) {}
      }
      res.setHeader('Content-Type', 'application/json');
      res.end('[]');
      return;
    }
    next();
  };
}

export function galleryAdminPlugin() {
  return {
    name: 'gallery-admin-api',
    enforce: 'pre',
    configureServer(server) {
      // Write static JSON so Vite can serve it at /api/album-folders.json (avoids middleware order issues)
      try {
        writeAlbumFoldersJson();
      } catch (_) {}

      // Also add middleware so /qa/api/album-folders.json returns fresh data
      server.middlewares.use(createAlbumAndDatabaseMiddleware());
      const galleryPost = (req, res, next) => {
          if (globalThis.__kiteGalleryJob) {
            const job = globalThis.__kiteGalleryJob;
            globalThis.__kiteGalleryJob = null;
            handleBody(job.fields, job.files || {});
            return;
          }
          const pathname = (req.url || '').split('?')[0];
          const isGalleryApi =
            req.method === 'POST' &&
            (pathname === '/qa/gallery-admin.php' ||
              pathname === '/gallery-admin.php' ||
              pathname === '/qa/api/gallery-admin' ||
              pathname === '/api/gallery-admin');
          if (!isGalleryApi) return next();

        const contentType = (req.headers['content-type'] || '').toLowerCase();
        const isMultipart = contentType.includes('multipart/form-data');

        function handleBody(fields, files: { image?: { filepath?: string; originalFilename?: string; mimetype?: string; size?: number; newFilename?: string } } = {}) {
          const action = String(fields.action || '').trim();
          try {
            if (action === 'upload') {
              const file = files.image;
              if (!file || !file.filepath) {
                throw new Error('No image file uploaded or upload error');
              }
              const categoriesRaw = String(fields.categories ?? '[]');
              const categories = (() => { try { return JSON.parse(categoriesRaw); } catch { return []; } })();
              const title = String(fields.title ?? 'Gallery Image');
              const albumSlug = String(fields.albumSlug ?? '').trim();
              if (albumSlug && /[\\/]/.test(albumSlug)) {
                throw new Error('Invalid album slug');
              }

              const ext = path.extname(file.originalFilename || file.newFilename || '') || '.jpg';
              let filename;
              if (albumSlug) {
                const albumDir = path.join(ALBUMS_DIR, albumSlug);
                if (!fs.existsSync(albumDir)) fs.mkdirSync(albumDir, { recursive: true });
                const base = safeBasename(file.originalFilename || `photo${ext}`);
                const { dest, filename: uniqueName } = uniquePathInDir(albumDir, base);
                fs.copyFileSync(file.filepath, dest);
                fs.unlinkSync(file.filepath);
                filename = uniqueName;
              } else {
                filename = `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
                if (!fs.existsSync(GALLERY_DIR)) fs.mkdirSync(GALLERY_DIR, { recursive: true });
                const targetPath = path.join(GALLERY_DIR, filename);
                fs.copyFileSync(file.filepath, targetPath);
                fs.unlinkSync(file.filepath);
              }

              const images = readImages();
              let maxId = 0;
              for (const img of images) {
                const n = Number(img.id);
                if (!Number.isNaN(n) && n > maxId) maxId = n;
              }
              const newImage = {
                id: maxId + 1,
                filename,
                categories: Array.isArray(categories) ? categories : [],
                title,
                uploadDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
              };
              images.unshift(newImage);
              writeImages(images);
              if (albumSlug) {
                assignImageToAlbum(albumSlug, filename, newImage.id);
              }
              sendJson(res, {
                status: 'success',
                message: albumSlug ? 'Image uploaded to album' : 'Image uploaded successfully',
                image: newImage,
                albumSlug: albumSlug || null,
              });
              return;
            }

            if (action === 'update') {
              const imageId = parseInt(String(fields.imageId ?? '0'), 10);
              if (!imageId) throw new Error('Invalid image ID');
              const categoriesRaw = String(fields.categories ?? '[]');
              const categories = (() => { try { return JSON.parse(categoriesRaw); } catch { return []; } })();
              const title = String(fields.title ?? '');

              const images = readImages();
              let updated = false;
              for (let i = 0; i < images.length; i++) {
                if (idMatch(images[i].id, imageId)) {
                  images[i].categories = Array.isArray(categories) ? categories : [];
                  images[i].title = title;
                  delete images[i].category;
                  updated = true;
                  break;
                }
              }
              if (!updated) throw new Error('Image not found with ID: ' + imageId);
              writeImages(images);
              const updatedImage = images.find((img) => idMatch(img.id, imageId));
              sendJson(res, { status: 'success', message: 'Image updated successfully', image: updatedImage });
              return;
            }

            if (action === 'update_old') {
              const filename = String(fields.filename ?? '').trim();
              if (!filename) throw new Error('Invalid filename');
              const categoriesRaw = String(fields.categories ?? '[]');
              let categories;
              try { categories = JSON.parse(categoriesRaw); } catch { categories = []; }
              if (!Array.isArray(categories)) categories = [];
              const title = String(fields.title ?? '');

              const images = readImages();
              let updated = false;
              for (let i = 0; i < images.length; i++) {
                if (images[i].filename === filename) {
                  images[i].categories = categories;
                  images[i].title = title;
                  images[i].isOldImage = true;
                  delete images[i].category;
                  updated = true;
                  break;
                }
              }
              if (!updated) {
                let maxId = 0;
                for (const img of images) {
                  const n = Number(img.id);
                  if (!Number.isNaN(n) && n > maxId) maxId = n;
                }
                images.push({
                  id: maxId + 1,
                  filename,
                  categories,
                  title,
                  isOldImage: true,
                  uploadDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
                });
              }
              writeImages(images);
              sendJson(res, { status: 'success', message: 'Image metadata updated successfully', categories, filename, verified: true });
              return;
            }

            if (action === 'delete') {
              let imageIdRaw = fields.imageId;
              if (Array.isArray(imageIdRaw)) imageIdRaw = imageIdRaw[0];
              const imageId = imageIdRaw != null ? String(imageIdRaw).trim() : '';
              if (!imageId) throw new Error('Invalid image ID');

              const images = readImages();
              const idx = images.findIndex((img) => idMatch(img.id, imageId));
              if (idx === -1) throw new Error('Image not found (ID: ' + imageId + ')');
              const deleted = images[idx];
              if (deleted.filename) {
                const fp = path.join(GALLERY_DIR, deleted.filename);
                if (fs.existsSync(fp)) fs.unlinkSync(fp);
              }
              images.splice(idx, 1);
              writeImages(images);
              sendJson(res, { status: 'success', message: 'Image deleted successfully' });
              return;
            }

            if (action === 'list_albums') {
              const albums = readAlbums();
              sendJson(res, { status: 'success', albums });
              return;
            }

            if (action === 'import_albums_from_folders') {
              const synced = importAlbumsFromFoldersAndJson();
              sendJson(res, {
                status: 'success',
                message: 'Albums synced from website list and folders',
                albums: synced,
              });
              return;
            }

            if (action === 'delete_album_file') {
              const albumSlug = String(fields.albumSlug ?? '').trim();
              const filename = String(fields.filename ?? '').trim();
              const imageId = String(fields.imageId ?? '').trim();
              if (!albumSlug) throw new Error('Album slug is required');
              if (/[\\/]/.test(albumSlug)) throw new Error('Invalid album slug');
              if (filename && /[\\/]/.test(filename)) throw new Error('Invalid filename');
              deleteAlbumPhoto(albumSlug, filename, imageId);
              sendJson(res, { status: 'success', message: 'Image removed from album' });
              return;
            }

            if (action === 'create_album') {
              let name = String(fields.name ?? '').trim();
              let slug = String(fields.slug ?? '').trim();
              if (!name) throw new Error('Album name is required');
              if (!slug) slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              const albums = readAlbums();
              let maxId = 0;
              for (const a of albums) {
                const n = Number(a.id);
                if (!Number.isNaN(n) && n > maxId) maxId = n;
              }
              const description = String(fields.description ?? '').trim();
              const now = galleryTimestamp();
              const newAlbum = {
                id: maxId + 1,
                name,
                slug,
                description,
                coverImageId: null,
                imageIds: [],
                createdAt: now,
                updatedAt: now,
              };
              albums.push(newAlbum);
              writeAlbums(albums);
              const albumFolder = path.join(ALBUMS_DIR, slug);
              if (!fs.existsSync(albumFolder)) fs.mkdirSync(albumFolder, { recursive: true });
              fs.writeFileSync(path.join(albumFolder, 'images.json'), JSON.stringify([], null, 2), 'utf8');
              writeAlbumFoldersJson();
              sendJson(res, { status: 'success', message: 'Album created', album: newAlbum });
              return;
            }

            if (action === 'update_album') {
              const albumId = parseInt(String(fields.albumId ?? '0'), 10);
              if (!albumId) throw new Error('Invalid album ID');
              const name = String(fields.name ?? '').trim();
              const slug = String(fields.slug ?? '').trim();
              let coverImageId = fields.coverImageId;
              if (coverImageId !== undefined && coverImageId !== null) coverImageId = String(coverImageId).trim() || null;
              let imageIds = [];
              try {
                const raw = fields.imageIds;
                if (raw != null) imageIds = JSON.parse(String(raw));
              } catch (_) {}
              if (!Array.isArray(imageIds)) imageIds = [];
              imageIds = imageIds.map((id) => String(id));
              const albums = readAlbums();
              const idx = albums.findIndex((a) => idMatch(a.id, albumId));
              if (idx === -1) throw new Error('Album not found');
              const oldSlug = albums[idx].slug || '';
              if (name) albums[idx].name = name;
              else if (!String(albums[idx].name || '').trim()) albums[idx].name = slugToName(oldSlug);
              if (slug) albums[idx].slug = slug;
              if (fields.description !== undefined) {
                albums[idx].description = String(fields.description ?? '').trim();
              }
              albums[idx].coverImageId = coverImageId;
              albums[idx].imageIds = imageIds;
              albums[idx].updatedAt = galleryTimestamp();
              if (!albums[idx].createdAt) albums[idx].createdAt = albums[idx].updatedAt;
              writeAlbums(albums);
              const effectiveSlug = slug || oldSlug;
              if (effectiveSlug) {
                const albumFolder = path.join(ALBUMS_DIR, effectiveSlug);
                if (!fs.existsSync(albumFolder)) fs.mkdirSync(albumFolder, { recursive: true });
                fs.writeFileSync(path.join(albumFolder, 'images.json'), JSON.stringify(imageIds, null, 2), 'utf8');
                if (oldSlug && oldSlug !== effectiveSlug) {
                  const oldFolder = path.join(ALBUMS_DIR, oldSlug);
                  if (fs.existsSync(oldFolder)) {
                    try {
                      fs.readdirSync(oldFolder).forEach((f) => fs.unlinkSync(path.join(oldFolder, f)));
                      fs.rmdirSync(oldFolder);
                    } catch (_) {}
                  }
                }
              }
              writeAlbumFoldersJson();
              sendJson(res, { status: 'success', message: 'Album updated' });
              return;
            }

            if (action === 'delete_album') {
              const albumId = parseInt(String(fields.albumId ?? '0'), 10);
              if (!albumId) throw new Error('Invalid album ID');
              const albums = readAlbums();
              const deleted = albums.find((a) => Number(a.id) === albumId);
              const slug = deleted && deleted.slug ? String(deleted.slug) : '';
              const newAlbums = albums.filter((a) => Number(a.id) !== albumId);
              writeAlbums(newAlbums);
              if (slug) {
                const albumFolder = path.join(ALBUMS_DIR, slug);
                if (fs.existsSync(albumFolder)) {
                  try {
                    fs.readdirSync(albumFolder).forEach((f) => fs.unlinkSync(path.join(albumFolder, f)));
                    fs.rmdirSync(albumFolder);
                  } catch (_) {}
                }
              }
              writeAlbumFoldersJson();
              sendJson(res, { status: 'success', message: 'Album deleted' });
              return;
            }

            if (action === 'init') {
              if (!fs.existsSync(GALLERY_DIR)) throw new Error('Gallery directory does not exist');
              const existing = readImages();
              const byFilename = {};
              for (const img of existing) if (img.filename) byFilename[img.filename] = img;

              const initialized = [];
              for (let i = 1; i <= 66; i++) {
                const fn = `img-${i}.jpg`;
                const fp = path.join(GALLERY_DIR, fn);
                if (!fs.existsSync(fp)) continue;
                if (byFilename[fn]) {
                  initialized.push(byFilename[fn]);
                } else {
                  const stat = fs.statSync(fp);
                  initialized.push({
                    id: `old-${i}`,
                    filename: fn,
                    categories: ['Students', 'Events', 'Celebrations'],
                    title: `Gallery Image ${i}`,
                    isOldImage: true,
                    uploadDate: new Date(stat.mtimeMs).toISOString().slice(0, 19).replace('T', ' ')
                  });
                }
              }

              let maxNumericId = 0;
              for (const img of initialized) {
                const n = Number(img.id);
                if (!Number.isNaN(n) && n > maxNumericId) maxNumericId = n;
              }
              for (const img of existing) {
                const n = Number(img.id);
                if (!Number.isNaN(n) && n > maxNumericId) maxNumericId = n;
              }

              const dir = fs.readdirSync(GALLERY_DIR);
              for (const name of dir) {
                if (/^img-\d+\./.test(name)) continue; // already added
                if (!/^gallery-.+\.(jpg|jpeg|png|webp)$/i.test(name)) continue;
                if (initialized.some((img) => img.filename === name)) continue;
                if (byFilename[name]) {
                  initialized.push(byFilename[name]);
                } else {
                  const fp = path.join(GALLERY_DIR, name);
                  const stat = fs.statSync(fp);
                  initialized.push({
                    id: ++maxNumericId,
                    filename: name,
                    categories: ['Students', 'Events', 'Celebrations'],
                    title: 'Gallery Image',
                    uploadDate: new Date(stat.mtimeMs).toISOString().slice(0, 19).replace('T', ' ')
                  });
                }
              }

              writeImages(initialized);
              sendJson(res, { status: 'success', message: 'Gallery images initialized successfully', count: initialized.length });
              return;
            }

            if (action === 'get_gallery_settings') {
              sendJson(res, { status: 'success', settings: readGallerySettings() });
              return;
            }

            if (action === 'update_gallery_settings') {
              const description = String(fields.description ?? '').trim();
              if (!description) throw new Error('Gallery description is required');
              const settings = writeGallerySettings({ description });
              sendJson(res, {
                status: 'success',
                message: 'Gallery description updated',
                settings,
              });
              return;
            }

            throw new Error('Invalid action');
          } catch (err) {
            sendError(res, 400, err.message || 'Request failed');
          }
        }

        if (isMultipart) {
          const tmpDir = path.join(PUBLIC, 'tmp');
          if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
          const form = formidable({
            uploadDir: tmpDir,
            keepExtensions: true,
            maxFileSize: 20 * 1024 * 1024
          });
          form.parse(req, (err, fields, files) => {
            if (err) {
              sendError(res, 400, err.message);
              return;
            }
            // Normalize: formidable may give { action: 'x' } or { action: ['x'] } or { action: [{ value: 'x' }] }
            const getFirst = (v) => {
              if (v == null) return undefined;
              const one = Array.isArray(v) ? v[0] : v;
              return one && typeof one === 'object' && 'value' in one ? one.value : one;
            };
            const normFields = {};
            for (const [k, v] of Object.entries(fields || {})) {
              const first = getFirst(v);
              normFields[k] = first !== undefined ? first : (Array.isArray(v) ? v : v);
            }
            const normFiles = {};
            for (const [k, v] of Object.entries(files || {})) {
              const first = Array.isArray(v) ? v[0] : v;
              normFiles[k] = first;
            }
            handleBody(normFields, normFiles);
          });
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          const params = new URLSearchParams(body);
          const fields = {};
          for (const [k, v] of params) {
            if (!fields[k]) fields[k] = v;
            else if (Array.isArray(fields[k])) fields[k].push(v);
            else fields[k] = [fields[k], v];
          }
          handleBody(fields, {});
        });
      };
      server.middlewares.use(galleryPost);
    }
  };
}

const galleryPlugin = galleryAdminPlugin();
galleryPlugin.configureServer({
  middlewares: {
    use(fn) {
      globalThis.__kiteGalleryLastMw = fn;
    },
  },
});

export function runGalleryAdmin(fields, files = {}): Promise<{ status: number; body: string }> {
  return new Promise((resolve) => {
    const mw = globalThis.__kiteGalleryLastMw;
    if (typeof mw !== 'function') {
      resolve({ status: 500, body: JSON.stringify({ status: 'error', message: 'Gallery admin is not ready' }) });
      return;
    }
    globalThis.__kiteGalleryJob = { fields, files };
    let settled = false;
    const finish = (status, body) => {
      if (settled) return;
      settled = true;
      resolve({ status, body });
    };
    const res = {
      statusCode: 200,
      setHeader() {},
      end(payload) {
        finish(this.statusCode || 200, String(payload ?? ''));
      },
    };
    try {
      mw({ url: '/api/gallery-admin', method: 'POST', headers: {}, on() {} }, res, () => {
        finish(500, JSON.stringify({ status: 'error', message: 'Gallery admin did not handle the request' }));
      });
    } catch (error) {
      finish(400, JSON.stringify({ status: 'error', message: error.message || 'Request failed' }));
    }
  });
}
