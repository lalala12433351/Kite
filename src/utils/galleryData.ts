/**
 * Shared gallery data loading – used by both Gallery and GalleryAdmin.
 * Single source: database/gallery-images.json (updated by gallery-admin or Vite plugin).
 * Albums: database/gallery-albums.json; each album folder: database/albums/{slug}/images.json (list of image ids).
 */

import { sortAlbumsNewestFirst, sortFolderImagesNewestFirst } from './galleryAdminGroups';

const GALLERY_JSON_PATH = 'database/gallery-images.json';
const ALBUMS_JSON_PATH = 'database/gallery-albums.json';
const GALLERY_IMAGE_PATH = 'images/gallery';

const getAssetUrl = (path) => `${'/'}${path}`;

/**
 * Normalize a raw image from JSON: ensure url and categories array.
 */
function normalizeImage(img) {
  const url = img.url || (img.filename ? getAssetUrl(`${GALLERY_IMAGE_PATH}/${img.filename}`) : null);
  let categories = img.categories;
  if (!Array.isArray(categories)) {
    if (img.category && img.category !== 'All') {
      categories = [img.category];
    } else {
      categories = img.isOldImage ? ['Students', 'Events', 'Celebrations'] : [];
    }
  }
  return {
    ...img,
    url,
    categories
  };
}

/**
 * Sort: new images first (by upload date), then old images (by id).
 */
function sortGalleryImages(images) {
  return [...images].sort((a, b) => {
    const aIsOld = a.isOldImage === true;
    const bIsOld = b.isOldImage === true;
    if (aIsOld && !bIsOld) return 1;
    if (!aIsOld && bIsOld) return -1;
    if (!aIsOld && !bIsOld && a.uploadDate && b.uploadDate) {
      const dateA = new Date(a.uploadDate).getTime();
      const dateB = new Date(b.uploadDate).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
    }
    if (aIsOld && bIsOld) {
      const aNum = parseInt(String(a.id).replace('old-', '') || '0', 10);
      const bNum = parseInt(String(b.id).replace('old-', '') || '0', 10);
      return bNum - aNum;
    }
    const aId = parseInt(a.id, 10) || 0;
    const bId = parseInt(b.id, 10) || 0;
    return bId - aId;
  });
}

/**
 * Parse response as JSON; if server returned HTML (e.g. 404 SPA fallback), return null.
 */
function parseJsonOrNull(response) {
  return response.text().then((text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || trimmed.startsWith('<')) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  });
}

/**
 * Load gallery images from the JSON file.
 * Returns a Promise that resolves to an array of normalized, sorted images.
 * If the server returns HTML (e.g. 404 fallback) or non-JSON, returns [] so folder albums can still show.
 */
export function loadGalleryImagesFromJson() {
  const cacheBuster = `?t=${Date.now()}`;
  const url = getAssetUrl(GALLERY_JSON_PATH) + cacheBuster;
  return fetch(url, {
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    }
  })
    .then((response) => {
      if (!response.ok) return [];
      return parseJsonOrNull(response);
    })
    .then((data) => {
      if (data == null || !Array.isArray(data) || data.length === 0) {
        return [];
      }
      const normalized = data.map(normalizeImage);
      return sortGalleryImages(normalized);
    })
    .catch(() => []);
}

/**
 * Load albums list from database/gallery-albums.json.
 * If the server returns HTML (e.g. 404 fallback), returns [] so folder albums can still show.
 */
export function loadAlbumsFromJson() {
  const cacheBuster = `?t=${Date.now()}`;
  const url = getAssetUrl(ALBUMS_JSON_PATH) + cacheBuster;
  return fetch(url, {
    cache: 'no-cache',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
  })
    .then((response) => {
      if (!response.ok) return [];
      return parseJsonOrNull(response);
    })
    .then((data) => (data != null && Array.isArray(data) ? data : []))
    .catch(() => []);
}

/**
 * Load image ids for an album from database/albums/{slug}/images.json (folder = album).
 * Returns a Promise that resolves to an array of image id strings.
 */
export function loadAlbumImageIdsFromJson(slug) {
  if (!slug) return Promise.resolve([]);
  const cacheBuster = `?t=${Date.now()}`;
  const url = getAssetUrl(`database/albums/${encodeURIComponent(slug)}/images.json`) + cacheBuster;
  return fetch(url, {
    cache: 'no-cache',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
  })
    .then((response) => {
      if (!response.ok) return [];
      return parseJsonOrNull(response);
    })
    .then((data) => (data != null && Array.isArray(data) ? data.map((id) => String(id)) : []))
    .catch(() => []);
}

/**
 * Load albums from database/albums folder structure (each subfolder = album, images inside).
 * Returns Promise<{ albums: Array<{ slug, name, images: Array<{ filename, url }> }> }>.
 * Tries with base path first (/qa/api/...), then /api/... as fallback.
 */
function fetchAlbumFoldersJson(url) {
  return fetch(url, {
    cache: 'no-cache',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
  }).then((response) => {
    if (!response.ok) return null;
    return response.text().then((text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || trimmed.startsWith('<')) return null;
      try {
        const data = JSON.parse(text);
        return Array.isArray(data?.albums) ? data : null;
      } catch {
        return null;
      }
    });
  }).catch(() => null);
}

/** Match public Gallery page album labels (e.g. Management → Highlights). */
export function patchWebsiteAlbumName(name) {
  if (name === 'Management') return 'Highlights';
  return name;
}

export function patchWebsiteAlbums(albums) {
  return (albums || []).map((alb) => ({
    ...alb,
    name: patchWebsiteAlbumName(alb?.name) || alb?.name || alb?.slug,
  }));
}

/** Sort albums and photos newest-first for public gallery and admin folder lists. */
export function applyAlbumFolderSort(albums, galleryImages = []) {
  return sortAlbumsNewestFirst(
    (albums || []).map((alb) => ({
      ...alb,
      images: sortFolderImagesNewestFirst(alb.images || [], galleryImages),
    })),
    galleryImages
  );
}

export function loadAlbumsFromAlbumFolder() {
  const base = '/'.replace(/\/?$/, '/');
  const cacheBuster = `?t=${Date.now()}`;
  const urlWithBase = `${base}api/album-folders.json${cacheBuster}`;
  const urlNoBase = `/api/album-folders.json${cacheBuster}`;
  return fetchAlbumFoldersJson(urlWithBase)
    .then((data) => {
      if (data?.albums?.length) return { albums: data.albums };
      return fetchAlbumFoldersJson(urlNoBase);
    })
    .then((data) => ({
      albums: applyAlbumFolderSort(
        patchWebsiteAlbums(Array.isArray(data?.albums) ? data.albums : [])
      ),
    }))
    .catch(() => ({ albums: [] }));
}

/**
 * Load albums for admin: same list as the public Gallery page (album-folders.json),
 * merged with gallery-albums.json metadata when available.
 */
export async function loadAlbumsForAdmin() {
  const [folderResult, metaAlbums, galleryImages] = await Promise.all([
    loadAlbumsFromAlbumFolder(),
    loadAlbumsFromJson(),
    loadGalleryImagesFromJson(),
  ]);
  const folderAlbums = applyAlbumFolderSort(
    patchWebsiteAlbums(Array.isArray(folderResult?.albums) ? folderResult.albums : []),
    galleryImages
  );
  return {
    folderAlbums,
    metaAlbums: Array.isArray(metaAlbums) ? metaAlbums : [],
    galleryImages,
  };
}

export { GALLERY_JSON_PATH, ALBUMS_JSON_PATH, GALLERY_IMAGE_PATH, getAssetUrl };
